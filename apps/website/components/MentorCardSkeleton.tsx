import { Skeleton } from '@sos-academy/ui';

export function MentorCardSkeleton() {
  return (
    <div className="border border-white/5 h-40 bg-black/50 flex overflow-hidden">
      <Skeleton className="w-[38%] flex-shrink-0" />
      <div className="flex-1 p-3 flex flex-col gap-2.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-3/4" />
        <div className="mt-auto flex gap-2 pt-1.5 border-t border-white/5">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="w-3 h-3" />
          <Skeleton className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
