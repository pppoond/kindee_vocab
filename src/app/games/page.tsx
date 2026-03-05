"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Swords, BookOpen, Timer, ChevronRight, Layers, Pencil } from "lucide-react"
import Link from "next/link"
import { AdBanner } from "@/components/ad-banner"

const GAME_MODES = [
  {
    title: "Battle Mode",
    description: "สู้มอนสเตอร์ด้วยคำศัพท์ที่ยังไม่ได้จำ ตอบถูกเพื่อโจมตี ตอบผิดโดนตี!",
    href: "/games/battle",
    icon: Swords,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30 hover:border-red-500/60",
    iconColor: "text-red-400",
    badge: "RPG",
    badgeColor: "border-red-500/50 text-red-400",
  },
  {
    title: "Full Vocab",
    description: "เหมือน Battle Mode แต่ใช้คำศัพท์ทั้งหมด รวมคำที่จำได้แล้วด้วย",
    href: "/games/fullvocab",
    icon: BookOpen,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/30 hover:border-purple-500/60",
    iconColor: "text-purple-400",
    badge: "RPG",
    badgeColor: "border-purple-500/50 text-purple-400",
  },
  {
    title: "Time Attack",
    description: "ตอบคำศัพท์ให้ได้มากที่สุดภายในเวลาที่กำหนด! เลือกเวลาเองได้",
    href: "/games/timeattack",
    icon: Timer,
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
    iconColor: "text-cyan-400",
    badge: "SPEED",
    badgeColor: "border-cyan-500/50 text-cyan-400",
  },
  {
    title: "Flashcard Swipe",
    description: "เห็นคำศัพท์แล้วปัดซ้าย-ขวา ว่าจำได้หรือไม่ มีทั้งแบบปกติและจับเวลา",
    href: "/games/flashcard",
    icon: Layers,
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    iconColor: "text-emerald-400",
    badge: "SWIPE",
    badgeColor: "border-emerald-500/50 text-emerald-400",
  },
  {
    title: "Verb Master",
    description: "ท้าทายความจำกริยา 3 ช่อง! เติม V2 และ V3 ให้ถูกต้องและรวดเร็วที่สุด",
    href: "/games/verb-master",
    icon: BookOpen,
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    iconColor: "text-amber-400",
    badge: "VERB",
    badgeColor: "border-amber-500/50 text-amber-400",
  },
  {
    title: "Vocab Writing",
    description: "ท้าทายการสะกดคำ! เขียนคำศัพท์ภาษาอังกฤษจากความหมายที่ปรากฏ",
    href: "/games/vocab-writing",
    icon: Pencil,
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    iconColor: "text-emerald-400",
    badge: "WRITE",
    badgeColor: "border-emerald-500/50 text-emerald-400",
  },
]

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Title */}
      <div className="text-center pt-8 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          Choose Your Mode
        </h1>
        <p className="text-zinc-500 text-lg">เลือกโหมดที่ต้องการเล่น</p>
      </div>

      {/* Game Mode Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {GAME_MODES.map((mode) => (
          <Link key={mode.href} href={mode.href} className="group">
            <Card className={`relative bg-zinc-900 ${mode.borderColor} border-2 transition-all duration-300 h-full group-hover:scale-[1.03] group-hover:shadow-2xl overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="relative text-center pb-3 pt-8">
                <div className="mx-auto mb-4 p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 w-fit group-hover:scale-110 transition-transform duration-300">
                  <mode.icon className={`h-10 w-10 ${mode.iconColor}`} />
                </div>
                <Badge variant="outline" className={`${mode.badgeColor} text-[10px] mx-auto mb-2 w-fit`}>
                  {mode.badge}
                </Badge>
                <CardTitle className="text-xl text-white">{mode.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative text-center pb-8">
                <CardDescription className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {mode.description}
                </CardDescription>
                <div className="flex items-center justify-center text-sm text-zinc-500 group-hover:text-white transition-colors">
                  Play <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <AdBanner position="games_bottom" />
      </div>
    </div>
  )
}
