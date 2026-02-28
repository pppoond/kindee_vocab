"use client"

import type { AnimationConfig } from "@/lib/game-assets"

export const SpriteSheet = ({ 
  src, 
  frames, 
  fps = 10, 
  loop = true,
  delay = 0,
  className = "",
  scale = 1,
  flip = false
}: { 
  src: string, 
  frames: number, 
  fps?: number, 
  loop?: boolean,
  delay?: number,
  className?: string,
  scale?: number,
  flip?: boolean
}) => {
  const duration = loop ? frames / fps : (frames - 1) / fps;
  const animationName = `slide-sprite-${frames}-${src.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <div 
      className={`overflow-hidden absolute bottom-0 left-[50%] -translate-x-[50%] pointer-events-none ${className}`}
      style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
    >
      <style>{`
        @keyframes ${animationName} {
          to { transform: translateX(-${((frames - 1) / frames) * 100}%); }
        }
      `}</style>
      <img 
        key={src}
        src={src} 
        alt="sprite" 
        className={`max-w-none h-full absolute top-0 left-0 [image-rendering:pixelated] ${flip ? '-scale-x-100' : ''}`}
        style={{
          width: `${frames * 100}%`,
          animation: `${animationName} ${duration}s steps(${frames - 1}, end) ${delay}s ${loop ? 'infinite' : '1 forwards'}`
        }} 
      />
    </div>
  )
}
