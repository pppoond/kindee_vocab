import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Battle Mode — สู้มอนสเตอร์ด้วยคำศัพท์",
  description: "ต่อสู้กับมอนสเตอร์โดยตอบคำศัพท์ภาษาอังกฤษ ตอบถูกเพื่อโจมตี ตอบผิดโดนตี! ผ่านด่านเพื่อเลื่อนเลเวล",
  openGraph: {
    title: "Battle Mode — สู้มอนสเตอร์ด้วยคำศัพท์ | Kindee Vocab",
    description: "เกม RPG ต่อสู้มอนสเตอร์ด้วยคำศัพท์ภาษาอังกฤษ ท้าทายและสนุก",
  },
};

export default function BattleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
