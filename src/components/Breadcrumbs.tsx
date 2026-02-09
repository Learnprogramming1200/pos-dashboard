import React from "react";
import Link from "next/link";

export default function Breadcrumbs({ items }: { items: { label: string, href?: string }[] }) {
  return (
    <nav className="text-sm text-slate-500 flex items-center space-x-2">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          {item.href ? (
            <Link href={item.href} className="text-slate-500 hover:text-slate-700 hover:underline">{item.label}</Link>
          ) : (
            <span className="text-slate-900 font-semibold">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="mx-2">&gt;</span>}
        </span>
      ))}
    </nav>
  );
}
