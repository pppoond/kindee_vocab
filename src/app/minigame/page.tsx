"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, ShieldAlert, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// GIF Assets (Replace these URLs with your own GIF links)
const ASSETS = {
  hero: {
    idle: "https://placehold.co/256x256/3b82f6/ffffff?text=Hero+Idle", 
    attack: "https://placehold.co/256x256/1d4ed8/ffffff?text=Hero+Attack\n(Pung!)",
    hurt: "https://placehold.co/256x256/93c5fd/ffffff?text=Hero+Hurt",
    win: "https://placehold.co/256x256/22c55e/ffffff?text=Hero+Win!\n(Yay!)", 
    lose: "https://placehold.co/256x256/94a3b8/ffffff?text=Hero+Defeated\n(RIP)",
  },
  demon: {
    idle: "https://placehold.co/256x256/ef4444/ffffff?text=Demon+Idle",
    attack: "https://placehold.co/256x256/dc2626/ffffff?text=Demon+Attack\n(Slash!)",
    hurt: "https://placehold.co/256x256/b91c1c/ffffff?text=Demon+Hurt\n(Ouch!)",
    win: "https://placehold.co/256x256/991b1b/ffffff?text=Demon+Victory\n(Haha!)",
  },
  background: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1965&auto=format&fit=crop", // Fantasy-like forest background
}

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
  const [heroState, setHeroState] = useState<"idle" | "attack" | "hurt" | "win" | "lose">("idle")
  const [demonState, setDemonState] = useState<"idle" | "attack" | "hurt" | "win">("idle")

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
      setHeroState("attack")
      setTimeout(() => {
        setDemonState("hurt")
        setBeastHp(prev => {
          const newHp = Math.max(0, prev - 25)
          if (newHp === 0) {
            setGameState("won")
            setHeroState("win")
          }
          return newHp
        })
        setTimeout(() => {
          setHeroState(beastHp - 25 <= 0 ? "win" : "idle")
          if (beastHp > 25) {
             setDemonState("idle")
             setupTurn(vocabularies)
          }
        }, 1000)
      }, 500)
    } else {
      setFeedback({ type: "error", message: `Wrong! The correct meaning was: ${currentWord?.meaning}` })
      
      setDemonState("attack")
      setTimeout(() => {
        setHeroState("hurt")
        setPlayerHp(prev => {
          const newHp = Math.max(0, prev - 20)
          if (newHp === 0) {
            setGameState("lost")
            setHeroState("lose")
            setDemonState("win")
          }
          return newHp
        })
        setTimeout(() => {
          if (playerHp - 20 <= 0) {
             setHeroState("lose")
             setDemonState("win")
          } else {
             setHeroState("idle")
             setDemonState("idle")
             setupTurn(vocabularies)
          }
        }, 1000)
      }, 500)
    }
  }

  const resetGame = () => {
    setPlayerHp(100)
    setBeastHp(100)
    setGameState("playing")
    setHeroState("idle")
    setDemonState("idle")
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

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Battle Arena */}
        <div className="w-full max-w-4xl grid grid-cols-2 gap-2 md:gap-8 items-center mb-6 md:mb-12 px-2 sm:px-0">
          {/* Player Side */}
          <div className={`flex flex-col items-center transition-all duration-300 ${heroState === 'attack' ? 'translate-x-6 md:translate-x-20 scale-110' : ''} ${heroState === 'win' ? '-translate-y-10 animate-bounce' : ''} ${heroState === 'hurt' ? 'scale-90 opacity-80 brightness-200 contrast-200 grayscale translate-x-2 -rotate-6' : ''} ${heroState === 'lose' ? 'opacity-50 grayscale rotate-90 scale-75 blur-sm' : ''}`}>
            <div className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-end justify-center drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
              <img 
                src={ASSETS.hero[heroState === 'hurt' ? 'idle' : heroState]} 
                alt="Hero" 
                className={`w-full h-full object-contain [image-rendering:pixelated] ${heroState === 'hurt' ? 'animate-pulse' : ''}`}
              />
            </div>
            <p className="mt-2 md:mt-4 font-bold text-sm md:text-lg bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Hero</p>
          </div>

          {/* Beast Side */}
          <div className={`flex flex-col items-center transition-all duration-300 ${demonState === 'hurt' ? 'scale-90 opacity-80 brightness-200 contrast-200 grayscale -translate-x-2 rotate-6' : ''} ${demonState === 'attack' ? '-translate-x-6 md:-translate-x-20 scale-110' : ''} ${demonState === 'win' ? '-translate-y-10 animate-bounce scale-110 drop-shadow-[0_0_50px_rgba(220,38,38,0.8)]' : ''}`}>
            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 flex items-end justify-center drop-shadow-[0_0_25px_rgba(220,38,38,0.3)]`}>
              <img 
                src={ASSETS.demon[demonState]} 
                alt="Demon" 
                className={`w-full h-full object-contain [image-rendering:pixelated] -scale-x-100 ${demonState === 'hurt' ? 'animate-pulse' : ''}`}
              />
              <div className="absolute -top-5 left-0 right-0 flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-white bg-black/50 px-2 rounded backdrop-blur-sm uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">Demon Lord</span>
                <div className="w-[80%] md:w-full h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-300" 
                    style={{ width: `${beastHp}%` }} 
                  />
                </div>
              </div>
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
      <div className="fixed inset-0 pointer-events-none -z-0">
        <img 
          src={ASSETS.background} 
          alt="Battle Background" 
          className="w-full h-full object-cover opacity-30 [image-rendering:pixelated]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/80" />
      </div>
    </div>
  )
}
