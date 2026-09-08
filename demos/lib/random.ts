/**
 * Deterministic pseudo-randomness.
 *
 * Every "random looking" value in the demos (busy slots, mock revenue, patient
 * names) is derived from a stable seed string, so the same page always renders
 * the same data — on the server, on the client, and after a refresh.
 */

/** FNV-1a, returns a 32-bit unsigned integer. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Stable float in [0, 1) for a given seed. */
export function seededUnit(seed: string): number {
  return hashString(seed) / 0xffffffff;
}

/** Stable integer in [min, max]. */
export function seededInt(seed: string, min: number, max: number): number {
  return min + Math.floor(seededUnit(seed) * (max - min + 1));
}

export function seededPick<T>(seed: string, items: readonly T[]): T {
  return items[hashString(seed) % items.length] as T;
}

export function seededBool(seed: string, probability: number): boolean {
  return seededUnit(seed) < probability;
}

/** Deterministic shuffle (Fisher–Yates driven by the seed). */
export function seededShuffle<T>(seed: string, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = hashString(`${seed}:${i}`) % (i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** Creates a mulberry32 generator — used where a stream of values is needed. */
export function createRng(seed: string): () => number {
  let state = hashString(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
