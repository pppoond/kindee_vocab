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

export type TimeAttackState = "selecting" | "playing" | "finished"

export const TIME_OPTIONS = [30, 60, 90, 120] // seconds

export function useTimeAttackEngine() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<TimeAttackState>("selecting")
  const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ word: string, meaning: string }[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [totalTime, setTotalTime] = useState(60)

  const correctCountRef = useRef(0)
  const wrongCountRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameStateRef = useRef<TimeAttackState>("selecting")

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

  const saveSession = useCallback(async (correct: number, wrong: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("game_sessions").insert([{
      user_id: user.id,
      mode: "timeattack",
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
        alert("You need at least some words to play! Add them in the dashboard.")
        router.push("/")
      }
      return
    }

    setVocabularies(data)
    setLoading(false)
  }, [supabase, router])

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

  const handleAnswer = useCallback((answer: string) => {
    if (gameStateRef.current !== "playing" || feedback) return

    if (answer === currentWord?.meaning) {
      correctCountRef.current += 1
      setCorrectCount(correctCountRef.current)
      setFeedback({ type: "success", message: "Correct! ✅" })
    } else {
      wrongCountRef.current += 1
      setWrongCount(wrongCountRef.current)
      setWrongAnswers(prev => [...prev, { word: currentWord!.word, meaning: currentWord!.meaning }])
      setFeedback({ type: "error", message: `Wrong! → ${currentWord?.meaning}` })
    }

    setTimeout(() => {
      if (gameStateRef.current === "playing") {
        setupTurn(vocabularies)
      }
    }, 600)
  }, [feedback, currentWord, vocabularies, setupTurn])

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
    setOptions([])
    setWrongAnswers([])
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return {
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
  }
}
