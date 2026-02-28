import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน",
  description: "รีเซ็ตรหัสผ่านของคุณ ระบบจะส่งลิงก์รีเซ็ตไปยังอีเมลที่ลงทะเบียน",
  openGraph: {
    title: "ลืมรหัสผ่าน | Kindee Vocab",
    description: "รีเซ็ตรหัสผ่านบัญชี Kindee Vocab ของคุณ",
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
