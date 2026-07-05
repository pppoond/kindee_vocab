"use client"

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Check, Search, Volume2, Loader2 } from 'lucide-react'
import { useAlert } from '@/components/alert-provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import Link from 'next/link'

type PublicWord = {
  id: string
  word: string
  type: string | null
  meaning: string
  v2: string | null
  v3: string | null
  example: string | null
  category: string
}

type Props = {
  words: PublicWord[]
  category: string
}

export function VocabListClient({ words, category }: Props) {
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string>("all")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  const supabase = createClient()
  const { showAlert } = useAlert()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        
        // Fetch existing user vocabularies
        const { data: userVocab } = await supabase
          .from('vocabularies')
          .select('word')
          .eq('user_id', session.user.id)
          
        if (userVocab) {
          setAddedWords(new Set(userVocab.map((v: any) => v.word.toLowerCase())))
        }
      }
    }
    checkUser()
  }, [])

  const filteredWords = useMemo(() => {
    let result = words

    if (activeLetter) {
      result = result.filter(w => w.word.toLowerCase().startsWith(activeLetter.toLowerCase()))
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(w => 
        w.word.toLowerCase().includes(lowerSearch) || 
        w.meaning.includes(lowerSearch)
      )
    }

    if (activeType !== "all") {
      result = result.filter(w => w.type === activeType)
    }

    return result
  }, [words, search, activeLetter, activeType])

  const wordTypes = useMemo(() => {
    const types = new Set<string>()
    words.forEach(w => {
      if (w.type) types.add(w.type)
    })
    return Array.from(types).sort()
  }, [words])

  const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const paginatedWords = useMemo(() => {
    return filteredWords.slice(0, page * ITEMS_PER_PAGE)
  }, [filteredWords, page])

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleAddWord = async (word: PublicWord) => {
    if (!userId) {
      setShowLoginModal(true)
      return
    }

    setAddingIds(prev => new Set(prev).add(word.id))

    try {
      const { error } = await supabase
        .from('vocabularies')
        .insert({
          user_id: userId,
          word: word.word,
          type: word.type || '',
          meaning: word.meaning,
          v2: word.v2 || '',
          v3: word.v3 || '',
          example: word.example || '',
        })

      if (error) {
        console.error('Error adding word:', error)
        showAlert('เกิดข้อผิดพลาดในการเพิ่มคำศัพท์', { type: 'error' })
      } else {
        setAddedWords(prev => new Set(prev).add(word.word.toLowerCase()))
        showAlert('เพิ่มเข้าคลังคำศัพท์แล้ว!', { type: 'success' })
      }
    } catch (err) {
      console.error(err)
      showAlert('เกิดข้อผิดพลาดในการเพิ่มคำศัพท์', { type: 'error' })
    } finally {
      const next = new Set(addingIds)
      next.delete(word.id)
      setAddingIds(next)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาคำศัพท์ หรือ ความหมาย..." 
            className="pl-10 h-12 text-lg rounded-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select 
            value={activeType} 
            onValueChange={(val) => {
              setActiveType(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-12 rounded-full text-base bg-white dark:bg-zinc-950 px-4">
              <SelectValue placeholder="ประเภทคำ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              {wordTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8 pb-4">
        <div className="flex flex-wrap gap-2 px-2 mx-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveLetter(null)
              setPage(1)
            }}
            className={`rounded-full transition-all px-5 ${
              activeLetter === null
                ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white border-none shadow-md shadow-amber-500/20 font-bold"
                : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
            }`}
          >
            All
          </Button>
          {ALPHABETS.map((letter) => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveLetter(activeLetter === letter ? null : letter)
                setPage(1)
              }}
              className={`rounded-full w-9 h-9 p-0 transition-all ${
                activeLetter === letter
                  ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white border-none shadow-md shadow-amber-500/20 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              }`}
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedWords.map((word) => {
          const isAdded = addedWords.has(word.word.toLowerCase())

          return (
          <Card key={word.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    {word.word}
                    {word.type && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {word.type}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground font-medium mt-1 text-sm">{word.meaning}</p>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    onClick={() => speakWord(word.word)}
                    title="อ่านออกเสียง"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>

                  <Button 
                    size="icon" 
                    variant={isAdded ? "outline" : "default"}
                    className={`rounded-full h-8 w-8 transition-all ${
                      isAdded 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 opacity-100" 
                        : "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-sm shadow-amber-500/20 border-none"
                    }`}
                    onClick={() => handleAddWord(word)}
                    disabled={addingIds.has(word.id) || isAdded}
                    title={isAdded ? "เพิ่มแล้ว" : "เพิ่มเข้าคลัง"}
                  >
                    {addingIds.has(word.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAdded ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {word.example && (
                <div className="mt-4 pt-4 border-t border-border/50 text-sm italic text-muted-foreground">
                  "{word.example}"
                </div>
              )}
            </CardContent>
          </Card>
        )})}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          ไม่พบคำศัพท์ที่ค้นหา
        </div>
      )}

      {paginatedWords.length < filteredWords.length && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setPage(prev => prev + 1)}
            className="rounded-full px-8"
          >
            โหลดเพิ่มเติม
          </Button>
        </div>
      )}

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>กรุณาเข้าสู่ระบบ</DialogTitle>
            <DialogDescription>
              คุณต้องเข้าสู่ระบบหรือสมัครสมาชิกก่อน เพื่อเพิ่มคำศัพท์นี้ลงในคลังส่วนตัวของคุณ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              ไว้คราวหน้า
            </Button>
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                เข้าสู่ระบบ / สมัครสมาชิก
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
