"use client"

import { useState } from "react"
import { format } from "date-fns"
import { resolveTicket, deleteTicket } from "@/app/actions/ticket"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useAlert } from "@/components/alert-provider"
import { CheckCircle2, Trash2, ExternalLink, RefreshCw } from "lucide-react"

type Ticket = {
  id: string
  user_id: string
  title: string
  type: string
  description: string
  image_url: string | null
  status: string
  created_at: string
}

export function TicketsClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { showAlert, showConfirm } = useAlert()

  const handleResolve = async (id: string) => {
    setLoadingId(id)
    const result = await resolveTicket(id)
    setLoadingId(null)
    
    if (result.error) {
      showAlert(result.error, { title: "Error", type: "error" })
    } else {
      showAlert("Ticket marked as resolved.", { title: "Success", type: "success" })
      setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t))
    }
  }

  const handleDelete = async (id: string, imageUrl: string | null) => {
    const confirmed = await showConfirm("Are you sure you want to delete this ticket? The attached image will also be deleted.")
    if (!confirmed) {
      return
    }

    setLoadingId(id)
    const result = await deleteTicket(id, imageUrl)
    setLoadingId(null)

    if (result.error) {
      showAlert(result.error, { title: "Error", type: "error" })
    } else {
      showAlert("Ticket deleted successfully.", { title: "Success", type: "success" })
      setTickets(tickets.filter(t => t.id !== id))
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            There are no support tickets in the system.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="flex flex-col relative overflow-hidden transition-all hover:shadow-md">
          {ticket.status === 'resolved' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          )}
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <Badge variant={ticket.type === 'bug' ? 'destructive' : ticket.type === 'feature' ? 'default' : 'secondary'} className="mb-2">
                  {ticket.type}
                </Badge>
                <CardTitle className="line-clamp-1">{ticket.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")}
                </CardDescription>
              </div>
              <Badge variant="outline" className={ticket.status === 'resolved' ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20" : "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20"}>
                {ticket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 text-sm pb-4">
            <p className="whitespace-pre-wrap text-muted-foreground line-clamp-3 mb-4">
              {ticket.description}
            </p>
            
            <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-4 truncate">
              User ID: {ticket.user_id}
            </div>

            {ticket.image_url && (
              <a 
                href={ticket.image_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                View Attachment
              </a>
            )}
          </CardContent>
          <CardFooter className="pt-0 flex gap-2">
            {ticket.status === 'open' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1.5"
                onClick={() => handleResolve(ticket.id)}
                disabled={loadingId === ticket.id}
              >
                {loadingId === ticket.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                Resolve
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm" 
              className={ticket.status === 'open' ? "px-3" : "flex-1 gap-1.5"}
              onClick={() => handleDelete(ticket.id, ticket.image_url)}
              disabled={loadingId === ticket.id}
            >
              {loadingId === ticket.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {ticket.status === 'resolved' && "Delete"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
