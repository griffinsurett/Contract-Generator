import { useState } from 'react'
import { getContractConfig } from '../contracts'

const FormSidebar = ({ isOpen, onClose, currentContract, businessProfiles = [], onApplyProfile }) => {
  const [currentPage, setCurrentPage] = useState('provider') // 'provider' or 'client'
  const contractConfig = getContractConfig(currentContract)
  const SidebarFormComponent = contractConfig.SidebarForm

  return (
    <div className={`sidebar ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="sidebar-header">
        <div className="flex items-center justify-between mb-2">
          <h2 className="sidebar-title">
            {currentPage === 'provider' ? 'Your Business Info' : 'Client Info (Optional)'}
          </h2>
          <button onClick={onClose} className="sidebar-close-btn">✕</button>
        </div>
        <p className="sidebar-subtitle">
          {currentPage === 'provider'
            ? 'Fill in your company details'
            : 'Pre-fill client details if known'}
        </p>
      </div>

      {/* Page Tabs */}
      <div className="px-4 pt-2 pb-0">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCurrentPage('provider')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'provider'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Your Info
          </button>
          <button
            onClick={() => setCurrentPage('client')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'client'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Client Info
            <span className="ml-1 text-xs text-gray-400">(optional)</span>
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Business Profile Selector - only show on provider page */}
        {currentPage === 'provider' && businessProfiles.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Quick Fill: Your Business Info
            </label>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value && onApplyProfile) {
                  onApplyProfile(e.target.value)
                  e.target.value = '' // Reset after applying
                }
              }}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a profile to apply...</option>
              {businessProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.companyName || profile.contactName || 'Unnamed Profile'}
                  {profile.location && ` - ${profile.location}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-600 mt-2">
              This will fill in your company details automatically.
            </p>
          </div>
        )}

        {/* Info box for client page */}
        {currentPage === 'client' && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Optional:</strong> Pre-fill client details if you already have them.
              Otherwise, leave blank and the client can fill these in when signing.
            </p>
          </div>
        )}

        <SidebarFormComponent page={currentPage} />
      </div>
    </div>
  )
}

export default FormSidebar