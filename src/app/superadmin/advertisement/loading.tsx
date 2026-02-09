export default function Loading() {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header skeleton */}
      <div className="mb-4">
        <div className="h-6 sm:h-7 w-48 sm:w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
        <div className="h-4 w-80 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] border border-gray-200 dark:border-slate-700 mb-4 p-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="h-11 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-11 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-11 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-11 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-11 w-11 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-11 w-11 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header cells */}
        <div className="grid grid-cols-12 gap-2 px-3 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-1 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-1 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-1 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-1 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 px-3 py-3 border-b border-gray-100 dark:border-slate-800"
          >
            <div className="col-span-2 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-1 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-1 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-2 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-1 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-2 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-1 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="col-span-2 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
