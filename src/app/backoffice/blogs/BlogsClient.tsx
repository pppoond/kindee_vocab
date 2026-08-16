"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BlogItem } from "@/components/blog-announcements"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Megaphone,
  AlertCircle,
  Rocket,
  Tag,
  Loader2,
  Calendar,
  Image as ImageIcon,
} from "lucide-react"
import { useAlert } from "@/components/alert-provider"

const CATEGORIES = [
  { value: "announcement", label: "ประกาศสำคัญ", icon: Megaphone },
  { value: "update", label: "อัปเดตใหม่", icon: Sparkles },
  { value: "feature", label: "ฟีเจอร์ใหม่", icon: Rocket },
  { value: "promotion", label: "โปรโมชั่น", icon: Tag },
  { value: "maintenance", label: "แจ้งปรับปรุง", icon: AlertCircle },
]

const COLORS = [
  { value: "amber", label: "Amber (ส้ม/เหลือง)", class: "bg-amber-500" },
  { value: "blue", label: "Blue (ฟ้า/น้ำเงิน)", class: "bg-blue-500" },
  { value: "emerald", label: "Emerald (เขียว)", class: "bg-emerald-500" },
  { value: "rose", label: "Rose (แดง/ชมพู)", class: "bg-rose-500" },
  { value: "purple", label: "Purple (ม่วง)", class: "bg-purple-500" },
]

export function BlogsClient({ initialBlogs }: { initialBlogs: BlogItem[] }) {
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [openModal, setOpenModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewBlog, setPreviewBlog] = useState<BlogItem | null>(null)

  const { showAlert, showConfirm } = useAlert()
  const supabase = createClient()

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "update",
    badge_color: "amber",
    cover_image_url: "",
    is_published: true,
    is_pinned: false,
  })

  const resetForm = () => {
    setFormData({
      title: "",
      summary: "",
      content: "",
      category: "update",
      badge_color: "amber",
      cover_image_url: "",
      is_published: true,
      is_pinned: false,
    })
    setEditingBlog(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setOpenModal(true)
  }

  const handleOpenEdit = (blog: BlogItem) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      category: blog.category || "update",
      badge_color: blog.badge_color || "amber",
      cover_image_url: blog.cover_image_url || "",
      is_published: blog.is_published,
      is_pinned: blog.is_pinned,
    })
    setOpenModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      showAlert("กรุณากรอกข้อมูล หัวข้อ, ข้อความย่อ และเนื้อหา ให้ครบถ้วน", { type: "info", title: "คำเตือน" })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        category: formData.category,
        badge_color: formData.badge_color,
        cover_image_url: formData.cover_image_url.trim() || null,
        is_published: formData.is_published,
        is_pinned: formData.is_pinned,
        updated_at: new Date().toISOString(),
      }

      if (editingBlog) {
        const { data, error } = await supabase
          .from("blogs")
          .update(payload)
          .eq("id", editingBlog.id)
          .select()
          .single()

        if (error) throw error
        setBlogs(blogs.map((b) => (b.id === editingBlog.id ? data : b)))
        showAlert("อัปเดตบล็อก/ข่าวสารเรียบร้อยแล้ว", { type: "success" })
      } else {
        const { data, error } = await supabase
          .from("blogs")
          .insert([{ ...payload, published_at: new Date().toISOString() }])
          .select()
          .single()

        if (error) throw error
        setBlogs([data, ...blogs])
        showAlert("สร้างบล็อก/ข่าวสารใหม่เรียบร้อยแล้ว", { type: "success" })
      }

      setOpenModal(false)
      resetForm()
    } catch (error: any) {
      console.error("Error saving blog:", error)
      showAlert(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", { type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (blog: BlogItem) => {
    try {
      const newStatus = !blog.is_published
      const { error } = await supabase
        .from("blogs")
        .update({ is_published: newStatus, updated_at: new Date().toISOString() })
        .eq("id", blog.id)

      if (error) throw error

      setBlogs(blogs.map((b) => (b.id === blog.id ? { ...b, is_published: newStatus } : b)))
      showAlert(
        newStatus ? "เผยแพร่ข่าวสารแล้ว" : "ซ่อนข่าวสารแล้ว",
        { type: newStatus ? "success" : "info" }
      )
    } catch (error: any) {
      console.error("Error toggling publish:", error)
      showAlert("ไม่สามารถเปลี่ยนสถานะได้", { type: "error" })
    }
  }

  const handleTogglePin = async (blog: BlogItem) => {
    try {
      const newPin = !blog.is_pinned
      const { error } = await supabase
        .from("blogs")
        .update({ is_pinned: newPin, updated_at: new Date().toISOString() })
        .eq("id", blog.id)

      if (error) throw error

      setBlogs(blogs.map((b) => (b.id === blog.id ? { ...b, is_pinned: newPin } : b)))
      showAlert(
        newPin ? "ปักหมุดไว้บนสุดแล้ว" : "ยกเลิกการปักหมุดแล้ว",
        { type: newPin ? "success" : "info" }
      )
    } catch (error: any) {
      console.error("Error toggling pin:", error)
      showAlert("ไม่สามารถปักหมุดได้", { type: "error" })
    }
  }

  const handleDelete = async (blog: BlogItem) => {
    const confirmed = await showConfirm(
      `คุณต้องการลบข่าวสาร "${blog.title}" ใช่หรือไม่?`,
      { title: "ยืนยันการลบ" }
    )

    if (!confirmed) return

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", blog.id)
      if (error) throw error

      setBlogs(blogs.filter((b) => b.id !== blog.id))
      showAlert("ลบข่าวสารเรียบร้อยแล้ว", { type: "success" })
    } catch (error: any) {
      console.error("Error deleting blog:", error)
      showAlert("เกิดข้อผิดพลาดในการลบข้อมูล", { type: "error" })
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || blog.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อหัวข้อ หรือรายละเอียด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          <Plus className="h-4 w-4" />
          สร้างข่าวสารใหม่
        </Button>
      </div>

      {/* Blogs Table / List */}
      <div className="grid gap-4">
        {filteredBlogs.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <CardDescription className="text-base">
              ไม่พบข้อมูลข่าวสาร/บล็อก กรุณากดปุ่ม "สร้างข่าวสารใหม่" เพื่อเริ่มเขียนข่าวแรกของคุณ
            </CardDescription>
          </Card>
        ) : (
          filteredBlogs.map((blog) => {
            const categoryObj = CATEGORIES.find((c) => c.value === blog.category) || CATEGORIES[1]
            const CategoryIcon = categoryObj.icon

            return (
              <Card
                key={blog.id}
                className={`transition-all ${
                  !blog.is_published ? "opacity-60 bg-zinc-50 dark:bg-zinc-900/40" : "hover:shadow-md"
                }`}
              >
                <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {blog.is_pinned && (
                        <Badge className="bg-amber-500 text-white border-none gap-1 px-2 py-0.5 text-xs">
                          <Pin className="h-3 w-3 fill-current" />
                          ปักหมุด
                        </Badge>
                      )}
                      <Badge variant={blog.is_published ? "default" : "secondary"} className="gap-1 text-xs">
                        <CategoryIcon className="h-3 w-3" />
                        {categoryObj.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(blog.published_at || blog.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      {blog.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-2 text-sm">
                      {blog.summary}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant={blog.is_pinned ? "default" : "outline"}
                      onClick={() => handleTogglePin(blog)}
                      title={blog.is_pinned ? "ปลดปักหมุด" : "ปักหมุดข่าวสารนี้"}
                      className={blog.is_pinned ? "bg-amber-500 hover:bg-amber-600" : ""}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant={blog.is_published ? "outline" : "secondary"}
                      onClick={() => handleTogglePublish(blog)}
                      title={blog.is_published ? "ซ่อนข่าวสาร" : "เผยแพร่ข่าวสาร"}
                    >
                      {blog.is_published ? (
                        <Eye className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-zinc-400" />
                      )}
                    </Button>

                    <Button size="sm" variant="ghost" onClick={() => setPreviewBlog(blog)}>
                      ดูตัวอย่าง
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => handleOpenEdit(blog)}>
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => handleDelete(blog)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>

      {/* Add / Edit Dialog Form */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? "แก้ไขข่าวสาร / Announcement" : "สร้างข่าวสารใหม่ / Announcement"}
            </DialogTitle>
            <DialogDescription>
              ข่าวสารจะแสดงผลที่แถบด้านบนสุด (เหนือ Banner) ในหน้า Dashboard ของ User
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">หัวข้อ (Title) *</Label>
              <Input
                id="title"
                placeholder="เช่น อัปเดตฟีเจอร์ใหม่! เพิ่มระบบดวล Vocab Battle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>หมวดหมู่ (Category)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>โทนสี Badge (Theme Color)</Label>
                <Select
                  value={formData.badge_color}
                  onValueChange={(val) => setFormData({ ...formData, badge_color: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${color.class}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">ข้อความย่อ (Summary / Excerpt) *</Label>
              <Textarea
                id="summary"
                rows={2}
                placeholder="ข้อความสั้นๆ 1-2 ประโยค สำหรับแสดงบนการ์ดเหนือ Banner..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">เนื้อหาฉบับเต็ม (Full Content) *</Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="รายละเอียดข่าวสาร ข้อมูลการอัปเดต หรือประกาศเต็มรูปแบบ..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cover_image_url" className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4" />
                รูปภาพปก/ประกอบ (Cover Image URL) (ถ้ามี)
              </Label>
              <Input
                id="cover_image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium">เผยแพร่ทันที (Is Published)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium">ปักหมุดไว้บนสุด (Is Pinned)</span>
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : editingBlog ? (
                  "บันทึกการแก้ไข"
                ) : (
                  "สร้างข่าวสาร"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewBlog} onOpenChange={(o) => !o && setPreviewBlog(null)}>
        {previewBlog && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {previewBlog.is_pinned && (
                  <Badge className="bg-amber-500 text-white border-none px-2 py-0.5 text-[11px] gap-1">
                    <Pin className="h-3 w-3 fill-current" />
                    ปักหมุด
                  </Badge>
                )}
                <Badge variant="outline" className="px-2.5 py-0.5 text-[11px]">
                  {CATEGORIES.find((c) => c.value === previewBlog.category)?.label || previewBlog.category}
                </Badge>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-left">
                {previewBlog.title}
              </DialogTitle>
              <DialogDescription className="text-left text-sm">
                {previewBlog.summary}
              </DialogDescription>
            </DialogHeader>

            {previewBlog.cover_image_url && (
              <div className="my-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <img
                  src={previewBlog.cover_image_url}
                  alt={previewBlog.title}
                  className="w-full h-auto max-h-72 object-cover"
                />
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {previewBlog.content}
              </p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
