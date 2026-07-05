import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VocabListClient } from './VocabListClient';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Suspense } from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = resolvedParams.category;
  
  // Format category name for display (e.g. oxford3000 -> Oxford 3000)
  const displayCategory = category.toLowerCase() === 'oxford3000' ? 'Oxford 3000' : category;

  return {
    title: `คำศัพท์หมวด ${displayCategory} พร้อมความหมายภาษาไทย`,
    description: `เรียนรู้และท่องคำศัพท์ภาษาอังกฤษหมวด ${displayCategory} ที่ใช้บ่อยที่สุด พร้อมความหมายภาษาไทย ชนิดของคำ และตัวอย่างประโยค เพิ่มเข้าคลังคำศัพท์ของคุณได้ทันทีบน Kindee Vocab`,
    keywords: [displayCategory, "คำศัพท์ภาษาอังกฤษ", "ท่องศัพท์", "คำศัพท์", "vocabulary", "เรียนภาษาอังกฤษ"],
  };
}

export default async function LearnCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const resolvedParams = await params;
  const category = resolvedParams.category;
  
  const supabase = await createClient();

  // Fetch all tags dynamically
  const { data: tags } = await supabase.from('public_tags').select('name').order('name');

  const displayCategory = category.toLowerCase() === 'oxford3000' ? 'Oxford 3000' : category;
  
  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
      {/* Navigation & Back Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" /> กลับหน้าแรก
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Category Selector (Dynamic) */}
        <div className="flex flex-wrap gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800">
          {tags?.map((t: any) => (
            <Link key={t.name} href={`/learn/${t.name}`}>
              <Button 
                variant="outline"
                size="sm" 
                className={`rounded-full px-5 transition-all capitalize ${
                  category.toLowerCase() === t.name.toLowerCase()
                    ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white border-none shadow-md shadow-amber-500/20 font-bold"
                    : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                }`}
              >
                {t.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">
          คลังคำศัพท์ {displayCategory}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          คำศัพท์ภาษาอังกฤษหมวด {displayCategory} ที่รวบรวมมาให้คุณท่องและเพิ่มเข้าคลังส่วนตัวได้ง่ายๆ
        </p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
          <p className="text-lg font-medium animate-pulse">กำลังโหลดคลังคำศัพท์กว่า 3,000 คำ...</p>
        </div>
      }>
        <VocabFetcher category={category} />
      </Suspense>
    </div>
  );
}

import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getCachedVocab = unstable_cache(
  async (category: string) => {
    // Use standard client without cookies for cached public data
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let allWords: any[] = [];
    let from = 0;
    const limit = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('public_word_bank')
        .select('*')
        .eq('category', category)
        .order('word', { ascending: true })
        .range(from, from + limit - 1);

      if (error) {
        console.error("Error fetching public words:", error);
        break;
      }

      if (data) {
        allWords = [...allWords, ...data];
        if (data.length < limit) break;
      } else {
        break;
      }
      from += limit;
    }
    return allWords;
  },
  ['vocab-list-cache'],
  { revalidate: 600, tags: ['vocab'] } // 600 seconds = 10 minutes
);

// Server Component for fetching vocabulary asynchronously
async function VocabFetcher({ category }: { category: string }) {
  const allWords = await getCachedVocab(category);
  return <VocabListClient words={allWords || []} category={category} />;
}

