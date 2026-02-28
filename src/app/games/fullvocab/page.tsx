"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShieldAlert, Trophy, Star, BookOpen } from "lucide-react"
import Link from "next/link"
import { SpriteSheet } from "@/components/sprite-sheet"
import { ASSETS, getEnemyStats } from "@/lib/game-assets"
import { useGameEngine } from "@/hooks/useGameEngine"
import { ReviewWrongAnswers } from "@/components/review-wrong-answers"
import { useAlert } from "@/components/alert-provider"

export default function FullVocabGame() {
  const { showAlert } = useAlert()
  const {
    currentWord,
    options,
    loading,
    level,
    playerHp,
    beastHp,
    beastMaxHp,
    gameState,
    feedback,
    heroState,
    demonState,
    correctCount,
    wrongCount,
    wrongAnswers,
    loadGame,
    handleAnswer,
    resetGame,
  } = useGameEngine("fullvocab", (msg) => showAlert(msg, { type: "error" }))

  useEffect(() => {
    loadGame()
  }, [loadGame])

  const enemyStats = getEnemyStats(level)

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Loading game...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/games">
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Back to Games</span>
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-purple-500/50 text-purple-400 gap-1.5 px-3 py-1 text-sm">
            <BookOpen className="h-3.5 w-3.5" />
            Full Vocab
          </Badge>
          <Badge variant="outline" className="border-amber-500/50 text-amber-400 gap-1.5 px-3 py-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            Level {level}
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
            ✅ {correctCount} / ❌ {wrongCount}
          </Badge>
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
                <span className="text-[10px] md:text-xs text-white bg-black/50 px-2 rounded backdrop-blur-sm uppercase tracking-widest mb-0.5 md:mb-1 whitespace-nowrap">{enemyStats.name}</span>
                <div className="w-[80%] md:w-full h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-300" 
                    style={{ width: `${(beastHp / beastMaxHp) * 100}%` }} 
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
              <div className="bg-purple-500/10 p-2 text-center border-b border-zinc-800">
                <Badge variant="outline" className="text-purple-400 border-purple-700/50 text-[10px] md:text-xs">Full Vocab Mode — Choose the correct meaning</Badge>
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
          ) : gameState === "leveling" ? (
            <div className="text-center animate-in zoom-in duration-500">
              <Star className="h-16 w-16 md:h-24 md:w-24 text-amber-400 mx-auto mb-4 md:mb-6 animate-spin" />
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-amber-400">LEVEL {level} CLEARED!</h2>
              <p className="text-lg md:text-xl text-zinc-400 mb-6">Preparing Level {level + 1}...</p>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in duration-500">
              {gameState === "won" ? (
                <>
                  <Trophy className="h-16 w-16 md:h-24 md:w-24 text-yellow-500 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-4xl md:text-6xl font-black mb-4">VICTORY!</h2>
                  <p className="text-lg md:text-xl text-zinc-400 mb-6 md:mb-8">You've mastered all your vocabulary!</p>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-16 w-16 md:h-24 md:w-24 text-red-600 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-4xl md:text-6xl font-black mb-4">DEFEATED</h2>
                  <p className="text-lg md:text-xl text-zinc-400 mb-2">You reached <span className="text-amber-400 font-bold">Level {level}</span></p>
                  <p className="text-sm text-zinc-500 mb-6 md:mb-8">✅ {correctCount} correct / ❌ {wrongCount} wrong</p>
                </>
              )}
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="px-8 text-lg" onClick={resetGame}>Try Again</Button>
                <Link href="/games">
                  <Button size="lg" variant="outline" className="px-8 text-lg border-zinc-700 text-zinc-300">Back</Button>
                </Link>
              </div>
              <ReviewWrongAnswers wrongAnswers={wrongAnswers} />
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
