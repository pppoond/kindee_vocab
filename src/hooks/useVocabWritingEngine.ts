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

export type VocabWritingState = "selecting" | "playing" | "finished"

export const TIME_OPTIONS = [30, 60, 90, 120] // seconds

export function useVocabWritingEngine(onAlert?: (message: string) => void) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<VocabWritingState>("selecting")
  const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ word: string, meaning: string, userTyped: string }[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [totalTime, setTotalTime] = useState(60)

  const correctCountRef = useRef(0)
  const wrongCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameStateRef = useRef<VocabWritingState>("selecting")
  const isSavedRef = useRef(false)

  const supabase = createClient()
  const router = useRouter()

  const setupTurn = useCallback((list: Vocabulary[]) => {
    if (list.length === 0) return
    const word = list[Math.floor(Math.random() * list.length)]
    setCurrentWord(word)
    setFeedback(null)
  }, [])

  const saveSession = useCallback(async (correct: number, wrong: number) => {
    if (isSavedRef.current) return
    isSavedRef.current = true

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("game_sessions").insert([{
      user_id: user.id,
      mode: "vocab_writing",
      level: 1,
      result: "finished",
      correct_count: correct,
      wrong_count: wrong,
    }])
  }, [supabase])

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
  }, [supabase, router, onAlert])

  const startGame = useCallback((duration: number) => {
    setTotalTime(duration)
    setTimeLeft(duration)
    setCorrectCount(0)
    setWrongCount(0)
    correctCountRef.current = 0
    wrongCountRef.current = 0
    setGameState("playing")
    gameStateRef.current = "playing"
    setFeedback(null)
    setWrongAnswers([])

    if (vocabularies.length > 0) {
      setupTurn(vocabularies)
    }

    // Start countdown
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
  }, [vocabularies, setupTurn, saveSession])

  const handleAnswer = useCallback((typedWord: string) => {
    if (gameStateRef.current !== "playing" || feedback || !currentWord) return

    const normalizedTyped = typedWord.trim().toLowerCase()
    const normalizedTarget = currentWord.word.trim().toLowerCase()

    if (normalizedTyped === normalizedTarget) {
      correctCountRef.current += 1
      setCorrectCount(correctCountRef.current)
      setFeedback({ type: "success", message: "Correct! ✅" })
    } else {
      wrongCountRef.current += 1
      setWrongCount(wrongCountRef.current)
      setWrongAnswers(prev => [...prev, { 
        word: currentWord.word, 
        meaning: currentWord.meaning,
        userTyped: typedWord 
      }])
      setFeedback({ type: "error", message: `Wrong! → ${currentWord.word}` })
    }

    setTimeout(() => {
      if (gameStateRef.current === "playing") {
        setupTurn(vocabularies)
      }
    }, 1000)
  }, [feedback, currentWord, vocabularies, setupTurn])

  // Cleanup/Save on exit
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (!isSavedRef.current && correctCountRef.current > 0) {
        saveSession(correctCountRef.current, wrongCountRef.current)
      }
    }
  }, [saveSession])

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameState("selecting")
    gameStateRef.current = "selecting"
    setCorrectCount(0)
    setWrongCount(0)
    correctCountRef.current = 0
    wrongCountRef.current = 0
    setFeedback(null)
    setCurrentWord(null)
    setWrongAnswers([])
    isSavedRef.current = false
  }, [])

  return {
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
  }
}
