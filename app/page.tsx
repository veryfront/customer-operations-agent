'use client'

import { Chat } from 'veryfront/chat'
import { MarkdownRendererProvider } from 'veryfront/markdown'
import { MarkdownRenderer } from './markdown-renderer.tsx'

export default function ChatPage(): React.JSX.Element {
  // uploadApi routes composer attachments through /api/uploads; without it
  // files are inlined as data: URLs, which the agent runtime reads as empty.
  return (
    <MarkdownRendererProvider renderer={MarkdownRenderer}>
      <Chat agentId="customer-operations-agent" api="/api/ag-ui" uploadApi="/api/uploads" className="flex-1 min-h-0" />
    </MarkdownRendererProvider>
  )
}
