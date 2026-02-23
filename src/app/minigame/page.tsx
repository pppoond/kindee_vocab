"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Swords, Heart, ShieldAlert, Sparkles, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Vocabulary = {
  id: string
  word: string
  meaning: string
  type: string
}

export default function MiniGame() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [playerHp, setPlayerHp] = useState(100)
  const [beastHp, setBeastHp] = useState(100)
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null)
  const [isAttacking, setIsAttacking] = useState(false)
  const [beastAttacking, setBeastAttacking] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const loadGame = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data, error } = await supabase
      .from("vocabularies")
      .select("id, word, meaning, type")
      .eq("memorized", false)
    
    if (error || !data || data.length === 0) {
      setLoading(false)
      if (!error && data?.length === 0) {
        alert("You need at least some non-memorized words to play! Add them in the dashboard.")
        router.push("/")
      }
      return
    }

    setVocabularies(data)
    setupTurn(data)
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadGame()
  }, [loadGame])

  const setupTurn = (list: Vocabulary[]) => {
    const word = list[Math.floor(Math.random() * list.length)]
    setCurrentWord(word)

    // Generate options
    // Filter out distractors that have the same word (to avoid ambiguity)
    // and those that have the same meaning (to avoid duplicates)
    const others = list
      .filter(v => v.id !== word.id && v.word.toLowerCase() !== word.word.toLowerCase() && v.meaning !== word.meaning)
      .map(v => v.meaning)
    
    // Get unique meanings from others
    const uniqueOthers = Array.from(new Set(others))
    const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3)
    const finalOptions = [...shuffledOthers, word.meaning].sort(() => 0.5 - Math.random())
    setOptions(finalOptions)
    setFeedback(null)
  }

  const handleAnswer = (answer: string) => {
    if (gameState !== "playing" || feedback) return

    if (answer === currentWord?.meaning) {
      setFeedback({ type: "success", message: "Correct! You strike the beast!" })
      setIsAttacking(true)
      setTimeout(() => {
        setBeastHp(prev => {
          const newHp = Math.max(0, prev - 25)
          if (newHp === 0) setGameState("won")
          return newHp
        })
        setIsAttacking(false)
        if (beastHp > 25) setTimeout(() => setupTurn(vocabularies), 1000)
      }, 500)
    } else {
      setFeedback({ type: "error", message: `Wrong! The correct meaning was: ${currentWord?.meaning}` })
      setBeastAttacking(true)
      setTimeout(() => {
        setPlayerHp(prev => {
          const newHp = Math.max(0, prev - 20)
          if (newHp === 0) setGameState("lost")
          return newHp
        })
        setBeastAttacking(false)
        if (playerHp > 20) setTimeout(() => setupTurn(vocabularies), 1500)
      }, 500)
    }
  }

  const resetGame = () => {
    setPlayerHp(100)
    setBeastHp(100)
    setGameState("playing")
    setFeedback(null)
    loadGame()
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading game...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Back to Dashboard</span>
          </Button>
        </Link>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <div className="w-32 h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <div 
                className="h-full bg-red-500 transition-all duration-500" 
                style={{ width: `${playerHp}%` }} 
              />
            </div>
            <span className="text-sm font-bold">{playerHp}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Battle Arena */}
        <div className="w-full max-w-4xl grid grid-cols-2 gap-2 md:gap-8 items-center mb-6 md:mb-12 px-2 sm:px-0">
          {/* Player Side */}
          <div className={`flex flex-col items-center transition-transform duration-300 ${isAttacking ? 'translate-x-6 md:translate-x-20 scale-110' : ''}`}>
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <Swords className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </div>
              {isAttacking && (
                <Sparkles className="absolute -top-4 -right-4 h-6 w-6 md:h-8 md:w-8 text-yellow-400 animate-pulse" />
              )}
            </div>
            <p className="mt-2 md:mt-4 font-bold text-sm md:text-lg">You</p>
          </div>

          {/* Beast Side */}
          <div className={`flex flex-col items-center transition-transform duration-300 ${beastAttacking ? '-translate-x-6 md:-translate-x-20 scale-110' : ''} ${beastHp === 0 ? 'opacity-0 scale-50' : ''}`}>
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-2xl bg-zinc-900 border-2 border-red-900/50 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <div className="text-4xl sm:text-6xl md:text-8xl">👹</div>
              </div>
              <div className="absolute -top-5 left-0 right-0 flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">Ancient Beast</span>
                <div className="w-[80%] md:w-full h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-300" 
                    style={{ width: `${beastHp}%` }} 
                  />
                </div>
              </div>
              {beastAttacking && (
                <ShieldAlert className="absolute -top-4 -left-4 h-6 w-6 md:h-8 md:w-8 text-red-500 animate-bounce" />
              )}
            </div>
          </div>
        </div>

        {/* Game UI */}
        <div className="w-full max-w-2xl w-[95%] z-10 px-2 sm:px-0">
          {gameState === "playing" ? (
            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
              <div className="bg-primary/10 p-2 text-center border-b border-zinc-800">
                <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-[10px] md:text-xs">Choose the correct meaning</Badge>
              </div>
              <CardHeader className="text-center pt-4 md:pt-8 pb-2 md:pb-4 px-2 md:px-6">
                <CardTitle className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white mb-1 md:mb-2 break-words">{currentWord?.word}</CardTitle>
                <p className="text-zinc-500 italic text-xs md:text-sm">{currentWord?.type}</p>
              </CardHeader>
              <CardContent className="p-3 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                {options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`h-auto min-h-[50px] py-2 md:py-4 px-3 md:px-6 flex items-start text-left border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800 transition-all text-[11px] sm:text-sm whitespace-normal ${feedback ? 'pointer-events-none' : ''}`}
                    onClick={() => handleAnswer(option)}
                  >
                    <span className="text-zinc-600 mr-2 md:mr-3 font-mono shrink-0">{String.fromCharCode(65 + idx)}.</span>
                    <span className="break-words leading-tight md:leading-normal mt-0.5 md:mt-0">{option}</span>
                  </Button>
                ))}
              </CardContent>
              {feedback && (
                <div className={`p-4 text-center font-bold animate-in fade-in slide-in-from-bottom-2 ${feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {feedback.message}
                </div>
              )}
            </Card>
          ) : (
            <div className="text-center animate-in zoom-in duration-500">
              {gameState === "won" ? (
                <>
                  <Trophy className="h-16 w-16 md:h-24 md:w-24 text-yellow-500 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-4xl md:text-6xl font-black mb-4">VICTORY!</h2>
                  <p className="text-lg md:text-xl text-zinc-400 mb-6 md:mb-8">The Princess is safe, and your vocabulary is stronger!</p>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-16 w-16 md:h-24 md:w-24 text-red-600 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-4xl md:text-6xl font-black mb-4">DEFEATED</h2>
                  <p className="text-lg md:text-xl text-zinc-400 mb-6 md:mb-8">The beast was too strong this time. Keep practicing!</p>
                </>
              )}
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="px-8 text-lg" onClick={resetGame}>Try Again</Button>
                <Link href="/">
                  <Button size="lg" variant="outline" className="px-8 text-lg border-zinc-700 text-zinc-300">Back Home</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f633_0%,transparent_50%)]" />
      </div>
    </div>
  )
}
