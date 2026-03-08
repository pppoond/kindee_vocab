import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Volume2, ChevronDown, ChevronUp, Lightbulb, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"
import { getExampleSentences } from "@/lib/dictionary"

type WrongAnswer = { word: string; meaning: string }

export function ReviewWrongAnswers({ wrongAnswers }: { wrongAnswers: WrongAnswer[] }) {
  const [expanded, setExpanded] = useState(false)
  const [examples, setExamples] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const fetchExamples = useCallback(async (word: string) => {
    if (examples[word] || loading[word]) return

    setLoading(prev => ({ ...prev, [word]: true }))
    try {
      const sentences = await getExampleSentences(word)
      setExamples(prev => ({ ...prev, [word]: sentences }))
    } finally {
      setLoading(prev => ({ ...prev, [word]: false }))
    }
  }, [examples, loading])

  if (wrongAnswers.length === 0) return null

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
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[400px] overflow-y-auto pr-2">
          {wrongAnswers.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-lg bg-zinc-900 border border-zinc-800 p-3"
            >
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="border-red-500/30 text-red-400 shrink-0 mt-0.5 text-[10px]">
                  {idx + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm break-all">{item.word}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => speakWord(item.word)}
                        className="p-1 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => fetchExamples(item.word)}
                        className={`p-1 rounded transition-colors ${examples[item.word] ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        title="View Examples"
                        disabled={loading[item.word]}
                      >
                        {loading[item.word] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Lightbulb className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mt-1">{item.meaning}</p>
                </div>
              </div>

              {/* Examples Section */}
              {examples[item.word] && (
                <div className="mt-1 pl-7 space-y-2 animate-in slide-in-from-top-1 duration-200">
                  {examples[item.word].length > 0 ? (
                    examples[item.word].slice(0, 2).map((sentence, sIdx) => (
                      <div key={sIdx} className="group relative text-[16px] text-zinc-500 bg-black/30 p-2 rounded border-l-2 border-emerald-500/30 italic leading-relaxed pr-8">
                        "{sentence}"
                        <button
                          onClick={() => speakWord(sentence)}
                          className="absolute right-2 top-2 p-1 text-zinc-600 hover:text-white hover:bg-white/5 rounded transition-colors"
                          title="Read sentence"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-[16px] text-zinc-600 italic pl-2">No example sentences found.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
