import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Vocab — สู้มอนสเตอร์ด้วยคำศัพท์ทั้งหมด",
  description: "เหมือน Battle Mode แต่ใช้คำศัพท์ทั้งหมดรวมคำที่จำได้แล้ว ฝึกทวนคำศัพท์ภาษาอังกฤษอย่างครบถ้วน",
  openGraph: {
    title: "Full Vocab Mode | Kindee Vocab",
    description: "โหมดสู้มอนสเตอร์ด้วยคำศัพท์ทั้งหมดที่มี ฝึกทบทวนแบบครบวงจร",
  },
};

export default function FullVocabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
