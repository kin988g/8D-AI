import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "8D Agent",
  description: "小白被领着走，熟手自己跑。重复劳动交给工具。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <header className="border-b border-stone-300 bg-[var(--card)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              8D Agent
            </Link>
            <nav className="flex gap-4 text-sm text-stone-600">
              <Link href="/">案件</Link>
              <Link href="/settings">设置</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
