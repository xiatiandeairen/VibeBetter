'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'AI Success Metrics',
    description:
      'Track AI-generated PR merge rates, revision frequency, and overall AI coding effectiveness across your engineering org.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Structural Risk Index',
    description:
      'PSRI scoring combines structural complexity, change frequency, and defect density to predict high-risk code areas before they break.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Hotspot Detection',
    description:
      'Automatically identify high-complexity, frequently-changed files that pose the greatest risk to your codebase stability.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b]">
      <div className="hero-glow absolute inset-0" />
      <div className="bg-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse-subtle" />
            Engineering Intelligence Platform
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="gradient-text">VibeBetter</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            AI-Augmented Engineering Insight Platform. Measure AI coding effectiveness, 
            track structural risk, and make data-driven decisions.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-8 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 animate-slide-up">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-left backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400 transition-colors group-hover:bg-indigo-500/15 group-hover:text-indigo-300">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-100">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
