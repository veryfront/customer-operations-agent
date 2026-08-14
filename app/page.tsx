'use client'

import { Chat, useChat } from 'veryfront/chat'
import { csrfHeaders } from '@/lib/csrf.ts'

export default function ChatPage(): React.JSX.Element {
  // Wire the chat through `useChat` with the framework CSRF header pair, matching
  // the agentic-job-submission-processing reference. The agent is bound by the
  // AG-UI route (`createAgUiHandler("customer-operations-agent")`), so it is no
  // longer passed here.
  const chat = useChat({ api: '/api/ag-ui', headers: csrfHeaders() })

  return <Chat chat={chat} className="flex-1 min-h-0" placeholder="What customer issue should we triage?" />
}
