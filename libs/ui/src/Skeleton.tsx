import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = '', ...rest }: Props) {
  return <div className={`bg-white/[0.06] animate-pulse ${className}`} {...rest} />;
}
