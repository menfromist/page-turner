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

  // 참가자 수 조회
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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">함께 읽고, 함께 나누는</h1>
        <p className="text-xl text-gray-600 mb-6">
          온라인 낭독 독서 모임에서 새로운 독서 경험을 만나보세요
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/meetings/new">
            <Button size="lg">모임 개설하기</Button>
          </Link>
          <Link href="#meetings">
            <Button variant="outline" size="lg">
              둘러보기
            </Button>
          </Link>
        </div>
      </section>

      {/* Meeting List Section */}
      <section id="meetings">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">모집 중인 모임</h2>
          <Link href="/meetings" className="text-primary hover:underline">
            전체 보기
          </Link>
        </div>
        <MeetingList meetings={meetings} />
      </section>
    </div>
  );
}
