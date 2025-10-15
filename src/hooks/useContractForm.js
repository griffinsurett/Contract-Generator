import { useState } from 'react'
import { getContractConfig } from '../contracts'

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

  const switchContract = (contractId) => {
    setCurrentContract(contractId)
    setFormData(getContractConfig(contractId).defaultFields)
  }

  return {
    currentContract,
    formData,
    updateField,
    updateMultipleFields,
    switchContract
  }
}