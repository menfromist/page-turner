import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Meeting } from '@/types/database';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const meetingDate = new Date(meeting.meeting_date);
  const formattedDate = meetingDate.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
  const formattedDay = meetingDate.toLocaleDateString('ko-KR', {
    weekday: 'short',
  });
  const formattedTime = meetingDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const participantCount = meeting.participant_count ?? 0;
  const spotsLeft = meeting.max_participants - participantCount;
  const progressPercent = (participantCount / meeting.max_participants) * 100;

  return (
    <Link href={`/meetings/${meeting.id}`} className="block group">
      <Card className="h-full overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
        {/* Book Cover */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {meeting.book_cover_url ? (
            <img
              src={meeting.book_cover_url}
              alt={meeting.book_title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl mb-2 block">📖</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {meeting.book_author}
                </span>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <Badge
            variant={meeting.status === 'recruiting' ? 'default' : 'secondary'}
            className="absolute top-3 left-3 rounded-full"
          >
            {meeting.status === 'recruiting' ? '모집중' : '마감'}
          </Badge>

          {/* Date Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center shadow-sm">
            <div className="text-xs font-medium text-muted-foreground">{formattedDay}</div>
            <div className="text-sm font-bold text-foreground">{formattedDate}</div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title & Author */}
          <div className="mb-3">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {meeting.book_title}
            </h3>
            <p className="text-sm text-muted-foreground">{meeting.book_author}</p>
          </div>

          {/* Reading Range & Time */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                className="text-primary/60"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span className="truncate">{meeting.reading_range}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                className="text-primary/60"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formattedTime} ({meeting.duration_minutes}분)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {participantCount}/{meeting.max_participants}명 참여
              </span>
              <span className={spotsLeft > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                {spotsLeft > 0 ? `${spotsLeft}자리 남음` : '마감'}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Leader */}
          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <Avatar className="h-7 w-7 ring-2 ring-background">
              <AvatarImage src={meeting.leader?.profile_image ?? undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {meeting.leader?.nickname?.charAt(0) ?? 'L'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">
                {meeting.leader?.nickname ?? '리더'}
              </span>
            </div>
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
              className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
