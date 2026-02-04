"use client";
import Loader from "@/components/ui/Loader";
export default function LoadingFallback(_: { message?: string }) {
  return (
    <div className="p-4">
      <Loader />
    </div>
  );
}
