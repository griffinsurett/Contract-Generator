import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import SignaturePad from 'signature_pad'
import { decodeContractData } from '../utils/contractUrl'
import { getContractConfig } from '../contracts'
import { FormProvider } from '../contexts/FormContext'
import { generateContractPDF, generatePDFBlob } from '../utils/pdfGenerator.jsx'

const ClientContractView = () => {
  const { encodedData } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get current step from URL query params (defaults to 0)
  const currentStep = parseInt(searchParams.get('step') || '0', 10)

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
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureData, setSignatureData] = useState(null)
  const [hasSigned, setHasSigned] = useState(false)
  const [isSignaturePanelOpen, setIsSignaturePanelOpen] = useState(true)

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
  // Use step from URL params instead of encoded data
  const getCurrentWorkflowIndex = () => currentStep

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

        // Determine tier selection - check various sources, default to priority if none set
        let tierToSet = null
        // If tier was pre-selected from workflow
        if (decoded.options?.workflowData?.selectedTier) {
          tierToSet = decoded.options.workflowData.selectedTier
        }
        // If admin pre-selected a hosting tier for web-design contract
        else if (decoded.formData?.selectedHostingTier) {
          tierToSet = decoded.formData.selectedHostingTier
        }
        // If admin pre-selected a tier for hosting contract
        else if (decoded.formData?.selectedTier) {
          tierToSet = decoded.formData.selectedTier
        }
        // Default to priority plan for better UX (recommended plan pre-selected)
        else {
          const contractId = decoded.isWorkflow ? decoded.workflow?.[0] : decoded.contractId
          // Only default for contracts that show tier selection (hosting or web-design)
          if (contractId === 'hosting' || contractId === 'web-design') {
            tierToSet = 'hosting-priority'
          }
        }

        if (tierToSet) {
          setSelectedTier(tierToSet)
        }

        // Clear localStorage only when starting fresh (first contract with no existing workflow data)
        // Use currentStep from URL params (defaults to 0)
        const isFirstContract = !decoded.isWorkflow || currentStep === 0
        if (isFirstContract) {
          // Only clear if there's no workflowData (meaning truly fresh start, not a refresh mid-workflow)
          const hasWorkflowContext = decoded.options?.workflowData?.previousContracts?.length > 0
          if (!hasWorkflowContext) {
            localStorage.removeItem('signedContractHtmls')
            localStorage.removeItem('workflowSignatureStates')
          }
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
      // Track when user finishes drawing and capture signature data
      signaturePadRef.current.addEventListener('endStroke', () => {
        setHasSigned(true)
        // Capture signature data so it renders in the document
        const dataUrl = signaturePadRef.current.toDataURL()
        setSignatureData(dataUrl)
      })
    }
  })

  // Clear signature
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
      setHasSigned(false)
      setSignatureData(null)
    }
  }

  // Save signature state to localStorage for the current contract
  const saveSignatureState = (contractId, signature, agreed, name) => {
    try {
      const signatureStates = JSON.parse(localStorage.getItem('workflowSignatureStates') || '{}')
      signatureStates[contractId] = {
        signatureData: signature,
        agreedToTerms: agreed,
        typedName: name,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('workflowSignatureStates', JSON.stringify(signatureStates))
    } catch (err) {
      console.warn('Could not save signature state:', err.message)
    }
  }

  // Restore signature state from localStorage for a contract
  const restoreSignatureState = (contractId) => {
    try {
      const signatureStates = JSON.parse(localStorage.getItem('workflowSignatureStates') || '{}')
      return signatureStates[contractId] || null
    } catch {
      return null
    }
  }

  // Restore signature state when navigating to a contract (including back navigation)
  useEffect(() => {
    if (!contractData) return
    const currentContractId = getCurrentContractId()
    if (!currentContractId) return

    const savedState = restoreSignatureState(currentContractId)
    if (savedState) {
      // Restore the saved state
      setAgreedToTerms(savedState.agreedToTerms || false)
      setTypedName(savedState.typedName || '')
      if (savedState.signatureData) {
        setSignatureData(savedState.signatureData)
        setHasSigned(true)
        // Restore signature to canvas if pad exists
        if (signaturePadRef.current) {
          const img = new Image()
          img.onload = () => {
            signaturePadRef.current.clear()
            const canvas = signatureCanvasRef.current
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          }
          img.src = savedState.signatureData
        }
      }
    } else {
      // No saved state - reset for fresh contract
      setAgreedToTerms(false)
      setHasSigned(false)
      setSignatureData(null)
      if (signaturePadRef.current) {
        signaturePadRef.current.clear()
      }
    }
  }, [currentStep, contractData])

  // Reset workflow - navigates back to the first contract with fresh state
  const handleResetWorkflow = () => {
    if (!window.confirm('Are you sure you want to start over? All progress will be lost.')) {
      return
    }

    // Clear localStorage
    localStorage.removeItem('signedContractHtmls')
    localStorage.removeItem('workflowSignatureStates')

    // Reset local state
    setViewStep('info')
    setTypedName('')
    setAgreedToTerms(false)
    setSelectedTier(null)
    setHasSigned(false)
    setSignatureData(null)
    setClientInfo({
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      address: ''
    })

    // Navigate to step 0 (first contract)
    // The base URL already has the workflow/contract data encoded
    navigate('?step=0')
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

      // Save signature state to localStorage so it persists when navigating back
      saveSignatureState(currentContractId, finalSignatureData, agreedToTerms, typedName)

      const tierPrices = {
        'hosting-only': 50,
        'hosting-basic': 80,
        'hosting-priority': 100
      }

      // Save contract HTML for PDF generation later (without export controls)
      if (contractDocRef.current) {
        const clone = contractDocRef.current.cloneNode(true)
        // Remove download/export sections
        clone.querySelectorAll('[data-export-control="true"]').forEach(el => el.remove())
        // Replace inputs with their values
        clone.querySelectorAll('input, select, textarea').forEach(input => {
          const span = document.createElement('span')
          span.textContent = input.value || input.placeholder || '___________'
          span.style.fontWeight = 'bold'
          input.parentNode.replaceChild(span, input)
        })

        // Save to localStorage so it persists across workflow navigation and refreshes
        const existingContracts = JSON.parse(localStorage.getItem('signedContractHtmls') || '[]')
        // Avoid duplicates if user somehow re-submits
        const alreadySaved = existingContracts.some(c => c.contractId === currentContractId)
        if (!alreadySaved) {
          existingContracts.push({
            contractId: currentContractId,
            contractName: contractConfig?.name || currentContractId,
            html: clone.innerHTML,
            signedAt: new Date().toISOString()
          })
          localStorage.setItem('signedContractHtmls', JSON.stringify(existingContracts))
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
        acceptedAt: new Date().toISOString(),
        contractData: contractData.formData,
        workflowStep: getCurrentWorkflowIndex() + 1,
        totalSteps: isWorkflow() ? getWorkflowContracts().length : 1
      }

      // Store in localStorage (don't include large data like signatures/PDFs)
      try {
        const recordToStore = {
          ...acceptanceRecord,
          signature: null // Don't store signature data - too large
        }
        const existingRecords = JSON.parse(localStorage.getItem('contractAcceptances') || '[]')
        existingRecords.push(recordToStore)
        // Keep only last 50 records
        while (existingRecords.length > 50) {
          existingRecords.shift()
        }
        localStorage.setItem('contractAcceptances', JSON.stringify(existingRecords))
      } catch (storageErr) {
        console.warn('Could not save to localStorage:', storageErr.message)
        // Non-critical - continue without saving
      }

      // Send email notification via Formspree with PDF attachment
      const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT
      if (formspreeEndpoint && contractDocRef.current) {
        const planNames = {
          'hosting-only': 'Hosting Only ($50/mo)',
          'hosting-basic': 'Hosting + Maintenance Basic ($80/mo) - 3 updates/week',
          'hosting-priority': 'Hosting + Maintenance Priority ($100/mo) - 15 updates/week'
        }

        // Generate PDF blob from the contract document
        const pdfFilename = `${(contractConfig?.name || currentContractId).replace(/\s+/g, '_')}_${typedName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`

        let pdfBlob = null
        try {
          console.log('Generating PDF for email attachment...')
          const pdfResult = await generatePDFBlob(contractDocRef.current, { filename: pdfFilename })
          pdfBlob = pdfResult.blob
          console.log('PDF generated successfully:', pdfFilename, 'Size:', pdfBlob?.size, 'bytes')
        } catch (pdfErr) {
          console.warn('Could not generate PDF for email attachment:', pdfErr)
        }

        // Use FormData for multipart/form-data submission (required for file uploads)
        const formData = new FormData()
        formData.append('_subject', `Contract Signed: ${contractConfig?.name || currentContractId} - ${clientInfo.companyName || typedName}`)
        formData.append('_replyto', clientInfo.email)
        formData.append('email', clientInfo.email)
        formData.append('clientName', typedName)
        formData.append('clientEmail', clientInfo.email)
        formData.append('clientPhone', clientInfo.phone || 'Not provided')
        formData.append('clientCompany', clientInfo.companyName || 'Not provided')
        formData.append('clientAddress', clientInfo.address || 'Not provided')
        formData.append('selectedPlan', planNames[selectedTier] || 'N/A')
        formData.append('acceptedAt', new Date().toLocaleString())
        formData.append('contractType', contractConfig?.name || currentContractId)
        formData.append('workflowStep', isWorkflow() ? `${getCurrentWorkflowIndex() + 1} of ${getWorkflowContracts().length}` : 'Single contract')

        // Attach PDF if generated successfully
        if (pdfBlob) {
          // Convert blob to File object for proper Formspree handling
          const pdfFile = new File([pdfBlob], pdfFilename, { type: 'application/pdf' })
          formData.append('attachment', pdfFile)
        }

        try {
          console.log('Sending to Formspree with attachment:', pdfBlob ? 'Yes' : 'No')
          const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json' // Tell Formspree to return JSON instead of redirecting
            }
          })
          const responseData = await response.json().catch(() => ({}))
          console.log('Formspree response:', response.status, responseData)
          if (!response.ok) {
            console.warn('Formspree submission returned non-OK status:', response.status, responseData)
          }
        } catch (emailErr) {
          // Non-critical - contract signing still succeeds even if email fails
          console.warn('Could not send email notification:', emailErr)
        }
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

    // Navigate to next step using query param
    // State restoration is handled by the useEffect that watches currentStep
    const nextStep = currentStep + 1
    navigate(`?step=${nextStep}`)
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
    // Load all signed contracts from localStorage
    const savedContracts = JSON.parse(localStorage.getItem('signedContractHtmls') || '[]')

    const handleDownloadContract = (contract) => {
      generateContractPDF({ innerHTML: contract.html }, {
        filename: `${contract.contractName.replace(/\s+/g, '_')}_${typedName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      })
    }

    const handleDownloadAll = () => {
      // Download each contract with a small delay between them
      savedContracts.forEach((contract, index) => {
        setTimeout(() => {
          handleDownloadContract(contract)
        }, index * 1000) // 1 second delay between each
      })
    }

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

          {/* Download PDF buttons */}
          {savedContracts.length > 0 && (
            <div className="mb-6">
              {savedContracts.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All Contracts ({savedContracts.length})
                </button>
              )}

              <div className="space-y-2">
                {savedContracts.map((contract, index) => (
                  <button
                    key={index}
                    onClick={() => handleDownloadContract(contract)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      savedContracts.length > 1
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm'
                        : 'bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 font-semibold'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {savedContracts.length > 1 ? contract.contractName : 'Download Signed Contract (PDF)'}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Tip: In the print dialog, uncheck "Headers and footers" for a cleaner PDF.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            A confirmation has been sent. You will be contacted shortly with next steps.
          </p>

          <button
            onClick={handleResetWorkflow}
            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Start Over
          </button>
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
  const displayStep = getCurrentWorkflowIndex() + 1 // 1-indexed for display

  // Calculate workflow progress percentage
  const workflowProgressPercent = totalWorkflowSteps > 1
    ? Math.round((displayStep / totalWorkflowSteps) * 100)
    : 100

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Progress indicator */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {contractConfig?.name || 'Contract Review'}
              </h1>
              <button
                onClick={handleResetWorkflow}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                title="Start over from the beginning"
              >
                Reset
              </button>
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
                  Contract {displayStep} of {totalWorkflowSteps}
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
                    if (currentStep > 0) {
                      navigate(`?step=${currentStep - 1}`)
                    }
                  }}
                  disabled={displayStep === 1}
                  className={`p-1 rounded transition-all ${
                    displayStep === 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-100 hover:bg-purple-100 cursor-pointer'
                  }`}
                  title={displayStep === 1 ? 'This is the first contract' : 'Go to previous contract'}
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
                    if (displayStep < totalWorkflowSteps && isFormComplete()) {
                      navigate(`?step=${currentStep + 1}`)
                    }
                  }}
                  disabled={displayStep === totalWorkflowSteps || !isFormComplete()}
                  className={`p-1 rounded transition-all ${
                    displayStep === totalWorkflowSteps || !isFormComplete()
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-100 hover:bg-purple-100 cursor-pointer'
                  }`}
                  title={
                    displayStep === totalWorkflowSteps
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
          <div className="w-full mx-auto">
            {/* Render contract - pointer-events-none with selective override via pointer-events-auto on interactive elements */}
            <div ref={contractDocRef} className="pointer-events-none flex justify-center items-center">
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
              <button
                onClick={() => setIsSignaturePanelOpen(!isSignaturePanelOpen)}
                className="w-full flex items-center justify-between mb-4 cursor-pointer group"
              >
                <div className="flex items-center gap-3 w-full justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Sign the Agreement</h2>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isSignaturePanelOpen ? 'rotate-0' : 'rotate-180'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {needsTierFirst && selectedTier && (
                  <span className="text-sm text-blue-600">
                    Selected: <strong>
                      {selectedTier === 'hosting-only' && 'Hosting Only ($50/mo)'}
                      {selectedTier === 'hosting-basic' && 'Basic Maintenance ($80/mo)'}
                      {selectedTier === 'hosting-priority' && 'Priority Maintenance ($100/mo)'}
                    </strong>
                  </span>
                )}
              </button>

              {/* Collapsible content */}
              {isSignaturePanelOpen && (
                <>
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
                        After signing, you'll continue to the next contract ({displayStep} of {totalWorkflowSteps}).
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
                          if (currentStep > 0) {
                            // Navigate to previous contract in workflow using query param
                            // State restoration is handled by the useEffect that watches currentStep
                            navigate(`?step=${currentStep - 1}`)
                          }
                        }}
                        disabled={currentStep === 0}
                        className={`px-6 py-4 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                          currentStep === 0
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={currentStep === 0 ? 'This is the first contract' : 'Go back to previous contract'}
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
                      Step {displayStep} of {totalWorkflowSteps} • {hasNextContract()
                        ? `Next: ${getContractConfig(getWorkflowContracts()[getCurrentWorkflowIndex() + 1])?.name || 'Next Contract'}`
                        : 'Final contract'
                      }
                    </div>
                  )}
                </>
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
