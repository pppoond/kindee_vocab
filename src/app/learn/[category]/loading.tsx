export default function CategoryLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
      <p className="text-lg font-medium animate-pulse text-zinc-600 dark:text-zinc-400">กำลังโหลด...</p>
    </div>
  );
}
