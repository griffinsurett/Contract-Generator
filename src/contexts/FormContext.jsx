import React, { createContext, useContext } from 'react'

const FormContext = createContext(null)

export const FormProvider = ({
  children,
  formData,
  updateField,
  updateMultipleFields,
  // Optional tier selection props (for client view)
  selectedTier,
  onTierSelect,
  onShowTierDetails,
  // Signature props (for client view)
  signatureData,
  onOpenSignature,
  typedName,
  isClientView = false
}) => {
  return (
    <FormContext.Provider value={{
      formData,
      updateField,
      updateMultipleFields,
      selectedTier,
      onTierSelect,
      onShowTierDetails,
      signatureData,
      onOpenSignature,
      typedName,
      isClientView
    }}>
      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider')
  }
  return context
}