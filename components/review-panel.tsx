"use client"

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ScanViewer } from "@/components/scan-viewer"
import { DataForm } from "@/components/data-form"
import type { GroupedDocument } from "@/lib/types"

interface ReviewPanelProps {
  document: GroupedDocument
  onUpdate: (doc: GroupedDocument) => void
  onVerify: () => void
}

export function ReviewPanel({ document, onUpdate, onVerify }: ReviewPanelProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <ScanViewer pages={document.pages} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <DataForm document={document} onUpdate={onUpdate} onVerify={onVerify} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
