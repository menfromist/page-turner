'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setNickname(user.user_metadata?.nickname || user.email?.split('@')[0] || '');
      }
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setNickname(session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <span className="text-2xl">📖</span>
            <span className="hidden sm:inline">Page Turner</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {isLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <>
                <Link href="/meetings/new">
                  <Button
                    className="rounded-full gap-2 hidden sm:flex"
                    size="sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    모임 개설
                  </Button>
                  <Button
                    className="rounded-full sm:hidden"
                    size="icon"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </Button>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border/50">
                  <Link href="/mypage" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:inline max-w-[100px] truncate">
                      {nickname}
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground rounded-full"
                  >
                    로그아웃
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/meetings/new" className="hidden sm:block">
                  <Button variant="ghost" className="rounded-full" size="sm">
                    모임 개설하기
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="rounded-full gap-2" size="sm">
                    시작하기
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
