// components/CalendarView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { startOfWeek } from 'date-fns';
import getDay from 'date-fns/getDay';
import ja from 'date-fns/locale/ja';


import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  ja: ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const mockEvents = [
  {
    title: 'テストタスク',
    start: new Date(),
    end: new Date(),
  },
];

export const CalendarView = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">タスクカレンダー</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        style={{ height: 600 }}
        messages={{
          month: '月',
          week: '週',
          day: '日',
          today: '今日',
          previous: '前',
          next: '次',
        }}
      />
    </div>
  );
};
