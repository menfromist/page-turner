-- Page Turner: 온라인 낭독 독서 모임 플랫폼
-- Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings 테이블 (낭독 모임)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- 책 정보
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  book_cover_url TEXT,
  book_description TEXT,

  -- 낭독 정보
  reading_range TEXT NOT NULL,           -- 예: "1장 ~ 3장"

  -- 모임 정보
  meeting_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 8,
  meeting_link TEXT NOT NULL,            -- Zoom/Google Meet 링크

  -- 상태
  status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'completed', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants 테이블 (모임 참가자)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(meeting_id, user_id)  -- 중복 참가 방지
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_meetings_leader ON meetings(leader_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_participants_meeting ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id);

-- Row Level Security (RLS) 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Users 정책
CREATE POLICY "Public profiles are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Meetings 정책
CREATE POLICY "Meetings are viewable by everyone" ON meetings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Leaders can delete their own meetings" ON meetings
  FOR DELETE USING (auth.uid() = leader_id);

-- Participants 정책
CREATE POLICY "Participants are viewable by meeting members" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join meetings" ON participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave meetings" ON participants
  FOR DELETE USING (auth.uid() = user_id);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 트리거: 새 사용자 생성 시 users 테이블에 자동 추가
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
