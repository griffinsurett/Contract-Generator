import { useState } from 'react'
import { getContractConfig } from '../contracts'

// Map business profile fields to contract form fields based on contract type
const mapProfileToFormFields = (profile, contractId) => {
  if (!profile) return {}

  // Common field for developer signature (shared across all contracts)
  const commonFields = {
    developerSignature: profile.signature || ''
  }

  // Different contracts use different field names for provider info
  switch (contractId) {
    case 'hosting':
      return {
        ...commonFields,
        serviceProviderName: profile.contactName || '',
        serviceProviderCompany: profile.companyName || '',
        serviceProviderLocation: profile.location || ''
      }
    case 'web-design':
      return {
        ...commonFields,
        developerName: profile.contactName || '',
        developerCompany: profile.companyName || '',
        developerLocation: profile.location || ''
      }
    case 'google-workspace':
      return {
        ...commonFields,
        serviceProviderLegalName: profile.contactName || '',
        serviceProviderEntity: profile.companyName || '',
        serviceProviderAddress: profile.location || ''
      }
    case 'nda':
      return {
        ...commonFields,
        disclosingPartyName: profile.contactName || '',
        disclosingPartyCompany: profile.companyName || '',
        disclosingPartyAddress: profile.location || ''
      }
    default:
      return commonFields
  }
}

export const useContractForm = (initialContractId = 'hosting') => {
  const [currentContract, setCurrentContract] = useState(initialContractId)
  const [formData, setFormData] = useState(
    getContractConfig(initialContractId).defaultFields
  )

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

  // Switch to a new contract, optionally applying business profile defaults
  const switchContract = (contractId, businessProfile = null) => {
    setCurrentContract(contractId)
    const defaultFields = getContractConfig(contractId).defaultFields

    if (businessProfile) {
      // Merge profile data with default fields (profile takes precedence for mapped fields)
      const profileFields = mapProfileToFormFields(businessProfile, contractId)
      setFormData({
        ...defaultFields,
        ...profileFields
      })
    } else {
      setFormData(defaultFields)
    }
  }

  // Apply business profile to current form data
  const applyBusinessProfile = (profile, contractId) => {
    if (!profile) return
    const profileFields = mapProfileToFormFields(profile, contractId || currentContract)
    setFormData(prev => ({
      ...prev,
      ...profileFields
    }))
  }

  return {
    currentContract,
    formData,
    updateField,
    updateMultipleFields,
    switchContract,
    applyBusinessProfile
  }
}