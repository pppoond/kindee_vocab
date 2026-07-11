import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Verb Writing — ท้าทายความจำกริยา 3 ช่อง",
  description: "ฝึกฝนและทบทวนกริยา 3 ช่องภาษาอังกฤษ (Irregular Verbs) เล่นฟรี ไม่ต้องเข้าสู่ระบบ!",
  openGraph: {
    title: "Public Verb Writing — เกมกริยา 3 ช่อง | Kindee Vocab",
    description: "เกมทดสอบความจำกริยา 3 ช่องภาษาอังกฤษ สนุกและได้ความรู้ เล่นฟรีสำหรับทุกคน",
  },
};

export default function PublicVerbWritingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
