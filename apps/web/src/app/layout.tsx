import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/providers';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VibeBetter - AI-Augmented Engineering Insight Platform',
  description:
    'Measure AI coding effectiveness, track structural risk, and make data-driven engineering decisions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#09090b] text-zinc-100`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
