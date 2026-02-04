"use client";
export default function Loader({ size = 24, label, className }: { size?: number; label?: string; className?: string }) {
  const style = { width: size, height: size };
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <span
        className="inline-block rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"
        style={style}
        aria-label={label || "Loading"}
        role="status"
      />
      {label ? <span className="text-sm text-gray-600">{label}</span> : null}
    </div>
  );
}
