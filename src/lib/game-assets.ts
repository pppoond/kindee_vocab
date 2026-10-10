export type AnimationConfig = {
  src: string;
  frames: number;
  fps: number;
  loop: boolean;
};

export type CharacterData = {
  id?: string;
  size: number;
  flip?: boolean;
  offsetY?: string;
  name: string;
  title?: string;
  maxHp: number;
  damage?: number;
  animations: Record<string, AnimationConfig>;
};

export type EnemyData = CharacterData & {
  baseHp: number;
  baseDamage: number;
};

export const HEROES: Record<string, CharacterData> = {
  knight: {
    id: "knight",
    size: 34,
    flip: false,
    offsetY: "0%",
    name: "Knight",
    title: "Ironclad Warrior",
    maxHp: 120,
    damage: 25,
    animations: {
      idle:   { src: "/assets/characters/knight/IDLE.png", frames: 7, fps: 8, loop: true },
      attack: { src: "/assets/characters/knight/ATTACK_1.png", frames: 6, fps: 12, loop: false },
      attack2: { src: "/assets/characters/knight/ATTACK_2.png", frames: 5, fps: 12, loop: false },
      attack3: { src: "/assets/characters/knight/ATTACK_3.png", frames: 6, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/knight/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/knight/IDLE.png", frames: 7, fps: 8, loop: true },
      lose:   { src: "/assets/characters/knight/DEATH.png", frames: 12, fps: 8, loop: false },
    },
  },
  huntress: {
    id: "huntress",
    size: 56,
    flip: false,
    offsetY: "-15%",
    name: "Huntress",
    title: "Forest Ranger",
    maxHp: 95,
    damage: 32,
    animations: {
      idle:   { src: "/assets/characters/huntress/IDLE.png", frames: 8, fps: 8, loop: true },
      attack: { src: "/assets/characters/huntress/ATTACK_1.png", frames: 5, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/huntress/HURT.png", frames: 3, fps: 8, loop: false },
      win:    { src: "/assets/characters/huntress/IDLE.png", frames: 8, fps: 8, loop: true },
      lose:   { src: "/assets/characters/huntress/DEATH.png", frames: 8, fps: 8, loop: false },
    },
  },
};

export const ENEMIES: Record<string, EnemyData> = {
  mushroom: {
    id: "mushroom",
    size: 52,
    flip: true,
    offsetY: "-15%",
    name: "Spore Shroom",
    maxHp: 60,
    baseHp: 60,
    baseDamage: 12,
    animations: {
      idle:   { src: "/assets/characters/mushroom/IDLE.png", frames: 4, fps: 7, loop: true },
      attack: { src: "/assets/characters/mushroom/ATTACK.png", frames: 8, fps: 10, loop: false },
      hurt:   { src: "/assets/characters/mushroom/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/mushroom/IDLE.png", frames: 4, fps: 7, loop: true },
      lose:   { src: "/assets/characters/mushroom/DEATH.png", frames: 4, fps: 8, loop: false },
    },
  },
  goblin: {
    id: "goblin",
    size: 54,
    flip: true,
    offsetY: "-15%",
    name: "Dagger Goblin",
    maxHp: 85,
    baseHp: 85,
    baseDamage: 16,
    animations: {
      idle:   { src: "/assets/characters/goblin/IDLE.png", frames: 4, fps: 7, loop: true },
      attack: { src: "/assets/characters/goblin/ATTACK.png", frames: 8, fps: 11, loop: false },
      hurt:   { src: "/assets/characters/goblin/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/goblin/IDLE.png", frames: 4, fps: 7, loop: true },
      lose:   { src: "/assets/characters/goblin/DEATH.png", frames: 4, fps: 8, loop: false },
    },
  },
  skeleton: {
    id: "skeleton",
    size: 56,
    flip: true,
    offsetY: "-15%",
    name: "Crypt Skeleton",
    maxHp: 120,
    baseHp: 120,
    baseDamage: 22,
    animations: {
      idle:   { src: "/assets/characters/skeleton/IDLE.png", frames: 4, fps: 7, loop: true },
      attack: { src: "/assets/characters/skeleton/ATTACK.png", frames: 8, fps: 11, loop: false },
      hurt:   { src: "/assets/characters/skeleton/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/skeleton/IDLE.png", frames: 4, fps: 7, loop: true },
      lose:   { src: "/assets/characters/skeleton/DEATH.png", frames: 4, fps: 8, loop: false },
    },
  },
  flying_eye: {
    id: "flying_eye",
    size: 52,
    flip: true,
    offsetY: "-5%",
    name: "Gazing Fiend",
    maxHp: 160,
    baseHp: 160,
    baseDamage: 28,
    animations: {
      idle:   { src: "/assets/characters/flying_eye/IDLE.png", frames: 8, fps: 8, loop: true },
      attack: { src: "/assets/characters/flying_eye/ATTACK.png", frames: 8, fps: 11, loop: false },
      hurt:   { src: "/assets/characters/flying_eye/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/flying_eye/IDLE.png", frames: 8, fps: 8, loop: true },
      lose:   { src: "/assets/characters/flying_eye/DEATH.png", frames: 4, fps: 8, loop: false },
    },
  },
  demon: {
    id: "demon",
    size: 38,
    flip: false,
    offsetY: "0%",
    name: "Flying Demon",
    maxHp: 200,
    baseHp: 200,
    baseDamage: 35,
    animations: {
      idle:   { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      flying: { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      attack: { src: "/assets/characters/flying_demon/ATTACK.png", frames: 8, fps: 12, loop: false },
      hurt:   { src: "/assets/characters/flying_demon/HURT.png", frames: 4, fps: 8, loop: false },
      win:    { src: "/assets/characters/flying_demon/IDLE.png", frames: 4, fps: 8, loop: true },
      lose:   { src: "/assets/characters/flying_demon/DEATH.png", frames: 7, fps: 8, loop: false },
    },
  },
};

export const ASSETS: Record<string, any> = {
  get hero() {
    return HEROES.knight;
  },
  get demon() {
    return ENEMIES.demon;
  },
  background: "/assets/backgrounds/forest.jpg",
};

export const getAllAssetUrls = () => {
  const urls: string[] = [];
  if (typeof ASSETS.background === "string") urls.push(ASSETS.background);

  const allCharacters = [...Object.values(HEROES), ...Object.values(ENEMIES)];
  allCharacters.forEach((char) => {
    if (char && char.animations) {
      Object.values(char.animations).forEach((anim) => {
        if (anim && anim.src) urls.push(anim.src);
      });
    }
  });

  return Array.from(new Set(urls));
};

export const preloadImages = (urls: string[]) => {
  if (typeof window === "undefined") return Promise.resolve();
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

export type EnemyStatConfig = {
  id: string;
  name: string;
  maxHp: number;
  damage: number;
  enemyData: CharacterData;
  isBoss: boolean;
};

/** Get enemy stats and character data scaled by level */
export const getEnemyStats = (level: number): EnemyStatConfig => {
  let enemyId = "demon";
  if (level <= 2) {
    enemyId = "mushroom";
  } else if (level <= 4) {
    enemyId = "goblin";
  } else if (level <= 6) {
    enemyId = "skeleton";
  } else if (level <= 8) {
    enemyId = "flying_eye";
  } else {
    enemyId = "demon";
  }

  const isBoss = level >= 5 && level % 5 === 0;
  const base = ENEMIES[enemyId] || ENEMIES.demon;
  const hpScaling = (level - 1) * 20;
  const dmgScaling = (level - 1) * 3;
  const maxHp = Math.round(base.baseHp + hpScaling + (isBoss ? 60 : 0));
  const damage = Math.round(base.baseDamage + dmgScaling + (isBoss ? 12 : 0));
  const name = `${isBoss ? "BOSS " : ""}${base.name} Lv.${level}`;

  return {
    id: enemyId,
    name,
    maxHp,
    damage,
    enemyData: {
      ...base,
      name,
      maxHp,
    },
    isBoss,
  };
};

/** Default Hero damage per correct answer */
export const HERO_DAMAGE = 25;
