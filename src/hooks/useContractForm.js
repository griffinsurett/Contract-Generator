import { useState, useEffect } from 'react'
import { getContractConfig } from '../contracts'

// LocalStorage keys
const STORAGE_KEY_FORM_DATA = 'contractFormData'
const STORAGE_KEY_CURRENT_CONTRACT = 'currentContractId'

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

// Load saved form data from localStorage
const loadSavedFormData = (contractId) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FORM_DATA)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Return saved data for the specific contract, or null if not found
      return parsed[contractId] || null
    }
  } catch (e) {
    console.warn('Could not load saved form data:', e)
  }
  return null
}

// Save form data to localStorage
const saveFormData = (contractId, data) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_FORM_DATA)
    const parsed = existing ? JSON.parse(existing) : {}
    parsed[contractId] = data
    localStorage.setItem(STORAGE_KEY_FORM_DATA, JSON.stringify(parsed))
  } catch (e) {
    console.warn('Could not save form data:', e)
  }
}

// Load saved current contract from localStorage
const loadSavedContractId = (defaultId) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_CONTRACT)
    return saved || defaultId
  } catch {
    return defaultId
  }
}

// Save current contract ID to localStorage
const saveContractId = (contractId) => {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_CONTRACT, contractId)
  } catch {
    // Ignore storage errors
  }
}

export const useContractForm = (initialContractId = 'hosting') => {
  // Try to restore saved contract ID
  const savedContractId = loadSavedContractId(initialContractId)
  const [currentContract, setCurrentContract] = useState(savedContractId)

  // Try to restore saved form data, fall back to defaults
  const [formData, setFormData] = useState(() => {
    const saved = loadSavedFormData(savedContractId)
    if (saved) return saved
    return getContractConfig(savedContractId).defaultFields
  })

  // Auto-save form data to localStorage whenever it changes
  useEffect(() => {
    saveFormData(currentContract, formData)
  }, [currentContract, formData])

  // Auto-save current contract ID to localStorage whenever it changes
  useEffect(() => {
    saveContractId(currentContract)
  }, [currentContract])

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

    // Try to load saved form data for this contract first
    const savedData = loadSavedFormData(contractId)
    const defaultFields = getContractConfig(contractId).defaultFields

    if (businessProfile) {
      // Merge profile data with saved/default fields (profile takes precedence for mapped fields)
      const profileFields = mapProfileToFormFields(businessProfile)
      setFormData({
        ...(savedData || defaultFields),
        ...profileFields
      })
    } else if (savedData) {
      // Use saved data if available
      setFormData(savedData)
    } else {
      // Fall back to defaults
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