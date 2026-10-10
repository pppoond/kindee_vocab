"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  ASSETS, 
  HEROES, 
  ENEMIES, 
  getEnemyStats, 
  HERO_DAMAGE, 
  getAllAssetUrls, 
  preloadImages,
  CharacterData,
  EnemyStatConfig 
} from "@/lib/game-assets"
import { useRouter } from "next/navigation"

export type Vocabulary = {
  id: string
  word: string
  meaning: string
  type: string
}

export type GameMode = "normal" | "fullvocab" | "oxford3000"
export type GameState = "playing" | "won" | "lost" | "leveling"
export type CharacterState = "idle" | "attack" | "attack2" | "attack3" | "hurt" | "win" | "lose"

export function useGameEngine(mode: GameMode, onAlert?: (message: string) => void) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState(1)
  
  // Hero selection
  const [heroId, setHeroIdState] = useState<string>("knight")
  const currentHero = useMemo(() => HEROES[heroId] || HEROES.knight, [heroId])
  const heroRef = useRef(currentHero)
  heroRef.current = currentHero

  const initialEnemy = useMemo(() => getEnemyStats(1), [])
  const [playerHp, setPlayerHp] = useState(currentHero.maxHp)
  const [beastHp, setBeastHp] = useState(initialEnemy.maxHp)
  const [beastMaxHp, setBeastMaxHp] = useState(initialEnemy.maxHp)
  const [gameState, setGameState] = useState<GameState>("playing")
  const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null)
  const [heroState, setHeroState] = useState<CharacterState>("idle")
  const [demonState, setDemonState] = useState<CharacterState>("idle")
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ word: string, meaning: string }[]>([])
  const [timeLeft, setTimeLeft] = useState(15)
  const [maxTime, setMaxTime] = useState(15)

  // Current Enemy info
  const enemyStats: EnemyStatConfig = useMemo(() => getEnemyStats(level), [level])
  const currentEnemy: CharacterData = enemyStats.enemyData

  // Refs to track actual HP values for side-effect logic
  const beastHpRef = useRef(initialEnemy.maxHp)
  const playerHpRef = useRef(currentHero.maxHp)
  const correctCountRef = useRef(0)
  const wrongCountRef = useRef(0)
  const streakRef = useRef(0)
  const levelCorrectCountRef = useRef(0)
  const levelWrongCountRef = useRef(0)
  const timeLeftRef = useRef(15)
  const wrongAnswersRef = useRef<string[]>([])
  const levelWrongAnswersRef = useRef<string[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isSavedRef = useRef(false)
  const sessionIdRef = useRef<string | null>(null)
  const sessionDataRef = useRef({ level: 1, correct: 0, wrong: 0, wrongWords: [] as any[], result: "playing" as "won" | "lost" | "finished" | "playing" })

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const setHeroId = useCallback((id: string) => {
    if (HEROES[id]) {
      setHeroIdState(id)
      const selected = HEROES[id]
      playerHpRef.current = selected.maxHp
      setPlayerHp(selected.maxHp)
    }
  }, [])

  const setupTurn = useCallback((list: Vocabulary[], currentLevel: number) => {
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

    const calculatedMaxTime = Math.max(5, 15 - (currentLevel - 1))
    setMaxTime(calculatedMaxTime)
    setTimeLeft(calculatedMaxTime)
    timeLeftRef.current = calculatedMaxTime
  }, [])

  const saveSession = useCallback(async (result: "won" | "lost" | "finished" | "playing", finalLevel: number, correct: number, wrong: number, wrongWords: any[] = []) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    console.log("Saving session (Batched):", { result, finalLevel, correct, wrong, wrongWords, sessionId: sessionIdRef.current })
    
    if (sessionIdRef.current) {
      const { error } = await supabase.from("game_sessions").update({
        level: finalLevel,
        result,
        correct_count: correct,
        wrong_count: wrong,
        wrong_words: wrongWords,
      }).eq("id", sessionIdRef.current)

      if (error) {
        console.error("Error updating session:", error)
        if (onAlert) onAlert("Failed to update session statistics.")
      }
    } else {
      const { data, error } = await supabase.from("game_sessions").insert([{
        user_id: user.id,
        mode,
        level: finalLevel,
        result,
        correct_count: correct,
        wrong_count: wrong,
        wrong_words: wrongWords,
      }]).select().single()

      if (data) {
        sessionIdRef.current = data.id
      }
      if (error) {
        console.error("Error saving session:", error)
        if (onAlert) onAlert("Failed to save session statistics.")
      }
    }
  }, [supabase, mode, onAlert])

  const loadGame = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    let data;
    let error;

    if (mode === "oxford3000") {
      const res = await supabase
        .from("public_word_bank")
        .select("id, word, meaning, type")
        .eq("category", "oxford3000")
        .limit(1000)
      data = res.data
      error = res.error
    } else {
      if (!user) {
        const res = await supabase
          .from("public_word_bank")
          .select("id, word, meaning, type")
          .limit(200)
        data = res.data
        error = res.error
      } else {
        const query = supabase
          .from("vocabularies")
          .select("id, word, meaning, type")

        if (mode === "normal") {
          query.eq("memorized", false)
        }
        const res = await query
        data = res.data
        error = res.error
      }
    }

    if (error || !data || data.length === 0) {
      setLoading(false)
      if (!error && data?.length === 0) {
        const msg = mode === "normal" 
          ? "You need at least some non-memorized words to play! Add them in the dashboard."
          : "You need at least some words to play! Add them in the dashboard."
        if (onAlert) onAlert(msg)
        router.push(user ? "/dashboard" : "/")
      }
      return
    }

    await preloadImages(getAllAssetUrls())

    setVocabularies(data)
    setupTurn(data, 1) // Initial level is 1
    setLoading(false)
    
    // Insert initial session immediately on game start
    saveSession("playing", 1, 0, 0, [])
  }, [supabase, router, mode, setupTurn, saveSession, onAlert])

  const startNextLevel = useCallback((vocabList: Vocabulary[]) => {
    levelCorrectCountRef.current = 0
    levelWrongCountRef.current = 0
    levelWrongAnswersRef.current = []
    isSavedRef.current = false

    setLevel(prev => {
      const newLevel = prev + 1
      const nextStats = getEnemyStats(newLevel)
      beastHpRef.current = nextStats.maxHp
      setBeastHp(nextStats.maxHp)
      setBeastMaxHp(nextStats.maxHp)
      return newLevel
    })

    const hero = heroRef.current
    playerHpRef.current = hero.maxHp
    setPlayerHp(hero.maxHp)
    setGameState("playing")
    setHeroState("idle")
    setDemonState("idle")
    setFeedback(null)
    const newLevel = level + 1
    setupTurn(vocabList, newLevel)
  }, [setupTurn, level])

  const handleAnswer = useCallback((answer: string) => {
    if (gameState !== "playing" || feedback || !currentWord) return

    const currentEnemyStats = getEnemyStats(level)
    const hero = heroRef.current
    const baseDamage = hero.damage || HERO_DAMAGE

    if (answer === currentWord?.meaning) {
      correctCountRef.current += 1
      levelCorrectCountRef.current += 1
      streakRef.current += 1
      setCorrectCount(correctCountRef.current)
      setStreak(streakRef.current)

      // Combo scaling
      const isCritical = streakRef.current >= 3
      const damageMultiplier = isCritical ? 1.5 : 1
      const finalHeroDamage = Math.round(baseDamage * damageMultiplier)

      // Determine hero attack animation
      let attackAnim: CharacterState = "attack"
      if (streakRef.current >= 4 && hero.animations.attack3) {
        attackAnim = "attack3"
      } else if (streakRef.current >= 2 && hero.animations.attack2) {
        attackAnim = "attack2"
      }

      setFeedback({ 
        type: "success", 
        message: isCritical 
          ? `COMBO x${streakRef.current}! Critical Strike dealt ${finalHeroDamage} dmg!` 
          : `Correct! You strike ${currentEnemyStats.enemyData.name} for ${finalHeroDamage} dmg!` 
      })
      setHeroState(attackAnim)

      setTimeout(() => {
        setHeroState("idle")
        const newBeastHp = Math.max(0, beastHpRef.current - finalHeroDamage)
        beastHpRef.current = newBeastHp
        setBeastHp(newBeastHp)

        if (newBeastHp === 0) {
          // Level cleared!
          setGameState("leveling")
          setHeroState("win")
          setDemonState("lose")

          sessionDataRef.current = { 
            level: level + 1, 
            correct: correctCountRef.current, 
            wrong: wrongCountRef.current, 
            wrongWords: Array.from(new Set(wrongAnswersRef.current)),
            result: "finished" 
          }
          saveSession("finished", level, correctCountRef.current, wrongCountRef.current, Array.from(new Set(wrongAnswersRef.current)))

          // Auto-advance after a short delay
          setTimeout(() => {
            startNextLevel(vocabularies)
          }, 2500)
        } else {
          setDemonState("hurt")
          setTimeout(() => {
            setDemonState("idle")
            setupTurn(vocabularies, level)
          }, 1000)
        }
      }, 500)
    } else {
      wrongCountRef.current += 1
      levelWrongCountRef.current += 1
      streakRef.current = 0
      setStreak(0)
      setWrongCount(wrongCountRef.current)
      wrongAnswersRef.current.push(currentWord!.word)
      levelWrongAnswersRef.current.push(currentWord!.word)
      setWrongAnswers(prev => [...prev, { word: currentWord!.word, meaning: currentWord!.meaning }])
      setFeedback({ type: "error", message: `Wrong! The correct meaning was: ${currentWord?.meaning}` })
      
      setDemonState("attack")
      setTimeout(() => {
        const newPlayerHp = Math.max(0, playerHpRef.current - currentEnemyStats.damage)
        playerHpRef.current = newPlayerHp
        setPlayerHp(newPlayerHp)

        if (newPlayerHp === 0) {
          setGameState("lost")
          setHeroState("lose")
          setDemonState("win")
          
          const finalWrongWords = Array.from(new Set(wrongAnswersRef.current))
          sessionDataRef.current = { 
            level, 
            correct: correctCountRef.current, 
            wrong: wrongCountRef.current, 
            wrongWords: finalWrongWords,
            result: "lost" 
          }
          saveSession("lost", level, correctCountRef.current, wrongCountRef.current, finalWrongWords)
        } else {
          setHeroState("hurt")
          setTimeout(() => {
            setHeroState("idle")
            setDemonState("idle")
            setupTurn(vocabularies, level)
          }, 1000)
        }
      }, 500)
    }
  }, [gameState, feedback, currentWord, vocabularies, level, setupTurn, startNextLevel, saveSession])

  // Timer Effect
  useEffect(() => {
    if (gameState !== "playing" || feedback || loading) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1)
        timeLeftRef.current = next
        if (next === 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleAnswer("") // Timeout
        }
        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, feedback, loading, handleAnswer])

  // Save on cleanup if not saved yet
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        const { result, level: finalLevel } = sessionDataRef.current
        const finalWrongWords = Array.from(new Set(wrongAnswersRef.current))
        saveSession(result, finalLevel, correctCountRef.current, wrongCountRef.current, finalWrongWords)
      }
    }
  }, [saveSession])

  const resetGame = useCallback(() => {
    setLevel(1)
    const hero = heroRef.current
    const stats = getEnemyStats(1)
    beastHpRef.current = stats.maxHp
    playerHpRef.current = hero.maxHp
    correctCountRef.current = 0
    wrongCountRef.current = 0
    streakRef.current = 0
    levelCorrectCountRef.current = 0
    levelWrongCountRef.current = 0
    setPlayerHp(hero.maxHp)
    setBeastHp(stats.maxHp)
    setBeastMaxHp(stats.maxHp)
    setGameState("playing")
    setHeroState("idle")
    setDemonState("idle")
    setFeedback(null)
    setCorrectCount(0)
    setWrongCount(0)
    setStreak(0)
    setWrongAnswers([])
    setTimeLeft(15)
    setMaxTime(15)
    timeLeftRef.current = 15
    isSavedRef.current = false
    sessionIdRef.current = null
    wrongAnswersRef.current = []
    levelWrongAnswersRef.current = []
    sessionDataRef.current = { level: 1, correct: 0, wrong: 0, wrongWords: [], result: "playing" }
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
    playerMaxHp: currentHero.maxHp,
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
    // Character & Enemy
    heroId,
    setHeroId,
    currentHero,
    currentEnemy,
    enemyStats,
    availableHeroes: Object.values(HEROES),
    // Actions
    loadGame,
    handleAnswer,
    resetGame,
  }
}
