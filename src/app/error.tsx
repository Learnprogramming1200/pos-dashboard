"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-600 mb-4">Please try again.</p>
      <button
        className="px-3 py-2 rounded bg-blue-600 text-white"
        onClick={reset}
      >
        Reload
      </button>
    </div>
  );
}
