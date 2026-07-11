"use client"

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CategoryDropdown({ tags, category }: { tags: any[], category: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <span className="hidden sm:inline">หมวดหมู่</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {tags?.map((t: any) => (
          <DropdownMenuItem key={t.name} asChild>
            <Link 
              href={`/learn/${t.name}`}
              className={`capitalize w-full cursor-pointer ${category.toLowerCase() === t.name.toLowerCase() ? "font-bold text-amber-500" : ""}`}
            >
              {t.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
