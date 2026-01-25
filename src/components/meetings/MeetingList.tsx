import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MeetingCard } from './MeetingCard';
import type { Meeting } from '@/types/database';

interface MeetingListProps {
  meetings: Meeting[];
}

export function MeetingList({ meetings }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          아직 등록된 모임이 없습니다
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          첫 번째 낭독 모임을 개설하고 함께 책을 읽을 사람들을 모아보세요!
        </p>
        <Link href="/meetings/new">
          <Button className="rounded-full gap-2">
            모임 개설하기
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
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
