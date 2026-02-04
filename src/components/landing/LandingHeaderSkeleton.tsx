
import { Skeleton } from "@/components/ui/skeleton";

export default function LandingHeaderSkeleton() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-[72px]">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo Skeleton */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>

                    {/* Desktop Navigation Skeleton */}
                    {/* <nav className="hidden lg:flex items-center gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-5 w-20" />
                        ))}
                    </nav> */}

                    {/* Right Section Skeleton */}
                    {/* <div className="flex items-center gap-5"> */}
                        {/* <Skeleton className="h-8 w-8 rounded-full" /> Theme Toggle */}
                        {/* <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-5"> */}
                            {/* <Skeleton className="h-10 w-24 rounded-lg" /> Login Script */}
                            {/* <Skeleton className="h-10 w-28 rounded-lg" /> Register/User */}
                        </div>
                    </div>
                {/* </div>
            </div> */}
        </header>
    );
}
