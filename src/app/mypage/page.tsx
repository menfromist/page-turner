import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface ParticipantWithMeeting {
  id: string;
  meeting_id: string;
  user_id: string;
  status: string;
  created_at: string;
  meeting: MeetingWithLeader;
}

async function getMyMeetings(userId: string) {
  const supabase = await createClient();

  // 내가 개설한 모임
  const { data: hostedMeetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('leader_id', userId)
    .order('meeting_date', { ascending: false });

  // 내가 참여한 모임
  const { data: participations } = await supabase
    .from('participants')
    .select(`
      *,
      meeting:meetings(*, leader:users(*))
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false });

  return {
    hosted: (hostedMeetings || []) as Meeting[],
    joined: (participations || []) as ParticipantWithMeeting[],
  };
}

function MeetingRow({ meeting, isHost = false }: { meeting: Meeting | MeetingWithLeader; isHost?: boolean }) {
  const meetingDate = new Date(meeting.meeting_date);
  const isPast = meetingDate < new Date();
  const formattedDate = meetingDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
  const formattedTime = meetingDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group">
        {/* Book Cover */}
        <div className="w-16 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          {meeting.book_cover_url ? (
            <img
              src={meeting.book_cover_url}
              alt={meeting.book_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              📖
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {meeting.book_title}
            </h3>
            <Badge variant={isPast ? 'secondary' : meeting.status === 'recruiting' ? 'default' : 'secondary'} className="flex-shrink-0">
              {isPast ? '종료' : meeting.status === 'recruiting' ? '모집중' : '마감'}
            </Badge>
            {isHost && (
              <Badge variant="outline" className="flex-shrink-0">호스트</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{meeting.book_author}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
            <span>{meeting.reading_range}</span>
          </div>
        </div>

        {/* Arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/mypage');
  }

  const { hosted, joined } = await getMyMeetings(user.id);
  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10">
        <Avatar className="h-16 w-16 ring-4 ring-background">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="text-xl bg-primary/20 text-primary">
            {nickname.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{nickname}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">{hosted.length}</div>
            <div className="text-sm text-muted-foreground">개설한 모임</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">{joined.length}</div>
            <div className="text-sm text-muted-foreground">참여한 모임</div>
          </CardContent>
        </Card>
      </div>

      {/* Hosted Meetings */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">내가 개설한 모임</CardTitle>
          <Link href="/meetings/new">
            <Button size="sm" className="rounded-full gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
              새 모임
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {hosted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">아직 개설한 모임이 없습니다.</p>
              <Link href="/meetings/new">
                <Button variant="outline" className="rounded-full">
                  첫 모임 개설하기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {hosted.map((meeting) => (
                <MeetingRow key={meeting.id} meeting={meeting} isHost />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Joined Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">내가 참여한 모임</CardTitle>
        </CardHeader>
        <CardContent>
          {joined.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">아직 참여한 모임이 없습니다.</p>
              <Link href="/#meetings">
                <Button variant="outline" className="rounded-full">
                  모임 둘러보기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {joined.map((participation) => (
                <MeetingRow key={participation.id} meeting={participation.meeting} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
