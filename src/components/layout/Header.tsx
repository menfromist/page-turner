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

    // 현재 사용자 확인
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setNickname(user.user_metadata?.nickname || user.email?.split('@')[0] || '');
      }
      setIsLoading(false);
    };

    getUser();

    // 인증 상태 변화 감지
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
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Page Turner
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-20 bg-gray-100 animate-pulse rounded" />
          ) : user ? (
            <>
              <Link href="/meetings/new">
                <Button variant="outline">모임 개설하기</Button>
              </Link>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{nickname.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{nickname}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/meetings/new">
                <Button variant="outline">모임 개설하기</Button>
              </Link>
              <Link href="/login">
                <Button>로그인</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
