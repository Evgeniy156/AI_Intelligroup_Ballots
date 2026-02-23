import type { GroupedDocument } from "./types"

export async function generateExcel(documents: GroupedDocument[]): Promise<void> {
  const XLSX = await import("xlsx")

  const maxQuestions = Math.max(...documents.map((d) => d.questions.length), 0)

  const headers = [
    "№",
    "Фамилия",
    "Имя",
    "Отчество",
    "СНИЛС",
    "Квартира",
    "Площадь (м²)",
    "Доля",
  ]
  for (let i = 1; i <= maxQuestions; i++) {
    headers.push(`Вопрос ${i}`)
  }

  const rows = documents.map((doc, idx) => {
    const row: (string | number)[] = [
      idx + 1,
      doc.lastName,
      doc.firstName,
      doc.middleName,
      doc.snils,
      doc.roomNo,
      doc.area,
      doc.ownershipShare,
    ]
    for (let i = 0; i < maxQuestions; i++) {
      const q = doc.questions[i]
      row.push(q?.vote || "")
    }
    return row
  })

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Set column widths
  ws["!cols"] = headers.map((h) => ({
    wch: Math.max(h.length, 12),
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Реестр голосования")

  XLSX.writeFile(wb, `Реестр_голосования_${formatDate()}.xlsx`)
}

export async function generateCSV(documents: GroupedDocument[]): Promise<void> {
  const XLSX = await import("xlsx")

  const maxQuestions = Math.max(...documents.map((d) => d.questions.length), 0)

  const headers = [
    "№",
    "Фамилия",
    "Имя",
    "Отчество",
    "СНИЛС",
    "Квартира",
    "Площадь",
    "Доля",
  ]
  for (let i = 1; i <= maxQuestions; i++) {
    headers.push(`Вопрос ${i}`)
  }

  const rows = documents.map((doc, idx) => {
    const row: (string | number)[] = [
      idx + 1,
      doc.lastName,
      doc.firstName,
      doc.middleName,
      doc.snils,
      doc.roomNo,
      doc.area,
      doc.ownershipShare,
    ]
    for (let i = 0; i < maxQuestions; i++) {
      const q = doc.questions[i]
      row.push(q?.vote || "")
    }
    return row
  })

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Реестр")

  XLSX.writeFile(wb, `Реестр_голосования_${formatDate()}.csv`, {
    bookType: "csv",
  })
}

function formatDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
