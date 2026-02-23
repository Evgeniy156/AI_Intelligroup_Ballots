"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RecognizedPage } from "@/lib/types"

interface ScanViewerProps {
  pages: RecognizedPage[]
}

export function ScanViewer({ pages }: ScanViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)

  if (pages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Нет страниц для отображения
      </div>
    )
  }

  const page = pages[currentPage]

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center text-sm text-muted-foreground">
            {currentPage + 1}{" / "}{pages.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
            aria-label="Следующая страница"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            aria-label="Уменьшить"
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="min-w-12 text-center text-xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label="Увеличить"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setZoom(1)}
            aria-label="Сбросить масштаб"
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.imageBase64}
            alt={`Скан страницы ${currentPage + 1}`}
            className="rounded-sm border shadow-sm"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              maxWidth: zoom <= 1 ? "100%" : "none",
            }}
          />
        </div>
      </div>
    </div>
  )
}
