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
    default: "Kindee Vocab — อัปสกิลศัพท์อังกฤษให้จึ้ง",
    template: "%s | Kindee Vocab",
  },
  description: "แอปเรียนศัพท์อังกฤษแบบจอยๆ อัปสกิลได้แบบ No Cap ผ่านมินิเกมสุดจึ่ง Battle, Time Attack, Flashcard และอื่นๆ ช่วยให้จำแม่นแบบตะโกน",
  keywords: ["คำศัพท์ภาษาอังกฤษ", "อัปสกิลภาษาอังกฤษ", "แอปท่องศัพท์", "vocabulary", "flashcard", "เกมคำศัพท์", "Kindee Vocab"],
  authors: [{ name: "Kindee Vocab" }],
  openGraph: {
    title: "Kindee Vocab — อัปสกิลศัพท์อังกฤษให้จึ้ง",
    description: "อัปสกิลศัพท์ภาษาอังกฤษให้นัวผ่านมินิเกมหลากหลายโหมด เพิ่มคำศัพท์ ติดตามความก้าวหน้า และทบทวนได้ทุกที่ทุกเวลาแบบใจฟู",
    type: "website",
    locale: "th_TH",
    siteName: "Kindee Vocab",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/assets/logos/logo.png",
    shortcut: "/assets/logos/logo.png",
    apple: "/assets/logos/logo.png",
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
