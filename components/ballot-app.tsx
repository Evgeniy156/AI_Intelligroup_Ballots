"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FileText, ClipboardCheck, Download } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingStatus } from "@/components/processing-status"
import { DocumentList } from "@/components/document-list"
import { ReviewPanel } from "@/components/review-panel"
import { ExportToolbar } from "@/components/export-toolbar"
import { extractPages } from "@/lib/pdf-utils"
import { resizeImageBase64 } from "@/lib/image-utils"
import { groupPagesIntoDocuments } from "@/lib/document-grouper"
import type { GroupedDocument, ProcessingState, RecognizedPage, PageImage } from "@/lib/types"

const STORAGE_KEY = "gemini-api-key"
const BASE_URL_STORAGE_KEY = "gemini-base-url"

function getStoredKey(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(STORAGE_KEY) || ""
}

function getStoredBaseUrl(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(BASE_URL_STORAGE_KEY) || ""
}

export function BallotApp() {
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [apiDialogOpen, setApiDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [documents, setDocuments] = useState<GroupedDocument[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<ProcessingState>({
    status: "idle",
    totalPages: 0,
    processedPages: 0,
    currentFileName: "",
  })

  const cancelRef = useRef(false)

  useEffect(() => {
    const stored = getStoredKey()
    const storedBaseUrl = getStoredBaseUrl()
    setApiKey(stored)
    setBaseUrl(storedBaseUrl)
    if (!stored) {
      setApiDialogOpen(true)
    }
  }, [])

  function handleSaveKey(key: string, newBaseUrl: string) {
    setApiKey(key)
    setBaseUrl(newBaseUrl)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, key)
      localStorage.setItem(BASE_URL_STORAGE_KEY, newBaseUrl)
    }
    toast.success("Настройки API сохранены")
  }

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!apiKey) {
        toast.error("Сначала укажите API-ключ Gemini")
        setApiDialogOpen(true)
        return
      }

      cancelRef.current = false

      setProcessing({
        status: "uploading",
        totalPages: 0,
        processedPages: 0,
        currentFileName: "Извлечение страниц...",
      })

      try {
        // Extract all pages from all files
        const allPages: PageImage[] = []
        for (const file of files) {
          const pages = await extractPages(file, (current, total) => {
            setProcessing((prev) => ({
              ...prev,
              currentFileName: `${file.name}: страница ${current}/${total}`,
            }))
          })
          allPages.push(...pages)
        }

        setProcessing({
          status: "processing",
          totalPages: allPages.length,
          processedPages: 0,
          currentFileName: "",
        })

        // Process each page through Gemini
        const recognizedPages: RecognizedPage[] = []

        for (let i = 0; i < allPages.length; i++) {
          if (cancelRef.current) {
            toast.info("Распознавание отменено")
            setProcessing((prev) => ({ ...prev, status: "idle" }))
            return
          }

          const page = allPages[i]
          setProcessing((prev) => ({
            ...prev,
            processedPages: i,
            currentFileName: `${page.fileName} — стр. ${page.pageIndex + 1}`,
          }))

          const resized = await resizeImageBase64(page.base64)

          let data: Record<string, unknown>
          try {
            const response = await fetch("/api/recognize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageBase64: resized,
                apiKey,
                baseUrl,
              }),
            })

            if (!response.ok) {
              const err = await response.json().catch(() => ({ error: "Ошибка сервера" }))
              const errorMsg = (err.error as string) || `Ошибка HTTP ${response.status}`
              toast.error(`Ошибка распознавания стр. ${page.pageIndex + 1}: ${errorMsg}`)
              // Skip this page but continue processing
              recognizedPages.push({
                pageIndex: page.pageIndex,
                imageBase64: page.base64,
                isStartPage: i === 0,
                lastName: "",
                firstName: "",
                middleName: "",
                roomNo: "",
                area: "",
                snils: "",
                ownershipShare: "",
                questions: [],
              })
              continue
            }

            data = await response.json()
          } catch (fetchErr) {
            const msg = fetchErr instanceof Error ? fetchErr.message : "Ошибка сети"
            toast.error(`Ошибка сети стр. ${page.pageIndex + 1}: ${msg}`)
            recognizedPages.push({
              pageIndex: page.pageIndex,
              imageBase64: page.base64,
              isStartPage: i === 0,
              lastName: "",
              firstName: "",
              middleName: "",
              roomNo: "",
              area: "",
              snils: "",
              ownershipShare: "",
              questions: [],
            })
            continue
          }

          recognizedPages.push({
            pageIndex: page.pageIndex,
            imageBase64: page.base64,
            isStartPage: data.isStartPage,
            lastName: data.lastName || "",
            firstName: data.firstName || "",
            middleName: data.middleName || "",
            roomNo: data.roomNo || "",
            area: data.area || "",
            snils: data.snils || "",
            ownershipShare: data.ownershipShare || "",
            questions: data.questions || [],
          })

          // Small delay to avoid rate limiting
          if (i < allPages.length - 1) {
            await new Promise((r) => setTimeout(r, 300))
          }
        }

        // Group pages into documents
        const fileGroups = new Map<string, RecognizedPage[]>()
        for (const rp of recognizedPages) {
          const page = allPages.find(
            (p) => p.pageIndex === rp.pageIndex && p.base64 === rp.imageBase64
          )
          const fileName = page?.fileName || "unknown"
          if (!fileGroups.has(fileName)) fileGroups.set(fileName, [])
          fileGroups.get(fileName)!.push(rp)
        }

        const newDocs: GroupedDocument[] = []
        for (const [fileName, pages] of fileGroups) {
          newDocs.push(...groupPagesIntoDocuments(pages, fileName))
        }

        setDocuments((prev) => [...prev, ...newDocs])
        setProcessing({
          status: "complete",
          totalPages: allPages.length,
          processedPages: allPages.length,
          currentFileName: "",
        })
        toast.success(`Распознано ${newDocs.length} бюллетеней`)

        if (newDocs.length > 0) {
          setActiveTab("review")
          setSelectedDocId(newDocs[0].id)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Неизвестная ошибка"
        setProcessing((prev) => ({
          ...prev,
          status: "error",
          errorMessage: message,
        }))
        toast.error(message)
      }
    },
    [apiKey, baseUrl]
  )

  function handleCancelProcessing() {
    cancelRef.current = true
  }

  function handleUpdateDocument(updated: GroupedDocument) {
    setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
  }

  function handleVerifyDocument(id: string) {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isVerified: true } : d))
    )
    toast.success("Бюллетень подтвержден")
  }

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <FileText className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">
              IntelliGroup Ballot Pro
            </h1>
            <p className="text-xs text-muted-foreground">
              Система распознавания бюллетеней
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {documents.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {"Бюллетеней: "}{documents.length}
              {" | Проверено: "}{documents.filter((d) => d.isVerified).length}
            </span>
          )}
          <ApiKeyDialog
            apiKey={apiKey}
            baseUrl={baseUrl}
            onSave={handleSaveKey}
            open={apiDialogOpen}
            onOpenChange={setApiDialogOpen}
          />
        </div>
      </header>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b bg-card px-6">
          <TabsList className="h-11">
            <TabsTrigger value="upload" className="gap-2">
              <FileText className="size-4" />
              Загрузка
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2" disabled={documents.length === 0}>
              <ClipboardCheck className="size-4" />
              {"Проверка"}{documents.length > 0 ? ` (${documents.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2" disabled={documents.length === 0}>
              <Download className="size-4" />
              Экспорт
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upload" className="flex-1 overflow-auto p-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Загрузка бюллетеней
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Загрузите отсканированные бюллетени голосования в формате PDF или изображения
              </p>
            </div>

            <FileDropzone
              onFilesSelected={processFiles}
              disabled={!apiKey || processing.status === "processing"}
              disabledMessage={
                !apiKey
                  ? "Сначала укажите API-ключ Gemini в настройках"
                  : "Дождитесь завершения обработки"
              }
            />

            {processing.status !== "idle" && (
              <ProcessingStatus state={processing} onCancel={handleCancelProcessing} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="review" className="flex min-h-0 flex-1">
          <div className="flex min-h-0 flex-1">
            <DocumentList
              documents={documents}
              selectedId={selectedDocId}
              onSelect={setSelectedDocId}
            />
            <div className="min-h-0 flex-1">
              {selectedDoc ? (
                <ReviewPanel
                  document={selectedDoc}
                  onUpdate={handleUpdateDocument}
                  onVerify={() => handleVerifyDocument(selectedDoc.id)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>Выберите бюллетень для проверки</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export" className="flex-1 overflow-auto p-6">
          <ExportToolbar documents={documents} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
