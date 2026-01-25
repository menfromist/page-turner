# Page Turner - 온라인 낭독 독서 모임 플랫폼

함께 읽고, 함께 나누는 온라인 낭독 독서 모임 플랫폼입니다.

## 프로젝트 소개

Page Turner는 기존에 Zoom으로 알음알음 진행되던 낭독 모임을 더 체계적으로 관리하고 연결해주는 서비스입니다.

### 핵심 가치
- 낭독을 통한 경청과 집중력 향상
- 다각적 독서 경험 제공
- 모임 개설 및 매칭을 위한 디렉토리 서비스

### 운영 방식
- 리더가 모임(책, 시간, Zoom 링크 등)을 개설
- 참여자가 모임을 찾아 신청
- 신청 완료 시 화상 회의 링크 노출

## 기술 스택

- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Database & Auth**: Supabase (PostgreSQL, 소셜 로그인)
- **Deployment**: Vercel (예정)

## 시작하기

### 필수 조건

- Node.js 18.17 이상
- npm 또는 yarn
- Supabase 계정

### 설치

1. 저장소 클론
```bash
git clone https://github.com/your-username/page-turner.git
cd page-turner
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 Supabase 프로젝트 정보를 입력합니다.

4. 개발 서버 실행
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행
3. Authentication > Providers에서 Google, Kakao 로그인 설정 (선택)

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # 인증 관련 페이지
│   ├── meetings/             # 모임 관련 페이지
│   │   ├── [id]/             # 모임 상세
│   │   └── new/              # 모임 개설
│   ├── layout.tsx
│   └── page.tsx              # 랜딩 페이지
├── components/
│   ├── ui/                   # Shadcn/UI 컴포넌트
│   ├── meetings/             # 모임 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트
│   └── auth/                 # 인증 컴포넌트
├── lib/
│   ├── supabase/             # Supabase 클라이언트
│   └── utils.ts
├── types/                    # TypeScript 타입 정의
└── hooks/                    # 커스텀 훅
```

## 주요 기능 (MVP)

1. **랜딩 페이지**: 모집 중인 낭독 모임 리스트 (카드 뷰)
2. **모임 상세 페이지**: 책 소개, 낭독 범위, 참가 신청
3. **모임 개설하기**: 책 정보, 시간, 화상 회의 링크 입력
4. **로그인/회원가입**: 소셜 로그인 지원

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # 린트 검사
```

## 데이터베이스 스키마

### Users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Supabase Auth 연동 |
| email | TEXT | 이메일 |
| nickname | TEXT | 닉네임 |
| profile_image | TEXT | 프로필 이미지 URL |
| bio | TEXT | 자기소개 |

### Meetings
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 모임 ID |
| leader_id | UUID | 리더 ID |
| book_title | TEXT | 책 제목 |
| book_author | TEXT | 저자 |
| reading_range | TEXT | 낭독 범위 |
| meeting_date | TIMESTAMPTZ | 모임 일시 |
| max_participants | INTEGER | 최대 인원 |
| meeting_link | TEXT | 화상 회의 링크 |
| status | TEXT | 상태 (recruiting/closed/completed/cancelled) |

### Participants
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 참가 ID |
| meeting_id | UUID | 모임 ID |
| user_id | UUID | 사용자 ID |
| status | TEXT | 상태 (confirmed/cancelled) |

## 라이선스

MIT License
