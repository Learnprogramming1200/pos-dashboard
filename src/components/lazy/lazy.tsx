"use client";
import dynamic from "next/dynamic";
import LoadingFallback from "./LoadingFallback";
import ErrorBoundary from "./ErrorBoundary";
export function makeLazy<TProps = any>(
  importer: () => Promise<any>,
  message?: string
) {
  const Comp = dynamic(importer, {
    loading: () => <LoadingFallback message={message} />,
  });
  return function Lazy(props: TProps) {
    return (
      <ErrorBoundary>
        <Comp {...(props as any)} />
      </ErrorBoundary>
    );
  };
}
