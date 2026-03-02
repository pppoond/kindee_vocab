"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Volume2, Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Loading } from "@/components/ui/loading"
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
}

export default function Verb3Page() {
  const [verbs, setVerbs] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  const fetchVerbs = useCallback(async (search = "") => {
    setLoading(true)
    let query = supabase
      .from("vocabularies")
      .select("*")
      .eq("type", "Verb")
      .order("word", { ascending: true })

    if (search.trim()) {
      query = query.or(`word.ilike.%${search.trim()}%,meaning.ilike.%${search.trim()}%`)
    }

    const { data, error } = await query
    if (!error && data) {
      setVerbs(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchVerbs()
  }, [fetchVerbs])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  // Group verbs by pattern (A-A-A, A-B-B, A-B-C, etc.)
  const getPattern = (v: Vocabulary) => {
    if (!v.v2 || !v.v3) return "Unknown"
    const w = v.word.toLowerCase()
    const v2 = v.v2.toLowerCase()
    const v3 = v.v3.toLowerCase()

    if (w === v2 && v2 === v3) return "A-A-A"
    if (w !== v2 && v2 === v3) return "A-B-B"
    if (w === v3 && w !== v2) return "A-B-A"
    if (w !== v2 && v2 !== v3 && w !== v3) return "A-B-C"
    return "Other"
  }

  const groupedVerbs = verbs.reduce((acc, verb) => {
    const pattern = getPattern(verb)
    if (!acc[pattern]) acc[pattern] = []
    acc[pattern].push(verb)
    return acc
  }, {} as Record<string, Vocabulary[]>)

  const patterns = ["A-A-A", "A-B-B", "A-B-A", "A-B-C", "Other", "Unknown"]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pb-20">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:bg-black/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Verb 3 Channels</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black tracking-tight">Irregular Verbs Library</h2>
            <p className="text-muted-foreground">รวมกริยา 3 ช่อง แบ่งตามรูปแบบการผัน</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาคำศัพท์หรือความหมาย..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                fetchVerbs(e.target.value)
              }}
              className="pl-9 h-12 text-lg"
            />
          </div>
        </div>

        <AdBanner position="dashboard_middle" />

        {loading ? (
          <Loading className="py-20" />
        ) : verbs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl">
            <Info className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
            <h3 className="text-xl font-bold">No verbs found</h3>
            <p className="text-muted-foreground">Add some verbs in the dashboard first!</p>
            <Button className="mt-6" asChild>
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {patterns.map(pattern => {
              const patternVerbs = groupedVerbs[pattern]
              if (!patternVerbs || patternVerbs.length === 0) return null

              return (
                <section key={pattern} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge className="text-lg px-4 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none">
                      {pattern}
                    </Badge>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {patternVerbs.map((v) => (
                      <Card key={v.id} className="group hover:border-primary/50 transition-all overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl font-black flex items-center gap-2">
                              {v.word}
                              {v.memorized && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </CardTitle>
                            <p className="text-muted-foreground font-medium">{v.meaning}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => speak(`${v.word}, ${v.v2}, ${v.v3}`)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-center">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">V1</span>
                              <div className="font-bold text-sm truncate">{v.word}</div>
                            </div>
                            <div className="space-y-1 border-x border-zinc-200 dark:border-zinc-800">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">V2</span>
                              <div className="font-bold text-sm truncate text-primary">{v.v2 || "—"}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">V3</span>
                              <div className="font-bold text-sm truncate text-violet-500">{v.v3 || "—"}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
