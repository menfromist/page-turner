'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          📖 Page Turner
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/meetings/new">
            <Button variant="outline">모임 개설하기</Button>
          </Link>
          <Link href="/login">
            <Button>로그인</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
