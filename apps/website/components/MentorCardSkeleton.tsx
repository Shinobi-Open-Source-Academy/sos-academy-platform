import { Skeleton } from '@sos-academy/ui';

export function MentorCardSkeleton() {
  return (
    <div className="border border-white/5 h-40 bg-black/50 relative overflow-hidden">
      <Skeleton className="absolute inset-y-0 left-0 w-[38%]" />
      <div className="relative z-20 h-full p-3 pl-[36%] flex flex-col gap-2">
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
