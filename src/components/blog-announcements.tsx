"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Megaphone, Pin, ChevronRight, Calendar, Sparkles, AlertCircle, Rocket, Tag } from "lucide-react"

export type BlogItem = {
  id: string
  title: string
  slug?: string
  summary: string
  content: string
  category: string
  badge_color: string
  cover_image_url?: string
  is_published: boolean
  is_pinned: boolean
  published_at: string
  created_at: string
}

const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
  announcement: { label: "ประกาศสำคัญ", icon: Megaphone },
  update: { label: "อัปเดตใหม่", icon: Sparkles },
  feature: { label: "ฟีเจอร์ใหม่", icon: Rocket },
  promotion: { label: "โปรโมชั่น", icon: Tag },
  maintenance: { label: "แจ้งปรับปรุง", icon: AlertCircle },
}

const COLOR_MAP: Record<string, { badge: string; border: string; bg: string }> = {
  amber: {
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    border: "border-amber-500/30 hover:border-amber-500/60",
    bg: "from-amber-500/5 via-amber-500/10 to-transparent",
  },
  blue: {
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    border: "border-blue-500/30 hover:border-blue-500/60",
    bg: "from-blue-500/5 via-blue-500/10 to-transparent",
  },
  emerald: {
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "from-emerald-500/5 via-emerald-500/10 to-transparent",
  },
  rose: {
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    border: "border-rose-500/30 hover:border-rose-500/60",
    bg: "from-rose-500/5 via-rose-500/10 to-transparent",
  },
  purple: {
    badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    border: "border-purple-500/30 hover:border-purple-500/60",
    bg: "from-purple-500/5 via-purple-500/10 to-transparent",
  },
}

export function BlogAnnouncements({ className = "" }: { className?: string }) {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("is_published", true)
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false })

        if (!error && data) {
          setBlogs(data)
        }
      } catch (err) {
        console.error("Error loading blog announcements:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [supabase])

  if (loading || blogs.length === 0) return null

  return (
    <div className={`w-full my-6 space-y-3 ${className}`}>
      <div className="flex items-center gap-2 px-1">
        <Megaphone className="h-4 w-4 text-amber-500 animate-bounce" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          ข่าวสาร & แจ้งเตือนล่าสุด
        </span>
      </div>

      <div className="grid gap-3">
        {blogs.map((blog) => {
          const categoryInfo = CATEGORY_MAP[blog.category] || { label: blog.category, icon: Sparkles }
          const CategoryIcon = categoryInfo.icon
          const colors = COLOR_MAP[blog.badge_color] || COLOR_MAP.amber

          return (
            <div
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-r ${colors.bg} p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer backdrop-blur-xl ${colors.border}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {blog.is_pinned && (
                      <Badge className="bg-amber-500 text-white dark:bg-amber-600 border-none px-2 py-0.5 text-[11px] gap-1 shadow-xs">
                        <Pin className="h-3 w-3 fill-current" />
                        ปักหมุด
                      </Badge>
                    )}
                    <Badge variant="outline" className={`px-2.5 py-0.5 text-[11px] gap-1 ${colors.badge}`}>
                      <CategoryIcon className="h-3 w-3" />
                      {categoryInfo.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.published_at || blog.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-1">
                    {blog.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 sm:line-clamp-1">
                    {blog.summary}
                  </p>
                </div>

                <div className="flex items-center shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-xs font-semibold group-hover:translate-x-1 transition-transform"
                  >
                    <span>อ่านรายละเอียด</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBlog} onOpenChange={(open) => !open && setSelectedBlog(null)}>
        {selectedBlog && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedBlog.is_pinned && (
                  <Badge className="bg-amber-500 text-white dark:bg-amber-600 border-none px-2 py-0.5 text-[11px] gap-1">
                    <Pin className="h-3 w-3 fill-current" />
                    ปักหมุด
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`px-2.5 py-0.5 text-[11px] gap-1 ${
                    (COLOR_MAP[selectedBlog.badge_color] || COLOR_MAP.amber).badge
                  }`}
                >
                  {CATEGORY_MAP[selectedBlog.category]?.label || selectedBlog.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedBlog.published_at || selectedBlog.created_at).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-left leading-snug">
                {selectedBlog.title}
              </DialogTitle>
              <DialogDescription className="text-left text-sm text-muted-foreground">
                {selectedBlog.summary}
              </DialogDescription>
            </DialogHeader>

            {selectedBlog.cover_image_url && (
              <div className="my-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <img
                  src={selectedBlog.cover_image_url}
                  alt={selectedBlog.title}
                  className="w-full h-auto max-h-72 object-cover"
                />
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
