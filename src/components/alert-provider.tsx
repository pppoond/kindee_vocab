"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

type AlertType = "info" | "success" | "error"

type AlertState = {
  open: boolean
  title: string
  message: string
  type: AlertType
  mode: "alert" | "confirm"
}

type AlertContextType = {
  showAlert: (message: string, options?: { title?: string; type?: AlertType }) => Promise<void>
  showConfirm: (message: string, options?: { title?: string }) => Promise<boolean>
}

const AlertContext = createContext<AlertContextType | null>(null)

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error("useAlert must be used within <AlertProvider>")
  return ctx
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    type: "info",
    mode: "alert",
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const close = useCallback((result: boolean) => {
    setState(prev => ({ ...prev, open: false }))
    resolveRef.current?.(result)
    resolveRef.current = null
  }, [])

  const showAlert = useCallback((message: string, options?: { title?: string; type?: AlertType }): Promise<void> => {
    return new Promise<void>((resolve) => {
      resolveRef.current = () => resolve()
      setState({
        open: true,
        title: options?.title || (options?.type === "error" ? "Error" : options?.type === "success" ? "Success" : "Notice"),
        message,
        type: options?.type || "info",
        mode: "alert",
      })
    })
  }, [])

  const showConfirm = useCallback((message: string, options?: { title?: string }): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({
        open: true,
        title: options?.title || "Confirm",
        message,
        type: "info",
        mode: "confirm",
      })
    })
  }, [])

  const iconMap: Record<AlertType, React.ReactNode> = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
  }

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => { if (!open) close(false) }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {iconMap[state.type]}
              {state.title}
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              {state.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            {state.mode === "confirm" && (
              <Button variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
            )}
            <Button
              onClick={() => close(true)}
              variant={state.type === "error" ? "destructive" : "default"}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertContext.Provider>
  )
}
