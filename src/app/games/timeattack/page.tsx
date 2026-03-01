"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Timer, Trophy, RotateCcw, Clock } from "lucide-react"
import Link from "next/link"
import { useTimeAttackEngine, TIME_OPTIONS } from "@/hooks/useTimeAttackEngine"
import { ReviewWrongAnswers } from "@/components/review-wrong-answers"
import { useAlert } from "@/components/alert-provider"
import { Loading } from "@/components/ui/loading"
import { AdBanner } from "@/components/ad-banner"

export default function TimeAttackGame() {
  const { showAlert } = useAlert()
  const {
    currentWord,
    options,
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
  } = useTimeAttackEngine((msg) => showAlert(msg, { type: "error" }))

  useEffect(() => {
    loadGame()
  }, [loadGame])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loading text="Loading game..." className="text-white" />
    </div>
  )

  const timerPercent = (timeLeft / totalTime) * 100
  const timerColor = timeLeft <= 10 ? "text-red-400" : timeLeft <= 20 ? "text-amber-400" : "text-cyan-400"
  const barColor = timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-amber-500" : "bg-cyan-500"

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
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 gap-1.5 px-3 py-1 text-sm">
              <Timer className="h-3.5 w-3.5" />
              Time Attack
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
              <Timer className="h-16 w-16 text-cyan-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Time Attack
            </h2>
            <p className="text-zinc-400 mb-10 text-lg">เลือกเวลาที่ต้องการ</p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {TIME_OPTIONS.map((seconds) => (
                <Button
                  key={seconds}
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 border-zinc-700 bg-zinc-900 hover:bg-cyan-950/50 hover:border-cyan-500/50 text-white transition-all duration-200"
                  onClick={() => startGame(seconds)}
                >
                  <Clock className="h-6 w-6 text-cyan-400" />
                  <span className="text-2xl font-black">{seconds}</span>
                  <span className="text-xs text-zinc-500">วินาที</span>
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
              <div className="bg-cyan-500/10 p-2 text-center border-b border-zinc-800">
                <Badge variant="outline" className="text-cyan-400 border-cyan-700/50 text-[10px] md:text-xs">Choose the correct meaning</Badge>
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
                <div className={`p-3 text-center font-bold text-sm animate-in fade-in slide-in-from-bottom-2 ${feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {feedback.message}
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Finished Screen */
          <div className="text-center animate-in zoom-in duration-500">
            <Trophy className="h-16 w-16 md:h-24 md:w-24 text-cyan-400 mx-auto mb-4 md:mb-6" />
            <h2 className="text-4xl md:text-6xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">TIME'S UP!</h2>
            <p className="text-lg md:text-xl text-zinc-400 mb-1">
              {totalTime} seconds completed
            </p>
            <div className="flex items-center justify-center gap-6 mb-8 mt-4">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-green-400">{correctCount}</p>
                <p className="text-xs text-zinc-500 mt-1">Correct</p>
              </div>
              <div className="w-px h-12 bg-zinc-700" />
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-red-400">{wrongCount}</p>
                <p className="text-xs text-zinc-500 mt-1">Wrong</p>
              </div>
              <div className="w-px h-12 bg-zinc-700" />
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-amber-400">
                  {correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0}%
                </p>
                <p className="text-xs text-zinc-500 mt-1">Accuracy</p>
              </div>
            </div>
            
            <AdBanner position="game_result" className="my-8" />

            <div className="flex gap-4 justify-center">
              <Button size="lg" className="px-8 text-lg gap-2" onClick={resetGame}>
                <RotateCcw className="h-5 w-5" />
                Try Again
              </Button>
              <Link href="/games">
                <Button size="lg" variant="outline" className="px-8 text-lg border-zinc-700 text-zinc-300">Back</Button>
              </Link>
            </div>
            <ReviewWrongAnswers wrongAnswers={wrongAnswers} />
          </div>
        )}
      </div>
    </div>
  )
}
