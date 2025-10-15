import React, { createContext, useContext } from 'react'

const FormContext = createContext(null)

export const FormProvider = ({ children, formData, updateField, updateMultipleFields }) => {
  return (
    <FormContext.Provider value={{ formData, updateField, updateMultipleFields }}>
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