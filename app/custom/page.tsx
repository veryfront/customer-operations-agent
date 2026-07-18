'use client'

/**
 * Fully-composed chat example — the counterpart to the minimal black-box
 * `<Chat>` at `/`. Every piece is hand-composed from veryfront's own
 * sub-components and driven by the hooks, so it doubles as a reference for
 * customizing the whole surface — layout, labels, colours, icons, handlers.
 *
 * Runs on the post-composition-DX APIs (veryfront 0.1.1081 / veryfront-code
 * #2941, #2955, #2956): no userland effects, no data reshaping, no boolean
 * toggles, controls bound to state.
 *
 * ── Customization cookbook (demonstrated below) ─────────────────────────────
 *
 *  • Submit icon → `<ChatInput.Submit icon={<MailIcon/>} />` (one control that
 *    flips to Stop while streaming).  → <MessageComposer>
 *  • Tool-call rendering → `Message.Content`'s function child switches on
 *    `part.type`; `Message.Part` renders the defaults.  → <ConversationThread>
 *  • Extra conversation-row menu item → compose `ChatSidebar.Item.Menu` with the
 *    built-in `.Rename`/`.Delete` + a `DropdownMenuItem` from `veryfront/ui`.
 *
 * Persistence is handled by `useConversationChat` inside a `ConversationsProvider`
 * — zero effects in this file. Backend: `/api/ag-ui`, `/api/uploads`,
 * `/api/agents(/:id)`.
 */

import * as React from 'react'
import {
  AgentAvatar,
  AgentPicker,
  AppShell,
  AttachmentsPanel,
  Chat,
  ChatInput,
  ChatSidebar,
  ChatThemeScope,
  ConversationsProvider,
  Message,
  ToolCall,
  useAgentMetadata,
  useAgents,
  useConversationChat,
  useConversationsContext,
  useUpload,
  useUploadsRegistry,
  useVoiceInput,
} from 'veryfront/chat'
import type { ChatDynamicToolPart, ChatToolPart, ModelOption, Source } from 'veryfront/chat'
import { DropdownMenuItem } from 'veryfront/ui'

const STORAGE_KEY = 'customer-operations-agent-custom'
const FALLBACK_AGENT_ID = 'support-agent'

const MODELS: ModelOption[] = [
  { value: 'openai/gpt-5.4-nano', label: 'GPT-5.4 nano' },
  { value: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
]

/** Inline mail icon — no icon dependency. */
function MailIcon(): React.JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Page — one ConversationsProvider owns the conversation list + persistence;
// everything below reads it from context.
// ---------------------------------------------------------------------------

export default function CustomChatPage(): React.JSX.Element {
  return (
    <ChatThemeScope className="h-screen">
      <ConversationsProvider storageKey={STORAGE_KEY}>
        <Shell />
      </ConversationsProvider>
    </ChatThemeScope>
  )
}

function Shell(): React.JSX.Element {
  const conversations = useConversationsContext()
  const { agents, isLoading: agentsLoading } = useAgents()

  const activeAgentId = conversations.active?.agentId ?? agents[0]?.id ?? FALLBACK_AGENT_ID

  const selectAgent = React.useCallback(
    (agentId: string) => {
      const active = conversations.active
      if (active && active.messages.length === 0) conversations.update(active.id, { agentId })
      else conversations.create(agentId)
    },
    [conversations],
  )

  const threadReady = conversations.activeId != null && conversations.active?.id === conversations.activeId

  return (
    <AppShell className="h-full" defaultOpen={{ left: true, right: false }}>
      <AppShell.Sidebar side="left" className="border-r border-[var(--outline-border)]">
        <AppShell.SidebarContent className="p-0">
          {/* ChatSidebar reads the provider from context. Each row composes the
              built-in Rename/Delete plus an extra "Copy title" entry. */}
          <ChatSidebar.Root>
            <ChatSidebar.NewButton>New chat</ChatSidebar.NewButton>
            <ChatSidebar.List>
              {conversations.conversations.map((conversation) => (
                <ChatSidebar.Item key={conversation.id} conversation={conversation}>
                  <ChatSidebar.Item.Menu>
                    <ChatSidebar.Item.Rename />
                    <DropdownMenuItem onSelect={() => void navigator.clipboard?.writeText(conversation.title)}>
                      Copy title
                    </DropdownMenuItem>
                    <ChatSidebar.Item.Delete />
                  </ChatSidebar.Item.Menu>
                </ChatSidebar.Item>
              ))}
            </ChatSidebar.List>
          </ChatSidebar.Root>
        </AppShell.SidebarContent>
      </AppShell.Sidebar>

      <AppShell.Main>
        <AppShell.Header border className="h-16 gap-3 px-4">
          <AppShell.Trigger side="left" />
          <AgentIdentity agentId={activeAgentId} />
          <div className="ml-auto flex items-center gap-2">
            <AgentSwitcher agents={agents} value={activeAgentId} onChange={selectAgent} loading={agentsLoading} />
            {/* Toggles the right-hand Files panel. */}
            <AppShell.Trigger side="right" />
          </div>
        </AppShell.Header>

        <AppShell.Content className="flex min-h-0 flex-col pt-3">
          {threadReady ? (
            // Keyed by the active id so the session re-binds when you switch threads.
            <ConversationThread key={conversations.activeId} agentId={activeAgentId} />
          ) : (
            <Chat.Skeleton />
          )}
        </AppShell.Content>
      </AppShell.Main>

      {/* Right sidebar: the durable uploads registry, composed. Starts collapsed. */}
      <AppShell.Sidebar side="right" className="border-l border-[var(--outline-border)]">
        <AppShell.SidebarContent className="p-0">
          <FilesPanel />
        </AppShell.SidebarContent>
      </AppShell.Sidebar>
    </AppShell>
  )
}

// --- Files: the durable uploads registry, composed -------------------------

function FilesPanel(): React.JSX.Element {
  const registry = useUploadsRegistry({ url: '/api/uploads' })
  return (
    <AttachmentsPanel.Root
      uploads={registry.items}
      loading={registry.isLoading}
      onAttach={registry.upload}
      onRemoveUpload={(id) => void registry.remove(id)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <AttachmentsPanel.Header>Files</AttachmentsPanel.Header>
      {registry.isLoading ? (
        <AttachmentsPanel.Loading />
      ) : registry.items.length === 0 ? (
        <AttachmentsPanel.Empty>No files uploaded yet.</AttachmentsPanel.Empty>
      ) : (
        <AttachmentsPanel.List>
          {registry.items.map((file) => (
            <AttachmentsPanel.Item key={file.id} file={file} />
          ))}
        </AttachmentsPanel.List>
      )}
    </AttachmentsPanel.Root>
  )
}

// --- Header: identity + a compound AgentPicker -----------------------------

function AgentIdentity({ agentId }: { agentId: string }): React.JSX.Element {
  const { agent } = useAgentMetadata(agentId)
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AgentAvatar name={agent?.name} avatarUrl={agent?.avatarUrl ?? undefined} className="size-8" />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{agent?.name ?? 'Assistant'}</div>
        {agent?.description && <div className="truncate text-xs text-[var(--faint)]">{agent.description}</div>}
      </div>
    </div>
  )
}

function AgentSwitcher({
  agents,
  value,
  onChange,
  loading,
}: {
  agents: ReturnType<typeof useAgents>['agents']
  value: string
  onChange: (agentId: string) => void
  loading: boolean
}): React.JSX.Element {
  // `AgentOption.avatarUrl` matches `AgentMetadata`, so the agents pass straight
  // through — no reshaping map.
  return (
    <AgentPicker agents={agents} value={value} onValueChange={onChange} isLoading={loading}>
      <AgentPicker.Trigger />
      <AgentPicker.Content>
        <AgentPicker.Search placeholder="Find an agent…" />
        <AgentPicker.List>
          {agents.map((agent) => (
            <AgentPicker.Item key={agent.id} agent={agent} selected={agent.id === value} />
          ))}
        </AgentPicker.List>
      </AgentPicker.Content>
    </AgentPicker>
  )
}

// ---------------------------------------------------------------------------
// ConversationThread — the chat surface for the active conversation.
// `useConversationChat` binds a `useChat` session to the provider's active
// thread and persists changes back — no effect, no manual seeding. Mounted once
// per conversation (keyed in <Shell>) so switching threads re-binds cleanly.
// ---------------------------------------------------------------------------

function ConversationThread({ agentId }: { agentId: string }): React.JSX.Element {
  const { chat, resolvedAgentId } = useConversationChat({ api: '/api/ag-ui', agentId })
  const { agent } = useAgentMetadata(resolvedAgentId ?? agentId)
  const upload = useUpload({ api: '/api/uploads' })
  const voice = useVoiceInput({
    onTranscript: (transcript, isFinal) => {
      if (isFinal) chat.setInput(transcript)
    },
  })

  const openSource = React.useCallback((source: Source) => {
    if (source.url) window.open(source.url, '_blank', 'noopener,noreferrer')
  }, [])

  const submit = React.useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault()
      if (chat.status === 'streaming' || chat.status === 'submitted') return
      const stillUploading = upload.attachments.some(
        (attachment) => attachment.state === 'uploading' || attachment.state === 'processing',
      )
      if (stillUploading) return
      const text = chat.input.trim()
      const files = upload.attachments
        .filter((attachment): attachment is typeof attachment & { url: string } => Boolean(attachment.url))
        .map((attachment) => ({
          type: 'file' as const,
          mediaType: attachment.type ?? 'application/octet-stream',
          url: attachment.url,
          filename: attachment.name,
        }))
      if (!text && files.length === 0) return
      chat.setInput('')
      upload.clear()
      void chat.sendMessage({ text, files })
    },
    [chat, upload],
  )

  // Agent prompt suggestions are already `{ label, prompt }` — pass them straight
  // to Chat.Empty; the click hands back the prompt, so no lookup.
  const suggestions = React.useMemo(() => {
    const list = agent?.suggestions?.suggestions ?? []
    return list.flatMap((suggestion) =>
      suggestion.type === 'prompt' && 'prompt' in suggestion && suggestion.prompt
        ? [{ label: suggestion.title || suggestion.prompt, prompt: suggestion.prompt }]
        : [],
    )
  }, [agent])

  const isEmpty = chat.messages.length === 0

  return (
    <Chat.Root
      messages={chat.messages}
      input={chat.input}
      isLoading={chat.status === 'streaming' || chat.status === 'submitted'}
      error={chat.error}
      setInput={chat.setInput}
      onSubmit={submit}
      onStop={chat.stop}
      onReload={() => void chat.reload()}
      model={chat.model}
      models={MODELS}
      onModelChange={chat.setModel}
      agent={agent ?? undefined}
      attachments={upload.attachments}
      onAttach={upload.upload}
      onRemoveAttachment={upload.remove}
      editMessage={chat.editMessage}
      className="flex min-h-0 flex-1 flex-col border-0"
    >
      {isEmpty ? (
        <Chat.Empty
          icon={<AgentAvatar name={agent?.name} avatarUrl={agent?.avatarUrl ?? undefined} className="size-12" />}
          title={agent?.name ?? 'How can I help?'}
          description={agent?.description ?? undefined}
          suggestions={suggestions}
          onSuggestionClick={(prompt) => void chat.sendMessage({ text: prompt })}
          className="flex-1"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {chat.messages.map((message) => (
              <Message.Root
                key={message.id}
                message={message}
                isStreaming={chat.streamingMessageId === message.id}
                editMessage={chat.editMessage}
                onReload={() => void chat.reload()}
                className="flex gap-3"
              >
                <Message.Avatar />
                <div className="min-w-0 flex-1">
                  <Message.Header />
                  {/* Compose the body: render tool parts with our styled card,
                      everything else (text, reasoning, files) via Message.Part. */}
                  <Message.Content>
                    {(part, partIndex) =>
                      part.type === 'tool'
                        ? <StyledToolCall key={partIndex} tool={part.tool} />
                        : <Message.Part key={partIndex} part={part} />
                    }
                  </Message.Content>
                  <Message.Sources onSourceClick={openSource} />
                  <Message.Actions>
                    <Message.CopyAction />
                    <Message.RegenerateAction />
                  </Message.Actions>
                </div>
              </Message.Root>
            ))}
          </div>
        </div>
      )}

      <MessageComposer chat={chat} upload={upload} voice={voice} onSubmit={submit} agentName={agent?.name} />
    </Chat.Root>
  )
}

// --- A restyled tool card (ToolCall compound) ------------------------------

function StyledToolCall({ tool }: { tool: ChatToolPart | ChatDynamicToolPart }): React.JSX.Element {
  return (
    <ToolCall.Root tool={tool} className="rounded-[var(--chat-radius)] border border-[var(--edge-medium)] bg-[var(--muted)]">
      <ToolCall.Trigger icon={<span aria-hidden>🔧</span>} />
      <ToolCall.Body>
        <ToolCall.Input />
        <ToolCall.Output className="ring-1 ring-[var(--edge)]" />
        <ToolCall.Error />
      </ToolCall.Body>
    </ToolCall.Root>
  )
}

// --- Composer assembled from ChatInput parts, with a mail submit icon ------

function MessageComposer({
  chat,
  upload,
  voice,
  onSubmit,
  agentName,
}: {
  chat: ReturnType<typeof useConversationChat>['chat']
  upload: ReturnType<typeof useUpload>
  voice: ReturnType<typeof useVoiceInput>
  onSubmit: (event?: React.FormEvent) => void
  agentName?: string
}): React.JSX.Element {
  return (
    <ChatInput.Root
      input={voice.isListening ? voice.transcript || chat.input : chat.input}
      onChange={chat.handleInputChange}
      onSubmit={onSubmit}
      isLoading={chat.status === 'streaming' || chat.status === 'submitted'}
      stop={chat.stop}
      onVoice={voice.isSupported ? voice.toggle : undefined}
      isListening={voice.isListening}
      transcript={voice.transcript}
      models={MODELS}
      model={chat.model}
      onModelChange={chat.setModel}
      onAttach={upload.upload}
      attachments={upload.attachments}
      onRemoveAttachment={upload.remove}
      className="mx-auto w-full max-w-3xl px-4 pb-4"
    >
      <div className="rounded-[var(--chat-radius)] border border-[var(--edge-medium)] bg-[var(--input-bg)] px-3 pb-2 pt-3">
        <ChatInput.Field placeholder={voice.isListening ? 'Listening…' : `Ask the ${agentName ?? 'agent'} anything…`} />
        <div className="mt-2 flex items-center justify-between">
          <ChatInput.Attach />
          <div className="flex items-center gap-1.5">
            <ChatInput.Model />
            <ChatInput.Voice />
            {/* One control: Send, flipping to Stop while streaming. */}
            <ChatInput.Submit icon={<MailIcon />} />
          </div>
        </div>
      </div>
    </ChatInput.Root>
  )
}
