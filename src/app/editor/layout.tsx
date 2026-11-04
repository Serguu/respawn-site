import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default function EditorRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-bg-deep">{children}</div>;
}
