"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Timer, Trophy, RotateCcw, Clock, Pencil, Send } from "lucide-react"
import Link from "next/link"
import { useVocabWritingEngine, TIME_OPTIONS } from "@/hooks/useVocabWritingEngine"
import { ReviewWrongAnswers } from "@/components/review-wrong-answers"
import { useAlert } from "@/components/alert-provider"
import { Loading } from "@/components/ui/loading"
import { AdBanner } from "@/components/ad-banner"

export default function VocabWritingGame() {
  const { showAlert } = useAlert()
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  const onAlert = useCallback((msg: string) => showAlert(msg, { type: "error" }), [showAlert])
  
  const {
    currentWord,
    loading,
    gameState,
    feedback,
    correctCount,
    wrongCount,
    wrongAnswers,
    timeLeft,
    totalTime,
    loadGame,
    startGame,
    handleAnswer,
    resetGame,
  } = useVocabWritingEngine(onAlert)

  useEffect(() => {
    loadGame()
  }, [loadGame])

  // Auto-focus input when word changes or game starts
  useEffect(() => {
    if (gameState === "playing" && !feedback) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [gameState, currentWord, feedback])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loading text="Loading game..." className="text-white" />
    </div>
  )

  const timerPercent = (timeLeft / totalTime) * 100
  const timerColor = timeLeft <= 10 ? "text-red-400" : timeLeft <= 20 ? "text-amber-400" : "text-emerald-400"
  const barColor = timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-amber-500" : "bg-emerald-500"

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || feedback) return
    handleAnswer(inputValue)
    setInputValue("")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/games">
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Back to Games</span>
          </Button>
        </Link>
        {gameState === "playing" && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 gap-1.5 px-3 py-1 text-sm">
              <Pencil className="h-3.5 w-3.5" />
              Vocab Writing
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
              ✅ {correctCount} / ❌ {wrongCount}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {gameState === "selecting" ? (
          /* Time Selection Screen */
          <div className="text-center animate-in fade-in duration-500 w-full max-w-lg">
            <div className="mx-auto mb-6 p-5 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 w-fit">
              <Pencil className="h-16 w-16 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Vocab Writing
            </h2>
            <p className="text-zinc-400 mb-10 text-lg ThaiFont">เลือกเวลาที่ต้องการฝึกเขียน</p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {TIME_OPTIONS.map((seconds) => (
                <Button
                  key={seconds}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 border-zinc-700 bg-zinc-900 hover:bg-emerald-950/50 hover:border-emerald-500/50 text-white transition-all duration-200"
                  onClick={() => startGame(seconds)}
                >
                  <Clock className="h-6 w-6 text-emerald-400" />
                  <span className="text-2xl font-black">{seconds}</span>
                  <span className="text-xs text-zinc-500 ThaiFont">วินาที</span>
                </Button>
              ))}
            </div>
          </div>
        ) : gameState === "playing" ? (
          /* Playing Screen */
          <div className="w-full max-w-2xl w-[95%] z-10 px-2 sm:px-0">
            {/* Timer Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-3">
                <span className={`text-5xl md:text-7xl font-black tabular-nums ${timerColor} transition-colors ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                  {timeLeft}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div
                  className={`h-full ${barColor} transition-all duration-1000 ease-linear`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
              <div className="bg-emerald-500/10 p-2 text-center border-b border-zinc-800">
                <Badge variant="outline" className="text-emerald-400 border-emerald-700/50 text-[10px] md:text-xs ThaiFont">พิมพ์คำศัพท์ภาษาอังกฤษให้ถูกต้อง</Badge>
              </div>
              <CardHeader className="text-center pt-4 md:pt-8 pb-2 md:pb-4 px-2 md:px-6">
                <p className="text-zinc-500 italic text-xs md:text-sm mb-2">{currentWord?.type}</p>
                <CardTitle className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white mb-1 md:mb-2 break-words ThaiFont">
                  {currentWord?.meaning}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <form onSubmit={onSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type the English word..."
                    className="h-12 md:h-16 text-xl md:text-2xl bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 text-center font-bold"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    disabled={!!feedback}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-12 w-12 md:h-16 md:w-16 bg-emerald-600 hover:bg-emerald-500 shrink-0"
                    disabled={!inputValue.trim() || !!feedback}
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </form>
              </CardContent>
              {feedback && (
                <div className={`p-3 text-center font-bold text-sm animate-in fade-in slide-in-from-bottom-2 ${feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {feedback.message}
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Finished Screen */
          <div className="text-center animate-in zoom-in duration-500">
            <Trophy className="h-16 w-16 md:h-24 md:w-24 text-emerald-400 mx-auto mb-4 md:mb-6" />
            <h2 className="text-4xl md:text-6xl font-black mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent uppercase">TIME'S UP!</h2>
            <p className="text-lg md:text-xl text-zinc-400 mb-1">
              {totalTime} seconds completed
            </p>
            <div className="flex items-center justify-center gap-6 mb-8 mt-4">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-green-400">{correctCount}</p>
                <p className="text-xs text-zinc-500 mt-1 ThaiFont">ถูกต้อง</p>
              </div>
              <div className="w-px h-12 bg-zinc-700" />
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-red-400">{wrongCount}</p>
                <p className="text-xs text-zinc-500 mt-1 ThaiFont">ผิด</p>
              </div>
              <div className="w-px h-12 bg-zinc-700" />
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-amber-400">
                  {correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0}%
                </p>
                <p className="text-xs text-zinc-500 mt-1 ThaiFont">ความแม่นยำ</p>
              </div>
            </div>
            
            <AdBanner position="game_result" className="my-8" />

            <div className="flex gap-4 justify-center">
              <Button size="lg" className="px-8 text-lg gap-2 bg-emerald-600 hover:bg-emerald-500" onClick={resetGame}>
                <RotateCcw className="h-5 w-5" />
                Try Again
              </Button>
              <Link href="/games">
                <Button size="lg" variant="outline" className="px-8 text-lg border-zinc-700 text-zinc-300">Back</Button>
              </Link>
            </div>
            <ReviewWrongAnswers 
                wrongAnswers={wrongAnswers.map(wa => ({ 
                    word: wa.word, 
                    meaning: `${wa.meaning} (You typed: ${wa.userTyped})` 
                }))} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
