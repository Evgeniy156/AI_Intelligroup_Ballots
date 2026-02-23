"use client"

import { Loader2, CheckCircle2, XCircle, Ban } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ProcessingState } from "@/lib/types"

interface ProcessingStatusProps {
  state: ProcessingState
  onCancel: () => void
}

export function ProcessingStatus({ state, onCancel }: ProcessingStatusProps) {
  const percent =
    state.totalPages > 0
      ? Math.round((state.processedPages / state.totalPages) * 100)
      : 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          {state.status === "processing" && (
            <Loader2 className="size-5 animate-spin text-primary" />
          )}
          {state.status === "complete" && (
            <CheckCircle2 className="size-5 text-success" />
          )}
          {state.status === "error" && (
            <XCircle className="size-5 text-destructive" />
          )}

          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {state.status === "uploading" && "Подготовка страниц..."}
              {state.status === "processing" &&
                `Распознавание страницы ${state.processedPages + 1} из ${state.totalPages}...`}
              {state.status === "complete" &&
                `Распознано ${state.totalPages} страниц`}
              {state.status === "error" && "Ошибка распознавания"}
            </p>
            {state.currentFileName && (
              <p className="text-xs text-muted-foreground">{state.currentFileName}</p>
            )}
            {state.errorMessage && (
              <p className="mt-1 text-xs text-destructive">{state.errorMessage}</p>
            )}
          </div>

          {state.status === "processing" && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <Ban className="size-3.5" />
              Отмена
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Progress value={percent} className="h-2" />
          <p className="text-right text-xs text-muted-foreground">{percent}%</p>
        </div>
      </CardContent>
    </Card>
  )
}
