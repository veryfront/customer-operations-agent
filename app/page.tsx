'use client'

import { Chat, getAgentPromptSuggestions, useAgentMetadata, useChat } from 'veryfront/chat'

export default function ChatPage(): React.JSX.Element {
  const chat = useChat()
  const agentMetadata = useAgentMetadata('support-agent')
  const agent = agentMetadata.agent
  const suggestions = getAgentPromptSuggestions(agent)
  const emptyState = agent
    ? {
        title: agent.name ?? agent.id,
        description: agent.description,
      }
    : undefined

  return (
    <Chat
      {...chat}
      className="flex-1 min-h-0"
      placeholder="Ask the support agent..."
      emptyState={emptyState}
      suggestions={suggestions}
      onSuggestionClick={(suggestion) => {
        void chat.sendMessage({ text: suggestion })
      }}
    />
  )
}
