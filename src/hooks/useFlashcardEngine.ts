"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export type Vocabulary = {
  id: string
  word: string
  meaning: string
  type: string
}

export type FlashcardMode = "selecting" | "playing" | "finished"
export type FlashcardSubMode = "normal" | "timed"

export const TIME_OPTIONS = [30, 60, 90, 120]

export function useFlashcardEngine(onAlert?: (message: string) => void) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [queue, setQueue] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<FlashcardMode>("selecting")
  const [subMode, setSubMode] = useState<FlashcardSubMode>("normal")
  const [showMeaning, setShowMeaning] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ word: string, meaning: string }[]>([])
  const [totalWords, setTotalWords] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [totalTime, setTotalTime] = useState(60)
  const [lastSwipe, setLastSwipe] = useState<"left" | "right" | null>(null)

  const correctCountRef = useRef(0)
  const wrongCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameStateRef = useRef<FlashcardMode>("selecting")

  const supabase = createClient()
  const router = useRouter()

  const nextCard = useCallback((currentQueue: Vocabulary[]) => {
    if (currentQueue.length === 0) {
      // Normal mode: all cards done
      if (gameStateRef.current === "playing") {
        setGameState("finished")
        gameStateRef.current = "finished"
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setCurrentWord(null)
      return
    }
    setCurrentWord(currentQueue[0])
    setShowMeaning(false)
    setLastSwipe(null)
  }, [])

  const loadGame = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data, error } = await supabase
      .from("vocabularies")
      .select("id, word, meaning, type")

    if (error || !data || data.length === 0) {
      setLoading(false)
      if (!error && data?.length === 0) {
        if (onAlert) onAlert("You need at least some words to play! Add them in the dashboard.")
        router.push("/")
      }
      return
    }

    setVocabularies(data)
    setLoading(false)
  }, [supabase, router])

  const saveSession = useCallback(async (correct: number, wrong: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("game_sessions").insert([{
      user_id: user.id,
      mode: "flashcard",
      level: 1,
      result: "finished",
      correct_count: correct,
      wrong_count: wrong,
    }])
  }, [supabase])

  const startGame = useCallback((mode: FlashcardSubMode, duration?: number) => {
    setSubMode(mode)
    setCorrectCount(0)
    setWrongCount(0)
    correctCountRef.current = 0
    wrongCountRef.current = 0
    setShowMeaning(false)
    setLastSwipe(null)

    // Shuffle vocabulary
    const shuffled = [...vocabularies].sort(() => 0.5 - Math.random())
    setQueue(shuffled)
    setTotalWords(shuffled.length)
    setCurrentWord(shuffled[0])
    setGameState("playing")
    gameStateRef.current = "playing"

    if (mode === "timed" && duration) {
      setTotalTime(duration)
      setTimeLeft(duration)

      if (timerRef.current) clearInterval(timerRef.current)
      let remaining = duration
      timerRef.current = setInterval(() => {
        remaining -= 1
        setTimeLeft(remaining)
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          setGameState("finished")
          gameStateRef.current = "finished"
          saveSession(correctCountRef.current, wrongCountRef.current)
        }
      }, 1000)
    }
  }, [vocabularies, saveSession])

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (gameStateRef.current !== "playing" || showMeaning) return

    setLastSwipe(direction)

    if (direction === "right") {
      // Remember
      correctCountRef.current += 1
      setCorrectCount(correctCountRef.current)
    } else {
      // Don't remember
      wrongCountRef.current += 1
      setWrongCount(wrongCountRef.current)
      setWrongAnswers(prev => [...prev, { word: currentWord!.word, meaning: currentWord!.meaning }])
    }

    // Show meaning briefly, then advance
    setShowMeaning(true)

    setTimeout(() => {
      if (gameStateRef.current !== "playing") return

      setQueue(prev => {
        const newQueue = prev.slice(1)
        if (newQueue.length === 0 && subMode === "normal") {
          setGameState("finished")
          gameStateRef.current = "finished"
          saveSession(correctCountRef.current, wrongCountRef.current)
          setCurrentWord(null)
        } else if (newQueue.length === 0 && subMode === "timed") {
          // Reshuffle for timed mode (loop)
          const reshuffled = [...vocabularies].sort(() => 0.5 - Math.random())
          setCurrentWord(reshuffled[0])
          setShowMeaning(false)
          setLastSwipe(null)
          return reshuffled
        } else {
          setCurrentWord(newQueue[0])
          setShowMeaning(false)
          setLastSwipe(null)
        }
        return newQueue
      })
    }, 1000)
  }, [showMeaning, subMode, vocabularies, saveSession])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameState("selecting")
    gameStateRef.current = "selecting"
    setCorrectCount(0)
    setWrongCount(0)
    correctCountRef.current = 0
    wrongCountRef.current = 0
    setShowMeaning(false)
    setLastSwipe(null)
    setCurrentWord(null)
    setQueue([])
    setWrongAnswers([])
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
    currentWord,
    loading,
    gameState,
    subMode,
    showMeaning,
    correctCount,
    wrongCount,
    wrongAnswers,
    totalWords,
    timeLeft,
    totalTime,
    lastSwipe,
    loadGame,
    startGame,
    handleSwipe,
    resetGame,
  }
}
