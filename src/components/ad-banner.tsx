import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getCachedBanners, setCachedBanners, CachedBanner } from "@/lib/ad-cache"

interface AdBannerProps {
  position: "dashboard_middle" | "games_bottom" | "game_result"
  className?: string
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  const [banners, setBanners] = useState<CachedBanner[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBanners() {
      try {
        // 1. Try to get from IndexedDB Cache first
        const cached = await getCachedBanners(position)
        if (cached && cached.length > 0) {
          setBanners(cached)
          setLoading(false)
          return
        }
      } catch (cacheError) {
        console.error("Cache read failed, falling back to Supabase:", cacheError)
      }

      // 2. If not in cache, expired, or error, fetch from Supabase
      try {
        const { data, error } = await supabase
          .from("banners")
          .select("id, title, image_url, link_url, position, is_active")
          .eq("position", position)
          .eq("is_active", true)
        
        if (!error && data) {
          setBanners(data)
          // 3. Save to Cache for next time (ignore errors here)
          setCachedBanners(position, data).catch(() => {})
        }
      } catch (supabaseError) {
        console.error("Supabase fetch failed:", supabaseError)
      }
      setLoading(false)
    }

    fetchBanners()
  }, [position, supabase])

  if (loading || banners.length === 0) return null

  return (
    <div className={`w-full flex flex-col items-center my-6 gap-6 ${className}`}>
      <span className="text-[10px] text-zinc-500 mb-[-1.25rem] uppercase tracking-widest opacity-50 font-medium font-sans">Advertisement</span>
      {banners.map((banner) => {
        const bannerContent = (
          <img 
            src={banner.image_url} 
            alt={banner.title} 
            className="w-full h-auto object-cover aspect-[728/90]"
          />
        )

        return (
          <div key={banner.id} className="w-full flex flex-col items-center">
            {banner.link_url ? (
              <a 
                href={banner.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full max-w-[728px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {bannerContent}
              </a>
            ) : (
              <div className="block w-full max-w-[728px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm">
                {bannerContent}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
