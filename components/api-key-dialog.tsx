"use client"

import { useState } from "react"
import { Eye, EyeOff, Settings, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApiKeyDialogProps {
  apiKey: string
  baseUrl: string
  onSave: (key: string, baseUrl: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ApiKeyDialog({ apiKey, baseUrl, onSave, open, onOpenChange }: ApiKeyDialogProps) {
  const [inputValue, setInputValue] = useState(apiKey)
  const [baseUrlValue, setBaseUrlValue] = useState(baseUrl)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [testMessage, setTestMessage] = useState("")

  async function handleTest() {
    if (!inputValue.trim()) return
    setTesting(true)
    setTestResult(null)
    setTestMessage("")

    try {
      const url = baseUrlValue.trim() || "https://generativelanguage.googleapis.com/v1beta"
      const response = await fetch(
        `${url}/models?key=${inputValue.trim()}`
      )
      if (response.ok) {
        setTestResult("success")
        setTestMessage("Подключение успешно! Ключ работает.")
      } else {
        setTestResult("error")
        setTestMessage("Неверный ключ или нет доступа к API.")
      }
    } catch {
      setTestResult("error")
      setTestMessage("Ошибка сети. Проверьте подключение к интернету.")
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    onSave(inputValue.trim(), baseUrlValue.trim() || "https://generativelanguage.googleapis.com/v1beta")
    onOpenChange?.(false)
  }

  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setInputValue(apiKey)
      setBaseUrlValue(baseUrl)
      setTestResult(null)
      setTestMessage("")
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Settings className="size-4" />
          <span className="hidden sm:inline">API Gemini</span>
          <span
            className={`size-2 rounded-full ${
              apiKey ? "bg-success" : "bg-destructive"
            }`}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки API Gemini</DialogTitle>
          <DialogDescription>
            Введите ваш API-ключ Google Gemini для распознавания бюллетеней.
            Ключ хранится только в вашем браузере.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="api-key">API-ключ</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setTestResult(null)
                  }}
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "Скрыть ключ" : "Показать ключ"}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="base-url">Base URL (опционально, для агрегаторов)</Label>
            <Input
              id="base-url"
              type="text"
              placeholder="https://generativelanguage.googleapis.com/v1beta"
              value={baseUrlValue}
              onChange={(e) => {
                setBaseUrlValue(e.target.value)
                setTestResult(null)
              }}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Оставьте пустым для прямого подключения к Google.
            </p>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                testResult === "success"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {testResult === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <XCircle className="size-4 shrink-0" />
              )}
              {testMessage}
            </div>
          )}

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            Получить ключ в Google AI Studio
          </a>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!inputValue.trim() || testing}
          >
            {testing && <Loader2 className="size-4 animate-spin" />}
            Проверить подключение
          </Button>
          <Button onClick={handleSave} disabled={!inputValue.trim()}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
