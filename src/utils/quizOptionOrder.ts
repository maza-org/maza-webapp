// A deterministic shuffle keeps options fixed through rerenders and navigation.
export function stableQuizOrder<T>(items: readonly T[], questionKey: string): T[] {
  let state = 2166136261;
  for (let i = 0; i < questionKey.length; i++) {
    state = Math.imul(state ^ questionKey.charCodeAt(i), 16777619) >>> 0;
  }
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((state / 4294967296) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
