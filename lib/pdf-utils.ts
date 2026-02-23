import type { PageImage } from "./types"

let pdfjsLib: typeof import("pdfjs-dist") | null = null

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib
  pdfjsLib = await import("pdfjs-dist")
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
  return pdfjsLib
}

export async function extractPagesFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PageImage[]> {
  const pdfjs = await getPdfjs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const pages: PageImage[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const scale = 2.8
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext("2d")!

    await page.render({ canvasContext: ctx, viewport }).promise

    const base64 = canvas.toDataURL("image/jpeg", 0.85)
    pages.push({
      base64,
      fileName: file.name,
      pageIndex: i - 1,
    })

    canvas.width = 0
    canvas.height = 0
    onProgress?.(i, pdf.numPages)
  }

  return pages
}

export async function extractPagesFromImage(file: File): Promise<PageImage[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve([
        {
          base64: reader.result as string,
          fileName: file.name,
          pageIndex: 0,
        },
      ])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function extractPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PageImage[]> {
  if (file.type === "application/pdf") {
    return extractPagesFromPdf(file, onProgress)
  }
  return extractPagesFromImage(file)
}
