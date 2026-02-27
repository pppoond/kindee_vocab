"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { ASSETS, getEnemyStats, HERO_DAMAGE, getAllAssetUrls, preloadImages } from "@/lib/game-assets"
import { useRouter } from "next/navigation"

export type Vocabulary = {
  id: string
  word: string
  meaning: string
  type: string
}

export type GameMode = "normal" | "fullvocab"
export type GameState = "playing" | "won" | "lost" | "leveling"
export type CharacterState = "idle" | "attack" | "hurt" | "win" | "lose"

export function useGameEngine(mode: GameMode) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState(1)
  const [playerHp, setPlayerHp] = useState(ASSETS.hero.maxHp)
  const [beastHp, setBeastHp] = useState(getEnemyStats(1).maxHp)
  const [beastMaxHp, setBeastMaxHp] = useState(getEnemyStats(1).maxHp)
  const [gameState, setGameState] = useState<GameState>("playing")
  const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null)
  const [heroState, setHeroState] = useState<CharacterState>("idle")
  const [demonState, setDemonState] = useState<CharacterState>("idle")
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)

  const supabase = createClient()
  const router = useRouter()

  const setupTurn = useCallback((list: Vocabulary[]) => {
    const word = list[Math.floor(Math.random() * list.length)]
    setCurrentWord(word)

    const others = list
      .filter(v => v.id !== word.id && v.word.toLowerCase() !== word.word.toLowerCase() && v.meaning !== word.meaning)
      .map(v => v.meaning)
    
    const uniqueOthers = Array.from(new Set(others))
    const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3)
    const finalOptions = [...shuffledOthers, word.meaning].sort(() => 0.5 - Math.random())
    setOptions(finalOptions)
    setFeedback(null)
  }, [])

  const saveSession = useCallback(async (result: "won" | "lost", finalLevel: number, correct: number, wrong: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("game_sessions").insert([{
      user_id: user.id,
      mode,
      level: finalLevel,
      result,
      correct_count: correct,
      wrong_count: wrong,
    }])
  }, [supabase, mode])

  const loadGame = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const query = supabase
      .from("vocabularies")
      .select("id, word, meaning, type")

    // In normal mode, only use non-memorized words
    if (mode === "normal") {
      query.eq("memorized", false)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      setLoading(false)
      if (!error && data?.length === 0) {
        alert(mode === "normal" 
          ? "You need at least some non-memorized words to play! Add them in the dashboard."
          : "You need at least some words to play! Add them in the dashboard."
        )
        router.push("/")
      }
      return
    }

    await preloadImages(getAllAssetUrls())

    setVocabularies(data)
    setupTurn(data)
    setLoading(false)
  }, [supabase, router, mode, setupTurn])

  const startNextLevel = useCallback((vocabList: Vocabulary[]) => {
    setLevel(prev => {
      const newLevel = prev + 1
      const stats = getEnemyStats(newLevel)
      setBeastHp(stats.maxHp)
      setBeastMaxHp(stats.maxHp)
      return newLevel
    })
    setPlayerHp(ASSETS.hero.maxHp)
    setGameState("playing")
    setHeroState("idle")
    setDemonState("idle")
    setFeedback(null)
    setupTurn(vocabList)
  }, [setupTurn])

  const handleAnswer = useCallback((answer: string) => {
    if (gameState !== "playing" || feedback) return

    const currentEnemyStats = getEnemyStats(level)

    if (answer === currentWord?.meaning) {
      setCorrectCount(prev => prev + 1)
      setFeedback({ type: "success", message: "Correct! You strike the beast!" })
      setHeroState("attack")

      setTimeout(() => {
        setHeroState("idle")
        setBeastHp((prev: number) => {
          const newHp = Math.max(0, prev - HERO_DAMAGE)
          if (newHp === 0) {
            // Level cleared!
            setGameState("leveling")
            setHeroState("win")
            setDemonState("lose")

            // Auto-advance after a short delay
            setTimeout(() => {
              startNextLevel(vocabularies)
            }, 2500)
          } else {
            setDemonState("hurt")
          }
          return newHp
        })
        setTimeout(() => {
          setBeastHp((currentHp: number) => {
            if (currentHp <= 0) {
              setHeroState("win")
              setDemonState("lose")
            } else {
              setDemonState("idle")
              setupTurn(vocabularies)
            }
            return currentHp
          })
        }, 1000)
      }, 500)
    } else {
      setWrongCount(prev => prev + 1)
      setFeedback({ type: "error", message: `Wrong! The correct meaning was: ${currentWord?.meaning}` })
      
      setDemonState("attack")
      setTimeout(() => {
        setPlayerHp((prev: number) => {
          const newHp = Math.max(0, prev - currentEnemyStats.damage)
          if (newHp === 0) {
            setGameState("lost")
            setHeroState("lose")
            setDemonState("win")
            // Save session on loss
            setCorrectCount(cc => {
              setWrongCount(wc => {
                saveSession("lost", level, cc, wc)
                return wc
              })
              return cc
            })
          } else {
            setHeroState("hurt")
          }
          return newHp
        })
        setTimeout(() => {
          setPlayerHp((currentHp: number) => {
            if (currentHp <= 0) {
              setHeroState("lose")
              setDemonState("win")
            } else {
              setHeroState("idle")
              setDemonState("idle")
              setupTurn(vocabularies)
            }
            return currentHp
          })
        }, 1000)
      }, 500)
    }
  }, [gameState, feedback, currentWord, vocabularies, level, setupTurn, startNextLevel, saveSession])

  const resetGame = useCallback(() => {
    setLevel(1)
    const stats = getEnemyStats(1)
    setPlayerHp(ASSETS.hero.maxHp)
    setBeastHp(stats.maxHp)
    setBeastMaxHp(stats.maxHp)
    setGameState("playing")
    setHeroState("idle")
    setDemonState("idle")
    setFeedback(null)
    setCorrectCount(0)
    setWrongCount(0)
    loadGame()
  }, [loadGame])

  return {
    // State
    vocabularies,
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
    // Actions
    loadGame,
    handleAnswer,
    resetGame,
  }
}
