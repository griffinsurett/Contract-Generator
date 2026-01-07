import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Generates a PDF from a contract element and returns it as a base64 data URL
 * @param {HTMLElement} element - The contract document element to convert
 * @param {Object} options - Configuration options
 * @returns {Promise<{dataUrl: string, blob: Blob}>} - PDF as data URL and Blob
 */
export const generateContractPDF = async (element, options = {}) => {
  const { filename = 'contract.pdf' } = options

  // Create a clone of the element to modify for PDF
  const clone = element.cloneNode(true)

  // Remove any interactive elements and fix styling for PDF
  clone.querySelectorAll('input, select, textarea').forEach(input => {
    const span = document.createElement('span')
    span.textContent = input.value || input.placeholder || '___________'
    // Simple styling - NO border-bottom (was causing strikethrough appearance)
    span.style.cssText = `
      text-decoration: none !important;
      display: inline;
      font-weight: bold;
      color: #000000;
    `
    input.parentNode.replaceChild(span, input)
  })

  // Create a container for the PDF content
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '750px' // Slightly narrower to ensure margins
  container.style.padding = '50px 60px' // Better margins
  container.style.backgroundColor = 'white'
  container.style.fontFamily = 'Times New Roman, serif'
  container.style.fontSize = '11pt'
  container.style.lineHeight = '1.4'
  container.style.color = '#000000' // Force black text to avoid oklch issues

  // Force safe colors on all elements (faster than checking each computed style)
  const forceBasicColors = (el) => {
    el.style.setProperty('color', '#000000', 'important')
    el.style.setProperty('text-decoration', 'none', 'important')
  }

  // Remove sections that shouldn't be in the PDF
  const downloadSection = clone.querySelector('[data-export-control="true"]')
  if (downloadSection) {
    downloadSection.remove()
  }

  // Remove date picker hints like "(or select: 2026-01-06)"
  clone.querySelectorAll('input[type="date"]').forEach(datePicker => {
    const parent = datePicker.closest('span')
    if (parent && parent.textContent.includes('or select')) {
      parent.remove()
    } else {
      datePicker.remove()
    }
  })

  // Apply basic colors to all elements in clone (single pass)
  clone.querySelectorAll('*').forEach(forceBasicColors)
  forceBasicColors(clone)
  container.appendChild(clone)

  // Add a style element to override oklch colors globally within our container
  const styleOverride = document.createElement('style')
  styleOverride.textContent = `
    #pdf-container, #pdf-container * {
      color: #000000 !important;
      background-color: transparent !important;
      text-decoration: none !important;
      border: none !important;
      border-bottom: none !important;
      border-top: none !important;
    }
    #pdf-container {
      background-color: #ffffff !important;
    }
    #pdf-container img {
      max-width: 100% !important;
    }
    #pdf-container h1, #pdf-container h2, #pdf-container h3 {
      border-bottom: none !important;
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
