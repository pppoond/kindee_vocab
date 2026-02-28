import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  text?: string
  size?: number
}

export function Loading({ className, text = "Loading...", size = 20 }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className="animate-spin text-muted-foreground" size={size} />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  )
}
