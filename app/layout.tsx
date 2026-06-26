import { Head } from "veryfront/head";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <>
      <Head>
        <title>Customer Operations Agent</title>
      </Head>
      <div className="flex flex-col h-screen bg-white dark:bg-neutral-900">
        {children}
      </div>
    </>
  );
}
