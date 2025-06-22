'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// JST変換関数
const toJSTDate = (input: string) => {
  const utcDate = new Date(input);
  const jstOffset = 9 * 60 * 60 * 1000;
  return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000 + jstOffset);
};

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('タスク');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('未対応');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [taskNumber, setTaskNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNextTaskNumber = async () => {
      const q = query(collection(db, 'tasks'), orderBy('taskNumber', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const maxNumber = snapshot.docs[0].data().taskNumber || 1000;
        setTaskNumber(maxNumber + 1);
      } else {
        setTaskNumber(1001);
      }
    };

    fetchNextTaskNumber();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert('ログインしてください');
      return;
    }

    const startDate = toJSTDate(start);
    const endDate = toJSTDate(end);

    if (startDate > endDate) {
      alert('開始日は終了日より前にしてください');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        tag,
        assignee,
        status,
        start: startDate,
        end: endDate,
        createdBy: auth.currentUser.uid,
        taskNumber,
      });

      router.push('/calendar');
    } catch (error) {
      alert('タスクの登録に失敗しました');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">新規タスク登録</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">タスク名</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium">タスク内容</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium">タスクタグ</label>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full border p-2 rounded">
            <option value="タスク">タスク</option>
            <option value="バグ">バグ</option>
            <option value="要望">要望</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">担当者名</label>
          <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium">状態</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded">
            <option value="未対応">未対応</option>
            <option value="処理中">処理中</option>
            <option value="処理済み">処理済み</option>
            <option value="完了済み">完了済み</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">開始日</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium">期限日</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required className="w-full border p-2 rounded" />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/calendar')}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            戻る
          </button>

          <button
            type="submit"
            disabled={loading || taskNumber === null}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '登録中...' : `登録（No.${taskNumber ?? '...'}）`}
          </button>
        </div>
      </form>
    </main>
  );
}
