"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Volume2, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

type WrongAnswer = { word: string; meaning: string }

export function ReviewWrongAnswers({ wrongAnswers }: { wrongAnswers: WrongAnswer[] }) {
  const [expanded, setExpanded] = useState(false)

  if (wrongAnswers.length === 0) return null

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <Button
        variant="ghost"
        className="w-full text-zinc-400 hover:text-white gap-2 mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        📝 Review Wrong Answers ({wrongAnswers.length})
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {expanded && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto">
          {wrongAnswers.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg bg-zinc-900 border border-zinc-800 p-3"
            >
              <Badge variant="outline" className="border-red-500/30 text-red-400 shrink-0 mt-0.5 text-[10px]">
                {idx + 1}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm break-all">{item.word}</span>
                  <button
                    onClick={() => speakWord(item.word)}
                    className="text-zinc-500 hover:text-white transition-colors shrink-0"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-zinc-400 text-xs mt-1">{item.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
