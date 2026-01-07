export const generateDocument = (formData, format) => {
  let documentElement = document.querySelector('.contract-doc')
  
  if (!documentElement) {
    alert('Could not find contract document. Please make sure the document is visible on screen.')
    return
  }

  const clonedDoc = documentElement.cloneNode(true)
  
  const checkboxes = clonedDoc.querySelectorAll('input[type="checkbox"]')
  checkboxes.forEach(checkbox => {
    const isChecked = checkbox.checked
    const span = document.createElement('span')
    span.textContent = isChecked ? '☑' : '☐'
    span.className = 'mr-2 text-[14pt]'
    checkbox.parentNode.insertBefore(span, checkbox)
    checkbox.remove()
  })

  const radios = clonedDoc.querySelectorAll('input[type="radio"]')
  radios.forEach(radio => {
    const isChecked = radio.checked
    const span = document.createElement('span')
    span.textContent = isChecked ? '◉' : '○'
    span.className = 'mr-2 text-[14pt]'
    radio.parentNode.insertBefore(span, radio)
    radio.remove()
  })
  
  const textInputs = clonedDoc.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"]')
  textInputs.forEach(input => {
    const value = input.value
    const span = document.createElement('span')
    span.textContent = value
    span.className = input.className
    if (!value) {
      span.style.borderBottom = '1px solid #666'
    }
    input.parentNode.insertBefore(span, input)
    input.remove()
  })

  const textareas = clonedDoc.querySelectorAll('textarea')
  textareas.forEach(textarea => {
    const value = textarea.value
    if (value) {
      const p = document.createElement('p')
      p.textContent = value
      p.className = 'font-[Times_New_Roman,serif] text-[11pt] whitespace-pre-wrap'
      textarea.parentNode.insertBefore(p, textarea)
    }
    textarea.remove()
  })

  // Remove any export-only UI blocks (e.g., download buttons)
  const exportSections = clonedDoc.querySelectorAll('[data-export-control="true"]')
  exportSections.forEach(section => section.remove())
  
  const buttons = clonedDoc.querySelectorAll('button')
  buttons.forEach(btn => btn.remove())

  const contractHTML = clonedDoc.innerHTML
  
  if (format === 'pdf') {
    generatePDF(contractHTML, formData)
  } else if (format === 'doc') {
    generateDOC(contractHTML, formData)
  }
}

const generatePDF = (contractHTML, formData) => {
  const printWindow = window.open('', '_blank')
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contract - ${formData.clientCompanyName || 'Document'}</title>
      <style>
        @page {
          margin: 1in;
        }
        body {
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      ${contractHTML}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

const generateDOC = (contractHTML, formData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset='utf-8'>
      <title>Contract</title>
    </head>
    <body>
      ${contractHTML}
    </body>
    </html>
  `
  
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Contract_${formData.clientCompanyName || 'Document'}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
