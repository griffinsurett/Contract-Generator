/**
 * Compress a signature image (base64 data URL) to reduce size
 * Resizes to max 300px width and converts to JPEG with quality reduction
 */
const compressSignature = (dataUrl, maxWidth = 300, quality = 0.6) => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl)
      return
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      // White background for JPEG (transparent becomes black otherwise)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to JPEG with reduced quality
      const compressed = canvas.toDataURL('image/jpeg', quality)
      resolve(compressed)
    }
    img.onerror = () => resolve(dataUrl) // Fallback to original on error
    img.src = dataUrl
  })
}

/**
 * Process form data, compressing any signature fields
 */
const processFormData = async (formData) => {
  const processed = { ...formData }

  // Compress developerSignature if present
  if (processed.developerSignature) {
    processed.developerSignature = await compressSignature(processed.developerSignature)
  }

  return processed
}

/**
 * Encode contract data to a URL-safe string (async to handle compression)
 */
export const encodeContractData = async (contractId, formData, options = {}) => {
  const processedFormData = await processFormData(formData)

  const payload = {
    contractId,
    formData: processedFormData,
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
export const generateContractLink = async (contractId, formData, options = {}) => {
  const encoded = await encodeContractData(contractId, formData, options)
  const baseUrl = window.location.origin
  return `${baseUrl}/sign/${encoded}`
}

/**
 * Generate a shareable link for a workflow (multiple contracts in sequence)
 * Step is now managed via URL query params (?step=0, ?step=1, etc.)
 */
export const generateWorkflowLink = async (contractIds, formData, options = {}) => {
  const processedFormData = await processFormData(formData)

  const payload = {
    isWorkflow: true,
    workflow: contractIds,
    formData: processedFormData,
    options,
    createdAt: new Date().toISOString()
  }

  const jsonString = JSON.stringify(payload)
  const encoded = btoa(encodeURIComponent(jsonString))
  const baseUrl = window.location.origin
  // Include ?step=0 so the step is visible in the URL from the start
  return `${baseUrl}/sign/${encoded}?step=0`
}
