import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // 3D Pill Variants (1px Top/Side Border + 4px Bottom Border - 20% Radius)
        pill:
          "rounded-xl bg-primary/10 text-primary border border-b-4 border-primary hover:bg-primary/20 active:translate-y-[3px] active:border-b",
        "pill-primary":
          "rounded-xl bg-primary text-primary-foreground border border-b-4 border-primary hover:bg-primary/90 active:translate-y-[3px] active:border-b",
        "pill-secondary":
          "rounded-xl bg-secondary text-secondary-foreground border border-b-4 border-border hover:bg-secondary/80 active:translate-y-[3px] active:border-b",
        "pill-destructive":
          "rounded-xl bg-destructive/10 text-destructive border border-b-4 border-destructive hover:bg-destructive/20 active:translate-y-[3px] active:border-b",
        "pill-outline":
          "rounded-xl bg-background text-foreground border border-b-4 border-input hover:bg-accent active:translate-y-[3px] active:border-b",
        "pill-accent":
          "rounded-xl bg-accent text-accent-foreground border border-b-4 border-accent-foreground/30 hover:bg-accent/80 active:translate-y-[3px] active:border-b",
        "pill-chart-1":
          "rounded-xl bg-[var(--chart-1)]/10 text-[var(--chart-1)] border border-b-4 border-[var(--chart-1)] hover:bg-[var(--chart-1)]/20 active:translate-y-[3px] active:border-b",
        "pill-chart-2":
          "rounded-xl bg-[var(--chart-2)]/10 text-[var(--chart-2)] border border-b-4 border-[var(--chart-2)] hover:bg-[var(--chart-2)]/20 active:translate-y-[3px] active:border-b",
        "pill-chart-3":
          "rounded-xl bg-[var(--chart-3)]/10 text-[var(--chart-3)] border border-b-4 border-[var(--chart-3)] hover:bg-[var(--chart-3)]/20 active:translate-y-[3px] active:border-b",
        "pill-chart-4":
          "rounded-xl bg-[var(--chart-4)]/10 text-[var(--chart-4)] border border-b-4 border-[var(--chart-4)] hover:bg-[var(--chart-4)]/20 active:translate-y-[3px] active:border-b",
        "pill-chart-5":
          "rounded-xl bg-[var(--chart-5)]/10 text-[var(--chart-5)] border border-b-4 border-[var(--chart-5)] hover:bg-[var(--chart-5)]/20 active:translate-y-[3px] active:border-b",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",

        // Pill sizes
        pill: "h-11 px-5 rounded-xl text-base font-bold",
        "pill-sm": "h-9 px-4 rounded-xl text-sm font-semibold",
        "pill-lg": "h-12 px-6 rounded-xl text-lg font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

/**
 * Icon container badge for 3D Pill buttons as seen in reference design.
 */
const PillIconBadge = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => (
  <span
    className={cn(
      "inline-flex items-center justify-center p-1.5 rounded-lg bg-current/15 shrink-0 [&_svg]:size-4",
      className
    )}
  >
    {children}
  </span>
)

export { Button, buttonVariants, PillIconBadge }

