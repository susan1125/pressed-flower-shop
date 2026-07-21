import type { Metadata } from "next";
import "./globals.css";
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: "压花小铺 - 手工压花文创",
  description: "手工压花台灯、包、扇子、书签、镜子、装饰画，每一件都是独一无二的自然之美",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t py-8 text-center text-sm text-gray-400">
          <p>🌸 压花小铺 — 手工压花，自然之美</p>
          <p className="mt-1">每一片花瓣都有自己的故事</p>
        </footer>
      </body>
    </html>
  );
}
