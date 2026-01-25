import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MeetingDetail } from '@/components/meetings/MeetingDetail';
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

async function getMeeting(id: string): Promise<Meeting | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      leader:users(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const meeting = data as unknown as MeetingWithLeader;

  // 참가자 수 조회
  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('meeting_id', id)
    .eq('status', 'confirmed');

  return {
    ...meeting,
    participant_count: count || 0,
  } as Meeting;
}

async function checkParticipation(meetingId: string, userId: string | null): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from('participants')
    .select('id')
    .eq('meeting_id', meetingId)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .single();

  return !!data;
}

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [meeting, user] = await Promise.all([
    getMeeting(id),
    getCurrentUser(),
  ]);

  if (!meeting) {
    notFound();
  }

  const isParticipant = await checkParticipation(id, user?.id || null);
  const isLeader = user?.id === meeting.leader_id;

  return (
    <MeetingDetail
      meeting={meeting}
      userId={user?.id || null}
      isParticipant={isParticipant}
      isLeader={isLeader}
    />
  );
}
