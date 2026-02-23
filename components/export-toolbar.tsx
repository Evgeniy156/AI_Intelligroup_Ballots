"use client"

import { useState } from "react"
import { FileSpreadsheet, FileText, Loader2, Download, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { GroupedDocument } from "@/lib/types"

interface ExportToolbarProps {
  documents: GroupedDocument[]
}

export function ExportToolbar({ documents }: ExportToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const verifiedDocs = documents.filter((d) => d.isVerified)
  const unverifiedDocs = documents.filter((d) => !d.isVerified)

  async function handleExportPdf() {
    setLoading("pdf")
    try {
      const { generateRegistryPdf } = await import("@/lib/pdf-generator")
      await generateRegistryPdf(verifiedDocs.length > 0 ? verifiedDocs : documents)
      toast.success("PDF-реестр сформирован")
    } catch (err) {
      toast.error("Ошибка формирования PDF: " + (err instanceof Error ? err.message : ""))
    } finally {
      setLoading(null)
    }
  }

  async function handleExportExcel() {
    setLoading("excel")
    try {
      const { generateExcel } = await import("@/lib/excel-generator")
      await generateExcel(verifiedDocs.length > 0 ? verifiedDocs : documents)
      toast.success("Excel-файл сформирован")
    } catch (err) {
      toast.error("Ошибка формирования Excel: " + (err instanceof Error ? err.message : ""))
    } finally {
      setLoading(null)
    }
  }

  async function handleExportCsv() {
    setLoading("csv")
    try {
      const { generateCSV } = await import("@/lib/excel-generator")
      await generateCSV(verifiedDocs.length > 0 ? verifiedDocs : documents)
      toast.success("CSV-файл сформирован")
    } catch (err) {
      toast.error("Ошибка формирования CSV: " + (err instanceof Error ? err.message : ""))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Экспорт результатов</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Сформируйте реестр голосования и выгрузите данные
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Сводка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-foreground">{documents.length}</span>
              <span className="text-xs text-muted-foreground">Всего бюллетеней</span>
            </div>
            <Separator orientation="vertical" className="h-auto" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-success">{verifiedDocs.length}</span>
              <span className="text-xs text-muted-foreground">Проверено</span>
            </div>
            <Separator orientation="vertical" className="h-auto" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-warning">{unverifiedDocs.length}</span>
              <span className="text-xs text-muted-foreground">Не проверено</span>
            </div>
          </div>

          {unverifiedDocs.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-warning/10 p-3 text-sm text-foreground">
              <AlertCircle className="size-4 shrink-0 text-warning" />
              {"Есть непроверенные бюллетени. Экспорт включит только проверенные данные."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="flex-1 pb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <CardTitle className="text-base">Реестр PDF</CardTitle>
            <CardDescription>
              Таблица голосования в формате PDF для печати
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportPdf}
              disabled={documents.length === 0 || loading !== null}
              className="w-full"
            >
              {loading === "pdf" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Скачать PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-1 pb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
              <FileSpreadsheet className="size-5 text-success" />
            </div>
            <CardTitle className="text-base">Excel</CardTitle>
            <CardDescription>
              Таблица в формате XLSX для обработки данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={documents.length === 0 || loading !== null}
              className="w-full"
            >
              {loading === "excel" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Скачать XLSX
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-1 pb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">CSV</CardTitle>
            <CardDescription>
              Простой текстовый формат для импорта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={documents.length === 0 || loading !== null}
              className="w-full"
            >
              {loading === "csv" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Скачать CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vote Summary */}
      {verifiedDocs.length > 0 && verifiedDocs[0].questions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Итоги голосования</CardTitle>
            <CardDescription>
              {"По проверенным бюллетеням ("}{verifiedDocs.length}{")"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {verifiedDocs[0].questions.map((q) => {
                const za = verifiedDocs.filter((d) =>
                  d.questions.find((dq) => dq.number === q.number && dq.vote === "ЗА")
                ).length
                const protiv = verifiedDocs.filter((d) =>
                  d.questions.find((dq) => dq.number === q.number && dq.vote === "ПРОТИВ")
                ).length
                const vozd = verifiedDocs.filter((d) =>
                  d.questions.find((dq) => dq.number === q.number && dq.vote === "ВОЗДЕРЖАЛСЯ")
                ).length

                return (
                  <div key={q.number} className="flex items-center gap-3 rounded-md border p-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                      {q.number}
                    </span>
                    <span className="flex-1 truncate text-sm text-foreground">{q.text}</span>
                    <div className="flex gap-2">
                      <Badge className="bg-success text-success-foreground">{"За: "}{za}</Badge>
                      <Badge variant="destructive">{"Против: "}{protiv}</Badge>
                      <Badge variant="outline">{"Возд: "}{vozd}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
