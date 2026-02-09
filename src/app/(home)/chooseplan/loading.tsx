export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 pt-20">
      <div className="w-full max-w-3xl px-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-10/12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-9/12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded mt-4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
