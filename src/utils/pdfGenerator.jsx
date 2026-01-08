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
