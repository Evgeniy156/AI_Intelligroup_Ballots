import type { GroupedDocument } from "./types"

export async function generateRegistryPdf(documents: GroupedDocument[]): Promise<void> {
  const jsPDFModule = await import("jspdf")
  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF
  await import("jspdf-autotable")

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const maxQuestions = Math.max(...documents.map((d) => d.questions.length), 0)

  const headers = [
    "No",
    "Familiya",
    "Imya",
    "Otchestvo",
    "SNILS",
    "Kvartira",
    "Ploshchad",
    "Dolya",
  ]

  const headersDisplay = [
    "#",
    "Familiya",
    "Imya",
    "Otchestvo",
    "SNILS",
    "Kv.",
    "S m2",
    "Dolya",
  ]

  for (let i = 1; i <= maxQuestions; i++) {
    headers.push(`Q${i}`)
    headersDisplay.push(`V.${i}`)
  }

  const body = documents.map((d, idx) => {
    const row: string[] = [
      String(idx + 1),
      d.lastName,
      d.firstName,
      d.middleName,
      d.snils,
      d.roomNo,
      d.area,
      d.ownershipShare,
    ]
    for (let i = 0; i < maxQuestions; i++) {
      const q = d.questions[i]
      if (q?.vote === "ЗА") row.push("ZA")
      else if (q?.vote === "ПРОТИВ") row.push("PR")
      else if (q?.vote === "ВОЗДЕРЖАЛСЯ") row.push("VZ")
      else row.push("-")
    }
    return row
  })

  // Title
  doc.setFontSize(14)
  doc.text("Reestr golosovaniya sobstvennikov", 14, 15)

  doc.setFontSize(9)
  doc.text(`Data: ${new Date().toLocaleDateString("ru-RU")}  |  Byulleteney: ${documents.length}`, 14, 22)

  // Table using autoTable
  const anyDoc = doc as Record<string, unknown>
  if (typeof anyDoc.autoTable === "function") {
    ;(anyDoc.autoTable as (opts: Record<string, unknown>) => void)({
      startY: 28,
      head: [headersDisplay],
      body,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [59, 91, 219],
        textColor: 255,
        fontSize: 7,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 243, 255],
      },
      margin: { left: 8, right: 8 },
      theme: "grid",
    })
  }

  doc.save(`Reestr_golosovaniya_${formatDate()}.pdf`)
}

function formatDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
