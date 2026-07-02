"use client";

import { Head } from "veryfront/head";
import {
  AppShell,
  ChatSidebar,
  ChatThemeScope,
  Tabs,
  TabsItem,
  ThreadsProvider,
  useThreadListContext,
} from "veryfront/chat";
import { useRouter } from "veryfront/router";

/** The conversation list — reads the shared thread store, navigates by ?thread=. */
function ConversationsSidebar(): React.JSX.Element {
  const router = useRouter();
  const { threads, createThread, deleteThread, renameThread } = useThreadListContext();
  // The URL is the single source of truth for the active thread (matches the page).
  const activeId = router.query.thread ?? threads[0]?.id ?? null;
  const open = (id: string) => void router.push(`/?thread=${id}`);
  return (
    <ChatSidebar
      fill
      threads={threads}
      activeThreadId={activeId}
      onSelectThread={open}
      // Reuse an existing empty draft instead of stacking up blank "New Chat" rows.
      onNewThread={() => {
        const draft = threads.find((t) => t.messages.length === 0);
        open(draft ? draft.id : createThread().id);
      }}
      onDeleteThread={(id) => {
        deleteThread(id);
        if (id === activeId) void router.push("/");
      }}
      onRenameThread={renameThread}
    />
  );
}

/** App shell: sidebar (conversations) + centered Chat|Uploads tabs, pages in the content slot. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const router = useRouter();
  const tab = router.pathname === "/uploads" ? "uploads" : "chat";
  return (
    <>
      <Head>
        <title>Customer Operations Agent</title>
      </Head>
      {/* One token scope so the sidebar + tabs (outside <Chat>) are themed too. */}
      <ChatThemeScope className="h-screen">
        {/* useThreads() lives here once; the sidebar and the page consume it via context. */}
        <ThreadsProvider storageKey="cx-threads">
          <AppShell className="h-full" storageKey="cx-shell">
            <AppShell.Sidebar
              side="left"
              width={260}
              aria-label="Conversations"
              className="border-r border-[var(--outline-border)]"
            >
              <ConversationsSidebar />
            </AppShell.Sidebar>
            <AppShell.Main>
              <AppShell.Header className="h-14 px-3">
                <AppShell.Trigger side="left" />
                <div className="flex flex-1 justify-center">
                  <Tabs
                    value={tab}
                    onValueChange={(v) => void router.push(v === "uploads" ? "/uploads" : "/")}
                  >
                    <TabsItem value="chat">Chat</TabsItem>
                    <TabsItem value="uploads">Uploads</TabsItem>
                  </Tabs>
                </div>
              </AppShell.Header>
              <AppShell.Content className="flex min-h-0 flex-col">
                {children}
              </AppShell.Content>
            </AppShell.Main>
          </AppShell>
        </ThreadsProvider>
      </ChatThemeScope>
    </>
  );
}
