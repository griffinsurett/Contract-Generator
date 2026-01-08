import { useState } from 'react'
import FormSidebar from './components/FormSidebar'
import AdminDashboard from './components/AdminDashboard'
import { useContractForm } from './hooks/useContractForm'
import { getContractConfig, getContractList } from './contracts'
import { FormProvider } from './contexts/FormContext'
import { generateContractLink, generateWorkflowLink } from './utils/contractUrl'

function App() {
  // View state: 'dashboard' or 'editor'
  const [view, setView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true) // Open by default so admin can fill out fields
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  // Workflow state
  const [workflowInfo, setWorkflowInfo] = useState(null) // { isWorkflow: true, workflow: ['contract-1', 'contract-2'] }
  const [currentWorkflowIndex, setCurrentWorkflowIndex] = useState(0)

  // Multiple business profiles state with localStorage persistence
  const [businessProfiles, setBusinessProfiles] = useState(() => {
    const saved = localStorage.getItem('businessProfiles')
    return saved ? JSON.parse(saved) : []
  })

  // Currently selected profile for this editing session (not persisted)
  const [selectedProfileId, setSelectedProfileId] = useState(null)

  // Get a profile by ID
  const getProfileById = (profileId) => {
    if (!profileId) return null
    return businessProfiles.find(p => p.id === profileId) || null
  }

  const contractForm = useContractForm()
  const contractList = getContractList()

  // Save profiles to localStorage
  const saveProfiles = (profiles) => {
    setBusinessProfiles(profiles)
    localStorage.setItem('businessProfiles', JSON.stringify(profiles))
  }

  // Add a new profile
  const handleAddProfile = (profile) => {
    const newProfile = {
      ...profile,
      id: `profile-${Date.now()}`
    }
    const updated = [...businessProfiles, newProfile]
    saveProfiles(updated)
    return newProfile
  }

  // Update an existing profile
  const handleUpdateProfile = (profileId, updates) => {
    const updated = businessProfiles.map(p =>
      p.id === profileId ? { ...p, ...updates } : p
    )
    saveProfiles(updated)
  }

  // Delete a profile
  const handleDeleteProfile = (profileId) => {
    const updated = businessProfiles.filter(p => p.id !== profileId)
    saveProfiles(updated)
  }

  // Apply a profile to current contract form (and remember it for the whole workflow)
  const handleApplyProfile = (profileId) => {
    const profile = businessProfiles.find(p => p.id === profileId)
    if (profile) {
      // Remember the selected profile for workflow navigation
      setSelectedProfileId(profileId)
      // Apply to current contract
      contractForm.applyBusinessProfile(profile, contractForm.currentContract)
    }
  }

  // Switch to editor view for a specific contract (or workflow)
  const handleEditContract = (contractId, workflow = null, profileId = null) => {
    // Apply selected profile when switching contracts (if provided)
    const profile = profileId ? getProfileById(profileId) : null
    setSelectedProfileId(profileId)
    contractForm.switchContract(contractId, profile)
    if (workflow?.isWorkflow) {
      setWorkflowInfo(workflow)
      setCurrentWorkflowIndex(0)
    } else {
      setWorkflowInfo(null)
      setCurrentWorkflowIndex(0)
    }
    setView('editor')
  }

  // Move to next contract in workflow
  const handleNextContract = () => {
    if (!workflowInfo || currentWorkflowIndex >= workflowInfo.workflow.length - 1) return
    const nextIndex = currentWorkflowIndex + 1
    setCurrentWorkflowIndex(nextIndex)
    // Keep the same profile for the workflow
    const profile = selectedProfileId ? getProfileById(selectedProfileId) : null
    contractForm.switchContract(workflowInfo.workflow[nextIndex], profile)
  }

  // Move to previous contract in workflow
  const handlePrevContract = () => {
    if (!workflowInfo || currentWorkflowIndex <= 0) return
    const prevIndex = currentWorkflowIndex - 1
    setCurrentWorkflowIndex(prevIndex)
    // Keep the same profile for the workflow
    const profile = selectedProfileId ? getProfileById(selectedProfileId) : null
    contractForm.switchContract(workflowInfo.workflow[prevIndex], profile)
  }

  // Generate link for current contract or workflow
  const handleGenerateLink = () => {
    let link
    if (workflowInfo?.isWorkflow) {
      link = generateWorkflowLink(
        workflowInfo.workflow,
        contractForm.formData,
        {}
      )
    } else {
      link = generateContractLink(
        contractForm.currentContract,
        contractForm.formData,
        {}
      )
    }
    setGeneratedLink(link)
    setShowLinkModal(true)
    setCopySuccess(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const currentContractConfig = getContractConfig(contractForm.currentContract)
  const DocumentComponent = currentContractConfig?.Document

  // Dashboard view
  if (view === 'dashboard') {
    return (
      <AdminDashboard
        onEditContract={handleEditContract}
        businessProfiles={businessProfiles}
        onAddProfile={handleAddProfile}
        onUpdateProfile={handleUpdateProfile}
        onDeleteProfile={handleDeleteProfile}
      />
    )
  }

  // Editor view
  const isWorkflow = workflowInfo?.isWorkflow
  const totalContracts = workflowInfo?.workflow?.length || 1

  return (
    <FormProvider
      formData={contractForm.formData}
      updateField={contractForm.updateField}
      updateMultipleFields={contractForm.updateMultipleFields}
    >
      <div className="min-h-screen bg-gray-200 relative">
        {/* Top bar */}
        <div className="sticky top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-3">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="font-semibold text-gray-900">
                {currentContractConfig?.name || 'Contract Editor'}
              </h1>
              {isWorkflow && (
                <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                  {currentWorkflowIndex + 1} of {totalContracts}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Profile selector dropdown */}
              {businessProfiles.length > 0 && (
                <select
                  value={selectedProfileId || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleApplyProfile(e.target.value)
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    selectedProfileId
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <option value="">Select Profile...</option>
                  {businessProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.companyName || profile.contactName || 'Unnamed Profile'}
                    </option>
                  ))}
                </select>
              )}
              {/* Workflow navigation */}
              {isWorkflow && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={handlePrevContract}
                    disabled={currentWorkflowIndex === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous contract"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    {workflowInfo.workflow.map((contractId, idx) => {
                      const contract = contractList.find(c => c.id === contractId)
                      return (
                        <span
                          key={contractId}
                          className={`text-xs px-2 py-1 rounded ${
                            idx === currentWorkflowIndex
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                          title={contract?.name}
                        >
                          {idx + 1}
                        </span>
                      )
                    })}
                  </div>
                  <button
                    onClick={handleNextContract}
                    disabled={currentWorkflowIndex === totalContracts - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next contract"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Edit Fields
              </button>
              <button
                onClick={handleGenerateLink}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Generate Link
              </button>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="overlay" />}

        {/* Main Document */}
        <div className="pt-20 pb-10 mx-auto flex justify-center items-center">
          <div className="max-w-[900px]">
            {DocumentComponent && <DocumentComponent />}
          </div>
        </div>

        {/* Sidebar */}
        <FormSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentContract={contractForm.currentContract}
          businessProfiles={businessProfiles}
          onApplyProfile={handleApplyProfile}
        />

        {/* Generate Link Modal */}
        {showLinkModal && (
          <>
            <div onClick={() => setShowLinkModal(false)} className="fixed inset-0 bg-black/60 z-[10000]" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-[10001] w-[600px] max-w-[90vw]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Client Contract Link</h2>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Workflow info */}
              {isWorkflow && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 font-medium mb-2">Workflow ({totalContracts} contracts):</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {workflowInfo.workflow.map((contractId, idx) => {
                      const contract = contractList.find(c => c.id === contractId)
                      return (
                        <span key={contractId} className="inline-flex items-center text-xs">
                          <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded">
                            {contract?.name || contractId}
                          </span>
                          {idx < workflowInfo.workflow.length - 1 && (
                            <span className="mx-1 text-purple-400">→</span>
                          )}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <p className="text-gray-600 mb-4">
                Share this link with your client. They will be able to:
              </p>
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                <li>• Read the entire contract{isWorkflow ? 's' : ''} (must scroll to bottom)</li>
                {(contractForm.currentContract === 'hosting' || (isWorkflow && workflowInfo?.workflow?.includes('hosting'))) && (
                  <li>• Choose a hosting plan: Hosting ($50), Basic Maintenance ($80), or Priority ($100)</li>
                )}
                <li>• Sign with typed name and drawn signature</li>
              </ul>

              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="w-full bg-transparent text-sm text-gray-700 outline-none font-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    copySuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copySuccess ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => window.open(generatedLink, '_blank')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Preview
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Note: Link contains all contract data encoded in the URL
              </p>
            </div>
          </>
        )}
      </div>
    </FormProvider>
  )
}

export default App
