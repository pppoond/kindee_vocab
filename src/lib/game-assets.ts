export type AnimationConfig = {
  src: string;
  frames: number;
  fps: number;
  loop: boolean;
}

export type CharacterData = {
  size: number;
  flip?: boolean;
  name: string;
  maxHp: number;
  animations: Record<string, AnimationConfig>;
}

export const ASSETS: Record<string, any> = {
  hero: {
    size: 32,
    flip: false,
    name: "Hero",
    maxHp: 100,
    animations: {
      idle:   { src: "/assets/characters/knight/IDLE.png", frames: 7, fps: 8, loop: true },
      attack: { src: "/assets/characters/knight/ATTACK_1.png", frames: 6, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/knight/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/knight/IDLE.png", frames: 7, fps: 8, loop: true },
      lose:   { src: "/assets/characters/knight/DEATH.png", frames: 12, fps: 8, loop: false },
    }
  },
  demon: {
    size: 32,
    flip: false,
    name: "Flying Demon",
    maxHp: 100,
    animations: {
      idle:   { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      flying: { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      attack: { src: "/assets/characters/flying_demon/ATTACK.png", frames: 8, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/flying_demon/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      lose:   { src: "/assets/characters/flying_demon/DEATH.png", frames: 7, fps: 8, loop: false },
    }
  },
  background: "/assets/backgrounds/forest.jpg",
}

export const getAllAssetUrls = () => {
  const urls: string[] = [];
  if (typeof ASSETS.background === 'string') urls.push(ASSETS.background);
  
  Object.values(ASSETS).forEach(value => {
    if (value && typeof value === 'object' && 'animations' in value) {
      Object.values(value.animations as Record<string, AnimationConfig>).forEach((anim) => {
        if (anim && anim.src) urls.push(anim.src);
      });
    }
  });
  return Array.from(new Set(urls));
};

export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
};

/** Get enemy stats scaled by level */
export const getEnemyStats = (level: number) => ({
  maxHp: 100 + (level - 1) * 30,
  damage: 20 + (level - 1) * 5,
  name: `Flying Demon Lv.${level}`,
});

/** Hero damage per correct answer */
export const HERO_DAMAGE = 25;
