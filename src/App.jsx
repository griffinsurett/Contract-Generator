import React, { useState } from 'react'
import ContractDocument from './components/ContractDocument'
import FormSidebar from './components/FormSidebar'
import { useContractForm } from './hooks/useContractForm'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const contractForm = useContractForm()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e5e7eb', position: 'relative' }}>
      {/* Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          width: '40px',
          height: '40px',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <span style={{
          display: 'block',
          width: '20px',
          height: '2px',
          backgroundColor: '#374151',
          transition: 'all 0.3s',
          transform: sidebarOpen ? 'rotate(45deg) translateY(6px)' : 'none'
        }} />
        <span style={{
          display: 'block',
          width: '20px',
          height: '2px',
          backgroundColor: '#374151',
          transition: 'all 0.3s',
          opacity: sidebarOpen ? 0 : 1
        }} />
        <span style={{
          display: 'block',
          width: '20px',
          height: '2px',
          backgroundColor: '#374151',
          transition: 'all 0.3s',
          transform: sidebarOpen ? 'rotate(-45deg) translateY(-6px)' : 'none'
        }} />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
        />
      )}

      {/* Main Document */}
      <div style={{ padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <ContractDocument 
            formData={contractForm.formData} 
            updateField={contractForm.updateField}
          />
        </div>
      </div>

      {/* Sidebar */}
      <FormSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        formData={contractForm.formData}
        updateField={contractForm.updateField}
      />
    </div>
  )
}

export default App