// Database Types for Supabase

export interface User {
  id: string;
  email: string;
  nickname: string;
  profile_image: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  leader_id: string;

  // 책 정보
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  book_description: string | null;

  // 낭독 정보
  reading_range: string;

  // 모임 정보
  meeting_date: string;
  duration_minutes: number;
  max_participants: number;
  meeting_link: string;
  meeting_password: string | null;

  // 상태
  status: 'recruiting' | 'closed' | 'completed' | 'cancelled';

  created_at: string;
  updated_at: string;

  // Relations (조인 시)
  leader?: User;
  participants?: Participant[];
  participant_count?: number;
}

export interface Participant {
  id: string;
  meeting_id: string;
  user_id: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;

  // Relations (조인 시)
  user?: User;
  meeting?: Meeting;
}

// Form Types
export interface CreateMeetingInput {
  book_title: string;
  book_author: string;
  book_cover_url?: string;
  book_description?: string;
  reading_range: string;
  meeting_date: string;
  duration_minutes: number;
  max_participants: number;
  meeting_link: string;
  meeting_password?: string;
}

export interface UpdateMeetingInput extends Partial<CreateMeetingInput> {
  status?: Meeting['status'];
}

// Database Response Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      meetings: {
        Row: Meeting;
        Insert: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'leader' | 'participants' | 'participant_count'>;
        Update: Partial<Omit<Meeting, 'id' | 'created_at' | 'leader' | 'participants' | 'participant_count'>>;
      };
      participants: {
        Row: Participant;
        Insert: Omit<Participant, 'id' | 'created_at' | 'user' | 'meeting'>;
        Update: Partial<Omit<Participant, 'id' | 'created_at' | 'user' | 'meeting'>>;
      };
    };
  };
};
