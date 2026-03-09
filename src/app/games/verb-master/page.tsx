"use client"

import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Heart, Timer, CheckCircle2, XCircle, RefreshCw, Zap } from "lucide-react"
import Link from "next/link"
import { Loading } from "@/components/ui/loading"
import { useRouter } from "next/navigation"
import { useAlert } from "@/components/alert-provider"
import { ThemeToggle } from "@/components/theme-toggle"

type Verb = {
  id: string
  word: string
  v2: string
  v3: string
  meaning: string
}

export default function VerbMasterPage() {
  const [verbs, setVerbs] = useState<Verb[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<"prep" | "playing" | "finished">("prep")
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(15)
  const [v2Input, setV2Input] = useState("")
  const [v3Input, setV3Input] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([])
  
  const isSavedRef = useRef(false)
  const correctCountRef = useRef(0)
  const wrongCountRef = useRef(0)
  const wrongAnswersRef = useRef<string[]>([])
  
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { showAlert } = useAlert()

  const fetchVerbs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("vocabularies")
      .select("id, word, v2, v3, meaning")
      .eq("type", "Verb")
      .not("v2", "is", null)
      .not("v3", "is", null)
    
    if (!error && data) {
      // Shuffle verbs
      setVerbs(data.sort(() => Math.random() - 0.5))
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchVerbs()
  }, [fetchVerbs])

  const saveSession = useCallback(async () => {
    if (isSavedRef.current || correctCountRef.current === 0) return
    isSavedRef.current = true

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("game_sessions").insert([{
      user_id: user.id,
      mode: "verb_master",
      level: 1,
      result: lives <= 0 ? "lost" : "finished",
      correct_count: correctCountRef.current,
      wrong_count: wrongCountRef.current,
      wrong_words: Array.from(new Set(wrongAnswersRef.current)),
    }])
  }, [supabase, lives])

  useEffect(() => {
    return () => {
      saveSession()
    }
  }, [saveSession])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && gameState === "playing") {
      handleWrong()
    }
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  const handleWrong = () => {
    setFeedback("wrong")
    const newLives = lives - 1
    wrongCountRef.current += 1
    wrongAnswersRef.current.push(verbs[currentIndex].word)
    setWrongAnswers(prev => [...prev, verbs[currentIndex].word])
    setLives(newLives)
    if (newLives <= 0) {
      setGameState("finished")
      saveSession()
    } else {
      setTimeout(() => {
        setFeedback(null)
        nextQuestion()
      }, 1000)
    }
  }

  const handleCorrect = () => {
    setFeedback("correct")
    correctCountRef.current += 1
    setScore(prev => prev + 10)
    setTimeout(() => {
      setFeedback(null)
      nextQuestion()
    }, 1000)
  }

  const nextQuestion = () => {
    setV2Input("")
    setV3Input("")
    setTimeLeft(15)
    if (currentIndex + 1 < verbs.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setGameState("finished")
      saveSession()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback) return

    const currentVerb = verbs[currentIndex]
    const isCorrectV2 = v2Input.trim().toLowerCase() === currentVerb.v2.toLowerCase()
    const isCorrectV3 = v3Input.trim().toLowerCase() === currentVerb.v3.toLowerCase()

    if (isCorrectV2 && isCorrectV3) {
      handleCorrect()
    } else {
      handleWrong()
    }
  }

  const startGame = () => {
    if (verbs.length === 0) {
      showAlert("You need to add some verbs with V2 and V3 forms first!", { type: "info" })
      return
    }
    setScore(0)
    setLives(3)
    setCurrentIndex(0)
    setTimeLeft(15)
    setGameState("playing")
    isSavedRef.current = false
    correctCountRef.current = 0
    wrongCountRef.current = 0
    wrongAnswersRef.current = []
    setWrongAnswers([])
  }

  if (loading) return <Loading className="min-h-screen text-foreground" />

  if (gameState === "prep") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-md w-full text-center space-y-8">
          <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 inline-block mb-4">
            <Trophy className="h-16 w-16 text-amber-400 mx-auto" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
            Verb Master
          </h1>
          <p className="text-muted-foreground text-sm ThaiFont">
            คุณมีเวลา 15 วินาทีต่อคำ และมี 3 ชีวิต
          </p>
          
          <Card className="bg-card border-border p-6 text-left">
            <h3 className="font-bold mb-4 text-zinc-300">ความพร้อม</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">คำศัพท์กริยาที่มีกริยา 3 ช่อง</span>
                <span className="font-mono text-amber-400">{verbs.length} คำ</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.min(100, (verbs.length / 10) * 100)}%` }} />
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button size="lg" className="h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-black" onClick={startGame}>
              Start Game
            </Button>
            <Button variant="ghost" className="text-muted-foreground" asChild>
              <Link href="/games">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Games
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="space-y-8 max-w-sm w-full">
          <div className="relative">
            <Trophy className="h-24 w-24 text-amber-400 mx-auto animate-bounce" />
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black">Game Over!</h2>
            <p className="text-zinc-500 text-xl font-medium uppercase tracking-widest">Final Score</p>
            <div className="text-6xl font-black text-amber-400 tabular-nums">
              {score}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
              <div className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-tight">Questions</div>
              <div className="text-2xl font-bold">{currentIndex + 1}</div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
              <div className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-tight">Accuracy</div>
              <div className="text-2xl font-bold">{Math.round((score / 10 / (currentIndex + 1)) * 100)}%</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button size="lg" className="h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-black" onClick={startGame}>
              <RefreshCw className="h-5 w-5 mr-2" /> Play Again
            </Button>
            <Button variant="ghost" className="text-zinc-400 h-14" asChild>
              <Link href="/games">
                Go back to Games
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentVerb = verbs[currentIndex]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      {/* HUD */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Score</div>
            <div className="text-2xl font-black text-amber-400 tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Question</div>
            <div className="text-2xl font-black tabular-nums">{currentIndex + 1}<span className="text-zinc-700 text-lg">/{verbs.length}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`h-6 w-6 ${i < lives ? "fill-red-500 text-red-500 animate-pulse" : "text-zinc-800"}`} />
            ))}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-colors ${timeLeft < 5 ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-border bg-card"}`}>
            <Timer className={`h-5 w-5 ${timeLeft < 5 ? "animate-spin" : ""}`} />
            <span className="text-xl font-black tabular-nums">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-20">
        <Card className={`w-full bg-card border-2 transition-all duration-300 ${feedback === "correct" ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : feedback === "wrong" ? "border-red-500 animate-shake shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "border-border"}`}>
          <CardHeader className="text-center space-y-4 pt-10">
            <Badge variant="outline" className="text-muted-foreground border-border px-3 py-1">Verb 1 (Present)</Badge>
            <CardTitle className="text-6xl font-black tracking-tighter text-card-foreground">{currentVerb?.word}</CardTitle>
            <CardDescription className="text-xl text-zinc-400 font-bold">{currentVerb?.meaning}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-12 px-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs uppercase font-black tracking-widest text-zinc-500 ml-1">V2 (Past Simple)</label>
                  <Input 
                    value={v2Input}
                    onChange={e => setV2Input(e.target.value)}
                    className="h-16 text-2xl font-bold bg-zinc-800 border-none focus-visible:ring-amber-500 text-center"
                    placeholder="..."
                    autoFocus
                    disabled={!!feedback}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase font-black tracking-widest text-zinc-500 ml-1">V3 (Past Participle)</label>
                  <Input 
                    value={v3Input}
                    onChange={e => setV3Input(e.target.value)}
                    className="h-16 text-2xl font-bold bg-zinc-800 border-none focus-visible:ring-amber-500 text-center"
                    placeholder="..."
                    disabled={!!feedback}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-16 text-xl font-black bg-amber-500 hover:bg-amber-600 text-black shadow-xl" disabled={!!feedback}>
                <Zap className="h-6 w-6 mr-2 fill-current" /> Submit Answer
              </Button>
            </form>
          </CardContent>

          {/* Feedback Overlays */}
          {feedback === "correct" && (
            <div className="absolute inset-0 bg-emerald-500/10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
              <CheckCircle2 className="h-24 w-24 text-emerald-500 mb-2" />
              <div className="text-3xl font-black text-emerald-500 uppercase tracking-widest underline decoration-wavy">Correct!</div>
            </div>
          )}
          {feedback === "wrong" && (
            <div className="absolute inset-0 bg-red-500/10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
              <XCircle className="h-24 w-24 text-red-500 mb-2" />
              <div className="text-3xl font-black text-red-500 uppercase tracking-widest underline decoration-wavy">Wrong!</div>
              <div className="mt-4 text-zinc-300 font-bold text-lg">
                Answer: <span className="text-white">{currentVerb.v2} • {currentVerb.v3}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  )
}
