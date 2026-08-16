"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, LogOut, Gamepad2, BookOpen, Trash2, Pencil, ChevronLeft, ChevronRight, MoreHorizontal, Star, Target, Search, Volume2, Filter, Heart, Lightbulb, Loader2, RefreshCw, Menu, Home, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, Brain } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAlert } from "@/components/alert-provider"
import { Loading } from "@/components/ui/loading"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { AdBanner } from "@/components/ad-banner"
import { BlogAnnouncements } from "@/components/blog-announcements"

import { getExampleSentences } from "@/lib/dictionary"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { TicketModal } from "@/components/ticket-modal"
import { LifeBuoy } from "lucide-react"

type Vocabulary = {
  id: string
  word: string
  type: string
  meaning: string
  v2?: string
  v3?: string
  example: string
  memorized: boolean
  created_at: string
}

const WORD_TYPES = [
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Pronoun",
  "Preposition",
  "Conjunction",
  "Interjection"
]

const PAGE_SIZE = 25

type DailyStats = {
  gamesPlayed: number
  bestLevel: number
  correctCount: number
  wrongCount: number
}

export default function Dashboard() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Vocabulary | null>(null)
  const [formData, setFormData] = useState({ word: "", type: "", meaning: "", v2: "", v3: "", example: "" })
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [dailyStats, setDailyStats] = useState<DailyStats>({ gamesPlayed: 0, bestLevel: 0, correctCount: 0, wrongCount: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterMemorized, setFilterMemorized] = useState("all")
  const [publicTags, setPublicTags] = useState<{name: string}[]>([])
  
  // New states for example sentences
  const [apiExamples, setApiExamples] = useState<Record<string, string[]>>({})
  const [exampleLoading, setExampleLoading] = useState<Record<string, boolean>>({})

  const handleRefresh = async () => {
    await Promise.all([
      fetchVocabularies(1, searchQuery, filterType, filterMemorized),
      fetchDailyStats(),
    ])
    const { data: tags } = await supabase.from('public_tags').select('name').order('name')
    if (tags) setPublicTags(tags)
  }
  
  const supabase = createClient()
  const router = useRouter()
  const { showAlert, showConfirm } = useAlert()

  const fetchVocabularies = useCallback(async (page: number, search = searchQuery, type = filterType, memorized = filterMemorized) => {
    setLoading(true)
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from("vocabularies")
      .select("id, word, type, meaning, v2, v3, example, memorized, created_at", { count: "exact" })
      .order("created_at", { ascending: false })

    if (search.trim()) {
      query = query.or(`word.ilike.%${search.trim()}%,meaning.ilike.%${search.trim()}%`)
    }
    if (type !== "all") {
      query = query.eq("type", type)
    }
    if (memorized === "yes") {
      query = query.eq("memorized", true)
    } else if (memorized === "no") {
      query = query.eq("memorized", false)
    }

    const { data, error, count } = await query.range(from, to)
    
    if (error) {
      console.error(error)
    } else {
      setVocabularies(data || [])
      if (count !== null) setTotalCount(count)
    }
    setLoading(false)
  }, [supabase, searchQuery, filterType, filterMemorized])

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const fetchExamples = async (word: string) => {
    if (apiExamples[word] || exampleLoading[word]) return

    setExampleLoading(prev => ({ ...prev, [word]: true }))
    try {
      const sentences = await getExampleSentences(word)
      setApiExamples(prev => ({ ...prev, [word]: sentences }))
    } finally {
      setExampleLoading(prev => ({ ...prev, [word]: false }))
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    fetchVocabularies(1, value, filterType, filterMemorized)
  }

  const handleFilterType = (value: string) => {
    setFilterType(value)
    setCurrentPage(1)
    fetchVocabularies(1, searchQuery, value, filterMemorized)
  }

  const handleFilterMemorized = (value: string) => {
    setFilterMemorized(value)
    setCurrentPage(1)
    fetchVocabularies(1, searchQuery, filterType, value)
  }

  const fetchDailyStats = useCallback(async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data, error } = await supabase
      .from("game_sessions")
      .select("level, correct_count, wrong_count")
      .gte("played_at", today.toISOString())
    
    if (!error && data) {
      const stats: DailyStats = {
        gamesPlayed: data.length,
        bestLevel: data.length > 0 ? Math.max(...data.map(s => s.level)) : 0,
        correctCount: data.reduce((sum, s) => sum + s.correct_count, 0),
        wrongCount: data.reduce((sum, s) => sum + s.wrong_count, 0),
      }
      setDailyStats(stats)
    }
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      
      const { data: userSettings } = await supabase.from("user_settings").select("role").eq("user_id", user.id).single()
      if (userSettings?.role === 'admin') setIsAdmin(true)
      
      fetchVocabularies(currentPage)
      fetchDailyStats()

      const { data: tags } = await supabase.from('public_tags').select('name').order('name')
      if (tags) setPublicTags(tags)
    }
    getUser()
  }, [currentPage, fetchVocabularies, fetchDailyStats, router, supabase])

  const handleOpenAdd = () => {
    setEditingWord(null)
    setFormData({ word: "", type: "", meaning: "", v2: "", v3: "", example: "" })
    setOpen(true)
  }

  const handleOpenEdit = (v: Vocabulary) => {
    setEditingWord(v)
    setFormData({ 
      word: v.word, 
      type: v.type || "", 
      meaning: v.meaning, 
      v2: v.v2 || "",
      v3: v.v3 || "",
      example: v.example || "" 
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingWord) {
        const { error } = await supabase
          .from("vocabularies")
          .update({ 
            word: formData.word, 
            type: formData.type, 
            meaning: formData.meaning, 
            v2: formData.v2,
            v3: formData.v3,
            example: formData.example 
          })
          .eq("id", editingWord.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("vocabularies")
          .insert([
            { 
              ...formData,
              user_id: user.id 
            }
          ])
        
        if (error) throw error
      }
      
      setOpen(false)
      fetchVocabularies(currentPage)
    } catch (err: any) {
      showAlert(err.message, { type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const toggleMemorized = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("vocabularies")
      .update({ memorized: !current })
      .eq("id", id)
    
    if (!error) {
      setVocabularies(vocabularies.map(v => v.id === id ? { ...v, memorized: !current } : v))
    }
  }

  const deleteWord = async (id: string) => {
    const confirmed = await showConfirm("Are you sure you want to delete this word?")
    if (!confirmed) return
    const { error } = await supabase
      .from("vocabularies")
      .delete()
      .eq("id", id)
    
    if (!error) {
      fetchVocabularies(currentPage)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <TicketModal open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen} />
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-black/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                <img src="/assets/logos/logo.png" alt="Kindee Vocab" className="h-7 w-7 object-contain" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hidden sm:block">Kindee Vocab</h1>
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">
            <Button variant="pill-outline" size="pill-sm" className="gap-2" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>หน้าแรก</span>
              </Link>
            </Button>
            
            {isAdmin && (
              <Button variant="pill-outline" size="pill-sm" className="gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700" asChild>
                <Link href="/backoffice">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Backoffice</span>
                </Link>
              </Button>
            )}
            
            <Button variant="pill-outline" size="pill-sm" className="gap-2" asChild>
              <Link href="/games">
                <Gamepad2 className="h-4 w-4" />
                <span>Play Game</span>
              </Link>
            </Button>

            <Button variant="pill-outline" size="pill-sm" className="gap-2" asChild>
              <Link href="/verb3">
                <BookOpen className="h-4 w-4" />
                <span>Verb 3 Channels</span>
              </Link>
            </Button>
            
            {/* Profile & Support */}
            <div className="flex items-center gap-2">
              <Button variant="pill-outline" size="pill-sm" onClick={() => setIsTicketModalOpen(true)} className="gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400">
                <LifeBuoy className="h-4 w-4" />
                <span>แจ้งปัญหา</span>
              </Button>
              <Button variant="pill-destructive" size="pill-sm" className="gap-2" asChild>
                <Link href="/donate">
                  <Heart className="h-4 w-4 fill-current animate-pulse" />
                  <span>Support</span>
                </Link>
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left">เมนู</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-6 px-4">
                  <Link href="/" className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition-colors" onClick={() => setIsSheetOpen(false)}>
                    <Home className="h-5 w-5" /> หน้าแรก
                  </Link>
                  {isAdmin && (
                    <Link href="/backoffice" className="flex items-center gap-2 text-lg font-medium text-amber-600 hover:text-amber-700 transition-colors" onClick={() => setIsSheetOpen(false)}>
                      <LayoutDashboard className="h-5 w-5" /> Backoffice
                    </Link>
                  )}
                  <Link href="/games" className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition-colors" onClick={() => setIsSheetOpen(false)}>
                    <Gamepad2 className="h-5 w-5" /> Play Game
                  </Link>
                  <Link href="/verb3" className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition-colors" onClick={() => setIsSheetOpen(false)}>
                    <BookOpen className="h-5 w-5" /> Verb 3 Channels
                  </Link>
                  <Link href="/donate" className="flex items-center gap-2 text-lg font-medium hover:text-rose-500 transition-colors" onClick={() => setIsSheetOpen(false)}>
                    <Heart className="h-5 w-5" /> Support
                  </Link>
                  <div className="my-2 border-b border-zinc-200 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      setIsSheetOpen(false)
                      setTimeout(() => setIsTicketModalOpen(true), 300)
                    }}
                    className="flex items-center gap-2 text-lg font-medium text-amber-600 dark:text-amber-500 text-left"
                  >
                    <LifeBuoy className="h-5 w-5" /> แจ้งปัญหา / Feedback
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-medium text-red-500 hover:text-red-600 transition-colors">
                    <LogOut className="h-5 w-5" /> ออกจากระบบ
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          {/* Card 1: Total Vocabulary */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Total Vocab</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{totalCount}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          {/* Card 2: Today's Games */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Today's Games</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{dailyStats.gamesPlayed}</h3>
              </div>
              <div className="p-3 bg-violet-100 dark:bg-violet-500/20 rounded-2xl text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20">
                <Gamepad2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card 3: Best Level */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-amber-500/10 dark:bg-amber-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Best Level</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">{dailyStats.bestLevel || "—"}</h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Card 4: Accuracy */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Accuracy</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  {dailyStats.correctCount + dailyStats.wrongCount > 0
                    ? `${Math.round((dailyStats.correctCount / (dailyStats.correctCount + dailyStats.wrongCount)) * 100)}%`
                    : "—"}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <BlogAnnouncements />
        <AdBanner position="dashboard_middle" />

        <div className="mb-8">
          <Button 
            variant="outline"
            className="w-full h-auto flex-col items-center justify-center gap-3 py-8 text-lg border-2 border-dashed border-amber-500/40 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-500 transition-all rounded-2xl"
            onClick={handleOpenAdd}
          >
            <div className="bg-amber-100 dark:bg-amber-500/20 p-3 rounded-full">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-bold">Add New Word</span>
          </Button>
        </div>

        {/* Public Vocabularies */}
        <div className="mb-10 space-y-4 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">คลังคำศัพท์สาธารณะ</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            กดเพื่อเข้าไปดูคำศัพท์ และกดเครื่องหมาย (+) เพื่อคัดลอกมาลงในคลังส่วนตัวของคุณได้ทันที
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {publicTags.map(tag => (
              <Link key={tag.name} href={`/learn/${tag.name}`}>
                <Button variant="pill-chart-4" size="pill-sm" className="capitalize">
                  {tag.name}
                </Button>
              </Link>
            ))}
            {publicTags.length === 0 && (
              <span className="text-sm text-muted-foreground">ยังไม่มีคลังคำศัพท์สาธารณะ</span>
            )}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWord ? "Edit Vocabulary" : "Add New Vocabulary"}</DialogTitle>
              <DialogDescription>
                Help yourself remember more words.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="word">Word</Label>
                <Input 
                  id="word" 
                  value={formData.word} 
                  onChange={e => setFormData({ ...formData, word: e.target.value })}
                  placeholder="e.g. Persistence" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "Verb" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="v2">Verb 2 (Past Simple)</Label>
                    <Input 
                      id="v2" 
                      value={formData.v2} 
                      onChange={e => setFormData({ ...formData, v2: e.target.value })}
                      placeholder="e.g. went" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="v3">Verb 3 (Past Participle)</Label>
                    <Input 
                      id="v3" 
                      value={formData.v3} 
                      onChange={e => setFormData({ ...formData, v3: e.target.value })}
                      placeholder="e.g. gone" 
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="meaning">Meaning</Label>
                <Textarea 
                  id="meaning" 
                  rows={3}
                  value={formData.meaning} 
                  onChange={e => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="e.g. The quality that allows someone to continue doing something" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="example">Example Sentence</Label>
                <Textarea 
                  id="example" 
                  rows={3}
                  value={formData.example} 
                  onChange={e => setFormData({ ...formData, example: e.target.value })}
                  placeholder="e.g. Her persistence paid off when she finally won." 
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingWord ? "Update Word" : "Save Word"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Word List</h2>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search words or meanings..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={handleFilterType}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {WORD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMemorized} onValueChange={handleFilterMemorized}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="no">Not Memorized</SelectItem>
                <SelectItem value="yes">Memorized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <Loading text="Loading words..." className="py-12" />
          ) : vocabularies.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <CardDescription>No words added yet. Start by adding your first word!</CardDescription>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {vocabularies.map((v) => (
                  <Card key={v.id} className={`transition-all ${v.memorized ? 'opacity-75 bg-zinc-50/50 dark:bg-zinc-900/20' : 'hover:border-primary/50 shadow-sm'}`}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-xl font-bold tracking-tight">
                            {v.word}
                            {v.type === "Verb" && (v.v2 || v.v3) && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                {v.v2 || "-"} • {v.v3 || "-"}
                              </span>
                            )}
                          </CardTitle>
                          {v.memorized && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-none text-[10px] h-5 px-1.5">Memorized</Badge>}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {v.type && (
                            <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-none">{v.type}</Badge>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`h-8 rounded-xl border border-b-4 transition-all gap-1.5 px-3 active:border-b active:translate-y-[3px] ${
                                v.memorized 
                                  ? "text-zinc-400 bg-zinc-100/80 dark:text-zinc-500 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80" 
                                  : "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-500/40 dark:border-emerald-500/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                              }`}
                              onClick={() => toggleMemorized(v.id, v.memorized)}
                              title={v.memorized ? "เปลี่ยนเป็นยังจำไม่ได้" : "ทำเครื่องหมายว่าจำได้แล้ว"}
                            >
                              <CheckCircle2 className={`h-4 w-4 shrink-0 ${v.memorized ? "text-zinc-400 dark:text-zinc-500" : "text-emerald-600 dark:text-emerald-400"}`} />
                              <span className="text-xs font-medium">จำได้แล้ว</span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-primary hover:bg-primary/5" 
                              onClick={() => speakWord(v.word)}
                              title="Speak word"
                            >
                              <Volume2 className="h-4.5 w-4.5" />
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-8 w-8 rounded-full transition-colors ${apiExamples[v.word] ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'text-zinc-400 hover:text-primary hover:bg-primary/5'}`}
                              onClick={() => fetchExamples(v.word)}
                              disabled={exampleLoading[v.word]}
                              title="View examples"
                            >
                              {exampleLoading[v.word] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Lightbulb className="h-4.5 w-4.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleOpenEdit(v)} className="gap-2 cursor-pointer">
                            <Pencil className="h-4 w-4" />
                            Edit Word
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteWord(v.id)} className="gap-2 text-red-600 focus:text-red-600 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                            Delete Word
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{v.meaning}</p>
                      <div className="space-y-2">
                        {v.example && (
                          <p className="text-sm text-zinc-500 italic">"{v.example}"</p>
                        )}
                        {/* API Examples Section */}
                        {apiExamples[v.word] && (
                          <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-200 border-t pt-2 dark:border-zinc-800">
                            {apiExamples[v.word].length > 0 ? (
                              apiExamples[v.word].slice(0, 2).map((sentence, sIdx) => (
                                <div key={sIdx} className="group relative text-[16px] text-zinc-500 bg-zinc-100 dark:bg-white/5 p-2 rounded border-l-2 border-emerald-500/30 italic leading-relaxed pr-8">
                                  "{sentence}"
                                  <button
                                    onClick={() => speakWord(sentence)}
                                    className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                                    title="Read sentence"
                                  >
                                    <Volume2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="text-[16px] text-zinc-400 italic">No additional example sentences found.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
    </PullToRefresh>
  )
}
