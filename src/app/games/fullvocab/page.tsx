"use client"

import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShieldAlert, Trophy, Star, BookOpen, Flame, Sparkles, UserCheck, CheckCircle2, XCircle, Crown } from "lucide-react"
import Link from "next/link"
import { SpriteSheet } from "@/components/sprite-sheet"
import { ASSETS } from "@/lib/game-assets"
import { useGameEngine } from "@/hooks/useGameEngine"
import { ReviewWrongAnswers } from "@/components/review-wrong-answers"
import { useAlert } from "@/components/alert-provider"
import { Loading } from "@/components/ui/loading"
import { AdBanner } from "@/components/ad-banner"
import { ThemeToggle } from "@/components/theme-toggle"

export default function FullVocabGame() {
  const { showAlert } = useAlert()
  const onAlert = useCallback((msg: string) => showAlert(msg, { type: "error" }), [showAlert])
  const {
    currentWord,
    options,
    loading,
    level,
    playerHp,
    playerMaxHp,
    beastHp,
    beastMaxHp,
    gameState,
    feedback,
    heroState,
    demonState,
    correctCount,
    wrongCount,
    streak,
    wrongAnswers,
    timeLeft,
    maxTime,
    heroId,
    setHeroId,
    currentHero,
    currentEnemy,
    enemyStats,
    availableHeroes,
    loadGame,
    handleAnswer,
    resetGame,
  } = useGameEngine("fullvocab", onAlert)

  useEffect(() => {
    loadGame()
  }, [loadGame])

  const timerPercent = (timeLeft / maxTime) * 100
  const timerColor = timeLeft <= 3 ? "text-red-400" : timeLeft <= 7 ? "text-amber-400" : "text-cyan-400"
  const barColor = timeLeft <= 3 ? "bg-red-500" : timeLeft <= 7 ? "bg-amber-500" : "bg-cyan-500"

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loading text="Loading game..." className="text-foreground" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Link href="/games">
            <Button variant="ghost" className="text-zinc-400 hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Back to Games</span>
            </Button>
          </Link>
          <ThemeToggle />

          {/* Hero Switcher */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border">
            {availableHeroes.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHeroId(h.id!)}
                disabled={gameState !== "playing"}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  heroId === h.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={`Class: ${h.name} (${h.title})`}
              >
                {heroId === h.id ? <UserCheck className="w-3 h-3 shrink-0" /> : null}
                <span>{h.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-purple-500/50 text-purple-400 gap-1.5 px-3 py-1 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Full Vocab</span>
          </Badge>

          {streak >= 2 && (
            <Badge variant="outline" className="border-orange-500/60 bg-orange-500/10 text-orange-400 gap-1 px-2.5 py-1 text-xs animate-bounce">
              <Flame className="h-3.5 w-3.5 fill-orange-400" />
              <span>{streak} Combo!</span>
            </Badge>
          )}

          <Badge variant="outline" className={`border-amber-500/50 text-amber-400 gap-1.5 px-3 py-1 text-sm ${enemyStats.isBoss ? 'bg-red-500/20 border-red-500 text-red-400 font-bold animate-pulse' : ''}`}>
            {enemyStats.isBoss ? <Crown className="h-3.5 w-3.5 text-amber-400" /> : <Star className="h-3.5 w-3.5 fill-amber-400" />}
            <span>{enemyStats.isBoss ? `BOSS Lv.${level}` : `Level ${level}`}</span>
          </Badge>

          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> {correctCount}</span>
            <span className="text-zinc-600">/</span>
            <span className="flex items-center gap-1 text-rose-400"><XCircle className="w-3.5 h-3.5" /> {wrongCount}</span>
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Battle Arena */}
        <div className="w-full max-w-5xl flex justify-between items-end mb-8 md:mb-14 px-6 sm:px-16 md:px-24">
          {/* Player Side */}
          <div className={`flex flex-col items-center transition-all duration-300 ${heroState.startsWith('attack') ? 'translate-x-[60px] md:translate-x-[140px] scale-110 z-20' : ''} ${heroState === 'win' ? '-translate-y-10 animate-bounce' : ''} ${heroState === 'hurt' ? 'scale-90 opacity-80 brightness-200 contrast-200 grayscale translate-x-2 -rotate-6' : ''}`}>
            <div className={`relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 flex items-end justify-center drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
              {currentHero.animations[heroState] && (
                <SpriteSheet 
                  src={currentHero.animations[heroState].src} 
                  frames={currentHero.animations[heroState].frames} 
                  fps={currentHero.animations[heroState].fps} 
                  loop={currentHero.animations[heroState].loop}
                  scale={currentHero.size / 32}
                  flip={currentHero.flip}
                  offsetY={currentHero.offsetY}
                />
              )}
              <div className="absolute -top-8 md:-top-10 left-0 right-0 flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-foreground bg-background/60 px-2 py-0.5 rounded backdrop-blur-sm uppercase tracking-widest mb-1 whitespace-nowrap">
                  {currentHero.name}
                </span>
                <div className="w-24 sm:w-32 md:w-40 h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300" 
                    style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beast Side */}
          <div className={`flex flex-col items-center transition-all duration-300 ${demonState === 'hurt' ? 'scale-90 opacity-80 brightness-200 contrast-200 grayscale -translate-x-2 rotate-6' : ''} ${demonState === 'attack' ? '-translate-x-[60px] md:-translate-x-[140px] scale-110 z-20' : ''} ${demonState === 'win' ? '-translate-y-10 animate-bounce scale-110 drop-shadow-[0_0_50px_rgba(220,38,38,0.8)]' : ''}`}>
            <div className={`relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 flex items-end justify-center ${enemyStats.isBoss ? 'drop-shadow-[0_0_35px_rgba(239,68,68,0.6)]' : 'drop-shadow-[0_0_25px_rgba(220,38,38,0.3)]'}`}>
              {currentEnemy.animations[demonState] && (
                <SpriteSheet 
                  src={currentEnemy.animations[demonState].src} 
                  frames={currentEnemy.animations[demonState].frames} 
                  fps={currentEnemy.animations[demonState].fps} 
                  loop={currentEnemy.animations[demonState].loop}
                  scale={currentEnemy.size / 32}
                  flip={currentEnemy.flip}
                  offsetY={currentEnemy.offsetY}
                  className={demonState === 'hurt' ? 'animate-pulse' : ''}
                />
              )}
              <div className="absolute -top-8 md:-top-10 left-0 right-0 flex flex-col items-center">
                <span className={`text-[10px] md:text-xs bg-background/60 px-2 py-0.5 rounded backdrop-blur-sm uppercase tracking-widest mb-1 whitespace-nowrap flex items-center gap-1 ${enemyStats.isBoss ? 'text-red-400 font-bold border border-red-500/40' : 'text-foreground'}`}>
                  {enemyStats.isBoss && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                  <span>{enemyStats.name}</span>
                </span>
                <div className="w-24 sm:w-32 md:w-40 h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div 
                    className={`h-full transition-all duration-300 ${enemyStats.isBoss ? 'bg-red-600' : 'bg-orange-600'}`} 
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
            <>
              {/* Timer Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-center mb-3">
                  <span className={`text-4xl md:text-6xl font-black tabular-nums ${timerColor} transition-colors ${timeLeft <= 3 ? 'animate-pulse' : ''}`}>
                    {timeLeft}
                  </span>
                </div>
                <div className="w-full h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className={`h-full ${barColor} transition-all duration-1000 ease-linear`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>

              <Card className="bg-card border-border shadow-2xl overflow-hidden">
                <div className="bg-primary/10 p-2 text-center border-b border-border flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-muted-foreground border-border text-[10px] md:text-xs">
                    Choose the correct meaning
                  </Badge>
                  {streak >= 3 && (
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-300 border-none font-bold">
                      <Sparkles className="w-3 h-3 mr-1 inline" /> 1.5x Crit Damage!
                    </Badge>
                  )}
                </div>
                <CardHeader className="text-center pt-4 md:pt-8 pb-2 md:pb-4 px-2 md:px-6">
                  <CardTitle className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-card-foreground mb-1 md:mb-2 break-words">
                    {currentWord?.word}
                  </CardTitle>
                  <p className="text-muted-foreground italic text-xs md:text-sm">{currentWord?.type}</p>
                </CardHeader>
                <CardContent className="p-3 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  {options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className={`h-auto min-h-[50px] py-2 md:py-4 px-3 md:px-6 flex items-start text-left border-border bg-background text-foreground hover:bg-muted transition-all text-[11px] sm:text-sm whitespace-normal ${
                        feedback ? 'pointer-events-none' : ''
                      }`}
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="text-muted-foreground mr-2 md:mr-3 font-mono shrink-0">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="break-words leading-tight md:leading-normal mt-0.5 md:mt-0">{option}</span>
                    </Button>
                  ))}
                </CardContent>
                {feedback && (
                  <div className={`p-4 text-center font-bold animate-in fade-in slide-in-from-bottom-2 ${
                    feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {feedback.message}
                  </div>
                )}
              </Card>
            </>
          ) : gameState === "leveling" ? (
            <div className="text-center animate-in zoom-in duration-500">
              <Star className="h-16 w-16 md:h-24 md:w-24 text-amber-400 mx-auto mb-4 md:mb-6 animate-spin" />
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-amber-400">
                LEVEL {level} CLEARED!
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 mb-6">Preparing Level {level + 1}...</p>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in duration-500">
              {gameState === "won" ? (
                <>
                  <Trophy className="h-16 w-16 md:h-24 md:w-24 text-yellow-500 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-4xl md:text-6xl font-black mb-4">VICTORY!</h2>
                  <p className="text-lg md:text-xl text-zinc-400 mb-6 md:mb-8">
                    The monsters have fallen, and your vocabulary is unmatched!
                  </p>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-16 w-16 md:h-24 md:w-24 text-red-600 mx-auto mb-4 md:mb-6" />
                  <h2 className="text-4xl md:text-6xl font-black mb-4">DEFEATED</h2>
                  <p className="text-lg md:text-xl text-zinc-400 mb-2">
                    You reached <span className="text-amber-400 font-bold">Level {level}</span>
                  </p>
                  <p className="text-sm text-zinc-400 mb-6 md:mb-8 flex items-center justify-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> {correctCount} correct
                    </span>
                    <span className="text-zinc-600">/</span>
                    <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                      <XCircle className="w-4 h-4" /> {wrongCount} wrong
                    </span>
                  </p>
                </>
              )}
              
              <AdBanner position="game_result" className="my-8" />

              <div className="flex gap-4 justify-center">
                <Button size="lg" className="px-8 text-lg" onClick={resetGame}>Try Again</Button>
                <Link href="/games">
                  <Button size="lg" variant="outline" className="px-8 text-lg border-border text-muted-foreground">Back</Button>
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
      </div>
    </div>
  )
}
