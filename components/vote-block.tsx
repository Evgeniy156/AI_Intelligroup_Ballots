"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { QuestionResult } from "@/lib/types"

interface VoteBlockProps {
  question: QuestionResult
  onChange: (vote: QuestionResult["vote"]) => void
}

const VOTE_OPTIONS: { value: "ЗА" | "ПРОТИВ" | "ВОЗДЕРЖАЛСЯ"; label: string; color: string }[] = [
  { value: "ЗА", label: "За", color: "text-success" },
  { value: "ПРОТИВ", label: "Против", color: "text-destructive" },
  { value: "ВОЗДЕРЖАЛСЯ", label: "Воздержался", color: "text-warning" },
]

export function VoteBlock({ question, onChange }: VoteBlockProps) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="mb-2 flex items-start gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
          {question.number}
        </span>
        <p className="text-sm leading-relaxed text-foreground">{question.text || "Текст вопроса не распознан"}</p>
      </div>
      <RadioGroup
        value={question.vote || ""}
        onValueChange={(val) => onChange(val as QuestionResult["vote"])}
        className="flex gap-4 pl-8"
      >
        {VOTE_OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`q${question.number}-${opt.value}`} />
            <Label
              htmlFor={`q${question.number}-${opt.value}`}
              className={`cursor-pointer text-sm font-medium ${
                question.vote === opt.value ? opt.color : "text-muted-foreground"
              }`}
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
