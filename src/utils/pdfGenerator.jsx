const buildPrintableHtmlDocument = (element, filename) => {
  let htmlContent
  if (element.innerHTML && typeof element.innerHTML === 'string' && !element.cloneNode) {
    htmlContent = element.innerHTML
  } else {
    const clone = element.cloneNode(true)

    clone.querySelectorAll('input, select, textarea').forEach(input => {
      const span = document.createElement('span')
      span.textContent = input.value || input.placeholder || '___________'
      span.style.fontWeight = 'bold'
      span.style.textDecoration = 'underline'
      input.parentNode.replaceChild(span, input)
    })

    const downloadSection = clone.querySelector('[data-export-control="true"]')
    if (downloadSection) downloadSection.remove()

    clone.querySelectorAll('input[type="date"]').forEach(el => el.remove())

    htmlContent = clone.innerHTML
  }

  return `
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

        p, li, h1, h2, h3, h4, h5, h6, tr, blockquote, pre, figure {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }

        p {
          orphans: 3;
          widows: 3;
        }

        img {
          max-width: 100%;
          page-break-inside: avoid;
        }

        .page-break-before {
          page-break-before: always !important;
        }

        .signature-section, [class*="signature"] {
          page-break-inside: avoid !important;
        }

        * {
          box-shadow: none !important;
          text-shadow: none !important;
        }

        a {
          color: #000 !important;
          text-decoration: underline;
        }

        table {
          page-break-inside: avoid;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

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
  `
}

export const generateContractPDFBlob = async (element, options = {}) => {
  const { filename = 'contract.pdf' } = options
  const html = buildPrintableHtmlDocument(element, filename)
  const pdfEndpoint = import.meta.env.VITE_PDF_ENDPOINT || '/api/generate-pdf'

  const response = await fetch(pdfEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ html, filename })
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(`PDF generation failed (${response.status}): ${message}`)
  }

  const blob = await response.blob()
  return { blob, filename }
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
      const printWindow = window.open('', '_blank', 'width=800,height=600')

      if (!printWindow) {
        reject(new Error('Could not open print window. Please allow popups.'))
        return
      }

      printWindow.document.write(buildPrintableHtmlDocument(element, filename))
      printWindow.document.close()

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()

          resolve({
            dataUrl: null,
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
