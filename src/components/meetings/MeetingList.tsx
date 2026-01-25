import { MeetingCard } from './MeetingCard';
import type { Meeting } from '@/types/database';

interface MeetingListProps {
  meetings: Meeting[];
}

export function MeetingList({ meetings }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">아직 등록된 모임이 없습니다.</p>
        <p className="text-gray-400 mt-2">첫 번째 낭독 모임을 개설해보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
