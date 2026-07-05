import { createClient } from "@/lib/supabase/server"
import { TicketsClient } from "./TicketsClient"

export const dynamic = "force-dynamic"

export default async function TicketsPage() {
  const supabase = await createClient()

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("id, title, type, description, image_url, status, created_at, user_id")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
  }

  // Next.js Server Components cannot easily join auth.users securely from the public schema if we don't have a profiles table.
  // Wait, `auth.users` is in the auth schema, we can't join it from public schema directly using supabase-js standard select unless we have a view or trigger.
  // If we just want user_id, that's fine.

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
        <p className="text-muted-foreground">Manage user reports and feedback.</p>
      </div>
      
      <TicketsClient initialTickets={tickets || []} />
    </div>
  )
}
