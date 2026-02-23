"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, FileText, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const ACCEPT = ".pdf,.jpg,.jpeg,.png"
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  disabledMessage?: string
}

export function FileDropzone({ onFilesSelected, disabled, disabledMessage }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const valid: File[] = []
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i]
        const ext = f.name.toLowerCase()
        const isValid =
          ext.endsWith(".pdf") ||
          ext.endsWith(".jpg") ||
          ext.endsWith(".jpeg") ||
          ext.endsWith(".png")
        if (isValid && f.size <= MAX_FILE_SIZE) {
          valid.push(f)
        }
      }
      if (valid.length > 0) {
        setSelectedFiles((prev) => [...prev, ...valid])
      }
    },
    []
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!disabled) handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleStart() {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
      setSelectedFiles([])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card
        className={`relative flex flex-col items-center justify-center gap-4 border-2 border-dashed p-12 transition-colors cursor-pointer ${
          disabled
            ? "opacity-50 cursor-not-allowed border-muted"
            : dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Зона загрузки файлов"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (!disabled) inputRef.current?.click()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ""
          }}
          disabled={disabled}
        />

        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Upload className="size-8 text-primary" />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-base font-medium text-foreground">
            {disabled ? disabledMessage || "Загрузка недоступна" : "Перетащите файлы сюда"}
          </p>
          {!disabled && (
            <p className="text-sm text-muted-foreground">
              {"или нажмите для выбора файлов (PDF, JPG, PNG, до 50 МБ)"}
            </p>
          )}
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            {"Выбрано файлов: "}{selectedFiles.length}
          </p>
          <div className="flex flex-col gap-1.5">
            {selectedFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
              >
                {file.type === "application/pdf" ? (
                  <FileText className="size-4 shrink-0 text-primary" />
                ) : (
                  <ImageIcon className="size-4 shrink-0 text-primary" />
                )}
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} {"МБ"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Удалить ${file.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleStart}
            disabled={disabled}
            className="mt-2 self-start"
          >
            <Upload className="size-4" />
            {"Начать распознавание"}
          </Button>
        </div>
      )}
    </div>
  )
}
