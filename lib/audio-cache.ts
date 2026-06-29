const cache = new Map<string, ArrayBuffer>()

export function storeAudio(id: string, buffer: ArrayBuffer): void {
  cache.set(id, buffer)
  setTimeout(() => cache.delete(id), 300_000) // 5 min TTL
}

export function getAudio(id: string): ArrayBuffer | undefined {
  return cache.get(id)
}
