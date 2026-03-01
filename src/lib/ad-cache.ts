/**
 * Utility for caching Ad Banners in IndexedDB to reduce Supabase API calls.
 * Expiration: 10 minutes
 */

const DB_NAME = "kindee_ads_cache"
const STORE_NAME = "banners"
const DB_VERSION = 1
const CACHE_EXPIRATION_MS = 10 * 60 * 1000 // 10 minutes

export type CachedBanner = {
  id: string
  title: string
  image_url: string
  link_url: string
  position: string
  is_active: boolean
}

type CacheEntry = {
  position: string
  data: CachedBanner[]
  timestamp: number
}

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "position" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })
}

export async function getCachedBanners(position: string): Promise<CachedBanner[] | null> {
  try {
    const db = await openDB()
    if (!db) return null

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(position)

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined
        if (!entry) {
          resolve(null)
          return
        }

        const now = Date.now()
        if (now - entry.timestamp > CACHE_EXPIRATION_MS) {
          resolve(null) // Expired
        } else {
          resolve(entry.data)
        }
      }
      request.onerror = () => resolve(null)
    })
  } catch (e) {
    console.error("Ad Cache retrieval error:", e)
    return null
  }
}

export async function setCachedBanners(position: string, data: CachedBanner[]): Promise<void> {
  try {
    const db = await openDB()
    if (!db) return

    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    store.put({
      position,
      data,
      timestamp: Date.now(),
    })
  } catch (e) {
    console.error("Ad Cache save error:", e)
  }
}
