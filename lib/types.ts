export interface QuestionResult {
  number: number
  text: string
  vote: "ЗА" | "ПРОТИВ" | "ВОЗДЕРЖАЛСЯ" | null
}

export interface RecognizedPage {
  pageIndex: number
  imageBase64: string
  isStartPage: boolean
  lastName: string
  firstName: string
  middleName: string
  roomNo: string
  area: string
  snils: string
  ownershipShare: string
  questions: QuestionResult[]
}

export interface GroupedDocument {
  id: string
  pages: RecognizedPage[]
  lastName: string
  firstName: string
  middleName: string
  roomNo: string
  area: string
  snils: string
  ownershipShare: string
  questions: QuestionResult[]
  isVerified: boolean
  sourceFileName: string
}

export type ProcessingStatus = "idle" | "uploading" | "processing" | "complete" | "error"

export interface ProcessingState {
  status: ProcessingStatus
  totalPages: number
  processedPages: number
  currentFileName: string
  errorMessage?: string
}

export interface PageImage {
  base64: string
  fileName: string
  pageIndex: number
}
