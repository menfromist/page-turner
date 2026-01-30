import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: '쪽GO🍫 - 한 쪽 읽기 GO 해봅시다',
  description:
    '함께 읽고, 함께 나누는 온라인 낭독 독서 모임 플랫폼. 낭독을 통한 경청과 집중력 향상, 다각적 독서 경험을 제공합니다.',
  keywords: ['낭독', '독서 모임', '온라인 독서', '책 모임', '북클럽', '쪽GO🍫', 'PageGO'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
