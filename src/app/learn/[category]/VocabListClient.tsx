"use client"

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, Search } from 'lucide-react'
import { useAlert } from '@/components/alert-provider'

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
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
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

    return result
  }, [words, search, activeLetter])

  const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const paginatedWords = useMemo(() => {
    return filteredWords.slice(0, page * ITEMS_PER_PAGE)
  }, [filteredWords, page])

  const handleAddWord = async (word: PublicWord) => {
    if (!userId) {
      showAlert('กรุณาเข้าสู่ระบบก่อนเพิ่มคำศัพท์', 'error')
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
        showAlert('เกิดข้อผิดพลาดในการเพิ่มคำศัพท์', 'error')
      } else {
        setAddedIds(prev => new Set(prev).add(word.id))
        showAlert('เพิ่มเข้าคลังคำศัพท์แล้ว!', 'success')
      }
    } catch (err) {
      console.error(err)
      showAlert('เกิดข้อผิดพลาดในการเพิ่มคำศัพท์', 'error')
    } finally {
      const next = new Set(addingIds)
      next.delete(word.id)
      setAddingIds(next)
    }
  }

  return (
    <div>
      <div className="relative mb-8 max-w-xl mx-auto">
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

      <div className="mb-8 pb-4">
        <div className="flex flex-wrap gap-2 px-2 mx-auto justify-center">
          <Button
            variant={activeLetter === null ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveLetter(null)
              setPage(1)
            }}
            className="rounded-full"
          >
            All
          </Button>
          {ALPHABETS.map((letter) => (
            <Button
              key={letter}
              variant={activeLetter === letter ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveLetter(activeLetter === letter ? null : letter)
                setPage(1)
              }}
              className="rounded-full w-9 h-9 p-0"
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedWords.map((word) => (
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
                
                <Button 
                  size="icon" 
                  variant={addedIds.has(word.id) ? "secondary" : "default"}
                  className="rounded-full h-8 w-8 shrink-0"
                  onClick={() => handleAddWord(word)}
                  disabled={addingIds.has(word.id) || addedIds.has(word.id)}
                  title="เพิ่มเข้าคลัง"
                >
                  {addedIds.has(word.id) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {word.example && (
                <div className="mt-4 pt-4 border-t border-border/50 text-sm italic text-muted-foreground">
                  "{word.example}"
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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
    </div>
  )
}
