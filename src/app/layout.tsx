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
      <body className="flex min-h-screen flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#cbc0b2] bg-[#f5f0e9]/86">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[#7d7164] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p className="font-semibold text-[#3d362e]">压花小铺</p>
            <p>手工压花，自然之美。每一片花瓣都有自己的故事。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
