// src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ 追加
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SignUpPage() {
  const router = useRouter(); // ✅ 追加

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/login'); // ✅ ユーザー登録完了後にログイン画面へ遷移
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">新規登録</h1>
        {error && <p className="text-red-500 text-sm mb-2">Firebase: {error}</p>}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 mb-2 rounded"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
        />
        <button
          onClick={handleSignUp}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          登録する
        </button>
      </div>
    </div>
  );
}
