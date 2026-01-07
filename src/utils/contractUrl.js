// Fields to exclude from URL encoding (too large for URL headers)
const EXCLUDED_FIELDS = ['developerSignature']

/**
 * Filter out large fields that shouldn't be in the URL
 */
const filterFormData = (formData) => {
  const filtered = { ...formData }
  EXCLUDED_FIELDS.forEach(field => {
    delete filtered[field]
  })
  return filtered
}

/**
 * Encode contract data to a URL-safe string
 */
export const encodeContractData = (contractId, formData, options = {}) => {
  const payload = {
    contractId,
    formData: filterFormData(formData),
    options, // service tiers, pricing, etc.
    createdAt: new Date().toISOString()
  }

  const jsonString = JSON.stringify(payload)
  // Use base64 encoding for URL safety
  const encoded = btoa(encodeURIComponent(jsonString))
  return encoded
}

/**
 * Decode contract data from URL parameter
 */
export const decodeContractData = (encodedString) => {
  try {
    const jsonString = decodeURIComponent(atob(encodedString))
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to decode contract data:', error)
    return null
  }
}

/**
 * Generate a shareable link for the contract
 */
export const generateContractLink = (contractId, formData, options = {}) => {
  const encoded = encodeContractData(contractId, formData, options)
  const baseUrl = window.location.origin
  return `${baseUrl}/sign/${encoded}`
}

/**
 * Generate a shareable link for a workflow (multiple contracts in sequence)
 */
export const generateWorkflowLink = (contractIds, formData, options = {}) => {
  const payload = {
    isWorkflow: true,
    workflow: contractIds,
    currentIndex: 0,
    formData: filterFormData(formData),
    options,
    createdAt: new Date().toISOString()
  }

  const jsonString = JSON.stringify(payload)
  const encoded = btoa(encodeURIComponent(jsonString))
  const baseUrl = window.location.origin
  return `${baseUrl}/sign/${encoded}`
}

/**
 * Generate a link for the next contract in a workflow
 */
export const generateNextWorkflowLink = (workflow, currentIndex, formData, options = {}) => {
  const nextIndex = currentIndex + 1
  if (nextIndex >= workflow.length) {
    return null // No more contracts in workflow
  }

  const payload = {
    isWorkflow: true,
    workflow,
    currentIndex: nextIndex,
    formData: filterFormData(formData),
    options,
    createdAt: new Date().toISOString()
  }

  const jsonString = JSON.stringify(payload)
  const encoded = btoa(encodeURIComponent(jsonString))
  const baseUrl = window.location.origin
  return `${baseUrl}/sign/${encoded}`
}
