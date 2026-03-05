import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vocab Writing | Kindee Vocab",
  description: "ท้าทายการสะกดคำ! เขียนคำศัพท์ภาษาอังกฤษจากความหมายที่ปรากฏ",
};

export default function VocabWritingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
