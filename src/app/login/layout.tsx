import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  description: "เข้าสู่ระบบ Kindee Vocab เพื่อจัดการคำศัพท์และเล่นเกมท่องคำศัพท์ภาษาอังกฤษของคุณ",
  openGraph: {
    title: "เข้าสู่ระบบ | Kindee Vocab",
    description: "เข้าสู่ระบบเพื่อเริ่มเรียนคำศัพท์ภาษาอังกฤษผ่านมินิเกมสุดสนุก",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
