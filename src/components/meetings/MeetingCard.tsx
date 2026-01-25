import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Meeting } from '@/types/database';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const meetingDate = new Date(meeting.meeting_date);
  const formattedDate = meetingDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const formattedTime = meetingDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const participantCount = meeting.participant_count ?? 0;
  const spotsLeft = meeting.max_participants - participantCount;

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
            {meeting.book_cover_url ? (
              <img
                src={meeting.book_cover_url}
                alt={meeting.book_title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-4xl">📚</span>
              </div>
            )}
            <Badge
              variant={meeting.status === 'recruiting' ? 'default' : 'secondary'}
              className="absolute top-2 right-2"
            >
              {meeting.status === 'recruiting' ? '모집중' : '마감'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{meeting.book_title}</h3>
          <p className="text-sm text-gray-600 mb-2">{meeting.book_author}</p>
          <p className="text-sm text-gray-500 mb-2">📖 {meeting.reading_range}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅 {formattedDate}</span>
            <span>🕐 {formattedTime}</span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={meeting.leader?.profile_image ?? undefined} />
              <AvatarFallback className="text-xs">
                {meeting.leader?.nickname?.charAt(0) ?? 'L'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{meeting.leader?.nickname ?? '리더'}</span>
          </div>
          <span className="text-sm text-gray-500">
            {spotsLeft > 0 ? `${spotsLeft}자리 남음` : '마감'}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
