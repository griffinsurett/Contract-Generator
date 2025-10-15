import React, { useState } from 'react'
import FormSidebar from './components/FormSidebar'
import { useContractForm } from './hooks/useContractForm'
import { getContractList, getContractConfig } from './contracts'
import { FormProvider } from './contexts/FormContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const contractForm = useContractForm()

  const contractList = getContractList()
  const currentContractConfig = getContractConfig(contractForm.currentContract)
  
  const DocumentComponent = currentContractConfig.Document

  return (
    <FormProvider 
      formData={contractForm.formData} 
      updateField={contractForm.updateField}
      updateMultipleFields={contractForm.updateMultipleFields}
    >
      <div className="min-h-screen bg-gray-200 relative">
        {/* Hamburger Button */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hamburger-btn">
          <span className={`hamburger-line ${sidebarOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`hamburger-line ${sidebarOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>

        {/* Overlay */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="overlay" />}

        {/* Contract Selector Dropdown */}
        <div className="contract-selector-container">
          <label className="contract-selector-label">Select Contract:</label>
          <select
            value={contractForm.currentContract}
            onChange={(e) => contractForm.switchContract(e.target.value)}
            className="contract-selector"
          >
            {contractList.map(contract => (
              <option key={contract.id} value={contract.id}>
                {contract.name}
              </option>
            ))}
          </select>
        </div>

        {/* Main Document */}
        <div className="py-10 mx-auto flex justify-center items-center">
          <div className="max-w-[900px]">
            <DocumentComponent />
          </div>
        </div>

        {/* Sidebar */}
        <FormSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentContract={contractForm.currentContract}
        />
      </div>
    </FormProvider>
  )
}

export default App