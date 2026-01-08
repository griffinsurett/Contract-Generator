import { useState, useEffect, useRef } from 'react'
import { getContractList, getContractConfig } from '../contracts'
import SignaturePad from 'signature_pad'

// Default workflow templates
const DEFAULT_TEMPLATES = [
  {
    id: 'design-hosting',
    name: 'Design + Hosting',
    description: 'Web design contract followed by hosting agreement',
    contracts: ['web-design', 'hosting']
  }
]

// Empty profile structure for new profiles
const EMPTY_PROFILE = {
  companyName: '',
  contactName: '',
  location: '',
  email: '',
  phone: '',
  signature: '' // Developer signature as data URL
}

// Signature capture component for business profiles
const SignatureCapture = ({ existingSignature, onSave, onClear }) => {
  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (canvasRef.current && !existingSignature) {
      const canvas = canvasRef.current
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext('2d').scale(ratio, ratio)

      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      })

      signaturePadRef.current.addEventListener('endStroke', () => {
        setIsDrawing(true)
      })
    }
  }, [existingSignature])

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
      setIsDrawing(false)
    }
    onClear()
  }

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      // Use SVG format for much smaller file size
      const svgData = signaturePadRef.current.toSVG()
      const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgData)
      onSave(dataUrl)
    }
  }

  // If there's an existing signature, show it with option to change
  if (existingSignature) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Saved signature:</span>
          <button
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Remove & draw new
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2">
          <img
            src={existingSignature}
            alt="Your signature"
            className="h-16 max-w-full object-contain"
          />
        </div>
      </div>
    )
  }

  // No existing signature - show canvas to draw
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-32 bg-white cursor-crosshair"
      />
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          disabled={!isDrawing}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isDrawing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Save Signature
        </button>
      </div>
    </div>
  )
}

const AdminDashboard = ({
  onEditContract,
  businessProfiles = [],
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile
}) => {
  const [view, setView] = useState('home') // 'home' | 'new-contract' | 'new-workflow' | 'templates' | 'settings'
  const [workflowTemplates, setWorkflowTemplates] = useState([])
  const [selectedContracts, setSelectedContracts] = useState([])
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDesc, setNewTemplateDesc] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

  // Local state for editing profile
  const [editingProfile, setEditingProfile] = useState(null)
  const [editingProfileId, setEditingProfileId] = useState(null) // null = new profile, string = editing existing

  // Profile selection when starting a contract
  const [selectedProfileId, setSelectedProfileId] = useState('')

  const contractList = getContractList()

  // Load workflow templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workflowTemplates')
    if (saved) {
      setWorkflowTemplates(JSON.parse(saved))
    } else {
      // Initialize with default templates
      setWorkflowTemplates(DEFAULT_TEMPLATES)
      localStorage.setItem('workflowTemplates', JSON.stringify(DEFAULT_TEMPLATES))
    }
  }, [])

  // Save templates to localStorage
  const saveTemplates = (templates) => {
    setWorkflowTemplates(templates)
    localStorage.setItem('workflowTemplates', JSON.stringify(templates))
  }

  // Add contract to workflow
  const addContract = (contractId) => {
    if (!selectedContracts.includes(contractId)) {
      setSelectedContracts([...selectedContracts, contractId])
    }
  }

  // Remove contract from workflow
  const removeContract = (contractId) => {
    setSelectedContracts(selectedContracts.filter(id => id !== contractId))
  }

  // Move contract in workflow
  const moveContract = (index, direction) => {
    const newOrder = [...selectedContracts]
    const newIndex = index + direction
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]
      setSelectedContracts(newOrder)
    }
  }

  // Save current workflow as template
  const saveAsTemplate = () => {
    if (!newTemplateName.trim() || selectedContracts.length === 0) return

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || `${selectedContracts.length} contracts`,
      contracts: [...selectedContracts]
    }

    saveTemplates([...workflowTemplates, newTemplate])
    setNewTemplateName('')
    setNewTemplateDesc('')
    setShowSaveTemplate(false)
  }

  // Delete a template
  const deleteTemplate = (templateId) => {
    // Don't allow deleting default templates
    if (DEFAULT_TEMPLATES.some(t => t.id === templateId)) {
      alert('Cannot delete default templates')
      return
    }
    saveTemplates(workflowTemplates.filter(t => t.id !== templateId))
  }

  // Use a template
  const useTemplate = (template) => {
    setSelectedContracts([...template.contracts])
    setView('new-workflow')
  }

  // Edit contract and then generate link (goes to editor view)
  const editAndGenerateContract = (contractId) => {
    onEditContract(contractId)
  }

  // Edit workflow contracts (goes to editor view with workflow data)
  const editAndGenerateWorkflow = () => {
    if (selectedContracts.length === 0) return
    // For workflows, we'll edit the first contract and pass workflow info
    onEditContract(selectedContracts[0], {
      isWorkflow: true,
      workflow: selectedContracts
    }, selectedProfileId || null)
  }

  // Check if any business profiles exist
  const hasProfiles = businessProfiles.length > 0

  // Home view
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Generator</h1>
              <p className="text-gray-600">Create and send contracts for client signatures</p>
            </div>
            <button
              onClick={() => setView('settings')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Profiles ({businessProfiles.length})
            </button>
          </div>

          {/* Business Profile Info - show when no profiles exist */}
          {!hasProfiles && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-medium text-blue-800">Tip: Create business profiles</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Save your company info to quickly fill contracts.{' '}
                    <button
                      onClick={() => {
                        setEditingProfile({ ...EMPTY_PROFILE })
                        setEditingProfileId(null)
                        setView('settings')
                      }}
                      className="underline font-medium hover:text-blue-900"
                    >
                      Create a profile
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* New Single Contract */}
            <button
              onClick={() => setView('new-contract')}
              className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">New Contract</h2>
              <p className="text-sm text-gray-500">Send a single contract for signature</p>
            </button>

            {/* New Workflow */}
            <button
              onClick={() => { setSelectedContracts([]); setView('new-workflow') }}
              className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">New Workflow</h2>
              <p className="text-sm text-gray-500">Chain multiple contracts together</p>
            </button>
          </div>

          {/* Workflow Templates */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Workflow Templates</h2>
              <button
                onClick={() => setView('templates')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Manage Templates
              </button>
            </div>

            {workflowTemplates.length === 0 ? (
              <p className="text-gray-500 text-sm">No templates yet. Create a workflow and save it as a template.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {workflowTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => useTemplate(template)}
                    className="p-4 border border-gray-200 rounded-lg text-left hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {template.contracts.map((contractId, idx) => {
                        const contract = contractList.find(c => c.id === contractId)
                        return (
                          <span key={contractId} className="inline-flex items-center text-xs">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              {contract?.name || contractId}
                            </span>
                            {idx < template.contracts.length - 1 && (
                              <span className="mx-1 text-gray-400">→</span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Contracts - placeholder for future */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex gap-3">
              {contractList.slice(0, 3).map(contract => (
                <button
                  key={contract.id}
                  onClick={() => {
                    onEditContract(contract.id)
                    setView('new-contract')
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  {contract.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // New Contract view
  if (view === 'new-contract') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setSelectedProfileId('')
              setView('home')
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select a Contract</h1>
          <p className="text-gray-600 mb-6">Choose a contract to fill out and generate a shareable link</p>

          {/* Profile selector */}
          {businessProfiles.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-fill with business profile (optional)
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No profile - start blank</option>
                {businessProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.companyName || profile.contactName || 'Unnamed Profile'}
                    {profile.location && ` - ${profile.location}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            {contractList.map(contract => {
              const config = getContractConfig(contract.id)
              return (
                <button
                  key={contract.id}
                  onClick={() => {
                    onEditContract(contract.id, null, selectedProfileId || null)
                  }}
                  className="w-full bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{contract.name}</h3>
                      <p className="text-sm text-gray-500">
                        {config?.description || 'Standard contract template'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium ml-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // New Workflow view
  if (view === 'new-workflow') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setSelectedProfileId('')
              setView('home')
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Build a Workflow</h1>

          {/* Profile selector */}
          {businessProfiles.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-fill with business profile (optional)
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">No profile - start blank</option>
                {businessProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.companyName || profile.contactName || 'Unnamed Profile'}
                    {profile.location && ` - ${profile.location}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* Contract selector */}
            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Available Contracts</h2>
              <div className="space-y-3">
                {contractList.map(contract => {
                  const config = getContractConfig(contract.id)
                  const isAdded = selectedContracts.includes(contract.id)
                  return (
                    <button
                      key={contract.id}
                      onClick={() => !isAdded && addContract(contract.id)}
                      disabled={isAdded}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        isAdded
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-50 hover:bg-purple-50 hover:border-purple-300 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{contract.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {config?.description || 'Standard contract template'}
                          </p>
                        </div>
                        {isAdded ? (
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded ml-4">Added</span>
                        ) : (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded ml-4">+ Add</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Workflow order */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Workflow Order</h2>

              {selectedContracts.length === 0 ? (
                <p className="text-gray-500 text-sm">Click contracts to add them to the workflow</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {selectedContracts.map((contractId, index) => {
                    const contract = contractList.find(c => c.id === contractId)
                    return (
                      <li key={contractId} className="flex items-center gap-2 bg-purple-50 rounded-lg p-2">
                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                          {contract?.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveContract(index, -1)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveContract(index, 1)}
                            disabled={index === selectedContracts.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => removeContract(contractId)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {selectedContracts.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={editAndGenerateWorkflow}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Fill Out & Generate Link
                  </button>
                  <button
                    onClick={() => setShowSaveTemplate(true)}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Save as Template
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Template Modal */}
        {showSaveTemplate && (
          <>
            <div onClick={() => setShowSaveTemplate(false)} className="fixed inset-0 bg-black/50 z-50" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-50 w-96">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Save as Template</h2>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Template name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAsTemplate}
                  disabled={!newTemplateName.trim()}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    )
  }

  // Manage Templates view
  if (view === 'templates') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Templates</h1>

          <div className="bg-white rounded-xl shadow-md p-6">
            {workflowTemplates.length === 0 ? (
              <p className="text-gray-500">No templates yet.</p>
            ) : (
              <ul className="space-y-3">
                {workflowTemplates.map(template => {
                  const isDefault = DEFAULT_TEMPLATES.some(t => t.id === template.id)
                  return (
                    <li key={template.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {template.name}
                          {isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Default</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {template.contracts.map((contractId, idx) => {
                            const contract = contractList.find(c => c.id === contractId)
                            return (
                              <span key={contractId} className="inline-flex items-center text-xs">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  {contract?.name || contractId}
                                </span>
                                {idx < template.contracts.length - 1 && (
                                  <span className="mx-1 text-gray-400">→</span>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => useTemplate(template)}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
                        >
                          Use
                        </button>
                        {!isDefault && (
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <button
              onClick={() => { setSelectedContracts([]); setView('new-workflow') }}
              className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              + Create New Template
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Settings view
  if (view === 'settings') {
    // If editing a profile, show the edit form
    if (editingProfile) {
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setEditingProfile(null)
                setEditingProfileId(null)
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profiles
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {editingProfileId ? 'Edit Profile' : 'New Profile'}
            </h1>
            <p className="text-gray-600 mb-6">
              This information will auto-fill across all contracts when this profile is active.
            </p>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editingProfile.companyName || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, companyName: e.target.value })}
                    placeholder="Your Company LLC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editingProfile.contactName || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, contactName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={editingProfile.location || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingProfile.email || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                      placeholder="contact@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editingProfile.phone || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Signature Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Signature
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    This signature will automatically appear on contracts you create.
                  </p>
                  <SignatureCapture
                    existingSignature={editingProfile.signature}
                    onSave={(signatureData) => setEditingProfile({ ...editingProfile, signature: signatureData })}
                    onClear={() => setEditingProfile({ ...editingProfile, signature: '' })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (editingProfileId) {
                      // Update existing profile
                      onUpdateProfile(editingProfileId, editingProfile)
                    } else {
                      // Add new profile
                      onAddProfile(editingProfile)
                    }
                    setEditingProfile(null)
                    setEditingProfileId(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingProfileId ? 'Save Changes' : 'Create Profile'}
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(null)
                    setEditingProfileId(null)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Profile list view
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Profiles</h1>
          <p className="text-gray-600 mb-6">
            Manage multiple business profiles. The active profile auto-fills contract fields.
          </p>

          {/* Profile List */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            {businessProfiles.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No business profiles yet</p>
                <button
                  onClick={() => {
                    setEditingProfile({ ...EMPTY_PROFILE })
                    setEditingProfileId(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your First Profile
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {businessProfiles.map(profile => (
                  <li
                    key={profile.id}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-blue-600">
                      {(profile.companyName || profile.contactName || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {profile.companyName || 'Unnamed Company'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {profile.contactName || 'No contact name'}
                        {profile.location && ` • ${profile.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProfile({ ...profile })
                          setEditingProfileId(profile.id)
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this profile?')) {
                            onDeleteProfile(profile.id)
                          }
                        }}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {businessProfiles.length > 0 && (
              <button
                onClick={() => {
                  setEditingProfile({ ...EMPTY_PROFILE })
                  setEditingProfileId(null)
                }}
                className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Another Profile
              </button>
            )}
          </div>

          {/* Info box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>How it works:</strong> When creating a contract, you'll be able to select which profile to use. You can also change profiles while editing using the "Apply Profile" dropdown.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AdminDashboard
