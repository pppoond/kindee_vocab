import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VocabListClient } from './VocabListClient';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  // Fetch words for this category (handling Supabase's 1000 row limit)
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

  // If we have no words, maybe it's not a valid category, but we can still show an empty state
  if (!allWords || allWords.length === 0) {
    // If we want to strictly check, we could return notFound() here.
    // For now, we will just show empty list.
  }

  const displayCategory = category.toLowerCase() === 'oxford3000' ? 'Oxford 3000' : category;

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
      {/* Navigation & Back Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <Link href="/">
          <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-primary">
            <Home className="h-4 w-4" /> กลับหน้าแรก
          </Button>
        </Link>

        {/* Category Selector (Placeholder for future categories) */}
        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Link href="/learn/oxford3000">
            <Button 
              variant={category.toLowerCase() === 'oxford3000' ? "default" : "ghost"} 
              size="sm" 
              className="rounded-full px-4"
            >
              Oxford 3000
            </Button>
          </Link>
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

      <VocabListClient words={allWords || []} category={category} />
    </div>
  );
}
