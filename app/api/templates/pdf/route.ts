import { NextRequest } from "next/server"
import { headers } from "next/headers"
import playwright from "playwright"

export async function GET(req: NextRequest) {
  console.log("[route.ts:6]", { req })
  const url = new URL(req.url)
  const type = url.searchParams.get("type") || "atestado"
  const data = url.searchParams.get("data") || "" // base64 json

  // monta URL absoluta da página de impressão
  const h = headers()
  const host = h.get("x-forwarded-host") || h.get("host")!
  const proto = h.get("x-forwarded-proto") || "https"
  const printUrl = `${proto}://${host}/print/certificate?type=${encodeURIComponent(type)}&data=${encodeURIComponent(
    data
  )}`

  const browser = await playwright.chromium.launch({ headless: true })
  try {
    const ctx = await browser.newContext({
      // se precisar, defina viewport para A4 (~ 794x1123 a 96dpi) ou use formato maior
      viewport: { width: 794, height: 1123 },
      deviceScaleFactor: 2, // nitidez
    })
    const page = await ctx.newPage()

    // se você precisar passar user info (CRP/nome) via header:
    await page.setExtraHTTPHeaders({
      "x-user-name": "Dra. Juliana Alves",
      "x-user-crp": "CRP 12/34567",
    })

    await page.goto(printUrl, { waitUntil: "networkidle" })

    const isA5 = /paperSize=a5/i.test(printUrl) // opcional
    const pdf = await page.pdf({
      format: "A4", // ou "A5" se seu config pedir
      printBackground: true,
      preferCSSPageSize: true, // respeita @page do CSS
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    })

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="documento-${type}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } finally {
    await browser.close()
  }
}
