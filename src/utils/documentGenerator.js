export const generateDocument = (formData, format) => {
  // Try multiple selectors to find the document
  let documentElement = document.querySelector('.contract-document')
  
  // Fallback: find by the distinctive heading
  if (!documentElement) {
    const heading = Array.from(document.querySelectorAll('h1')).find(
      h => h.textContent.includes('WEBSITE HOSTING AND MAINTENANCE AGREEMENT')
    )
    if (heading) {
      documentElement = heading.closest('div')
    }
  }
  
  if (!documentElement) {
    alert('Could not find contract document. Please make sure the document is visible on screen.')
    return
  }

  // Clone to avoid modifying the actual display
  const clonedDoc = documentElement.cloneNode(true)
  
  // Replace checkboxes and radio buttons with visual symbols
  const checkboxes = clonedDoc.querySelectorAll('input[type="checkbox"]')
  checkboxes.forEach(checkbox => {
    const isChecked = checkbox.checked
    const span = document.createElement('span')
    span.textContent = isChecked ? '☑' : '☐'
    span.style.marginRight = '8px'
    span.style.fontSize = '14pt'
    checkbox.parentNode.insertBefore(span, checkbox)
    checkbox.remove()
  })

  // Replace radio buttons with visual symbols
  const radios = clonedDoc.querySelectorAll('input[type="radio"]')
  radios.forEach(radio => {
    const isChecked = radio.checked
    const span = document.createElement('span')
    span.textContent = isChecked ? '◉' : '○'
    span.style.marginRight = '8px'
    span.style.fontSize = '14pt'
    radio.parentNode.insertBefore(span, radio)
    radio.remove()
  })
  
  // Remove all text inputs but keep their values (or leave blank if empty)
  const textInputs = clonedDoc.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"]')
  textInputs.forEach(input => {
    const value = input.value
    const span = document.createElement('span')
    span.textContent = value // If empty, this will be blank
    span.style.fontFamily = 'Times New Roman, serif'
    span.style.fontSize = '11pt'
    span.style.borderBottom = value ? 'none' : '1px solid #666'
    span.style.display = 'inline-block'
    span.style.minWidth = input.style.width || '100px'
    input.parentNode.insertBefore(span, input)
    input.remove()
  })

  // Remove textareas but keep their content
  const textareas = clonedDoc.querySelectorAll('textarea')
  textareas.forEach(textarea => {
    const value = textarea.value
    if (value) {
      const p = document.createElement('p')
      p.textContent = value
      p.style.fontFamily = 'Times New Roman, serif'
      p.style.fontSize = '11pt'
      p.style.whiteSpace = 'pre-wrap'
      textarea.parentNode.insertBefore(p, textarea)
    }
    textarea.remove()
  })
  
  // Remove underscore placeholders (___) when adjacent text is empty
  const allText = clonedDoc.querySelectorAll('p, span')
  allText.forEach(el => {
    // Remove standalone underscores that are placeholders for empty fields
    if (el.textContent.trim().match(/^_{3,}$/)) {
      el.textContent = ''
    }
  })
  
  // Hide the date picker helper text
  const dateHelpers = clonedDoc.querySelectorAll('span')
  dateHelpers.forEach(el => {
    if (el.textContent.includes('(or select:')) {
      el.remove()
    }
  })
  
  // Remove all buttons
  const buttons = clonedDoc.querySelectorAll('button')
  buttons.forEach(btn => btn.remove())
  
  // Remove the download section
  const allDivs = clonedDoc.querySelectorAll('div')
  allDivs.forEach(div => {
    if (div.textContent.includes('Download Contract')) {
      div.remove()
    }
  })

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
      <title>Hosting Agreement - ${formData.clientCompanyName || 'Contract'}</title>
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
      <title>Hosting Agreement</title>
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
  link.download = `Hosting_Agreement_${formData.clientCompanyName || 'Contract'}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}