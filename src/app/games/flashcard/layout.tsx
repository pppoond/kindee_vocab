import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcard Swipe — ปัดการ์ดทบทวนคำศัพท์",
  description: "ทบทวนคำศัพท์ภาษาอังกฤษแบบ Flashcard ปัดขวาถ้าจำได้ ปัดซ้ายถ้าจำไม่ได้ มีทั้งโหมดปกติและจับเวลา",
  openGraph: {
    title: "Flashcard Swipe — ปัดการ์ดทบทวนคำศัพท์ | Kindee Vocab",
    description: "โหมด Flashcard ปัดซ้าย-ขวาเพื่อทบทวนคำศัพท์ภาษาอังกฤษ สนุกและง่ายดาย",
  },
};

export default function FlashcardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
