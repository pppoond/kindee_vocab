"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, LogOut, Gamepad2, BookOpen, Trash2, Pencil, ChevronLeft, ChevronRight, MoreHorizontal, Star, Target, Search, Volume2, Filter, Heart } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAlert } from "@/components/alert-provider"
import { Loading } from "@/components/ui/loading"
import { Loader2 } from "lucide-react"
import { AdBanner } from "@/components/ad-banner"

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
  const [open, setOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Vocabulary | null>(null)
  const [formData, setFormData] = useState({ word: "", type: "", meaning: "", v2: "", v3: "", example: "" })
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [dailyStats, setDailyStats] = useState<DailyStats>({ gamesPlayed: 0, bestLevel: 0, correctCount: 0, wrongCount: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterMemorized, setFilterMemorized] = useState("all")
  
  const supabase = createClient()
  const router = useRouter()
  const { showAlert, showConfirm } = useAlert()

  const fetchVocabularies = useCallback(async (page: number, search = searchQuery, type = filterType, memorized = filterMemorized) => {
    setLoading(true)
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from("vocabularies")
      .select("id, word, type, meaning, example, memorized, created_at", { count: "exact" })
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
      fetchVocabularies(currentPage)
      fetchDailyStats()
    }
    getUser()
  }, [currentPage, fetchVocabularies, fetchDailyStats, router, supabase.auth])

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-black/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                <img src="/assets/logos/logo.png" alt="Kindee Vocab" className="h-7 w-7 object-contain" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hidden sm:block">Kindee Vocab</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/games">
              <Button variant="outline" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Play Game</span>
              </Button>
            </Link>

            <Link href="/verb3">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Verb 3 Channels</span>
              </Button>
            </Link>
            
            {/* Profile & Support */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-rose-400 hover:bg-rose-950/20 hover:text-rose-400 gap-2 border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.1)]" asChild>
                <Link href="/donate">
                  <Heart className="h-4 w-4 fill-rose-500 animate-pulse" />
                  <span className="hidden sm:inline">Support</span>
                </Link>
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <CardHeader className="pb-2">
              <CardDescription>Total Vocabulary</CardDescription>
              <CardTitle className="text-4xl">{totalCount}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-4 border-l-violet-500 dark:border-l-violet-400">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5"><Gamepad2 className="h-3.5 w-3.5" /> Today&apos;s Games</CardDescription>
              <CardTitle className="text-4xl">{dailyStats.gamesPlayed}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-4 border-l-amber-500 dark:border-l-amber-400">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> Best Level Today</CardDescription>
              <CardTitle className="text-4xl">{dailyStats.bestLevel || "—"}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Today&apos;s Accuracy</CardDescription>
              <CardTitle className="text-4xl">
                {dailyStats.correctCount + dailyStats.wrongCount > 0
                  ? `${Math.round((dailyStats.correctCount / (dailyStats.correctCount + dailyStats.wrongCount)) * 100)}%`
                  : "—"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <AdBanner position="dashboard_middle" />

        <div className="mb-8">
          <Button 
            className="w-full h-auto flex-col items-center justify-center gap-2 py-6 text-lg"
            onClick={handleOpenAdd}
          >
            <Plus className="h-8 w-8" />
            Add New Word
          </Button>
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
                  <Card key={v.id} className={`transition-all ${v.memorized ? 'opacity-60 grayscale' : 'hover:border-primary/50 shadow-sm'}`}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl break-all">
                            {v.word}
                            {v.type === "Verb" && (v.v2 || v.v3) && (
                              <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({v.v2 || "-"} • {v.v3 || "-"})
                              </span>
                            )}
                          </CardTitle>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-primary shrink-0" onClick={() => speakWord(v.word)}>
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          {v.memorized && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Memorized</Badge>}
                        </div>
                        {v.type && (
                          <div className="flex">
                            <Badge variant="secondary" className="text-xs">{v.type}</Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={v.memorized ? "text-zinc-400" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                          onClick={() => toggleMemorized(v.id, v.memorized)}
                        >
                          {v.memorized ? "Unmark" : "Mark Memorized"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-400">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(v)} className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteWord(v.id)} className="gap-2 text-red-600 focus:text-red-600">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{v.meaning}</p>
                      {v.example && (
                        <p className="text-sm text-zinc-500 italic">"{v.example}"</p>
                      )}
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
  )
}
