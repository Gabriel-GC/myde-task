"use client";

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-transparent select-none"
        >
          <div className="w-11 h-11 rounded-full bg-neutral-200 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 py-1">
            <div className="flex justify-between items-baseline mb-2">
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-24" />
              <div className="h-3 bg-neutral-200 rounded animate-pulse w-8" />
            </div>
            <div className="h-3 bg-neutral-200 rounded animate-pulse w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
