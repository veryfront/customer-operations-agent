'use client'

import { Head } from 'veryfront/head'
import { AppShell, ChatSidebar, ChatThemeScope, ConversationsProvider, Tabs, TabsItem } from 'veryfront/chat'
import { useRouter } from 'veryfront/router'

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  const router = useRouter()
  const activeTab = router.pathname.startsWith('/uploads') ? 'uploads' : 'chat'

  // `/custom` is the fully-composed example — it owns its entire shell (its own
  // theme scope, sidebar, header, layout). Hand it a bare passthrough so nothing
  // from the minimal example's AppShell wraps it. Reachable only by typing the
  // URL; there is intentionally no nav link.
  if (router.pathname.startsWith('/custom')) {
    return (
      <>
        <Head>
          <title>Composed Chat — Customer Operations Agent</title>
        </Head>
        {children}
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Customer Operations Agent</title>
      </Head>
      <ChatThemeScope className="flex flex-col h-screen">
        <ConversationsProvider storageKey="customer-operations-agent-conversations">
          <AppShell className="flex-1 min-h-0">
            <AppShell.Sidebar side="left" className="border-r border-[var(--outline-border)]">
              <AppShell.SidebarContent className="p-0">
                <ChatSidebar fill />
              </AppShell.SidebarContent>
            </AppShell.Sidebar>

            <AppShell.Main>
              <AppShell.Header border className="h-16 gap-3 px-3">
                <AppShell.Trigger side="left" />
                <div className="flex flex-1 justify-center">
                  <Tabs
                    value={activeTab}
                    onValueChange={(v: string) => router.push(v === 'uploads' ? '/uploads' : '/')}
                  >
                    <TabsItem value="chat">Chat</TabsItem>
                    <TabsItem value="uploads">Uploads</TabsItem>
                  </Tabs>
                </div>
              </AppShell.Header>
              <AppShell.Content className="flex flex-col min-h-0 pt-3">{children}</AppShell.Content>
            </AppShell.Main>
          </AppShell>
        </ConversationsProvider>
      </ChatThemeScope>
    </>
  )
}
