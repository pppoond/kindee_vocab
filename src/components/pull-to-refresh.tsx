"use client"

import { useState, useRef } from "react"
import { Loader2, RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const pullStartY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return
    const y = e.touches[0].clientY
    const pullDistance = y - pullStartY.current
    if (pullDistance > 0 && pullDistance < 120) {
      setPullY(pullDistance)
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling) return
    setIsPulling(false)
    if (pullY > 55) {
      setRefreshing(true)
      setPullY(55) // Hold position while refreshing
      await onRefresh()
      setRefreshing(false)
    }
    setPullY(0)
  }

  return (
    <div 
      className={`relative w-full ${!isPulling ? 'transition-transform duration-200' : ''}`}
      style={{ transform: `translateY(${pullY > 0 ? Math.min(pullY * 0.3, 30) : 0}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={`fixed top-0 left-0 right-0 flex justify-center z-[100] pointer-events-none ${!isPulling ? 'transition-transform duration-200' : ''}`}
        style={{ transform: `translateY(${pullY > 0 ? pullY - 60 : -60}px)` }}
      >
        <div className="bg-white dark:bg-zinc-800 shadow-md rounded-full p-2.5 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
          {refreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          ) : (
            <RefreshCw 
              className="h-5 w-5 text-amber-500 transition-transform" 
              style={{ transform: `rotate(${pullY * 2.5}deg)` }}
            />
          )}
        </div>
      </div>
      
      {children}
    </div>
  )
}
