import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VocabListClient } from './VocabListClient';
import { CategoryDropdown } from './CategoryDropdown';
import { NavigationMenu } from '@/components/navigation-menu';
import { Suspense } from 'react';

function getCategoryInfo(category: string) {
  const cat = category.toLowerCase();
  if (cat === 'oxford3000') {
    return {
      displayCategory: 'Oxford 3000',
      seoDescription: 'เรียนรู้และท่องคำศัพท์ภาษาอังกฤษหมวด Oxford 3000 ที่ใช้บ่อยที่สุด พร้อมความหมายภาษาไทย ชนิดของคำ และตัวอย่างประโยค เพิ่มเข้าคลังคำศัพท์ของคุณได้ทันทีบน Kindee Vocab',
      pageDescription: 'คำศัพท์ภาษาอังกฤษหมวด Oxford 3000 ที่รวบรวมมาให้คุณท่องและเพิ่มเข้าคลังส่วนตัวได้ง่ายๆ'
    };
  } else if (cat === 'irregular-verbs') {
    return {
      displayCategory: 'Irregular Verbs (กริยา 3 ช่อง)',
      seoDescription: 'เรียนรู้และท่องกริยา 3 ช่องภาษาอังกฤษ (Irregular Verbs) ที่ใช้บ่อยที่สุด พร้อมความหมายภาษาไทย V2, V3 และตัวอย่างประโยค เพิ่มเข้าคลังคำศัพท์ของคุณได้ทันทีบน Kindee Vocab',
      pageDescription: 'รวบรวมคำกริยา 3 ช่อง (Irregular Verbs) ที่ใช้บ่อยที่สุด พร้อมความหมายภาษาไทย V2, V3 และช่องที่ 1 ให้คุณท่องจำและเพิ่มเข้าคลังส่วนตัวได้ง่ายๆ'
    };
  } else if (cat === 'business') {
    return {
      displayCategory: 'Business (หมวดธุรกิจ)',
      seoDescription: 'เรียนรู้และท่องคำศัพท์ภาษาอังกฤษหมวดธุรกิจ (Business) ที่ใช้บ่อยในการทำงานและการบริหารงาน พร้อมความหมายภาษาไทย ชนิดของคำ และตัวอย่างประโยค',
      pageDescription: 'รวบรวมคำศัพท์ภาษาอังกฤษหมวดธุรกิจและการทำงาน (Business English) ที่ใช้บ่อยในการทำงานจริง ให้คุณเรียนรู้และทบทวนได้ง่ายๆ'
    };
  }
  return {
    displayCategory: category,
    seoDescription: `เรียนรู้และท่องคำศัพท์ภาษาอังกฤษหมวด ${category} ที่ใช้บ่อยที่สุด พร้อมความหมายภาษาไทย ชนิดของคำ และตัวอย่างประโยค เพิ่มเข้าคลังคำศัพท์ของคุณได้ทันทีบน Kindee Vocab`,
    pageDescription: `คำศัพท์ภาษาอังกฤษหมวด ${category} ที่รวบรวมมาให้คุณท่องและเพิ่มเข้าคลังส่วนตัวได้ง่ายๆ`
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = resolvedParams.category;

  const { displayCategory, seoDescription } = getCategoryInfo(category);

  return {
    title: `คำศัพท์หมวด ${displayCategory} พร้อมความหมายภาษาไทย`,
    description: seoDescription,
    keywords: [displayCategory, "คำศัพท์ภาษาอังกฤษ", "ท่องศัพท์", "คำศัพท์", "vocabulary", "เรียนภาษาอังกฤษ", "กริยา 3 ช่อง", "oxford3000", "คำศัพท์ oxford 3000"],
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

  const categoryExists = tags?.some((t: any) => t.name.toLowerCase() === category.toLowerCase());
  
  if (!categoryExists) {
    notFound();
  }

  const { displayCategory, pageDescription } = getCategoryInfo(category);

  return (
    <div className="min-h-screen">
      {/* Navigation & Back Buttons */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b mb-8 shadow-sm">
        <div className="container mx-auto max-w-5xl px-4 py-3 md:px-8 flex justify-between items-center gap-4">
          <NavigationMenu />

          {/* Category Selector (Hamburger) */}
          <div>
            <CategoryDropdown tags={tags || []} category={category} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl pb-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">
            คลังคำศัพท์ {displayCategory}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pageDescription}
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

