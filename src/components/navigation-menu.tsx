"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Menu, Home, LifeBuoy, X, LayoutDashboard, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { TicketModal } from "./ticket-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function NavigationMenu() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("user_settings")
          .select("role")
          .eq("user_id", user.id)
          .single()
        
        if (data?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }
    checkAdmin()
  }, [])
  
  return (
    <>
      <TicketModal open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen} />
      
      <div className="flex items-center gap-2">
        <Button variant="pill-secondary" size="pill-sm" className="gap-2 text-muted-foreground hover:text-primary" asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> กลับหน้าแรก
          </Link>
        </Button>
        <ThemeToggle />
        
        {/* Desktop Menu */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="w-full cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/donate" className="w-full cursor-pointer">
                  <Heart className="mr-2 h-4 w-4" /> Support
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/backoffice" className="w-full cursor-pointer text-amber-600 dark:text-amber-500">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Backoffice
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsTicketModalOpen(true)}
                className="text-amber-600 dark:text-amber-500 cursor-pointer font-medium"
              >
                <LifeBuoy className="mr-2 h-4 w-4" /> แจ้งปัญหา / Feedback
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">เมนู</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-6 px-4">
                  <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition-colors"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link 
                  href="/donate" 
                  className="flex items-center gap-2 text-lg font-medium hover:text-amber-500 transition-colors"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  Support
                </Link>
                {isAdmin && (
                  <Link 
                    href="/backoffice" 
                    className="flex items-center gap-2 text-lg font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Backoffice
                  </Link>
                )}
                <div className="my-2 border-b border-zinc-200 dark:border-zinc-800" />
                <button
                  onClick={() => {
                    setIsSheetOpen(false)
                    setTimeout(() => setIsTicketModalOpen(true), 300) // allow sheet to close first
                  }}
                  className="flex items-center gap-2 text-lg font-medium text-amber-600 dark:text-amber-500 text-left"
                >
                  <LifeBuoy className="h-5 w-5" />
                  แจ้งปัญหา / Feedback
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
