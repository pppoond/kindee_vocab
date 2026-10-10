"use client"

export const SpriteSheet = ({ 
  src, 
  frames, 
  fps = 10, 
  loop = true,
  delay = 0,
  className = "",
  scale = 1,
  flip = false,
  offsetY = "0%"
}: { 
  src: string, 
  frames: number, 
  fps?: number, 
  loop?: boolean,
  delay?: number,
  className?: string, 
  scale?: number, 
  flip?: boolean,
  offsetY?: string
}) => {
  const duration = loop ? frames / fps : (frames - 1) / fps;
  const animationName = `slide-sprite-${frames}-${src.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <div 
      className={`overflow-hidden absolute left-[50%] pointer-events-none ${className}`}
      style={{ 
        width: `${scale * 100}%`, 
        height: `${scale * 100}%`,
        bottom: offsetY,
        transform: flip ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%)',
        transformOrigin: 'center bottom'
      }}
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
        className="max-w-none h-full absolute top-0 left-0 [image-rendering:pixelated]"
        style={{
          width: `${frames * 100}%`,
          animation: `${animationName} ${duration}s steps(${frames - 1}, end) ${delay}s ${loop ? 'infinite' : '1 forwards'}`
        }} 
      />
    </div>
  )
}
