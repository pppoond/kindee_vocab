import { Metadata } from "next"
import { LandingClient } from "./LandingClient"

export const metadata: Metadata = {
  title: "Kindee Vocab — อัปสกิลศัพท์อังกฤษให้จึ้ง สนุกจอยๆ แบบ No Cap",
  description: "อัปสกิลศัพท์อังกฤษให้จึ่ง จำแม่นแบบตะโกน กับ Kindee Vocab! เรียนรู้ผ่านมินิเกมสุดจอย แฟลชการ์ด และระบบติดตามสถิติที่ช่วยให้คุณเก่งขึ้นทุกวันแบบใจฟู",
  keywords: ["อัปสกิลภาษาอังกฤษ", "จำศัพท์แม่นๆ", "คำศัพท์ภาษาอังกฤษ", "เกมภาษาอังกฤษ", "Kindee Vocab", "เรียนภาษาอังกฤษแบบจอยๆ"],
  openGraph: {
    title: "Level Up Your Vocab Game — Kindee Vocab",
    description: "อัปสกิลศัพท์อังกฤษให้นัว จำแม่นแบบไม่ต้องพยายาม กับ Kindee Vocab มินิเกมและแฟลชการ์ดคำศัพท์ที่คุณดีไซน์เองได้",
    images: [
      {
        url: "/assets/logos/logo.png",
        width: 800,
        height: 800,
        alt: "Kindee Vocab Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kindee Vocab — อัปสกิลศัพท์อังกฤษให้จึ้ง สนุกจอยๆ แบบ No Cap",
    description: "แอปฝึกศัพท์อังกฤษที่ช่วยให้จำแม่นขึ้นผ่านมินิเกมและแฟลชการ์ดแบบฉ่ำๆ",
    images: ["/assets/logos/logo.png"],
  },
}

export default function Page() {
  return <LandingClient />
}
