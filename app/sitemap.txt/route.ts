// app/sitemap.txt/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") || "https://psicomais.com"

  const urls = [
    `${base}/`,
    `${base}/about`,
    `${base}/contato`,
    `${base}/terapeutas`,
    `${base}/blog`,
  ]

  return new NextResponse(urls.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
