"use client"

import { CheckCircle2, Clock, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { GroupedDocument } from "@/lib/types"

interface DocumentListProps {
  documents: GroupedDocument[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function DocumentList({ documents, selectedId, onSelect }: DocumentListProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col border-r bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          {"Бюллетени ("}{documents.length}{")"}
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {documents.map((doc) => {
            const fullName = [doc.lastName, doc.firstName, doc.middleName]
              .filter(Boolean)
              .join(" ")
            const isSelected = doc.id === selectedId

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect(doc.id)}
                className={`flex flex-col gap-1.5 rounded-md px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {fullName || "Без имени"}
                  </span>
                  {doc.isVerified ? (
                    <Badge variant="default" className="bg-success text-success-foreground text-[10px] px-1.5 py-0">
                      <CheckCircle2 className="size-3" />
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <Clock className="size-3" />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 pl-5.5">
                  {doc.roomNo && (
                    <span className="text-xs text-muted-foreground">
                      {"кв. "}{doc.roomNo}
                    </span>
                  )}
                  {doc.area && (
                    <span className="text-xs text-muted-foreground">
                      {doc.area}{" м\u00B2"}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {doc.questions.length}{" вопр."}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
