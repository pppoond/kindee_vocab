import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกมท่องคำศัพท์",
  description: "เลือกโหมดเกมที่ชอบ Battle Mode, Full Vocab, Time Attack หรือ Flashcard Swipe เพื่อทบทวนคำศัพท์ภาษาอังกฤษอย่างสนุกสนาน",
  openGraph: {
    title: "เกมท่องคำศัพท์ | Kindee Vocab",
    description: "เลือกโหมดเกมคำศัพท์ภาษาอังกฤษหลากหลายโหมด ทั้ง RPG, จับเวลา และ Flashcard",
  },
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
