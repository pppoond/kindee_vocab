import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time Attack — ตอบคำศัพท์แข่งกับเวลา",
  description: "ตอบคำศัพท์ภาษาอังกฤษให้ได้มากที่สุดภายในเวลาที่กำหนด เลือกเวลาเองได้ 30, 60, 90 หรือ 120 วินาที",
  openGraph: {
    title: "Time Attack — ตอบคำศัพท์แข่งกับเวลา | Kindee Vocab",
    description: "โหมดจับเวลา ตอบคำศัพท์ภาษาอังกฤษให้เร็วที่สุดเท่าที่จะทำได้",
  },
};

export default function TimeAttackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
