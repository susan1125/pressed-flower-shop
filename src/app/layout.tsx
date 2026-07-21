import type { Metadata } from "next";
import "./globals.css";
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: "沁瓣 - 手工押花文创",
  description: "沁瓣制作手工押花台灯、包、扇子、书签、镜子、装饰画，每一件都是独一无二的自然之美",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preload" as="image" href="/brand/qinban-meadow.jpg" />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/35 bg-[#f4efe6]/78 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[#5f6655] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p className="font-semibold text-[#263325]">沁瓣</p>
            <p>手工押花，把花海的风留在日常物件里。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
