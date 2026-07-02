"use client";

import * as React from "react";
import {
  AgentAvatar,
  Chat,
  ChatAgentPicker,
  useAgentMetadata,
  useChat,
  useThreadListContext,
} from "veryfront/chat";
import { useRouter } from "veryfront/router";

const DEFAULT_AGENT = "support-agent";

export default function ChatPage(): React.JSX.Element {
  const router = useRouter();
  const { threads, updateThread } = useThreadListContext();

  // The URL (?thread=) is the single source of truth for the active chat — no
  // second copy of "which thread" to fall out of sync with.
  const activeId = router.query.thread ?? threads[0]?.id ?? null;
  const activeThread = threads.find((t) => t.id === activeId) ?? null;

  const agentId = activeThread?.agentId ?? DEFAULT_AGENT;
  const chat = useChat({ body: { agentId } });
  const { agent, isLoading: agentLoading } = useAgentMetadata(agentId);

  const loadedRef = React.useRef<string | null>(null);
  const prevMessagesRef = React.useRef(chat.messages);

  // Load the active thread's messages when it changes. The persist effect below
  // already saved the outgoing thread as its messages changed, so there's nothing
  // to flush here — and NOT re-saving avoids bumping the old thread's `updatedAt`,
  // which would wrongly float it above a newer chat in the recency-sorted sidebar.
  React.useEffect(() => {
    if (!activeThread || activeThread.id === loadedRef.current) return;
    loadedRef.current = activeThread.id;
    prevMessagesRef.current = activeThread.messages; // loading isn't an edit → don't re-persist
    chat.setMessages(activeThread.messages);
  }, [activeThread, chat]);

  // Persist messages + auto-title back to the active thread as it grows.
  React.useEffect(() => {
    const id = loadedRef.current;
    if (!id || chat.messages === prevMessagesRef.current) return;
    prevMessagesRef.current = chat.messages;
    if (chat.messages.length === 0) return;
    const thread = threads.find((t) => t.id === id);
    let title: string | undefined;
    if (thread?.title === "New Chat") {
      const firstUser = chat.messages.find((m) => m.role === "user");
      const text = firstUser?.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { text: string }).text)
        .join("")
        .trim();
      if (text) title = text.slice(0, 30);
    }
    updateThread(id, title ? { messages: chat.messages, title } : { messages: chat.messages });
  }, [chat.messages, threads, updateThread]);

  // Remember the agent this thread last used, so revisiting restores the picker.
  const onAgentChange = (next: string) => {
    if (loadedRef.current) updateThread(loadedRef.current, { agentId: next });
  };

  // Skeleton until the active thread's messages are actually loaded into the view.
  const initializing = (activeThread != null && loadedRef.current !== activeThread.id) ||
    (chat.messages.length === 0 && agentLoading);

  // Suggestion chips show the short title but send the full prompt.
  const suggestionItems = (agent?.suggestions?.suggestions ?? []).flatMap((s) =>
    s.type === "prompt" && "prompt" in s ? [{ label: s.title, prompt: s.prompt }] : []
  );

  return (
    <Chat
      {...chat}
      className="min-h-0 flex-1"
      initializing={initializing}
      placeholder="Ask an agent..."
      agent={agent ? { name: agent.name, avatarUrl: agent.avatarUrl ?? undefined } : undefined}
      emptyState={agent
        ? {
          icon: (
            <AgentAvatar
              name={agent.name}
              avatarUrl={agent.avatarUrl ?? undefined}
              className="size-12"
            />
          ),
          title: agent.name,
          description: agent.description ?? undefined,
        }
        : undefined}
      suggestions={suggestionItems.map((s) => s.label)}
      onSuggestionClick={(label) => {
        const item = suggestionItems.find((s) => s.label === label);
        void chat.sendMessage({ text: item?.prompt ?? label });
      }}
      toolbarStart={<ChatAgentPicker value={agentId} onValueChange={onAgentChange} />}
    />
  );
}
