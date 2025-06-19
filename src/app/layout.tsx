import '@/styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'タスクカレンダーアプリ',
  description: 'Firebase認証付きのアプリ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
