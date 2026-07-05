import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, LifeBuoy, ArrowLeft, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export const metadata = {
  title: "Backoffice - Kindee Vocab",
  description: "Admin Backoffice for Kindee Vocab",
}

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!userSettings || userSettings.role !== "admin") {
    redirect("/dashboard")
  }

  const navLinks = [
    { name: "Tickets", href: "/backoffice/tickets", icon: LifeBuoy },
    // Add more backoffice links here in the future
  ]

  return (
    <div className="flex min-h-screen w-full bg-zinc-50/50 dark:bg-black">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-white dark:bg-zinc-950 sm:flex sm:flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/backoffice" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6 text-amber-500" />
            <span>Backoffice</span>
          </Link>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              กลับไป Dashboard
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white dark:bg-zinc-950 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 backdrop-blur-md">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-amber-500" />
                  Backoffice
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-4 text-lg font-medium px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}
                <div className="my-2 border-b border-zinc-200 dark:border-zinc-800" />
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  กลับ Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold sm:hidden">Backoffice</h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
