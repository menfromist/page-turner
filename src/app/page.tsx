import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MeetingList } from '@/components/meetings/MeetingList';
import { createClient } from '@/lib/supabase/server';
import type { Meeting, User } from '@/types/database';

interface MeetingWithLeader {
  id: string;
  leader_id: string;
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  book_description: string | null;
  reading_range: string;
  meeting_date: string;
  duration_minutes: number;
  max_participants: number;
  meeting_link: string;
  status: string;
  created_at: string;
  updated_at: string;
  leader: User | null;
}

async function getMeetings(): Promise<Meeting[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      leader:users(*)
    `)
    .eq('status', 'recruiting')
    .gte('meeting_date', new Date().toISOString())
    .order('meeting_date', { ascending: true })
    .limit(12);

  if (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }

  const meetings = data as unknown as MeetingWithLeader[];

  const meetingsWithCount = await Promise.all(
    meetings.map(async (meeting) => {
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('meeting_id', meeting.id)
        .eq('status', 'confirmed');

      return {
        ...meeting,
        participant_count: count || 0,
      } as Meeting;
    })
  );

  return meetingsWithCount;
}

export default async function HomePage() {
  const meetings = await getMeetings();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              온라인 낭독 독서 모임
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              함께 읽고,{' '}
              <span className="text-primary">함께 나누는</span>
              <br />
              새로운 독서 경험
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              매주 다양한 책을 낭독하고 이야기 나누는 온라인 모임에 참여하세요.
              <br className="hidden sm:block" />
              책 한 권이 없어도, 목소리 하나면 충분합니다.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/meetings/new">
                <Button size="lg" className="rounded-full px-8 gap-2 w-full sm:w-auto">
                  모임 개설하기
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
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </Link>
              <Link href="#meetings">
                <Button variant="outline" size="lg" className="rounded-full px-8 w-full sm:w-auto">
                  모임 둘러보기
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">100+</div>
                <div className="text-sm text-muted-foreground">개설된 모임</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">참여한 독자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">함께 읽은 책</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎙️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">소리로 읽는 책</h3>
              <p className="text-muted-foreground text-sm">
                낭독을 통해 텍스트에 생명을 불어넣고, 더 깊이 집중하세요.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">함께하는 경험</h3>
              <p className="text-muted-foreground text-sm">
                다양한 시각으로 책을 해석하고 나누며 풍성한 독서를 경험하세요.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">언제 어디서나</h3>
              <p className="text-muted-foreground text-sm">
                온라인으로 진행되어 시간과 장소에 구애받지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meeting List Section */}
      <section id="meetings" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                모집 중인 모임
              </h2>
              <p className="text-muted-foreground">
                지금 참여할 수 있는 낭독 모임을 확인해보세요
              </p>
            </div>
            <Link
              href="/meetings"
              className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              전체 보기
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
          <MeetingList meetings={meetings} />
          <div className="mt-8 text-center sm:hidden">
            <Link href="/meetings">
              <Button variant="outline" className="rounded-full">
                전체 모임 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            나만의 낭독 모임을 시작해보세요
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            좋아하는 책을 함께 읽을 사람들을 모아보세요.
            모임 개설은 무료이며, 몇 분이면 시작할 수 있습니다.
          </p>
          <Link href="/meetings/new">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8 gap-2"
            >
              지금 모임 개설하기
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
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
