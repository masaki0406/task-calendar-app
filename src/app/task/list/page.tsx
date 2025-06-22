'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';

export default function TaskListPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  type Task = {
    id: string;
    taskNumber: number;
    title: string;
    tag: string;
    assignee: string;
    status: string;
    startDate?: any;
    endDate?: any;
    dueDate?: any;
  };

  // JST日数差計算
  const calculateDelay = (endDate: any, status: string) => {
    if (!endDate || status === '完了済み') return '-';

    const jstNow = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const end = endDate.toDate();

    const diff = Math.ceil(
      (jstNow.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : '-';
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, 'tasks'),
        where('createdBy', '==', auth.currentUser.uid),
        orderBy('taskNumber', 'asc')
      );

      const snapshot = await getDocs(q);
      const data: Task[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          taskNumber: d.taskNumber ?? 0,
          title: d.title ?? '',
          tag: d.tag ?? '',
          assignee: d.assignee ?? '',
          status: d.status ?? '',
          startDate: d.start,
          endDate: d.end,
          dueDate: d.dueDate,
        };
      });

      setTasks(data);
    };

    fetchTasks();
  }, []);

  const uniqueTags = Array.from(new Set(tasks.map((t) => t.tag).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(tasks.map((t) => t.status).filter(Boolean)));
  const uniqueAssignees = Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean)));

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = [task.title, task.assignee, task.tag].some((field) =>
      field?.toLowerCase().includes(searchText.toLowerCase())
    );
    const matchesTag = !tagFilter || task.tag === tagFilter;
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesAssignee = !assigneeFilter || task.assignee === assigneeFilter;
    return matchesSearch && matchesTag && matchesStatus && matchesAssignee;
  });

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push('/calendar')}
        >
          カレンダーへ戻る
        </button>
      </div>

      <input
        type="text"
        placeholder="タスク名・担当・タグを検索"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />

      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">タスク番号</th>
            <th className="border p-2">タスク名</th>

            <th className="border p-2">
              タグ
              <select
                className="ml-2 border rounded px-1"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="">すべて</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </th>

            <th className="border p-2">
              担当
              <select
                className="ml-2 border rounded px-1"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="">すべて</option>
                {uniqueAssignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </th>

            <th className="border p-2">
              状態
              <select
                className="ml-2 border rounded px-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">すべて</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </th>

            <th className="border p-2">開始日</th>
            <th className="border p-2">期限日</th>
            <th className="border p-2">遅延日数</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task.id}>
              <td className="border p-2 text-blue-700 font-semibold">
                <Link href={`/task/${task.id}`} className="underline hover:text-blue-500">
                  {task.taskNumber}
                </Link>
              </td>
              <td className="border p-2">{task.title}</td>
              <td className="border p-2">{task.tag}</td>
              <td className="border p-2">{task.assignee}</td>
              <td className="border p-2">{task.status}</td>
              <td className="border p-2">
                {task.startDate
                  ? task.startDate.toDate().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
                  : '-'}
              </td>
              <td className="border p-2">
                {task.endDate
                  ? task.endDate.toDate().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
                  : '-'}
              </td>
              <td className="border p-2 text-center">
                {calculateDelay(task.endDate, task.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
