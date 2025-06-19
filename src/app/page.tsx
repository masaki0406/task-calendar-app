// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/calendar'); // ログイン済みなら calendar ページへ
      } else {
        router.push('/login');    // 未ログインならログイン画面へ
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <div className="text-center p-8">読み込み中...</div>;
}
