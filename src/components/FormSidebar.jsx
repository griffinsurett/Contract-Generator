import React from 'react'
import ServiceProviderSection from './ServiceProviderSection'
import ClientSection from './ClientSection'

const FormSidebar = ({ isOpen, onClose, formData, updateField }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 9999,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '24px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
            Party Information
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Fill in service provider and client details
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ServiceProviderSection formData={formData} updateField={updateField} />
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <ClientSection formData={formData} updateField={updateField} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormSidebar