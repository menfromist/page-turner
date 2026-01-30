'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import type { Meeting } from '@/types/database';

interface MeetingDetailProps {
  meeting: Meeting;
  userId: string | null;
  isParticipant: boolean;
  isLeader: boolean;
}

export function MeetingDetail({ meeting, userId, isParticipant, isLeader }: MeetingDetailProps) {
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(isParticipant);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = isLeader && meeting.status !== 'cancelled' && meeting.status !== 'completed';

  const handleCancelMeeting = async () => {
    if (!userId || !isLeader) return;

    setIsCancelling(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('meetings')
      .update({ status: 'cancelled' } as never)
      .eq('id', meeting.id)
      .eq('leader_id', userId);

    if (error) {
      setError('모임 취소에 실패했습니다. 다시 시도해주세요.');
      setIsCancelling(false);
      setCancelDialogOpen(false);
      return;
    }

    setCancelDialogOpen(false);
    setIsCancelling(false);
    router.refresh();
  };

  const meetingDate = new Date(meeting.meeting_date);
  const spotsLeft = meeting.max_participants - (meeting.participant_count ?? 0);

  const handleJoin = async () => {
    if (!userId) {
      router.push(`/login?redirect=/meetings/${meeting.id}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('participants')
      .insert({
        meeting_id: meeting.id,
        user_id: userId,
        status: 'confirmed' as const,
      } as never);

    if (error) {
      if (error.code === '23505') {
        setError('이미 참가 신청한 모임입니다.');
      } else {
        setError('참가 신청에 실패했습니다. 다시 시도해주세요.');
      }
      setIsLoading(false);
      return;
    }

    setIsJoined(true);
    setIsLoading(false);
    router.refresh();
  };

  const handleCancel = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('meeting_id', meeting.id)
      .eq('user_id', userId);

    if (error) {
      setError('참가 취소에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    setIsJoined(false);
    setIsLoading(false);
    router.refresh();
  };

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
              <div className="flex items-center justify-center h-full text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-6xl">📚</span>
              </div>
            )}
          </div>
        </div>

        {/* 모임 정보 */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={meeting.status === 'recruiting' ? 'default' : meeting.status === 'cancelled' ? 'destructive' : 'secondary'}>
                {meeting.status === 'recruiting' ? '모집중' : meeting.status === 'cancelled' ? '취소됨' : meeting.status === 'completed' ? '완료' : '마감'}
              </Badge>
              {isLeader && (
                <Badge variant="outline">내가 개설한 모임</Badge>
              )}
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
                  {meeting.leader?.bio && (
                    <p className="text-sm text-gray-500">{meeting.leader.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* 참가 신청 버튼 또는 Zoom 링크 */}
          {meeting.status === 'cancelled' ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800 font-medium mb-2">이 모임은 취소되었습니다</p>
                <p className="text-sm text-gray-600">모임 리더에 의해 취소된 모임입니다.</p>
              </CardContent>
            </Card>
          ) : isLeader ? (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-blue-800 font-medium mb-2">내가 개설한 모임입니다</p>
                <p className="text-sm text-gray-600 mb-4">모임 당일 아래 링크로 입장하세요.</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">회의 링크</span>
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline break-all"
                    >
                      {meeting.meeting_link}
                    </a>
                  </div>
                  {meeting.meeting_password && (
                    <div>
                      <span className="text-sm text-gray-500">비밀번호</span>
                      <p className="font-mono text-lg font-semibold text-blue-800">{meeting.meeting_password}</p>
                    </div>
                  )}
                </div>
                {canManage && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-blue-200">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/meetings/${meeting.id}/edit`}>모임 수정하기</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      모임 취소하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : isJoined ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-green-800 font-medium mb-2">참가 신청이 완료되었습니다!</p>
                <p className="text-sm text-gray-600 mb-4">모임 당일 아래 링크로 입장해주세요.</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">회의 링크</span>
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline break-all"
                    >
                      {meeting.meeting_link}
                    </a>
                  </div>
                  {meeting.meeting_password && (
                    <div>
                      <span className="text-sm text-gray-500">비밀번호</span>
                      <p className="font-mono text-lg font-semibold text-green-800">{meeting.meeting_password}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    {isLoading ? '취소 중...' : '참가 취소'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={isLoading || spotsLeft <= 0 || meeting.status !== 'recruiting'}
            >
              {isLoading
                ? '신청 중...'
                : !userId
                  ? '로그인하고 참가 신청하기'
                  : spotsLeft > 0
                    ? '모임 참가 신청하기'
                    : '마감되었습니다'}
            </Button>
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

      {/* 모임 취소 확인 다이얼로그 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>모임을 취소하시겠습니까?</DialogTitle>
            <DialogDescription>
              모임을 취소하면 참가자들에게 알림이 전달되며, 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              돌아가기
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelMeeting}
              disabled={isCancelling}
            >
              {isCancelling ? '취소 중...' : '모임 취소하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
