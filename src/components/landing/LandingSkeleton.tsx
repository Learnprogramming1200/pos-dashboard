
import { WebComponents } from "@/components";

export function HeroSkeleton() {
    return (
        <section className="relative h-screen min-h-[600px] w-full bg-slate-950 pt-0">
            <div className="container mx-auto px-2 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                    <div className="space-y-6">
                        <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-6 w-48 bg-gray-700" />
                        <div className="space-y-2">
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-16 w-3/4 bg-gray-700" />
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-16 w-1/2 bg-gray-700" />
                        </div>
                        <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-4 w-full max-w-md bg-gray-700" />
                        <div className="grid grid-cols-2 gap-4">
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-6 w-full bg-gray-700" />
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-6 w-full bg-gray-700" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-12 w-40 bg-blue-600/50" />
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-12 w-40 bg-gray-700" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FeaturesSkeleton() {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center space-y-4">
                    <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-8 w-64 mx-auto" />
                    <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-4 w-96 mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm space-y-4">
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-12 w-12 rounded-lg" />
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-6 w-3/4" />
                            <WebComponents.UiWebComponents.UiWebComponents.Skeleton className="h-20 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ProductOverviewSkeleton() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <WebComponents.UiComponents.UiWebComponents.Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
        </section>
    );
}

export function PricingSkeleton() {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center space-y-4">
                    <WebComponents.UiComponents.UiWebComponents.Skeleton className="h-8 w-48 mx-auto" />
                    <WebComponents.UiComponents.UiWebComponents.Skeleton className="h-4 w-80 mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <WebComponents.UiComponents.UiWebComponents.Skeleton key={i} className="h-[500px] w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FaqSkeleton() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-12 text-center">
                    <WebComponents.UiComponents.UiWebComponents.Skeleton className="h-8 w-32 mx-auto mb-4" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <WebComponents.UiComponents.UiWebComponents.Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function LandingSkeleton() {
    return (
        <div className="w-full">
            <HeroSkeleton />
            <FeaturesSkeleton />
            <ProductOverviewSkeleton />
            <PricingSkeleton />
            <FaqSkeleton />
        </div>
    );
}
