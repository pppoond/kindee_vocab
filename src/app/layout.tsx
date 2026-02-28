import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AlertProvider } from "@/components/alert-provider";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kindee Vocab — แอปท่องคำศัพท์ภาษาอังกฤษ",
    template: "%s | Kindee Vocab",
  },
  description: "แอปเรียนคำศัพท์ภาษาอังกฤษสุดสนุก เพิ่มคำศัพท์ ทบทวนผ่านมินิเกม Battle, Time Attack, Flashcard และอื่นๆ ช่วยให้จำคำศัพท์ได้เร็วขึ้น",
  keywords: ["คำศัพท์ภาษาอังกฤษ", "เรียนภาษาอังกฤษ", "แอปท่องศัพท์", "vocabulary", "flashcard", "เกมคำศัพท์", "Kindee Vocab"],
  authors: [{ name: "Kindee Vocab" }],
  openGraph: {
    title: "Kindee Vocab — แอปท่องคำศัพท์ภาษาอังกฤษ",
    description: "เรียนคำศัพท์ภาษาอังกฤษสุดสนุกผ่านมินิเกมหลากหลายโหมด เพิ่มคำศัพท์ ติดตามความก้าวหน้า และทบทวนคำศัพท์ได้ทุกที่ทุกเวลา",
    type: "website",
    locale: "th_TH",
    siteName: "Kindee Vocab",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#f59e0b" height={3} showSpinner={false} />
          <AlertProvider>
            {children}
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
