import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const config = {
  maxDuration: 30
}

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_')

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = await readBody(req)
  const html = body?.html
  const filename = sanitizeFilename(body?.filename || 'contract.pdf')

  if (!html) {
    res.status(400).json({ error: 'Missing html content' })
    return
  }

  let browser
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(pdf)
  } catch (err) {
    console.error('PDF generation error:', err)
    res.status(500).json({ error: 'PDF generation failed' })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
