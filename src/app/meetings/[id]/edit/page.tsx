'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { Meeting, UpdateMeetingInput } from '@/types/database';
import type { User } from '@supabase/supabase-js';

export default function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateMeetingInput>({
    book_title: '',
    book_author: '',
    book_cover_url: '',
    book_description: '',
    reading_range: '',
    meeting_date: '',
    duration_minutes: 60,
    max_participants: 6,
    meeting_link: '',
    meeting_password: '',
  });

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setMeetingId(id);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/meetings/${id}/edit`);
        return;
      }

      setUser(user);

      // 모임 정보 조회
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (meetingError || !meetingData) {
        setError('모임을 찾을 수 없습니다.');
        setIsCheckingAuth(false);
        return;
      }

      const meetingResult = meetingData as Meeting;

      // 권한 체크: 리더만 수정 가능
      if (meetingResult.leader_id !== user.id) {
        router.push(`/meetings/${id}`);
        return;
      }

      // 취소되거나 완료된 모임은 수정 불가
      if (meetingResult.status === 'cancelled' || meetingResult.status === 'completed') {
        router.push(`/meetings/${id}`);
        return;
      }

      setMeeting(meetingResult);

      // datetime-local 형식으로 변환
      const meetingDate = new Date(meetingResult.meeting_date);
      const localDateTime = new Date(meetingDate.getTime() - meetingDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        book_title: meetingResult.book_title,
        book_author: meetingResult.book_author,
        book_cover_url: meetingResult.book_cover_url || '',
        book_description: meetingResult.book_description || '',
        reading_range: meetingResult.reading_range,
        meeting_date: localDateTime,
        duration_minutes: meetingResult.duration_minutes,
        max_participants: meetingResult.max_participants,
        meeting_link: meetingResult.meeting_link,
        meeting_password: meetingResult.meeting_password || '',
      });

      if (meetingResult.book_cover_url) {
        setCoverPreview(meetingResult.book_cover_url);
      }

      setIsCheckingAuth(false);
    };

    init();
  }, [params, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateJitsiLink = () => {
    const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const jitsiLink = `https://meet.jit.si/PageTurner-${randomId}`;
    const password = generatePassword();
    setFormData((prev) => ({
      ...prev,
      meeting_link: jitsiLink,
      meeting_password: password,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 파일은 5MB 이하만 업로드 가능합니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeCoverImage = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setFormData((prev) => ({ ...prev, book_cover_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !meetingId) return;

    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    let coverUrl: string | null = formData.book_cover_url || null;

    // 새 이미지 파일이 있으면 업로드
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, coverFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      coverUrl = urlData.publicUrl;
    }

    const meetingDate = new Date(formData.meeting_date!).toISOString();

    const updateData = {
      book_title: formData.book_title,
      book_author: formData.book_author,
      book_cover_url: coverUrl,
      book_description: formData.book_description || null,
      reading_range: formData.reading_range,
      meeting_date: meetingDate,
      duration_minutes: formData.duration_minutes,
      max_participants: formData.max_participants,
      meeting_link: formData.meeting_link,
      meeting_password: formData.meeting_password || null,
    };

    const { error } = await supabase
      .from('meetings')
      .update(updateData as never)
      .eq('id', meetingId)
      .eq('leader_id', user.id);

    if (error) {
      console.error('Error updating meeting:', error);
      setError('모임 수정에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    router.push(`/meetings/${meetingId}`);
  };

  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">모임 정보 수정</CardTitle>
          <CardDescription>
            모임 정보를 수정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 책 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">책 정보</h3>

              <div className="space-y-2">
                <Label htmlFor="book_title">책 제목 *</Label>
                <Input
                  id="book_title"
                  name="book_title"
                  value={formData.book_title}
                  onChange={handleChange}
                  placeholder="예: 데미안"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book_author">저자 *</Label>
                <Input
                  id="book_author"
                  name="book_author"
                  value={formData.book_author}
                  onChange={handleChange}
                  placeholder="예: 헤르만 헤세"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="book_cover">책 표지 이미지 (선택)</Label>
                <div className="flex flex-col gap-3">
                  {coverPreview ? (
                    <div className="relative w-32 h-44 rounded-lg overflow-hidden border">
                      <Image
                        src={coverPreview}
                        alt="책 표지 미리보기"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-sm"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm text-gray-500">이미지 추가</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="book_cover"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500">
                    5MB 이하의 이미지 파일을 업로드해주세요.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="book_description">책 소개 (선택)</Label>
                <Textarea
                  id="book_description"
                  name="book_description"
                  value={formData.book_description}
                  onChange={handleChange}
                  placeholder="이 책에 대한 간단한 소개를 적어주세요."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reading_range">낭독 범위 *</Label>
                <Input
                  id="reading_range"
                  name="reading_range"
                  value={formData.reading_range}
                  onChange={handleChange}
                  placeholder="예: 1장 ~ 3장"
                  required
                />
              </div>
            </div>

            {/* 모임 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">모임 정보</h3>

              <div className="space-y-2">
                <Label htmlFor="meeting_date">모임 일시 *</Label>
                <Input
                  id="meeting_date"
                  name="meeting_date"
                  type="datetime-local"
                  value={formData.meeting_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">소요 시간 (분)</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min={30}
                    max={180}
                    value={formData.duration_minutes}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants">최대 인원</Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min={2}
                    max={20}
                    value={formData.max_participants}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link">화상 회의 링크 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="meeting_link"
                    name="meeting_link"
                    type="url"
                    value={formData.meeting_link}
                    onChange={handleChange}
                    placeholder="Zoom, Google Meet 또는 Jitsi 링크"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateJitsiLink}
                    className="whitespace-nowrap"
                  >
                    Jitsi 링크 자동 생성
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  직접 입력하거나, Jitsi 링크 자동 생성 버튼을 클릭하세요.
                </p>
              </div>

              {formData.meeting_password && (
                <div className="space-y-2">
                  <Label htmlFor="meeting_password">회의 비밀번호</Label>
                  <div className="flex gap-2">
                    <Input
                      id="meeting_password"
                      name="meeting_password"
                      value={formData.meeting_password}
                      onChange={handleChange}
                      className="flex-1 font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData((prev) => ({ ...prev, meeting_password: generatePassword() }))}
                      className="whitespace-nowrap"
                    >
                      재생성
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    참가자에게 이 비밀번호가 함께 안내됩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? '수정 중...' : '수정 완료'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
