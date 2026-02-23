"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { VoteBlock } from "@/components/vote-block"
import type { GroupedDocument, QuestionResult } from "@/lib/types"

interface DataFormProps {
  document: GroupedDocument
  onUpdate: (doc: GroupedDocument) => void
  onVerify: () => void
}

export function DataForm({ document: doc, onUpdate, onVerify }: DataFormProps) {
  function updateField(field: keyof GroupedDocument, value: string) {
    onUpdate({ ...doc, [field]: value })
  }

  function updateQuestion(index: number, vote: QuestionResult["vote"]) {
    const questions = [...doc.questions]
    questions[index] = { ...questions[index], vote }
    onUpdate({ ...doc, questions })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Данные бюллетеня</h3>
          {doc.isVerified && (
            <Badge variant="default" className="bg-success text-success-foreground">
              <CheckCircle2 className="size-3" />
              Подтвержден
            </Badge>
          )}
        </div>
        {!doc.isVerified && (
          <Button size="sm" onClick={onVerify}>
            <CheckCircle2 className="size-4" />
            Подтвердить
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-4">
          {/* Owner Fields */}
          <section className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Данные собственника
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-xs">Фамилия</Label>
                <Input
                  id="lastName"
                  value={doc.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-xs">Имя</Label>
                <Input
                  id="firstName"
                  value={doc.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="middleName" className="text-xs">Отчество</Label>
                <Input
                  id="middleName"
                  value={doc.middleName}
                  onChange={(e) => updateField("middleName", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Сведения о помещении
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="roomNo" className="text-xs">Квартира / помещение</Label>
                <Input
                  id="roomNo"
                  value={doc.roomNo}
                  onChange={(e) => updateField("roomNo", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="area" className="text-xs">{"Площадь (м\u00B2)"}</Label>
                <Input
                  id="area"
                  value={doc.area}
                  onChange={(e) => updateField("area", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="snils" className="text-xs">СНИЛС</Label>
                <Input
                  id="snils"
                  value={doc.snils}
                  onChange={(e) => updateField("snils", e.target.value)}
                  className="h-9 text-sm font-mono"
                  maxLength={11}
                  placeholder="11 цифр"
                />
                {doc.snils && doc.snils.replace(/\D/g, "").length !== 11 && (
                  <p className="text-xs text-destructive">СНИЛС должен содержать 11 цифр</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ownershipShare" className="text-xs">Доля собственности</Label>
                <Input
                  id="ownershipShare"
                  value={doc.ownershipShare}
                  onChange={(e) => updateField("ownershipShare", e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Vote Questions */}
          {doc.questions.length > 0 && (
            <section className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {"Голосование ("}{doc.questions.length}{" вопросов)"}
              </h4>
              <div className="flex flex-col gap-2">
                {doc.questions.map((q, i) => (
                  <VoteBlock
                    key={q.number}
                    question={q}
                    onChange={(vote) => updateQuestion(i, vote)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
