export function pickRandom<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** Picks up to `count` distinct items in random order (fewer if the pool is smaller). */
export function pickManyDistinct<T>(items: readonly T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Picks two distinct items when possible; falls back to repeating the one item available. */
export function pickTwoDistinct<T>(items: readonly T[]): [T | undefined, T | undefined] {
  const first = pickRandom(items);
  if (first === undefined) return [undefined, undefined];

  const remaining = items.filter((item) => item !== first);
  const second = remaining.length > 0 ? pickRandom(remaining) : first;
  return [first, second];
}
