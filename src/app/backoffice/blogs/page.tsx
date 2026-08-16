import { createClient } from "@/lib/supabase/server"
import { BlogsClient } from "./BlogsClient"

export const dynamic = "force-dynamic"

export default async function BlogsPage() {
  const supabase = await createClient()

  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blogs:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Blogs & Announcement Management</h2>
        <p className="text-muted-foreground">สร้างและจัดการบล็อก/ข่าวสารแจ้งเตือนสำหรับแสดงผลแก่ User บนหน้า Dashboard</p>
      </div>
      
      <BlogsClient initialBlogs={blogs || []} />
    </div>
  )
}
