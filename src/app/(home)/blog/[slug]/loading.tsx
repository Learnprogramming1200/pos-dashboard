export default function Loading() {
  return (
    <div className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl mb-8 animate-pulse" />
        <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-10/12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-9/12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
