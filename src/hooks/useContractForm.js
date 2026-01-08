import { useState } from 'react'
import { getContractConfig } from '../contracts'

// Map business profile fields to contract form fields
// Sets ALL provider field variants so data is available across all contract types
const mapProfileToFormFields = (profile) => {
  if (!profile) return {}

  // Set all provider field variants so data works across all contracts
  return {
    // Common signature field
    developerSignature: profile.signature || '',

    // Hosting contract fields
    serviceProviderName: profile.contactName || '',
    serviceProviderCompany: profile.companyName || '',
    serviceProviderLocation: profile.location || '',

    // Web Design contract fields
    developerName: profile.contactName || '',
    developerCompany: profile.companyName || '',
    developerLocation: profile.location || '',

    // Google Workspace contract fields
    serviceProviderLegalName: profile.contactName || '',
    serviceProviderEntity: profile.companyName || '',
    serviceProviderAddress: profile.location || '',

    // NDA contract fields
    disclosingPartyName: profile.contactName || '',
    disclosingPartyCompany: profile.companyName || '',
    disclosingPartyAddress: profile.location || ''
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
      const profileFields = mapProfileToFormFields(businessProfile)
      setFormData({
        ...defaultFields,
        ...profileFields
      })
    } else {
      setFormData(defaultFields)
    }
  }

  // Apply business profile to current form data
  const applyBusinessProfile = (profile) => {
    if (!profile) return
    const profileFields = mapProfileToFormFields(profile)
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