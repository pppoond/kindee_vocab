"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Heart, Share2, Copy, Check } from "lucide-react"
import Link from "next/link"
import { Loading } from "@/components/ui/loading"

export default function DonatePage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Fetch User
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch Settings
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value")
      
      if (!error && data) {
        const settingsMap = data.reduce((acc, item) => ({
          ...acc,
          [item.key]: item.value
        }), {})
        setSettings(settingsMap)
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loading text="Loading..." className="text-white" />
    </div>
  )

  const promptpayId = settings.promptpay_id || "ระบุเบอร์โทรศัพท์/เลขบัตรในระบบ"
  const message = settings.donation_message || "ขอบคุณที่ร่วมเป็นส่วนหนึ่งในการสนับสนุนการพัฒนาแอปพลิเคชันของเราครับ ทุกการสนับสนุนมีความหมายมาก!"
  
  // PromptPay QR generating URL (Example using a common open service or placeholder)
  // Ref: https://promptpay.io/
  const qrUrl = `https://promptpay.io/${promptpayId}.png`

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-rose-500/30">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <Link href={user ? "/dashboard" : "/"}>
          <Button variant="ghost" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> {user ? "Back to Dashboard" : "Back to Home"}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="hidden sm:block">Support Developer</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
        <div className="mb-8 animate-in fade-in zoom-in duration-1000">
          <img 
            src="/assets/pages/thanks/001.png" 
            alt="Thank You" 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto object-contain drop-shadow-[0_0_20px_rgba(225,29,72,0.3)]"
          />
        </div>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Support Our Project
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* PromptPay Section */}
          <Card className="bg-zinc-900 border-zinc-800 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
            <CardHeader className="text-center pb-2">
              <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 border-4 border-zinc-800">
                {/* QR Code Placeholder/Generator */}
                <img 
                  src={qrUrl} 
                  alt="PromptPay QR Code" 
                  className="w-48 h-48 md:w-56 md:h-56"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x400/000000/FFFFFF?text=PromptPay+QR"
                  }}
                />
              </div>
              <CardTitle className="text-2xl font-black text-white">PromptPay</CardTitle>
              <CardDescription className="text-zinc-500">Scan to donate any amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex items-center justify-between mb-4 group hover:border-zinc-700 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">PromptPay ID</span>
                  <span className="text-lg font-mono text-white mt-1 tracking-wider">{promptpayId}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-zinc-500 hover:text-white"
                  onClick={() => copyToClipboard(promptpayId)}
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-xs text-center text-zinc-600 italic">
                *ยอดเงินทั้งหมดจะถูกนำไปใช้เป็นค่า Server และพัฒนาฟีเจอร์ใหม่ๆ
              </p>
            </CardContent>
          </Card>

          {/* Messages & Perks */}
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl text-center">
              <h3 className="text-xl font-bold flex items-center justify-center gap-3 mb-2">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                สนับสนุนค่ากาแฟ
              </h3>
              <p className="text-zinc-500 text-sm italic">
                ทุกๆ แก้วคือกำลังใจที่ยิ่งใหญ่ในการพัฒนาฟีเจอร์ใหม่ๆ ครับ
              </p>
            </div>

            <Button 
              className="w-full h-auto py-5 text-lg font-black gap-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(225,29,72,0.3)]"
              asChild
            >
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Kindee Vocabulary',
                    text: 'แอปฝึกคำศัพท์ที่ช่วยให้การเรียนรู้สนุกเหมือนเล่นเกม! มาสนับสนุนผู้พัฒนากันเถอะ',
                    url: window.location.origin,
                  })
                } else {
                  copyToClipboard(window.location.origin)
                }
              }}>
                <Share2 className="h-5 w-5" />
                Share this App
              </button>
            </Button>
          </div>
        </div>
      </main>

      {/* Decorative Circles */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  )
}
