'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <p className="text-5xl font-bold text-red-500/30">Error</p>
      <p className="mt-3 text-sm text-zinc-500">{error.message || 'Something went wrong'}</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500">Try Again</button>
    </div>
  );
}
