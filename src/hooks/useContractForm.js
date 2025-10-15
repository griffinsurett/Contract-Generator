import { useState } from 'react'

export const useContractForm = () => {
  const [formData, setFormData] = useState({
    // Service Provider Details
    serviceProviderName: '',
    serviceProviderCompany: '',
    serviceProviderLocation: '',
    
    // Client Details
    clientFirstName: '',
    clientCompanyName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    
    // Date
    day: '',
    month: '',
    year: '',
    
    // Exhibit A - Website Type
    websiteType: 'static',
    dynamicFeatures: '',
    
    // Maintenance Services (array of booleans)
    maintenanceServices: [],
    
    // Content Updates (array of booleans)
    contentUpdates: [],
    
    // Form Monitoring
    formMonitoring: false,
    
    // Form Management
    formspreeManagement: 'service-provider',
    
    // Service Start Date
    serviceStartDate: '',
    
    // Billing Period
    billingPeriod: 'monthly',
    
    // Fees
    totalFee: '',
    feeFrequency: 'month',
    
    // Invoicing Method
    invoicingMethod: 'upfront',
    invoicingOther: '',
    
    // Late Payment
    lateFeeAmount: '',
    lateFeePercentage: '',
    lateFeeDays: '',
    
    // Additional Notes
    additionalNotes: ''
  })

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateMultipleFields = (fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }))
  }

  return {
    formData,
    updateField,
    updateMultipleFields
  }
}