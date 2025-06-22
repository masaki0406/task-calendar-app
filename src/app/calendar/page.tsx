'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  Calendar,
  momentLocalizer,
  Views,
  View,
} from 'react-big-calendar';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import CustomToolbar from '../../components/CustomToolbar';

moment.tz.setDefault('Asia/Tokyo');
const localizer = momentLocalizer(moment);

type Task = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  createdBy: string;
  isPublic?: boolean;
};

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Task[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) router.push('/login');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const myTasksQuery = query(
      collection(db, 'tasks'),
      where('createdBy', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(myTasksQuery, (snapshot) => {
      const myTasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          start: moment(data.start.toDate()).toDate(),
          end: moment(data.end.toDate()).toDate(),
          createdBy: data.createdBy,
          isPublic: data.isPublic,
        } as Task;
      });

      setEvents((prev) => {
        const others = prev.filter(
          (task) => task.createdBy !== auth.currentUser?.uid
        );
        return [...others, ...myTasks];
      });
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const publicTasksQuery = query(
      collection(db, 'tasks'),
      where('isPublic', '==', true),
      where('createdBy', '!=', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(publicTasksQuery, (snapshot) => {
      const publicTasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          start: moment(data.start.toDate()).toDate(),
          end: moment(data.end.toDate()).toDate(),
          createdBy: data.createdBy,
          isPublic: data.isPublic,
        } as Task;
      });

      setEvents((prev) => {
        const mine = prev.filter(
          (task) => task.createdBy === auth.currentUser?.uid
        );
        return [...mine, ...publicTasks];
      });
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const navigateDate = (action: 'today' | 'prev' | 'next') => {
    const current = moment(currentDate);

    let updated;
    if (action === 'today') {
      updated = moment();
    } else if (action === 'prev') {
      updated =
        view === 'month'
          ? current.subtract(1, 'month')
          : view === 'week'
          ? current.subtract(1, 'week')
          : current.subtract(1, 'day');
    } else {
      updated =
        view === 'month'
          ? current.add(1, 'month')
          : view === 'week'
          ? current.add(1, 'week')
          : current.add(1, 'day');
    }

    setCurrentDate(updated.toDate());
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">タスクカレンダーアプリ</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/task/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            タスク追加
          </button>
          <button
            onClick={() => router.push('/task/list')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            タスク一覧
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ダッシュボード
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => navigateDate('prev')} className="px-3 py-1 bg-gray-200 rounded">
          前へ
        </button>
        <button onClick={() => navigateDate('today')} className="px-3 py-1 bg-blue-200 rounded">
          本日
        </button>
        <button onClick={() => navigateDate('next')} className="px-3 py-1 bg-gray-200 rounded">
          次へ
        </button>

        {(['month', 'week', 'day'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 rounded ${
              view === v ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {v === 'month' ? '月' : v === 'week' ? '週' : '日'}
          </button>
        ))}
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        view={view}
        date={currentDate}
        onView={setView}
        onNavigate={setCurrentDate}
        style={{ height: 600 }}
        components={{ toolbar: CustomToolbar }}
        selectable
        onSelectEvent={(event) => router.push(`/task/${event.id}`)}
      />
    </main>
  );
}
