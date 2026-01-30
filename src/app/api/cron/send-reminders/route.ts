import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron Job에서 호출되는 API
// 매일 오전 9시에 실행되어 내일 모임이 있는 참가자들에게 이메일 발송

export async function GET(request: Request) {
  // Cron Job 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing service role key' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 내일 날짜 계산 (한국 시간 기준)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // 내일 예정된 모임 조회
  const { data: meetings, error: meetingsError } = await supabase
    .from('meetings')
    .select(`
      id,
      book_title,
      book_author,
      meeting_date,
      meeting_link,
      meeting_password,
      reading_range,
      duration_minutes,
      leader_id,
      leader:users!meetings_leader_id_fkey(id, email, nickname)
    `)
    .eq('status', 'recruiting')
    .gte('meeting_date', tomorrowStart.toISOString())
    .lte('meeting_date', tomorrowEnd.toISOString());

  if (meetingsError) {
    console.error('Error fetching meetings:', meetingsError);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }

  if (!meetings || meetings.length === 0) {
    return NextResponse.json({ message: 'No meetings tomorrow', sent: 0 });
  }

  const emailsSent: string[] = [];

  for (const meeting of meetings) {
    // 참가자 조회
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select(`
        user_id,
        user:users(id, email, nickname)
      `)
      .eq('meeting_id', meeting.id)
      .eq('status', 'confirmed');

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      continue;
    }

    const meetingDate = new Date(meeting.meeting_date);
    const formattedDate = meetingDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    const formattedTime = meetingDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // 이메일 발송 대상 목록 (리더 + 참가자)
    const recipients: { email: string; nickname: string }[] = [];

    // 리더 추가
    const leader = meeting.leader as { id: string; email: string; nickname: string } | null;
    if (leader?.email) {
      recipients.push({ email: leader.email, nickname: leader.nickname });
    }

    // 참가자 추가
    if (participants) {
      for (const p of participants) {
        const user = p.user as { id: string; email: string; nickname: string } | null;
        if (user?.email) {
          recipients.push({ email: user.email, nickname: user.nickname });
        }
      }
    }

    // 이메일 발송 (Resend API 사용)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email');
      continue;
    }

    for (const recipient of recipients) {
      const emailBody = `
안녕하세요, ${recipient.nickname}님!

내일 예정된 낭독 모임을 안내드립니다.

📚 책 제목: ${meeting.book_title}
✍️ 저자: ${meeting.book_author}
📖 낭독 범위: ${meeting.reading_range}

📅 일시: ${formattedDate} ${formattedTime}
⏱️ 소요 시간: ${meeting.duration_minutes}분

🔗 회의 링크: ${meeting.meeting_link}
${meeting.meeting_password ? `🔑 비밀번호: ${meeting.meeting_password}` : ''}

모임에서 뵙겠습니다!

- 쪽GO🍫 팀 드림
      `.trim();

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: '쪽GO🍫 <noreply@pagego.kr>',
            to: recipient.email,
            subject: `[쪽GO🍫] 내일 "${meeting.book_title}" 낭독 모임이 있습니다`,
            text: emailBody,
          }),
        });

        if (response.ok) {
          emailsSent.push(recipient.email);
        } else {
          const errorData = await response.json();
          console.error('Resend API error:', errorData);
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }

  return NextResponse.json({
    message: 'Reminders sent',
    meetingsProcessed: meetings.length,
    emailsSent: emailsSent.length,
  });
}
