import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่",
  description: "ตั้งรหัสผ่านใหม่สำหรับบัญชี Kindee Vocab ของคุณ",
  openGraph: {
    title: "ตั้งรหัสผ่านใหม่ | Kindee Vocab",
    description: "ตั้งรหัสผ่านใหม่เพื่อเข้าใช้งาน Kindee Vocab",
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
