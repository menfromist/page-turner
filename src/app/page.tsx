import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MeetingList } from '@/components/meetings/MeetingList';
import type { Meeting } from '@/types/database';

// 임시 목업 데이터 (Supabase 연동 전)
const mockMeetings: Meeting[] = [
  {
    id: '1',
    leader_id: 'user1',
    book_title: '데미안',
    book_author: '헤르만 헤세',
    book_cover_url: null,
    book_description: '방황하는 청춘에게 보내는 성장의 메시지',
    reading_range: '1장 ~ 3장',
    meeting_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    max_participants: 6,
    meeting_link: 'https://zoom.us/j/example1',
    status: 'recruiting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    leader: {
      id: 'user1',
      email: 'leader1@example.com',
      nickname: '책벌레',
      profile_image: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    participant_count: 3,
  },
  {
    id: '2',
    leader_id: 'user2',
    book_title: '1984',
    book_author: '조지 오웰',
    book_cover_url: null,
    book_description: '디스토피아 소설의 고전',
    reading_range: '파트 1 (1~8장)',
    meeting_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    max_participants: 8,
    meeting_link: 'https://zoom.us/j/example2',
    status: 'recruiting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    leader: {
      id: 'user2',
      email: 'leader2@example.com',
      nickname: '문학소녀',
      profile_image: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    participant_count: 5,
  },
  {
    id: '3',
    leader_id: 'user3',
    book_title: '어린 왕자',
    book_author: '생텍쥐페리',
    book_cover_url: null,
    book_description: '어른들을 위한 동화',
    reading_range: '전체 낭독',
    meeting_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 120,
    max_participants: 10,
    meeting_link: 'https://zoom.us/j/example3',
    status: 'recruiting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    leader: {
      id: 'user3',
      email: 'leader3@example.com',
      nickname: '낭독가',
      profile_image: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    participant_count: 7,
  },
];

export default function HomePage() {
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
          <Button variant="outline" size="lg">
            둘러보기
          </Button>
        </div>
      </section>

      {/* Meeting List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">모집 중인 모임</h2>
          <Link href="/meetings" className="text-primary hover:underline">
            전체 보기
          </Link>
        </div>
        <MeetingList meetings={mockMeetings} />
      </section>
    </div>
  );
}
