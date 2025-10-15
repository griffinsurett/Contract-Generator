import React from 'react'

const ServiceProviderSection = ({ formData, updateField }) => {
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
        Service Provider Information
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>
            Contact Name
          </label>
          <input
            type="text"
            value={formData.serviceProviderName}
            onChange={(e) => updateField('serviceProviderName', e.target.value)}
            style={inputStyle}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label style={labelStyle}>
            Company Name
          </label>
          <input
            type="text"
            value={formData.serviceProviderCompany}
            onChange={(e) => updateField('serviceProviderCompany', e.target.value)}
            style={inputStyle}
            placeholder="Your Company LLC"
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            Location
          </label>
          <input
            type="text"
            value={formData.serviceProviderLocation}
            onChange={(e) => updateField('serviceProviderLocation', e.target.value)}
            style={inputStyle}
            placeholder="123 Main St, City, State, ZIP"
          />
        </div>
      </div>
    </div>
  )
}

export default ServiceProviderSection