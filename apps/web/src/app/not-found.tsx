import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <p className="text-7xl font-bold text-zinc-800">404</p>
      <p className="mt-2 text-lg text-zinc-500">Page not found</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
