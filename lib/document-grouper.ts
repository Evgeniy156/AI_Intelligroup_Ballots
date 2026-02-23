import type { RecognizedPage, GroupedDocument, QuestionResult } from "./types"

let docCounter = 0

export function groupPagesIntoDocuments(
  pages: RecognizedPage[],
  sourceFileName: string
): GroupedDocument[] {
  const documents: GroupedDocument[] = []
  let currentPages: RecognizedPage[] = []

  for (const page of pages) {
    if (page.isStartPage && currentPages.length > 0) {
      documents.push(buildDocument(currentPages, sourceFileName))
      currentPages = []
    }
    currentPages.push(page)
  }

  if (currentPages.length > 0) {
    documents.push(buildDocument(currentPages, sourceFileName))
  }

  return documents
}

function buildDocument(
  pages: RecognizedPage[],
  sourceFileName: string
): GroupedDocument {
  const startPage = pages.find((p) => p.isStartPage) || pages[0]

  const allQuestions: QuestionResult[] = []
  const seenNumbers = new Set<number>()

  for (const page of pages) {
    for (const q of page.questions) {
      if (!seenNumbers.has(q.number)) {
        seenNumbers.add(q.number)
        allQuestions.push({ ...q })
      }
    }
  }

  allQuestions.sort((a, b) => a.number - b.number)

  docCounter++

  return {
    id: `doc-${docCounter}-${Date.now()}`,
    pages,
    lastName: startPage.lastName || "",
    firstName: startPage.firstName || "",
    middleName: startPage.middleName || "",
    roomNo: startPage.roomNo || "",
    area: startPage.area || "",
    snils: startPage.snils || "",
    ownershipShare: startPage.ownershipShare || "",
    questions: allQuestions,
    isVerified: false,
    sourceFileName,
  }
}
