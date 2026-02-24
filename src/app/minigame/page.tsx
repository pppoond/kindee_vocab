"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, ShieldAlert, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type AnimationConfig = {
  src: string;
  frames: number;
  fps: number;
  loop: boolean;
}

type CharacterData = {
  size: number;
  flip?: boolean;
  name: string;
  maxHp: number;
  animations: Record<string, AnimationConfig>;
}

const ASSETS: Record<string, any> = {
  hero: {
    size: 32, // source sprite size: 32x32 px
    flip: false, // facing right
    name: "Hero",
    maxHp: 100,
    animations: {
      idle:   { src: "/assets/characters/knight/IDLE.png", frames: 7, fps: 8, loop: true },
      attack: { src: "/assets/characters/knight/ATTACK_1.png", frames: 6, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/knight/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/knight/IDLE.png", frames: 7, fps: 8, loop: true },
      lose:   { src: "/assets/characters/knight/DEATH.png", frames: 12, fps: 8, loop: false },
    }
  },
  demon: {
    size: 32, // source sprite size: 64x64 px
    flip: false, // facing left towards hero
    name: "Flying Demon",
    maxHp: 100,
    animations: {
      idle:   { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      flying: { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      attack: { src: "/assets/characters/flying_demon/ATTACK.png", frames: 8, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/flying_demon/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true }, // Using idle as win state for now
      lose:   { src: "/assets/characters/flying_demon/DEATH.png", frames: 7, fps: 8, loop: false },
    }
  },
  background: "/assets/backgrounds/forest.jpg", // Fantasy-like forest background
}

type Vocabulary = {
  id: string
  word: string
  meaning: string
  type: string
}

const SpriteSheet = ({ 
  src, 
  frames, 
  fps = 10, 
  loop = true,
  delay = 0,
  className = "",
  scale = 1,
  flip = false
}: { 
  src: string, 
  frames: number, 
  fps?: number, 
  loop?: boolean,
  delay?: number,
  className?: string,
  scale?: number,
  flip?: boolean
}) => {
  const duration = loop ? frames / fps : (frames - 1) / fps;
  const animationName = `slide-sprite-${frames}-${src.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <div 
      className={`overflow-hidden absolute bottom-0 left-[50%] -translate-x-[50%] pointer-events-none ${className}`}
      style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
    >
      <style>{`
        @keyframes ${animationName} {
          to { transform: translateX(-${((frames - 1) / frames) * 100}%); }
        }
      `}</style>
      <img 
        key={src}
        src={src} 
        alt="sprite" 
        className={`max-w-none h-full absolute top-0 left-0 [image-rendering:pixelated] ${flip ? '-scale-x-100' : ''}`}
        style={{
          width: `${frames * 100}%`,
          animation: `${animationName} ${duration}s steps(${frames - 1}, end) ${delay}s ${loop ? 'infinite' : '1 forwards'}`
        }} 
      />
    </div>
  )
}

export default function MiniGame() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [playerHp, setPlayerHp] = useState(ASSETS.hero.maxHp)
  const [beastHp, setBeastHp] = useState(ASSETS.demon.maxHp)
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null)
  const [heroState, setHeroState] = useState<"idle" | "attack" | "hurt" | "win" | "lose">("idle")
  const [demonState, setDemonState] = useState<"idle" | "attack" | "hurt" | "win" | "lose">("idle")

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
      // Attack animation is 6 frames at 12fps = 0.5s duration. 
      // Waiting exactly 0.5s for the attack animation to finish, then hurt the demon.
      setTimeout(() => {
        setHeroState("idle") // Return to idle right after striking
        setBeastHp((prev: number) => {
          const newHp = Math.max(0, prev - 25)
          if (newHp === 0) {
            setGameState("won")
            setHeroState("win")
            setDemonState("lose")
          } else {
            setDemonState("hurt")
          }
          return newHp
        })
        setTimeout(() => {
          if (beastHp - 25 <= 0) {
             setHeroState("win") // Persist win state
             setDemonState("lose")
          } else {
             setDemonState("idle")
             setupTurn(vocabularies)
          }
        }, 1000)
      }, 500) // Attack finishes at 500ms
    } else {
      setFeedback({ type: "error", message: `Wrong! The correct meaning was: ${currentWord?.meaning}` })
      
      setDemonState("attack")
      setTimeout(() => {
        setPlayerHp((prev: number) => {
          const newHp = Math.max(0, prev - 20)
          if (newHp === 0) {
            setGameState("lost")
            setHeroState("lose")
            setDemonState("win")
          } else {
            setHeroState("hurt")
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
    setPlayerHp(ASSETS.hero.maxHp)
    setBeastHp(ASSETS.demon.maxHp)
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
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Battle Arena */}
        <div className="w-full max-w-4xl grid grid-cols-2 gap-2 md:gap-8 items-center mb-6 md:mb-12 px-2 sm:px-0">
          {/* Player Side */}
          <div className={`flex flex-col items-center transition-all duration-300 ${heroState === 'attack' ? 'translate-x-[40%] md:translate-x-[80%] scale-110 z-20' : ''} ${heroState === 'win' ? '-translate-y-10 animate-bounce' : ''} ${heroState === 'hurt' ? 'scale-90 opacity-80 brightness-200 contrast-200 grayscale translate-x-2 -rotate-6' : ''}`}>
            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-end justify-center drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
              {ASSETS.hero.animations[heroState] && (
                <SpriteSheet 
                  src={ASSETS.hero.animations[heroState].src} 
                  frames={ASSETS.hero.animations[heroState].frames} 
                  fps={ASSETS.hero.animations[heroState].fps} 
                  loop={ASSETS.hero.animations[heroState].loop}
                  scale={ASSETS.hero.size / 32}
                  flip={ASSETS.hero.flip}
                />
              )}
              <div className="absolute -top-5 left-0 right-0 flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-white bg-black/50 px-2 rounded backdrop-blur-sm uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">{ASSETS.hero.name}</span>
                <div className="w-[80%] md:w-full h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300" 
                    style={{ width: `${(playerHp / ASSETS.hero.maxHp) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beast Side */}
          <div className={`flex flex-col items-center transition-all duration-300 ${demonState === 'hurt' ? 'scale-90 opacity-80 brightness-200 contrast-200 grayscale -translate-x-2 rotate-6' : ''} ${demonState === 'attack' ? '-translate-x-[40%] md:-translate-x-[80%] scale-110 z-20' : ''} ${demonState === 'win' ? '-translate-y-10 animate-bounce scale-110 drop-shadow-[0_0_50px_rgba(220,38,38,0.8)]' : ''}`}>
            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-end justify-center drop-shadow-[0_0_25px_rgba(220,38,38,0.3)]`}>
              {ASSETS.demon.animations[demonState] && (
                <SpriteSheet 
                  src={ASSETS.demon.animations[demonState].src} 
                  frames={ASSETS.demon.animations[demonState].frames} 
                  fps={ASSETS.demon.animations[demonState].fps} 
                  loop={ASSETS.demon.animations[demonState].loop}
                  scale={ASSETS.demon.size / 32}
                  flip={ASSETS.demon.flip}
                  className={demonState === 'hurt' ? 'animate-pulse' : ''}
                />
              )}
              <div className="absolute -top-5 left-0 right-0 flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-white bg-black/50 px-2 rounded backdrop-blur-sm uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">{ASSETS.demon.name}</span>
                <div className="w-[80%] md:w-full h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-300" 
                    style={{ width: `${(beastHp / ASSETS.demon.maxHp) * 100}%` }} 
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
