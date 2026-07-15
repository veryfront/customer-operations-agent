'use client'

/**
 * Fully-composed chat example — composed at the *sub-component* level, on the
 * post-migration `veryfront/chat` + `veryfront/ui` APIs.
 *
 * `<Chat>` (see `app/page.tsx`) is a preset with one fixed arrangement. Here we
 * drop a level and arrange the atomic parts ourselves — `ChatInput.Root/.Field/
 * .Send`, `Message.Root/.Content/.Sources/.Actions`, `ToolCall.Root/.Trigger/
 * .Output`, `ChatSidebar.Root/.List/.Item`, `AgentPicker.Trigger/.Content/.Item`,
 * `AttachmentsPanel.Root/.List/.Item` — every atom restyleable/reorderable/
 * replaceable. A collapsible right-hand Files panel mirrors the basic example's
 * /uploads tab, composed here from the AttachmentsPanel anatomy.
 *
 * ── Customization cookbook (demonstrated below) ─────────────────────────────
 *
 *  Q: Change the submit up-arrow to a mail icon?
 *  A: The send button is `ChatInput.Send`; it takes an `icon` prop:
 *     <ChatInput.Send icon={<MailIcon/>} />  → see <MessageComposer>.
 *
 *  Q: Change how a message part (e.g. a tool call) renders?
 *  A: `Message.Content` takes a function child over the message's parts — switch
 *     on `part.type`, return your node for tools and `<Message.Part/>` (the
 *     default) for the rest.  → see <ConversationThread>.
 *
 *  Q: Add an item to the "…" menu of a conversation row?
 *  A: Compose `ChatSidebar.Item.Menu` with the built-in `.Rename`/`.Delete` plus
 *     your own `<DropdownMenuItem>` from `veryfront/ui`.  → see the sidebar.
 *
 * State comes from hooks (`useChat`, `useConversations`, `useAgents`,
 * `useAgentMetadata`, `useUpload`, `useUploadsRegistry`, `useVoiceInput`). The one effect,
 * `usePersistMessages`, bridges `useChat` → the conversation store; it goes away
 * once server-side AG-UI persistence lands (veryfront-code #2925). Backend is
 * unchanged: `/api/ag-ui`, `/api/uploads`, `/api/agents(/:id)`.
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
  Message,
  ToolCall,
  useAgentMetadata,
  useAgents,
  useChat,
  useConversations,
  useUpload,
  useUploadsRegistry,
  useVoiceInput,
} from 'veryfront/chat'
import type {
  ChatDynamicToolPart,
  ChatMessage,
  ChatToolPart,
  ModelOption,
  Source,
  UseConversationsResult,
} from 'veryfront/chat'
import { DropdownMenuItem } from 'veryfront/ui'

const STORAGE_KEY = 'customer-operations-agent-custom'
const FALLBACK_AGENT_ID = 'support-agent'

const MODELS: ModelOption[] = [
  { value: 'openai/gpt-5.4-nano', label: 'GPT-5.4 nano' },
  { value: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
]

/**
 * Persist a thread's messages back to the conversation store whenever they
 * change — skipping the first render so merely *opening* a conversation doesn't
 * re-save it (which would bump its timestamp and jump it to the top of the
 * sidebar). `<Chat>` app mode does the equivalent internally; a headless
 * `useConversationChat` / server-side persistence would remove this (see #2925).
 */
function usePersistMessages(
  messages: ChatMessage[],
  conversationId: string,
  save: UseConversationsResult['bind'],
): void {
  const isInitialRender = React.useRef(true)
  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    save(conversationId, { messages })
  }, [messages, conversationId, save])
}

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
// Page — the shell. AppShell + a compound ChatSidebar + a compound AgentPicker.
// ---------------------------------------------------------------------------

export default function CustomChatPage(): React.JSX.Element {
  const {
    conversations,
    active: activeConversation,
    activeId,
    isLoading: conversationsLoading,
    select,
    create,
    remove,
    rename,
    update,
    bind,
  } = useConversations({ storageKey: STORAGE_KEY })
  const { agents, isLoading: agentsLoading } = useAgents()

  const activeAgentId = activeConversation?.agentId ?? agents[0]?.id ?? FALLBACK_AGENT_ID

  const selectAgent = React.useCallback(
    (agentId: string) => {
      // Retarget an empty draft in place; otherwise open a new thread so we never
      // rewrite the agent mid-conversation.
      if (activeConversation && activeConversation.messages.length === 0) {
        update(activeConversation.id, { agentId })
      } else {
        create(agentId)
      }
    },
    [activeConversation, update, create],
  )

  return (
    <ChatThemeScope className="h-screen">
      <AppShell className="h-full" defaultOpen={{ left: true, right: false }}>
        <AppShell.Sidebar side="left" className="border-r border-[var(--outline-border)]">
          <AppShell.SidebarContent className="p-0">
            {/* ChatSidebar compound, driven by useConversations. Each row is a
                `ChatSidebar.Item` composing the built-in Rename/Delete plus an
                extra "Copy title" entry — the built-in `.Rename` is a real inline
                edit, no native prompt(). */}
            <ChatSidebar.Root
              fill
              loading={conversationsLoading}
              conversations={conversations}
              activeId={activeId}
              onSelect={(id) => select(id)}
              onNew={() => create(activeAgentId)}
              onDelete={(id) => remove(id)}
              onRename={(id, title) => rename(id, title)}
            >
              <ChatSidebar.NewButton>New chat</ChatSidebar.NewButton>
              <ChatSidebar.List>
                {conversations.map((conversation) => (
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
            <ActiveConversation
              activeConversation={activeConversation}
              activeId={activeId}
              isLoading={conversationsLoading}
              save={bind}
              agentId={activeAgentId}
            />
          </AppShell.Content>
        </AppShell.Main>

        {/* Right sidebar: the durable uploads registry, composed — parallels the
            basic example's /uploads tab. Starts collapsed (see `defaultOpen`). */}
        <AppShell.Sidebar side="right" className="border-l border-[var(--outline-border)]">
          <AppShell.SidebarContent className="p-0">
            <FilesPanel />
          </AppShell.SidebarContent>
        </AppShell.Sidebar>
      </AppShell>
    </ChatThemeScope>
  )
}

// --- Files: the durable uploads registry, composed -------------------------
// The basic example's /uploads tab drops in the `<AttachmentsPanel>` preset;
// here we compose its anatomy (Header + Loading/Empty/List → Item) so every
// piece is ours, fed by the `useUploadsRegistry` hook.

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
  const options = React.useMemo(
    () => agents.map((agent) => ({ id: agent.id, name: agent.name, avatarSrc: agent.avatarUrl ?? undefined })),
    [agents],
  )
  // AgentPicker as a compound: trigger + searchable content + your own items.
  return (
    <AgentPicker agents={options} value={value} onValueChange={onChange} isLoading={loading}>
      <AgentPicker.Trigger />
      <AgentPicker.Content>
        <AgentPicker.Search placeholder="Find an agent…" />
        <AgentPicker.List>
          {options.map((option) => (
            <AgentPicker.Item key={option.id} agent={option} selected={option.id === value} />
          ))}
        </AgentPicker.List>
      </AgentPicker.Content>
    </AgentPicker>
  )
}

// ---------------------------------------------------------------------------
// ActiveConversation — resolve which conversation is selected (skeleton while it
// loads), then mount <ConversationThread> for it, remounting on thread switch.
// ---------------------------------------------------------------------------

function ActiveConversation({
  activeConversation,
  activeId,
  isLoading,
  save,
  agentId,
}: {
  activeConversation: UseConversationsResult['active']
  activeId: string | null
  isLoading: boolean
  save: UseConversationsResult['bind']
  agentId: string
}): React.JSX.Element {
  if (isLoading || !activeId || activeConversation?.id !== activeId) return <Chat.Skeleton />
  // `key={activeId}` remounts <ConversationThread> when you switch conversations,
  // so its `useChat` re-seeds from the newly-selected thread's messages.
  return (
    <ConversationThread
      key={activeId}
      conversationId={activeId}
      agentId={activeConversation.agentId ?? agentId}
      initialMessages={activeConversation.messages}
      save={save}
    />
  )
}

// ---------------------------------------------------------------------------
// ConversationThread — the chat surface for ONE conversation. Runs `useChat`
// (seeded from this thread's history), renders the transcript (Message.*) and
// the composer (ChatInput.*), and persists new messages back to the store.
// Mounted once per conversation (see the `key` above), so switching threads
// gives it a fresh, correctly-seeded `useChat`.
// ---------------------------------------------------------------------------

function ConversationThread({
  conversationId,
  agentId,
  initialMessages,
  save,
}: {
  conversationId: string
  agentId: string
  initialMessages: ChatMessage[]
  save: UseConversationsResult['bind']
}): React.JSX.Element {
  const chat = useChat({ api: '/api/ag-ui', initialMessages, body: { agentId } })
  const { agent } = useAgentMetadata(agentId)
  const upload = useUpload({ api: '/api/uploads' })
  const voice = useVoiceInput({
    onTranscript: (transcript, isFinal) => {
      if (isFinal) chat.setInput(transcript)
    },
  })

  // Save messages back to the conversation store as they change.
  usePersistMessages(chat.messages, conversationId, save)

  const openSource = React.useCallback((source: Source) => {
    if (source.url) window.open(source.url, '_blank', 'noopener,noreferrer')
  }, [])

  const submit = React.useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault()
      if (chat.isLoading) return
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

  const suggestions = React.useMemo(() => {
    const promptSuggestions = agent?.suggestions?.suggestions ?? []
    return promptSuggestions.flatMap((suggestion) =>
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
      isLoading={chat.isLoading}
      error={chat.error}
      setInput={chat.setInput}
      onSubmit={submit}
      onStop={chat.stop}
      onReload={() => void chat.reload()}
      model={chat.model}
      models={MODELS}
      onModelChange={chat.setModel}
      agent={agent ? { name: agent.name, avatarUrl: agent.avatarUrl ?? undefined } : undefined}
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
          suggestions={suggestions.map((suggestion) => suggestion.label)}
          onSuggestionClick={(label: string) => {
            const match = suggestions.find((suggestion) => suggestion.label === label)
            void chat.sendMessage({ text: match?.prompt ?? label })
          }}
          className="flex-1"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {chat.messages.map((message, index) => (
              <Message.Root
                key={message.id}
                message={message}
                isStreaming={index === chat.messages.length - 1 && chat.isLoading}
                editMessage={chat.editMessage}
                onReload={() => void chat.reload()}
                className="flex gap-3"
              >
                <Message.Avatar />
                <div className="min-w-0 flex-1">
                  <Message.Header />
                  {/* Compose the body: a function child over the message's parts.
                      Render tool parts with our styled card; everything else
                      (text, reasoning, files) via the default `Message.Part`. */}
                  <Message.Content>
                    {(part, partIndex) =>
                      part.type === 'tool'
                        ? <StyledToolCall key={partIndex} tool={part.tool} />
                        : <Message.Part key={partIndex} part={part} />
                    }
                  </Message.Content>
                  {/* With a function child you own the body, so sources aren't
                      auto-appended — place them explicitly. */}
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

// --- MessageComposer assembled from ChatInput parts, with a mail send icon --------

function MessageComposer({
  chat,
  upload,
  voice,
  onSubmit,
  agentName,
}: {
  chat: ReturnType<typeof useChat>
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
      isLoading={chat.isLoading}
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
            <ChatInput.Stop />
            {/* The one you asked about: swap the up-arrow for a mail icon. */}
            <ChatInput.Send icon={<MailIcon />} />
          </div>
        </div>
      </div>
    </ChatInput.Root>
  )
}
