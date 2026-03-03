"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Gamepad2, 
  Heart, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Trophy, 
  Zap,
  LayoutDashboard,
  ArrowRight,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingClient() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-black/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20">
              <img src="/assets/logos/logo.png" alt="Kindee Vocab" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Kindee Vocab</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-amber-500 transition-colors">ฟีเจอร์</Link>
            <Link href="/games" className="hover:text-amber-500 transition-colors">Games</Link>
            <Link href="/verb3" className="hover:text-amber-500 transition-colors">กริยา 3 ช่อง</Link>
            <Link href="/donate" className="hover:text-rose-500 transition-colors flex items-center gap-1.5">
              <Heart className="h-4 w-4 fill-rose-500" /> สนับสนุน
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button className="rounded-full bg-amber-500 hover:bg-amber-600 border-none px-6">
                    Go to Dashboard <LayoutDashboard className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-full hover:bg-amber-500/10">Sign In</Button>
                  </Link>
                  <Link href="/login?tab=signup">
                    <Button className="rounded-full bg-amber-500 hover:bg-amber-600 border-none px-6">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-6 gap-4">
              <Link 
                href="#features" 
                className="text-lg font-medium hover:text-amber-500 py-2 border-b border-zinc-100 dark:border-zinc-900"
                onClick={() => setIsMenuOpen(false)}
              >
                ฟีเจอร์
              </Link>
              <Link 
                href="/games" 
                className="text-lg font-medium hover:text-amber-500 py-2 border-b border-zinc-100 dark:border-zinc-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Games
              </Link>
              <Link 
                href="/verb3" 
                className="text-lg font-medium hover:text-amber-500 py-2 border-b border-zinc-100 dark:border-zinc-900"
                onClick={() => setIsMenuOpen(false)}
              >
                กริยา 3 ช่อง
              </Link>
              <Link 
                href="/donate" 
                className="text-lg font-medium hover:text-rose-500 py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" /> สนับสนุนทีมงาน
              </Link>
              
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm text-zinc-500">Theme</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 h-12">
                      Dashboard <LayoutDashboard className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl h-12">Sign In</Button>
                    </Link>
                    <Link href="/login?tab=signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 h-12">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-orange-500/20 rounded-full blur-[120px] -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>เก่งศัพท์อังกฤษได้ไวขึ้น สนุกเหมือนเล่นเกม</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent leading-[1.15]">
            Level Up Your <br className="hidden md:block" />
            <span className="text-amber-500">Vocabulary Master</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed ThaiFont">
            Kindee Vocab ช่วยให้คุณจำศัพท์ได้นานขึ้นผ่านมินิเกมสุดมันส์ 
            แฟลชการ์ดอัจฉริยะ และระบบติดตามความก้าวหน้าส่วนตัว
          </p>

          {/* Epic Battle Scene */}
          <div className="mt-16 relative mx-auto max-w-5xl h-[400px] md:h-[600px] flex items-center justify-center overflow-visible">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 scale-75 md:scale-100">
              <div className="relative">
                <div className="absolute inset-0 bg-white dark:bg-amber-500 rounded-full blur-2xl opacity-20 animate-ping" />
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-4xl md:text-6xl p-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-2xl skew-x-[-12deg] rotate-[-5deg]">
                  VS
                </div>
              </div>
            </div>

            {/* Character Container */}
            <div className="w-full flex items-center justify-between gap-4 md:gap-20">
              {/* Hero (Left) */}
              <div className="relative flex-1 animate-float-slow group">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/20 blur-xl rounded-full" />
                <img 
                  src="/assets/pages/home/hero_red.png" 
                  alt="Kindee Hero" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(245,158,11,0.4)] transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute -top-10 left-0 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hidden lg:block rotate-[-10deg]">
                  <span className="font-bold text-amber-500">Kindee Hero</span>
                </div>
              </div>

              {/* Demon Lord (Right) */}
              <div className="relative flex-1 animate-float group">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/20 blur-xl rounded-full" />
                <img 
                  src="/assets/pages/home/demon_load_black.png" 
                  alt="Demon Lord" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(147,51,234,0.4)] transition-transform duration-500 group-hover:scale-110 scale-x-[-1]"
                />
                <div className="absolute -top-10 right-0 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hidden lg:block rotate-[10deg]">
                  <span className="font-bold text-purple-500">Demon Lord</span>
                </div>
              </div>
            </div>
            
            {/* Impact Particles (Conceptual) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full animate-ping delay-0" />
               <div className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[40%] w-3 h-3 bg-purple-400 rounded-full animate-ping delay-300" />
               <div className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[60%] w-2 h-2 bg-white rounded-full animate-ping delay-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">ทำไมต้อง Kindee Vocab?</h2>
            <p className="text-zinc-600 dark:text-zinc-400">ครบเครื่องเรื่องคำศัพท์อังกฤษ เรียนรู้ได้อย่างมีประสิทธิภาพ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="h-6 w-6 text-amber-500" />}
              title="สร้างคลังศัพท์ส่วนตัว"
              description="เพิ่มคำศัพท์และความหมายที่คุณต้องการจำเองได้ รองรับการปรับแต่งที่ยืดหยุ่น"
            />
            <FeatureCard 
              icon={<Gamepad2 className="h-6 w-6 text-violet-500" />}
              title="Mini-games สุดสนุก"
              description="ลืมการท่องจำแบบเดิมๆ ไปได้เลย ทบทวนความจำผ่านเกมหลากหลายรูปแบบ"
            />
            <FeatureCard 
              icon={<Trophy className="h-6 w-6 text-emerald-500" />}
              title="ติดตามสถิติ"
              description="เห็นพัฒนาการของคุณได้ชัดเจนผ่านกราฟและคะแนนความแม่นยำในแต่ละวัน"
            />
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl text-left">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">เรียนผ่านการเล่น</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                เราออกแบบมินิเกมมาเพื่อทดสอบความจำโดยเฉพาะ ช่วยให้สมองจำศัพท์ได้ไวขึ้น
              </p>
            </div>
            <Link href="/games">
              <Button variant="link" className="text-amber-500 p-0 text-lg group">
                ดูเกมทั้งหมด <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <GamePreviewCard 
               title="Time Attack"
               description="แข่งกับเวลาเพื่อจับคู่คำศัพท์กับความหมาย! ยิ่งตอบไว ยิ่งคะแนนสูง"
               color="amber"
               image="/assets/logos/logo.png"
               buttonText="เริ่มเล่น"
             />
             <GamePreviewCard 
               title="Battle Mode"
               description="สู้กับมอนสเตอร์ด้วยพลังศัพท์อังกฤษ ตอบถูกเพื่อโจมตี ตอบผิดระวังโดนตีสวน!"
               color="violet"
               image="/assets/logos/logo.png"
               buttonText="เริ่มสู้"
             />
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="p-8 md:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart className="h-32 w-32 fill-rose-500" />
               </div>
               <h2 className="text-3xl font-bold text-white mb-4">สนับสนุน Kindee Vocab</h2>
               <p className="text-zinc-400 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                  ร่วมเป็นส่วนหนึ่งในการสนับสนุนค่า Server และพัฒนาฟีเจอร์ใหม่ๆ 
                  เพื่อให้ทุกคนได้เข้าถึงการเรียนรู้ที่สนุกสนาน
               </p>
               <Link href="/donate">
                  <Button size="lg" className="rounded-full bg-rose-500 hover:bg-rose-600 text-white border-none gap-2 px-8">
                     <Heart className="h-5 w-5 fill-white" /> Support Kindee
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
               <img src="/assets/logos/logo.png" alt="Logo" className="h-6 w-6 object-contain grayscale opacity-50" />
               <span className="text-zinc-500 font-semibold uppercase tracking-widest text-xs">Kindee Vocab &copy; 2026</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500">
               <Link href="/games" className="hover:text-amber-500 underline-offset-4 hover:underline">มินิเกม</Link>
               <Link href="/verb3" className="hover:text-amber-500 underline-offset-4 hover:underline">กริยา 3 ช่อง</Link>
               <Link href="/donate" className="hover:text-rose-500 underline-offset-4 hover:underline">สนับสนุน</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader>
        <div className="mb-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 w-fit">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed ThaiFont">{description}</p>
      </CardContent>
    </Card>
  )
}

function GamePreviewCard({ title, description, color, image, buttonText }: { title: string, description: string, color: string, image: string, buttonText: string }) {
  const colorClasses = {
    amber: "from-amber-500/10 to-transparent border-amber-500/20",
    violet: "from-violet-500/10 to-transparent border-violet-500/20",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20",
  }[color] || "from-amber-500/10 to-transparent border-amber-500/20"

  const iconColor = {
    amber: "text-amber-500",
    violet: "text-violet-500",
    emerald: "text-emerald-500",
  }[color] || "text-amber-500"

  return (
    <div className={`p-8 rounded-3xl border ${colorClasses} bg-gradient-to-br flex flex-col md:flex-row gap-8 items-center group`}>
       <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 ThaiFont">{description}</p>
          <Button variant="outline" className={`rounded-full gap-2 border-zinc-200 dark:border-zinc-800 ${iconColor} bg-white dark:bg-black font-semibold`}>
             {buttonText} <Zap className="h-4 w-4" />
          </Button>
       </div>
       <div className="w-32 h-32 md:w-48 md:h-48 relative shrink-0">
          <div className="absolute inset-0 bg-white/50 dark:bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <img src={image} alt={title} className="relative z-10 w-full h-full object-contain drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500" />
       </div>
    </div>
  )
}
