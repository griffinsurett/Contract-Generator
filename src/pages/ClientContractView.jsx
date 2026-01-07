import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SignaturePad from 'signature_pad'
import { decodeContractData, generateNextWorkflowLink } from '../utils/contractUrl'
import { getContractConfig } from '../contracts'
import { FormProvider } from '../contexts/FormContext'
import { generateContractPDF, savePDFRecord } from '../utils/pdfGenerator'

const ClientContractView = () => {
  const { encodedData } = useParams()
  const navigate = useNavigate()

  // Decode contract data from URL
  const [contractData, setContractData] = useState(null)
  const [error, setError] = useState(null)

  // UI State
  const [viewStep, setViewStep] = useState('info') // 'info' | 'contract' | 'complete'
  const [selectedTier, setSelectedTier] = useState(null)
  const [typedName, setTypedName] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showTierModal, setShowTierModal] = useState(false)
  const [modalTier, setModalTier] = useState(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureData, setSignatureData] = useState(null)
  const [hasSigned, setHasSigned] = useState(false)

  // Client info form state
  const [clientInfo, setClientInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    address: ''
  })

  // Refs
  const signatureCanvasRef = useRef(null)
  const signaturePadRef = useRef(null)
  const containerRef = useRef(null)
  const contractDocRef = useRef(null)

  // Check if this is a dynamic workflow from URL
  const isWorkflow = () => contractData?.isWorkflow === true
  const getWorkflowContracts = () => contractData?.workflow || []
  const getCurrentWorkflowIndex = () => contractData?.currentIndex || 0

  // Get current contract ID (either from workflow or single contract)
  const getCurrentContractId = () => {
    if (isWorkflow()) {
      return getWorkflowContracts()[getCurrentWorkflowIndex()]
    }
    return contractData?.contractId
  }

  // Check if there's a next contract in workflow
  const hasNextContract = () => {
    if (!isWorkflow()) return false
    return getCurrentWorkflowIndex() < getWorkflowContracts().length - 1
  }

  // Check if tier selection should show (for hosting or web-design contracts)
  const showTierSelection = () => {
    const currentId = getCurrentContractId()
    // Show tier selection for hosting contract (standalone or last in workflow)
    // or for web-design contract (always show - they can decline hosting)
    if (currentId === 'hosting' && !hasNextContract()) return true
    if (currentId === 'web-design') return true
    return false
  }

  // Decode contract on mount
  useEffect(() => {
    if (encodedData) {
      const decoded = decodeContractData(encodedData)
      if (decoded) {
        setContractData(decoded)
        // If this is a continuation of a workflow, restore the typed name
        if (decoded.options?.workflowData?.typedName) {
          setTypedName(decoded.options.workflowData.typedName)
        }
        // If tier was pre-selected from workflow
        if (decoded.options?.workflowData?.selectedTier) {
          setSelectedTier(decoded.options.workflowData.selectedTier)
        }
        // If admin pre-selected a hosting tier for web-design contract
        if (decoded.formData?.selectedHostingTier) {
          setSelectedTier(decoded.formData.selectedHostingTier)
        }
        // If admin pre-selected a tier for hosting contract
        if (decoded.formData?.selectedTier) {
          setSelectedTier(decoded.formData.selectedTier)
        }
      } else {
        setError('Invalid or expired contract link')
      }
    }
  }, [encodedData])

  // Initialize signature pad
  useEffect(() => {
    if (signatureCanvasRef.current && !signaturePadRef.current) {
      const canvas = signatureCanvasRef.current
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      })
      // Track when user finishes drawing
      signaturePadRef.current.addEventListener('endStroke', () => {
        setHasSigned(true)
      })
    }
  })

  // Clear signature
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
      setHasSigned(false)
    }
  }

  // Check if form is complete - requires terms checked and signature
  const isFormComplete = () => {
    return agreedToTerms && (hasSigned || signatureData)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormComplete()) return

    setIsSubmitting(true)

    try {
      // Use signature from modal state, or fall back to signature pad
      const finalSignatureData = signatureData || signaturePadRef.current?.toDataURL()
      const currentContractId = getCurrentContractId()
      const contractConfig = getContractConfig(currentContractId)

      const tierPrices = {
        'hosting-only': 50,
        'hosting-basic': 80,
        'hosting-priority': 100
      }

      // Generate PDF of the signed contract
      let pdfDataUrl = null
      if (contractDocRef.current) {
        try {
          const pdfResult = await generateContractPDF(contractDocRef.current, {
            filename: `${contractConfig?.name || 'Contract'}_${typedName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
            clientName: typedName,
            contractType: contractConfig?.name || 'Contract',
            signatureData: finalSignatureData,
            selectedTier: selectedTier,
            clientInfo: clientInfo
          })
          pdfDataUrl = pdfResult.dataUrl

          // Save PDF record locally
          savePDFRecord(pdfDataUrl, {
            contractId: currentContractId,
            contractType: contractConfig?.name,
            clientName: typedName,
            clientEmail: clientInfo.email,
            selectedTier: selectedTier
          })
        } catch (pdfError) {
          console.error('PDF generation error:', pdfError)
          // Continue without PDF if generation fails
        }
      }

      const acceptanceRecord = {
        contractId: currentContractId,
        clientName: typedName,
        clientInfo: clientInfo,
        selectedTier: selectedTier,
        selectedHostingTier: currentContractId === 'web-design' ? selectedTier : null,
        tierPrice: tierPrices[selectedTier] || null,
        signature: finalSignatureData,
        pdfDataUrl: pdfDataUrl,
        acceptedAt: new Date().toISOString(),
        contractData: contractData.formData,
        workflowStep: getCurrentWorkflowIndex() + 1,
        totalSteps: isWorkflow() ? getWorkflowContracts().length : 1
      }

      // Store in localStorage
      const existingRecords = JSON.parse(localStorage.getItem('contractAcceptances') || '[]')
      existingRecords.push(acceptanceRecord)
      localStorage.setItem('contractAcceptances', JSON.stringify(existingRecords))

      // Send email notification via Formspree with PDF attachment
      const formspreeEndpoint = contractData.options?.formspreeEndpoint
      if (formspreeEndpoint) {
        const planNames = {
          'hosting-only': 'Hosting Only ($50/mo)',
          'hosting-basic': 'Hosting + Maintenance Basic ($80/mo) - 3 updates/week',
          'hosting-priority': 'Hosting + Maintenance Priority ($100/mo) - 15 updates/week'
        }

        // Build email body with contract summary
        const emailBody = {
          _subject: `Contract Signed: ${contractConfig?.name || currentContractId} - ${clientInfo.companyName || typedName}`,
          clientName: typedName,
          clientEmail: clientInfo.email,
          clientPhone: clientInfo.phone || 'Not provided',
          clientCompany: clientInfo.companyName || 'Not provided',
          clientAddress: clientInfo.address || 'Not provided',
          selectedPlan: planNames[selectedTier] || 'N/A',
          acceptedAt: new Date().toLocaleString(),
          contractType: contractConfig?.name || currentContractId,
          workflowStep: isWorkflow() ? `${getCurrentWorkflowIndex() + 1} of ${getWorkflowContracts().length}` : 'Single contract',
          signatureImage: finalSignatureData,
          // Include PDF as base64 attachment (Formspree supports this)
          _attachments: pdfDataUrl ? [{
            filename: `${contractConfig?.name || 'Contract'}_Signed.pdf`,
            content: pdfDataUrl.split(',')[1] // Remove data URL prefix
          }] : undefined
        }

        await fetch(formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailBody)
        })
      }

      // Save the PDF URL for the success screen
      if (pdfDataUrl) {
        setSignedPdfUrl(pdfDataUrl)
      }

      // Check if there's a next contract in the workflow
      if (hasNextContract()) {
        // Navigate to next contract
        handleProceedToNextContract()
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      console.error('Submission error:', err)
      alert('There was an error submitting. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle proceeding to next contract in workflow
  const handleProceedToNextContract = () => {
    if (!hasNextContract()) return

    // Generate next workflow link with preserved data
    const nextLink = generateNextWorkflowLink(
      getWorkflowContracts(),
      getCurrentWorkflowIndex(),
      contractData.formData,
      {
        ...contractData.options,
        workflowData: {
          typedName: typedName,
          selectedTier: selectedTier,
          previousContracts: [
            ...(contractData.options?.workflowData?.previousContracts || []),
            getCurrentContractId()
          ]
        }
      }
    )

    if (nextLink) {
      // Extract the encoded part from the full URL
      const encoded = nextLink.split('/sign/')[1]
      navigate(`/sign/${encoded}`)

      // Reset state for new contract
      setAgreedToTerms(false)
      setSelectedTier(null)
      setHasSigned(false)
      if (signaturePadRef.current) {
        signaturePadRef.current.clear()
      }
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Contract Link</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!contractData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading contract...</div>
      </div>
    )
  }

  // Final success state
  if (isSubmitted) {
    const totalContracts = isWorkflow() ? getWorkflowContracts().length : 1
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {totalContracts > 1 ? 'All Contracts Signed!' : 'Contract Accepted!'}
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you, <strong>{typedName}</strong>. {totalContracts > 1 ? `All ${totalContracts} agreements have been recorded.` : 'Your agreement has been recorded.'}
          </p>
          {selectedTier && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Selected Plan</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedTier === 'hosting-only' && 'Hosting Only - $50/month'}
                {selectedTier === 'hosting-basic' && 'Hosting + Maintenance Basic - $80/month'}
                {selectedTier === 'hosting-priority' && 'Hosting + Maintenance Priority - $100/month'}
              </p>
            </div>
          )}

          {/* Download signed contract PDF */}
          {signedPdfUrl && (
            <a
              href={signedPdfUrl}
              download={`Signed_Contract_${new Date().toISOString().split('T')[0]}.pdf`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Signed Contract (PDF)
            </a>
          )}

          <p className="text-sm text-gray-500">
            A confirmation has been sent. You will be contacted shortly with next steps.
          </p>
        </div>
      </div>
    )
  }

  // Helper to check if client info form is complete
  const isClientInfoComplete = () => {
    return clientInfo.fullName.trim() && clientInfo.email.trim()
  }

  // Handle client info form field change
  const updateClientInfo = (field, value) => {
    setClientInfo(prev => ({ ...prev, [field]: value }))
  }

  // Handle proceeding from info form to contract
  const handleProceedToContract = () => {
    if (isClientInfoComplete()) {
      // Pre-fill the typed name from full name
      setTypedName(clientInfo.fullName)
      setViewStep('contract')
    }
  }

  // Client info form step
  if (viewStep === 'info') {
    const contractConfig = getContractConfig(getCurrentContractId())
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex justify-center items-center">
        <div className="max-w-xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {contractConfig?.name || 'Contract Review'}
            </h1>
            <p className="text-gray-600">
              Please provide your information before reviewing the contract
            </p>
          </div>

          {/* Client Info Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Information</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientInfo.fullName}
                  onChange={(e) => updateClientInfo('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => updateClientInfo('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => updateClientInfo('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={clientInfo.companyName}
                  onChange={(e) => updateClientInfo('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Your Company LLC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={clientInfo.address}
                  onChange={(e) => updateClientInfo('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleProceedToContract}
                disabled={!isClientInfoComplete()}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                  isClientInfoComplete()
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Contract
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </div>

          {/* Provider info preview */}
          {contractData?.formData?.developerCompany || contractData?.formData?.serviceProviderCompany ? (
            <div className="mt-6 text-center text-sm text-gray-500">
              Contract from: <strong>{contractData.formData.developerCompany || contractData.formData.serviceProviderCompany}</strong>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // Get contract config for rendering
  const currentContractId = getCurrentContractId()
  const contractConfig = getContractConfig(currentContractId)
  const DocumentComponent = contractConfig?.Document

  // Create a read-only version of the form data, including client info and selected tier
  const readOnlyFormData = {
    ...contractData.formData,
    // Include client-entered information
    clientFirstName: clientInfo.fullName.split(' ')[0] || contractData.formData.clientFirstName,
    clientName: clientInfo.fullName || contractData.formData.clientName,
    clientEmail: clientInfo.email || contractData.formData.clientEmail,
    clientPhone: clientInfo.phone || contractData.formData.clientPhone,
    clientCompanyName: clientInfo.companyName || contractData.formData.clientCompanyName,
    clientAddress: clientInfo.address || contractData.formData.clientAddress,
    // Pass selectedTier to hosting contract so it can conditionally render sections
    selectedTier: currentContractId === 'hosting' ? selectedTier : contractData.formData.selectedTier,
    // Pass selectedHostingTier to web-design contract
    selectedHostingTier: currentContractId === 'web-design' ? selectedTier : contractData.formData.selectedHostingTier
  }

  // Determine step labels based on contract type
  const needsTierFirst = showTierSelection()
  const totalWorkflowSteps = isWorkflow() ? getWorkflowContracts().length : 1
  const currentStep = getCurrentWorkflowIndex() + 1

  // Calculate workflow progress percentage
  const workflowProgressPercent = totalWorkflowSteps > 1
    ? Math.round((currentStep / totalWorkflowSteps) * 100)
    : 100

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Progress indicator */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {contractConfig?.name || 'Contract Review'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <StepIndicator
                step={1}
                label="Read"
                active={!isFormComplete()}
                completed={isFormComplete()}
              />
              {needsTierFirst ? (
                <>
                  <StepIndicator
                    step={2}
                    label="Select Plan"
                    active={!selectedTier}
                    completed={!!selectedTier}
                  />
                  <StepIndicator
                    step={3}
                    label="Sign"
                    active={!!selectedTier && !isFormComplete()}
                    completed={isFormComplete()}
                  />
                </>
              ) : (
                <StepIndicator
                  step={2}
                  label="Sign"
                  active={!isFormComplete()}
                  completed={isFormComplete()}
                />
              )}
            </div>
          </div>

          {/* Workflow progress bar (below Read/Select/Sign) */}
          {totalWorkflowSteps > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-gray-600 mb-2">
                <span className="text-sm font-medium">
                  Contract {currentStep} of {totalWorkflowSteps}
                </span>
                <span className="text-sm font-bold text-purple-600">{workflowProgressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${workflowProgressPercent}%` }}
                />
              </div>
              {/* Workflow steps indicator with arrows */}
              <div className="flex items-center justify-center gap-1">
                {/* Left arrow - navigate to previous contract */}
                <button
                  onClick={() => {
                    if (currentStep > 1) {
                      const prevIndex = getCurrentWorkflowIndex() - 1
                      const prevLink = generateNextWorkflowLink(
                        getWorkflowContracts(),
                        prevIndex - 1,
                        contractData.formData,
                        {
                          ...contractData.options,
                          workflowData: {
                            typedName: typedName,
                            selectedTier: selectedTier
                          }
                        }
                      )
                      if (prevLink) {
                        const encoded = prevLink.split('/sign/')[1]
                        navigate(`/sign/${encoded}`)
                        setAgreedToTerms(false)
                        setHasSigned(false)
                        if (signaturePadRef.current) {
                          signaturePadRef.current.clear()
                        }
                      }
                    }
                  }}
                  disabled={currentStep === 1}
                  className={`p-1 rounded transition-all ${
                    currentStep === 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-100 hover:bg-purple-100 cursor-pointer'
                  }`}
                  title={currentStep === 1 ? 'This is the first contract' : 'Go to previous contract'}
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Step dots */}
                <div className="flex items-center gap-1 mx-1">
                  {getWorkflowContracts().map((contractId, idx) => {
                    const config = getContractConfig(contractId)
                    const isCompleted = idx < getCurrentWorkflowIndex()
                    const isCurrent = idx === getCurrentWorkflowIndex()
                    return (
                      <div
                        key={contractId}
                        className="flex items-center gap-1"
                        title={config?.name || contractId}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                              : 'bg-gray-300 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        {idx < getWorkflowContracts().length - 1 && (
                          <div className={`w-4 h-0.5 ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Right arrow - navigate to next contract (only if current is signed) */}
                <button
                  onClick={() => {
                    if (currentStep < totalWorkflowSteps && isFormComplete()) {
                      const nextLink = generateNextWorkflowLink(
                        getWorkflowContracts(),
                        getCurrentWorkflowIndex(),
                        contractData.formData,
                        {
                          ...contractData.options,
                          workflowData: {
                            typedName: typedName,
                            selectedTier: selectedTier
                          }
                        }
                      )
                      if (nextLink) {
                        const encoded = nextLink.split('/sign/')[1]
                        navigate(`/sign/${encoded}`)
                        setAgreedToTerms(false)
                        setHasSigned(false)
                        if (signaturePadRef.current) {
                          signaturePadRef.current.clear()
                        }
                      }
                    }
                  }}
                  disabled={currentStep === totalWorkflowSteps || !isFormComplete()}
                  className={`p-1 rounded transition-all ${
                    currentStep === totalWorkflowSteps || !isFormComplete()
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-100 hover:bg-purple-100 cursor-pointer'
                  }`}
                  title={
                    currentStep === totalWorkflowSteps
                      ? 'This is the last contract'
                      : !isFormComplete()
                        ? 'Sign this contract first to continue'
                        : 'Go to next contract'
                  }
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Relative wrapper for sticky bottom panel */}
      <div className="relative">
        {/* Contract document */}
        <div ref={containerRef} className="flex justify-center pt-24 pb-8">
          <FormProvider
          formData={readOnlyFormData}
          updateField={() => {}}
          updateMultipleFields={() => {}}
          selectedTier={selectedTier}
          onTierSelect={setSelectedTier}
          onShowTierDetails={(tier) => {
            setModalTier(tier)
            setShowTierModal(true)
          }}
          signatureData={signatureData}
          onOpenSignature={() => setShowSignatureModal(true)}
          typedName={typedName}
          isClientView={true}
        >
          <div className="max-w-4xl mx-auto">
            {/* Render contract - pointer-events-none with selective override via pointer-events-auto on interactive elements */}
            <div ref={contractDocRef} className="pointer-events-none">
              {DocumentComponent && <DocumentComponent />}
            </div>

          </div>
        </FormProvider>
      </div>

      {/* Tier Details Modal */}
      {showTierModal && modalTier && (
        <TierDetailsModal
          tier={modalTier}
          onClose={() => {
            setShowTierModal(false)
            setModalTier(null)
          }}
          onSelect={(tier) => {
            setSelectedTier(tier)
            setShowTierModal(false)
            setModalTier(null)
          }}
          isSelected={selectedTier === modalTier}
        />
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureModal
          onClose={() => setShowSignatureModal(false)}
          onSave={(dataUrl) => {
            setSignatureData(dataUrl)
            setShowSignatureModal(false)
          }}
          existingSignature={signatureData}
        />
      )}

      {/* Fixed bottom panel - appears after scrolling */}
      {/* {hasScrolledToBottom && ( */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-40">
          <div className="w-full mx-auto p-6">
            {/* Signature section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Sign the Agreement</h2>
                {needsTierFirst && selectedTier && (
                  <span className="text-sm text-blue-600">
                    Plan: <strong>
                      {selectedTier === 'hosting-only' && 'Hosting Only ($50/mo)'}
                      {selectedTier === 'hosting-basic' && 'Basic Maintenance ($80/mo)'}
                      {selectedTier === 'hosting-priority' && 'Priority Maintenance ($100/mo)'}
                    </strong>
                  </span>
                )}
              </div>

              {needsTierFirst && !selectedTier && (
                <div className="rounded-lg p-3 mb-4 bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Please select a hosting plan above before signing.
                  </p>
                </div>
              )}

              {hasNextContract() && (
                  <div className="bg-amber-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      After signing, you'll continue to the next contract ({currentStep} of {totalWorkflowSteps}).
                    </p>
                  </div>
                )}

                {/* Agreement checkbox - must be checked before signing */}
                <label className="flex items-start gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the terms and conditions outlined in this contract.
                    I understand that this constitutes a legally binding agreement.
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-6">
                  {/* Typed name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type your full legal name
                    </label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg bg-gray-50 text-gray-700">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Signature pad */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Draw your signature {!agreedToTerms && <span className="text-gray-400">(check terms first)</span>}
                      </label>
                      <button
                        onClick={clearSignature}
                        disabled={!agreedToTerms}
                        className={`text-xs ${agreedToTerms ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                      >
                        Clear
                      </button>
                    </div>
                    <canvas
                      ref={signatureCanvasRef}
                      className={`w-full h-[80px] border-2 rounded-lg ${
                        agreedToTerms
                          ? 'border-gray-300 bg-white cursor-crosshair'
                          : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                      }`}
                      style={{ touchAction: 'none', pointerEvents: agreedToTerms ? 'auto' : 'none' }}
                    />
                  </div>
                </div>

                {/* Submit/Navigation buttons */}
                <div className="flex items-center gap-4 mt-4">
                  {/* Back button for workflows (disabled on first contract) */}
                  {totalWorkflowSteps > 1 && (
                    <button
                      onClick={() => {
                        if (currentStep > 1) {
                          // Navigate to previous contract in workflow
                          const prevIndex = getCurrentWorkflowIndex() - 1
                          const prevLink = generateNextWorkflowLink(
                            getWorkflowContracts(),
                            prevIndex - 1, // generateNextWorkflowLink adds 1, so we subtract 1
                            contractData.formData,
                            {
                              ...contractData.options,
                              workflowData: {
                                typedName: typedName,
                                selectedTier: selectedTier
                              }
                            }
                          )
                          if (prevLink) {
                            const encoded = prevLink.split('/sign/')[1]
                            navigate(`/sign/${encoded}`)
                            // Reset state for previous contract
                            setAgreedToTerms(false)
                            setHasSigned(false)
                            if (signaturePadRef.current) {
                              signaturePadRef.current.clear()
                            }
                          }
                        }
                      }}
                      disabled={currentStep === 1}
                      className={`px-6 py-4 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        currentStep === 1
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={currentStep === 1 ? 'This is the first contract' : 'Go back to previous contract'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  )}

                  {/* Main submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormComplete() || isSubmitting}
                    className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                      isFormComplete() && !isSubmitting
                        ? hasNextContract()
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : hasNextContract() ? (
                      <>
                        Sign & Continue
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept & Sign Contract
                      </>
                    )}
                  </button>
                </div>

                {/* Workflow step indicator at bottom */}
                {totalWorkflowSteps > 1 && (
                  <div className="mt-3 text-center text-sm text-gray-500">
                    Step {currentStep} of {totalWorkflowSteps} • {hasNextContract()
                      ? `Next: ${getContractConfig(getWorkflowContracts()[getCurrentWorkflowIndex() + 1])?.name || 'Next Contract'}`
                      : 'Final contract'
                    }
                  </div>
                )}
              </div>
          </div>
        </div>
      {/* )} */}
      </div>
    </div>
  )
}

// Step indicator component
const StepIndicator = ({ step, label, active, completed }) => (
  <div className={`flex items-center gap-2 ${active ? 'text-blue-600' : completed ? 'text-green-600' : 'text-gray-400'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
      completed ? 'bg-green-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
    }`}>
      {completed ? '✓' : step}
    </div>
    <span className="text-sm font-medium hidden sm:inline">{label}</span>
  </div>
)

// Tier details data
const tierDetails = {
  'hosting-only': {
    title: 'Hosting Only',
    price: '$50',
    period: '/month',
    features: [
      'Website hosting on fast, secure servers',
      'SSL certificate included',
      'Uptime monitoring (99.9% guarantee)',
      'Form delivery and email notifications',
      'Daily automated backups',
      'CDN for fast loading globally'
    ],
    recommended: false
  },
  'hosting-basic': {
    title: 'Hosting + Maintenance',
    subtitle: 'Basic',
    price: '$80',
    period: '/month',
    features: [
      'Everything in Hosting Only',
      '3 content updates per week',
      'Monthly software and security updates',
      'Standard email support (24-48hr response)',
      'Minor text and image changes',
      'Monthly performance report'
    ],
    recommended: false
  },
  'hosting-priority': {
    title: 'Hosting + Maintenance',
    subtitle: 'Priority',
    price: '$100',
    period: '/month',
    features: [
      'Everything in Hosting Only',
      '15 content updates per week',
      'Monthly software and security updates',
      'Priority support (same-day response)',
      'Layout adjustments and new sections',
      'Monthly performance report',
      'Quarterly strategy call'
    ],
    recommended: true
  }
}

// Tier details modal showing a single plan's details
const TierDetailsModal = ({ tier, onClose, onSelect, isSelected }) => {
  const details = tierDetails[tier]
  if (!details) return null

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-[10000]" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-[10001] w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{details.title}</h2>
            {details.subtitle && <p className="text-gray-500">{details.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {details.recommended && (
          <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Recommended
          </span>
        )}

        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">{details.price}</span>
          <span className="text-gray-500 text-lg">{details.period}</span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-3">What's Included:</h3>
        <ul className="space-y-3 mb-6">
          {details.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button
            onClick={() => onSelect(tier)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              isSelected
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSelected ? 'Selected' : 'Select This Plan'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

// Signature modal component
const SignatureModal = ({ onClose, onSave, existingSignature }) => {
  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext('2d').scale(ratio, ratio)

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      })

      // Load existing signature if available
      if (existingSignature) {
        signaturePadRef.current.fromDataURL(existingSignature)
      }
    }
  }, [existingSignature])

  const handleClear = () => {
    signaturePadRef.current?.clear()
  }

  const handleSave = () => {
    if (signaturePadRef.current?.isEmpty()) {
      return
    }
    const dataUrl = signaturePadRef.current.toDataURL()
    onSave(dataUrl)
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-[10000]" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-[10001] w-[500px] max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Sign Here</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Use your mouse or finger to draw your signature below.
        </p>

        <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-[150px] cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Clear
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Signature
          </button>
        </div>
      </div>
    </>
  )
}

export default ClientContractView
