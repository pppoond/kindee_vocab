import { Metadata } from "next"
import { LandingClient } from "./LandingClient"

export const metadata: Metadata = {
  title: "Kindee Vocab — ฝึกคำศัพท์ภาษาอังกฤษ สนุกเหมือนเล่นเกม",
  description: "อัปสกิลคำศัพท์อังกฤษ จำได้แม่น ไม่มีลืม กับ Kindee Vocab! เรียนรู้ผ่านมินิเกมสุดมันส์ แฟลชการ์ด และระบบติดตามสถิติที่ช่วยให้คุณเก่งขึ้นทุกวัน",
  keywords: ["Level Up Vocabulary", "Master English Words", "คำศัพท์ภาษาอังกฤษ", "เกมภาษาอังกฤษ", "Kindee Vocab", "เรียนภาษาอังกฤษด้วยตัวเอง"],
  openGraph: {
    title: "Level Up Your Vocabulary Master — Kindee Vocab",
    description: "ฝึกคำศัพท์ภาษาอังกฤษให้สนุกและจำได้แม่นยิ่งขึ้นด้วย Kindee Vocab มินิเกมและแฟลชการ์ดคำศัพท์ที่คุณสร้างเองได้",
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
    title: "Kindee Vocab — ฝึกคำศัพท์ภาษาอังกฤษ สนุกเหมือนเล่นเกม",
    description: "แอปฝึกศัพท์อังกฤษที่ช่วยให้คุณจำได้แม่นขึ้นผ่านมินิเกมและแฟลชการ์ด",
    images: ["/assets/logos/logo.png"],
  },
}

export default function Page() {
  return <LandingClient />
}
