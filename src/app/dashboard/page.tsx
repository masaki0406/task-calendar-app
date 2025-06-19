'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type TaskStatus = '未対応' | '処理中' | '処理済み' | '完了済み';

type Task = {
  title: string;
  start?: any;
  status: TaskStatus;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyCounts, setDailyCounts] = useState<{ date: string; count: number }[]>([]);
  const [statusCounts, setStatusCounts] = useState<{ status: TaskStatus; count: number }[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, 'tasks'),
        where('createdBy', '==', auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const taskList = snapshot.docs.map((doc) => doc.data() as Task);
      setTasks(taskList);
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const countsByDate: Record<string, number> = {};
    const statusCounter: Record<TaskStatus, number> = {
      未対応: 0,
      処理中: 0,
      処理済み: 0,
      完了済み: 0,
    };

    tasks.forEach((task) => {
      const dateKey = task.start?.toDate().toISOString().split('T')[0];
      if (dateKey) {
        countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
      }
      if (task.status in statusCounter) {
        statusCounter[task.status as TaskStatus]++;
      }
    });

    setDailyCounts(
      Object.entries(countsByDate).map(([date, count]) => ({ date, count }))
    );

    setStatusCounts(
      (Object.entries(statusCounter) as [TaskStatus, number][]).map(([status, count]) => ({
        status,
        count,
      }))
    );
  }, [tasks]);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push('/calendar')}
        >
          カレンダーへ戻る
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">📅 タスク件数（日別）</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyCounts}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">📈 状態別進捗率</h2>
        <div className="space-y-2">
          {statusCounts.map(({ status, count }) => (
            <div key={status}>
              <div className="flex justify-between">
                <span>{status}</span>
                <span>{count}</span>
              </div>
              <div className="bg-gray-200 h-4 rounded">
                <div
                  className="bg-blue-500 h-4 rounded"
                  style={{
                    width: `${tasks.length ? (count / tasks.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
