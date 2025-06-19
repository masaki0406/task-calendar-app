'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [tag, setTag] = useState('');
  const [assignee, setAssignee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      const docRef = doc(db, 'tasks', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTask(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setStatus(data.status || '');
        setTag(data.tag || '');
        setAssignee(data.assignee || '');
        setStartDate(data.start?.toDate().toISOString().slice(0, 16) || '');
        setDueDate(data.end?.toDate().toISOString().slice(0, 16) || '');
      }
    };

    fetchTask();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    const start = new Date(startDate);
    const end = new Date(dueDate);
    if (start > end) {
      setError('開始日時は終了日時より前にしてください。');
      return;
    }

    const docRef = doc(db, 'tasks', id as string);
    await updateDoc(docRef, {
      title,
      description,
      status,
      tag,
      assignee,
      start,
      end,
    });
    setIsEditing(false);
    setError('');
  };

  if (!task) {
    return <div className="p-6">読み込み中...</div>;
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">タスク詳細</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold">タスク名</label>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{title}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">タスク内容</label>
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded w-full"
              rows={4}
            />
          ) : (
            <p className="whitespace-pre-line">{description || '-'}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">状態</label>
          {isEditing ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="未対応">未対応</option>
              <option value="処理中">処理中</option>
              <option value="処理済み">処理済み</option>
              <option value="完了済み">完了済み</option>
            </select>
          ) : (
            <p>{status}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">タグ</label>
          {isEditing ? (
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="タスク">タスク</option>
              <option value="バグ">バグ</option>
              <option value="要望">要望</option>
            </select>
          ) : (
            <p>{tag}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">担当者</label>
          {isEditing ? (
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{assignee}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">開始日時</label>
          {isEditing ? (
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{startDate ? new Date(startDate).toLocaleString() : '-'}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold">終了日時</label>
          {isEditing ? (
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          ) : (
            <p>{dueDate ? new Date(dueDate).toLocaleString() : '-'}</p>
          )}
        </div>

        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </div>

      <div className="flex gap-4 mt-6">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={handleSave}
            >
              保存
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={() => setIsEditing(false)}
            >
              編集キャンセル
            </button>
          </>
        ) : (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setIsEditing(true)}
          >
            編集モードに切り替え
          </button>
        )}
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded"
          onClick={() => router.push('/task/list')}
        >
          戻る
        </button>
      </div>
    </main>
  );
}
