import React from 'react'

const ClientSection = ({ formData, updateField }) => {
  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        Client Information
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>
            First Name
          </label>
          <input
            type="text"
            value={formData.clientFirstName}
            onChange={(e) => updateField('clientFirstName', e.target.value)}
            style={inputStyle}
            placeholder="John"
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            Company Name
          </label>
          <input
            type="text"
            value={formData.clientCompanyName}
            onChange={(e) => updateField('clientCompanyName', e.target.value)}
            style={inputStyle}
            placeholder="Client Business Inc"
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            Address
          </label>
          <input
            type="text"
            value={formData.clientAddress}
            onChange={(e) => updateField('clientAddress', e.target.value)}
            style={inputStyle}
            placeholder="456 Business Ave, City, State, ZIP"
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            Email
          </label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => updateField('clientEmail', e.target.value)}
            style={inputStyle}
            placeholder="client@example.com"
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => updateField('clientPhone', e.target.value)}
            style={inputStyle}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  )
}

export default ClientSection