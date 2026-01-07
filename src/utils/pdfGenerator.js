import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Generates a PDF from a contract element and returns it as a base64 data URL
 * @param {HTMLElement} element - The contract document element to convert
 * @param {Object} options - Configuration options
 * @returns {Promise<{dataUrl: string, blob: Blob}>} - PDF as data URL and Blob
 */
export const generateContractPDF = async (element, options = {}) => {
  const {
    filename = 'contract.pdf',
    clientName = 'Client',
    contractType = 'Contract',
    signatureData = null,
    selectedTier = null,
    clientInfo = {}
  } = options

  // Create a clone of the element to modify for PDF
  const clone = element.cloneNode(true)

  // Remove any interactive elements and fix styling for PDF
  clone.querySelectorAll('input, select, textarea').forEach(input => {
    const span = document.createElement('span')
    span.textContent = input.value || input.placeholder || '___________'
    // Explicit styling to prevent any inherited strikethrough or decoration
    span.style.cssText = `
      border-bottom: 1px solid #333;
      padding: 0 4px;
      text-decoration: none !important;
      display: inline;
      font-weight: inherit;
      color: #000000;
    `
    input.parentNode.replaceChild(span, input)
  })

  // Create a container for the PDF content
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '816px' // Letter width at 96 DPI
  container.style.padding = '40px'
  container.style.backgroundColor = 'white'
  container.style.fontFamily = 'Times New Roman, serif'
  container.style.color = '#000000' // Force black text to avoid oklch issues

  // Force safe colors on all elements (faster than checking each computed style)
  const forceBasicColors = (el) => {
    el.style.setProperty('color', '#000000', 'important')
    el.style.setProperty('text-decoration', 'none', 'important')
  }

  // Add header with contract info
  const header = document.createElement('div')
  header.style.marginBottom = '20px'
  header.style.paddingBottom = '20px'
  header.style.borderBottom = '2px solid #333'
  header.innerHTML = `
    <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #111;">${contractType}</h1>
    <p style="margin: 0; color: #666; font-size: 12px;">Signed by: ${clientName}</p>
    <p style="margin: 0; color: #666; font-size: 12px;">Date: ${new Date().toLocaleDateString()}</p>
    ${selectedTier ? `<p style="margin: 0; color: #666; font-size: 12px;">Selected Plan: ${
      selectedTier === 'hosting-only' ? 'Hosting Only ($50/mo)' :
      selectedTier === 'hosting-basic' ? 'Basic Maintenance ($80/mo)' :
      selectedTier === 'hosting-priority' ? 'Priority Maintenance ($100/mo)' : selectedTier
    }</p>` : ''}
  `

  container.appendChild(header)

  // Apply basic colors to all elements in clone (single pass)
  clone.querySelectorAll('*').forEach(forceBasicColors)
  forceBasicColors(clone)
  container.appendChild(clone)

  // Add signature section at the bottom
  if (signatureData || clientName) {
    const signatureSection = document.createElement('div')
    signatureSection.style.marginTop = '40px'
    signatureSection.style.paddingTop = '20px'
    signatureSection.style.borderTop = '2px solid #333'
    signatureSection.style.pageBreakInside = 'avoid'

    signatureSection.innerHTML = `
      <h3 style="margin: 0 0 20px 0; font-size: 16px;">Signature</h3>
      <div style="display: flex; gap: 40px;">
        <div style="flex: 1;">
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Typed Name:</p>
          <p style="margin: 0; font-size: 16px; font-weight: bold;">${clientName}</p>
        </div>
        ${signatureData ? `
          <div style="flex: 1;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Signature:</p>
            <img src="${signatureData}" style="max-width: 200px; max-height: 80px; border-bottom: 1px solid #333;" />
          </div>
        ` : ''}
      </div>
      <div style="margin-top: 20px;">
        <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Client Information:</p>
        <p style="margin: 0; font-size: 14px;">${clientInfo.fullName || clientName}</p>
        ${clientInfo.email ? `<p style="margin: 0; font-size: 14px;">${clientInfo.email}</p>` : ''}
        ${clientInfo.phone ? `<p style="margin: 0; font-size: 14px;">${clientInfo.phone}</p>` : ''}
        ${clientInfo.companyName ? `<p style="margin: 0; font-size: 14px;">${clientInfo.companyName}</p>` : ''}
        ${clientInfo.address ? `<p style="margin: 0; font-size: 14px;">${clientInfo.address}</p>` : ''}
      </div>
      <p style="margin-top: 20px; font-size: 11px; color: #999;">
        Electronically signed on ${new Date().toLocaleString()}
      </p>
    `

    container.appendChild(signatureSection)
  }

  // Add a style element to override oklch colors globally within our container
  const styleOverride = document.createElement('style')
  styleOverride.textContent = `
    #pdf-container *, #pdf-container *::before, #pdf-container *::after {
      color: #000000 !important;
      background-color: transparent !important;
      border-color: #cccccc !important;
      text-decoration: none !important;
    }
    #pdf-container {
      background-color: #ffffff !important;
    }
  `
  container.id = 'pdf-container'
  document.head.appendChild(styleOverride)
  document.body.appendChild(container)

  try {
    // Use html2canvas to capture the content
    const canvas = await html2canvas(container, {
      scale: 1.5, // Reduced from 2 for faster rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // Create PDF with proper dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Convert canvas to image data once (expensive operation)
    const imgData = canvas.toDataURL('image/jpeg', 0.85)

    const pdf = new jsPDF('p', 'mm', 'a4')
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Get PDF as data URL and Blob
    const dataUrl = pdf.output('datauristring')
    const blob = pdf.output('blob')

    return { dataUrl, blob, filename }
  } finally {
    // Clean up
    document.body.removeChild(container)
    document.head.removeChild(styleOverride)
  }
}

/**
 * Converts a Blob to base64 string
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Saves PDF metadata to local storage for record keeping
 * Note: We don't store the actual PDF data URL as it's too large for localStorage
 */
export const savePDFRecord = (metadata) => {
  try {
    const records = JSON.parse(localStorage.getItem('signedContractPDFs') || '[]')
    records.push({
      ...metadata,
      // Don't store the full PDF data URL - it's too large
      // Just store metadata for record keeping
      savedAt: new Date().toISOString()
    })
    // Keep only last 20 records to avoid storage limits
    while (records.length > 20) {
      records.shift()
    }
    localStorage.setItem('signedContractPDFs', JSON.stringify(records))
  } catch (err) {
    console.warn('Could not save PDF record to localStorage:', err.message)
    // Non-critical - continue without saving
  }
}
