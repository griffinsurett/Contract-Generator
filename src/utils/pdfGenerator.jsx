import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generates a PDF blob from HTML content using html2canvas + jsPDF
 * This gives us an actual PDF file that can be uploaded/attached
 * @param {HTMLElement|Object} element - The contract document element or object with innerHTML
 * @param {Object} options - Configuration options
 * @returns {Promise<{blob: Blob, filename: string}>} - PDF as Blob
 */
export const generatePDFBlob = async (element, options = {}) => {
  const { filename = 'contract.pdf' } = options

  // Create a temporary container for rendering - must be visible for html2canvas
  const container = document.createElement('div')
  container.id = 'pdf-render-container'

  // Add a style tag to override oklch colors (not supported by html2canvas)
  // This converts Tailwind v4's oklch colors to standard hex/rgb
  const styleOverride = document.createElement('style')
  styleOverride.textContent = `
    #pdf-render-container, #pdf-render-container * {
      /* Override any oklch colors with fallback values */
      --tw-text-opacity: 1 !important;
      --tw-bg-opacity: 1 !important;
      --tw-border-opacity: 1 !important;
    }
    #pdf-render-container {
      position: fixed;
      left: 0;
      top: 0;
      width: 794px;
      padding: 40px;
      background: white !important;
      background-color: #ffffff !important;
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000000 !important;
      z-index: -9999;
      pointer-events: none;
    }
    #pdf-render-container h1, #pdf-render-container h2, #pdf-render-container h3 {
      color: #000000 !important;
    }
    #pdf-render-container p, #pdf-render-container span, #pdf-render-container li {
      color: #000000 !important;
    }
    #pdf-render-container .text-gray-900 { color: #111827 !important; }
    #pdf-render-container .text-gray-800 { color: #1f2937 !important; }
    #pdf-render-container .text-gray-700 { color: #374151 !important; }
    #pdf-render-container .text-gray-600 { color: #4b5563 !important; }
    #pdf-render-container .text-gray-500 { color: #6b7280 !important; }
    #pdf-render-container .text-gray-400 { color: #9ca3af !important; }
    #pdf-render-container .text-blue-700 { color: #1d4ed8 !important; }
    #pdf-render-container .text-blue-600 { color: #2563eb !important; }
    #pdf-render-container .text-green-600 { color: #16a34a !important; }
    #pdf-render-container .bg-gray-50 { background-color: #f9fafb !important; }
    #pdf-render-container .bg-gray-100 { background-color: #f3f4f6 !important; }
    #pdf-render-container .bg-blue-100 { background-color: #dbeafe !important; }
    #pdf-render-container .border-gray-200 { border-color: #e5e7eb !important; }
    #pdf-render-container .border-gray-300 { border-color: #d1d5db !important; }
    #pdf-render-container .border-gray-400 { border-color: #9ca3af !important; }
  `
  document.head.appendChild(styleOverride)

  // Handle both DOM element and innerHTML object
  let htmlContent
  if (element.innerHTML && typeof element.innerHTML === 'string' && !element.cloneNode) {
    htmlContent = element.innerHTML
  } else {
    const clone = element.cloneNode(true)

    // Remove pointer-events-none class that might affect rendering
    clone.classList.remove('pointer-events-none')
    clone.style.pointerEvents = 'auto'

    // Replace inputs with their current values as text
    clone.querySelectorAll('input, select, textarea').forEach(input => {
      const span = document.createElement('span')
      // Get the actual value from the original element if possible
      const originalInput = element.querySelector(`[name="${input.name}"]`) || input
      span.textContent = originalInput.value || input.value || input.placeholder || '___________'
      span.style.fontWeight = 'bold'
      span.style.borderBottom = '1px solid #000'
      span.style.padding = '0 4px'
      if (input.parentNode) {
        input.parentNode.replaceChild(span, input)
      }
    })

    // Remove elements that shouldn't be in PDF
    clone.querySelectorAll('[data-export-control="true"]').forEach(el => el.remove())
    clone.querySelectorAll('input[type="date"]').forEach(el => el.remove())
    clone.querySelectorAll('.contract-date-picker').forEach(el => el.remove())

    // Remove any "(or select:" helper text
    clone.querySelectorAll('span').forEach(span => {
      if (span.textContent?.includes('(or select:')) {
        span.remove()
      }
    })

    // Strip oklch from inline styles
    clone.querySelectorAll('*').forEach(el => {
      if (el.style && el.style.cssText) {
        el.style.cssText = el.style.cssText.replace(/oklch\([^)]+\)/g, '#000000')
      }
    })

    htmlContent = clone.innerHTML
  }

  container.innerHTML = htmlContent
  document.body.appendChild(container)

  // Force layout calculation
  container.offsetHeight

  try {
    console.log('html2canvas starting, container size:', container.offsetWidth, 'x', container.offsetHeight)

    // Use html2canvas to capture the content
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: container.offsetWidth,
      height: container.offsetHeight,
      windowWidth: container.offsetWidth,
      windowHeight: container.offsetHeight,
      // Ignore elements with unsupported colors
      ignoreElements: (el) => {
        // Skip elements that might have problematic styles
        return el.tagName === 'SCRIPT' || el.tagName === 'STYLE'
      }
    })

    console.log('Canvas generated:', canvas.width, 'x', canvas.height)

    // Calculate dimensions for PDF (A4 size)
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Get blob
    const blob = pdf.output('blob')
    console.log('PDF blob created, size:', blob.size)

    return { blob, filename }
  } finally {
    // Clean up
    document.body.removeChild(container)
    document.head.removeChild(styleOverride)
  }
}

/**
 * Generates a PDF from a contract element using the browser's print functionality
 * This approach uses CSS page-break rules which the browser respects
 * @param {HTMLElement|Object} element - The contract document element or object with innerHTML
 * @param {Object} options - Configuration options
 * @returns {Promise<{dataUrl: string, blob: Blob}>} - PDF as data URL and Blob
 */
export const generateContractPDF = async (element, options = {}) => {
  const { filename = 'contract.pdf' } = options

  return new Promise((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')

      if (!printWindow) {
        reject(new Error('Could not open print window. Please allow popups.'))
        return
      }

      // Handle both DOM element and innerHTML object
      let htmlContent
      if (element.innerHTML && typeof element.innerHTML === 'string' && !element.cloneNode) {
        // It's an object with innerHTML property (from saved state)
        htmlContent = element.innerHTML
      } else {
        // It's a DOM element, clone and process it
        const clone = element.cloneNode(true)

        // Replace inputs with text spans
        clone.querySelectorAll('input, select, textarea').forEach(input => {
          const span = document.createElement('span')
          span.textContent = input.value || input.placeholder || '___________'
          span.style.fontWeight = 'bold'
          span.style.textDecoration = 'underline'
          input.parentNode.replaceChild(span, input)
        })

        // Remove sections that shouldn't be in PDF
        const downloadSection = clone.querySelector('[data-export-control="true"]')
        if (downloadSection) downloadSection.remove()

        // Remove date pickers
        clone.querySelectorAll('input[type="date"]').forEach(el => el.remove())

        htmlContent = clone.innerHTML
      }

      // Build the print document with proper CSS for page breaks
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename.replace('.pdf', '')}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm 20mm 20mm 20mm;
            }

            @media print {
              /* Hide URL and page numbers in some browsers */
              @page {
                margin-top: 0;
                margin-bottom: 0;
              }
              body {
                padding-top: 20mm;
                padding-bottom: 20mm;
              }
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: "Times New Roman", Times, serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 20px;
            }

            /* Prevent page breaks inside these elements */
            p, li, h1, h2, h3, h4, h5, h6, tr, blockquote, pre, figure {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            /* Keep headings with their following content */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            /* Orphans and widows control */
            p {
              orphans: 3;
              widows: 3;
            }

            /* Images should not break */
            img {
              max-width: 100%;
              page-break-inside: avoid;
            }

            /* Force page break before certain elements if needed */
            .page-break-before {
              page-break-before: always !important;
            }

            /* Signature sections should stay together */
            .signature-section, [class*="signature"] {
              page-break-inside: avoid !important;
            }

            /* Reset any problematic styles */
            * {
              box-shadow: none !important;
              text-shadow: none !important;
            }

            /* Style overrides for clean printing */
            a {
              color: #000 !important;
              text-decoration: underline;
            }

            /* Tables should try to stay together */
            table {
              page-break-inside: avoid;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            /* Lists */
            ul, ol {
              page-break-before: avoid;
            }

            li {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()

          // Since we can't capture the actual PDF from print dialog,
          // return a placeholder that indicates success
          resolve({
            dataUrl: null, // Browser print doesn't give us the data URL
            blob: null,
            filename,
            printInitiated: true
          })
        }, 500)
      }
    } catch (err) {
      reject(err)
    }
  })
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
 */
export const savePDFRecord = (metadata) => {
  try {
    const records = JSON.parse(localStorage.getItem('signedContractPDFs') || '[]')
    records.push({
      ...metadata,
      savedAt: new Date().toISOString()
    })
    while (records.length > 20) {
      records.shift()
    }
    localStorage.setItem('signedContractPDFs', JSON.stringify(records))
  } catch (err) {
    console.warn('Could not save PDF record to localStorage:', err.message)
  }
}
