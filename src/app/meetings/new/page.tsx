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
import type { CreateMeetingInput } from '@/types/database';
import type { User } from '@supabase/supabase-js';

export default function NewMeetingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMeetingInput>({
    book_title: '',
    book_author: '',
    book_cover_url: '',
    book_description: '',
    reading_range: '',
    meeting_date: '',
    duration_minutes: 60,
    max_participants: 6,
    meeting_link: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/meetings/new');
        return;
      }

      setUser(user);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  // Jitsi Meet 링크 자동 생성 함수
  const generateJitsiLink = () => {
    const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const jitsiLink = `https://meet.jit.si/PageTurner-${randomId}`;
    setFormData((prev) => ({
      ...prev,
      meeting_link: jitsiLink,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 파일은 5MB 이하만 업로드 가능합니다.');
        return;
      }
      // 이미지 파일만 허용
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    let coverUrl: string | null = null;

    // 이미지 파일이 있으면 Supabase Storage에 업로드
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

      // 업로드된 이미지의 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      coverUrl = urlData.publicUrl;
    }

    // datetime-local 값을 ISO 문자열로 변환
    const meetingDate = new Date(formData.meeting_date).toISOString();

    const insertData = {
      leader_id: user.id,
      book_title: formData.book_title,
      book_author: formData.book_author,
      book_cover_url: coverUrl,
      book_description: formData.book_description || null,
      reading_range: formData.reading_range,
      meeting_date: meetingDate,
      duration_minutes: formData.duration_minutes,
      max_participants: formData.max_participants,
      meeting_link: formData.meeting_link,
      status: 'recruiting',
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert(insertData as never)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      setError('모임 개설에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
      return;
    }

    // 성공 시 생성된 모임 상세 페이지로 이동
    const newMeeting = data as { id: string };
    router.push(`/meetings/${newMeeting.id}`);
  };

  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">로그인 확인 중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">낭독 모임 개설하기</CardTitle>
          <CardDescription>
            함께 읽고 싶은 책과 모임 정보를 입력해주세요.
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
                        ✕
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
                  min={new Date().toISOString().slice(0, 16)}
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
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? '개설 중...' : '모임 개설하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
