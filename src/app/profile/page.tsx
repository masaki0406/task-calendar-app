// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || '');
        }
      } else {
        router.push('/login'); // 未ログイン時はログインへ
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    await setDoc(doc(db, 'users', uid), {
      email: auth.currentUser?.email || '',
      displayName: displayName,
    });
    alert('保存しました');
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSave} className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">プロフィール編集</h2>
        <label className="block">
          表示名：
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          保存する
        </button>
      </form>
    </div>
  );
}
