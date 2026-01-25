'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Meeting } from '@/types/database';

// 임시 목업 데이터
const mockMeeting: Meeting = {
  id: '1',
  leader_id: 'user1',
  book_title: '데미안',
  book_author: '헤르만 헤세',
  book_cover_url: null,
  book_description:
    '《데미안》은 헤르만 헤세가 1919년 에밀 싱클레어라는 가명으로 발표한 소설입니다. 주인공 에밀 싱클레어가 어린 시절부터 청년기까지 겪는 내면의 성장과 자아 탐구의 여정을 그리고 있습니다. 데미안이라는 신비로운 인물을 통해 자신의 내면에 있는 어두운 면과 밝은 면을 모두 받아들이고 진정한 자아를 찾아가는 과정을 담고 있습니다.',
  reading_range: '1장 ~ 3장 (두 세계, 카인, 도둑)',
  meeting_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  duration_minutes: 60,
  max_participants: 6,
  meeting_link: 'https://zoom.us/j/1234567890',
  status: 'recruiting',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  leader: {
    id: 'user1',
    email: 'leader1@example.com',
    nickname: '책벌레',
    profile_image: null,
    bio: '문학을 사랑하는 독서가입니다.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  participant_count: 3,
};

export default function MeetingDetailPage() {
  const params = useParams();
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const meeting = mockMeeting; // TODO: Fetch from Supabase
  const meetingDate = new Date(meeting.meeting_date);

  const handleJoin = async () => {
    setIsLoading(true);
    // TODO: Implement join logic with Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsJoined(true);
    setIsLoading(false);
  };

  const spotsLeft = meeting.max_participants - (meeting.participant_count ?? 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid md:grid-cols-3 gap-8">
        {/* 책 표지 */}
        <div className="md:col-span-1">
          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {meeting.book_cover_url ? (
              <img
                src={meeting.book_cover_url}
                alt={meeting.book_title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-6xl">📚</span>
              </div>
            )}
          </div>
        </div>

        {/* 모임 정보 */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={meeting.status === 'recruiting' ? 'default' : 'secondary'}>
                {meeting.status === 'recruiting' ? '모집중' : '마감'}
              </Badge>
              <span className="text-sm text-gray-500">
                {spotsLeft > 0 ? `${spotsLeft}자리 남음` : '마감'}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-1">{meeting.book_title}</h1>
            <p className="text-lg text-gray-600">{meeting.book_author}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">모임 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-20">낭독 범위</span>
                <span className="font-medium">{meeting.reading_range}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-20">일시</span>
                <span className="font-medium">
                  {meetingDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}{' '}
                  {meetingDate.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-20">소요 시간</span>
                <span className="font-medium">{meeting.duration_minutes}분</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-20">정원</span>
                <span className="font-medium">
                  {meeting.participant_count ?? 0} / {meeting.max_participants}명
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 리더 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">모임 리더</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={meeting.leader?.profile_image ?? undefined} />
                  <AvatarFallback>{meeting.leader?.nickname?.charAt(0) ?? 'L'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{meeting.leader?.nickname}</p>
                  <p className="text-sm text-gray-500">{meeting.leader?.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신청 버튼 */}
          {!isJoined ? (
            <Button
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={isLoading || spotsLeft <= 0}
            >
              {isLoading ? '신청 중...' : spotsLeft > 0 ? '모임 참가 신청하기' : '마감되었습니다'}
            </Button>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-green-800 font-medium mb-2">참가 신청이 완료되었습니다!</p>
                <p className="text-sm text-gray-600 mb-4">모임 당일 아래 링크로 입장해주세요.</p>
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {meeting.meeting_link}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 책 소개 */}
      {meeting.book_description && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>책 소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {meeting.book_description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
