
export enum GameView {
  MENU = 'MENU',
  LORE = 'LORE',
  HERO_SELECT = 'HERO_SELECT',
  LEVEL_SELECT = 'LEVEL_SELECT',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  BESTIARY = 'BESTIARY'
}

export enum TowerType {
  BARRACKS = 'BARRACKS',
  ARCHER = 'ARCHER',
  MAGE = 'MAGE',
  CANNON = 'CANNON',
  GOLD_MINE = 'GOLD_MINE',
  SUPPORT = 'SUPPORT'
}

export enum ProjectileType {
  ARROW = 'ARROW',
  MAGIC = 'MAGIC',
  BOMB = 'BOMB'
}

export interface TowerTier {
  name: string;
  damage: number;
  range: number;
  rate: number; // Cooldown in ms
  cost: number;
  description: string;
  projectileType?: ProjectileType;
  splashRadius?: number;
  soldierHp?: number;
  soldierArmor?: number;
}

export interface TowerDef {
  id: string;
  type: TowerType;
  name: string;
  icon: string;
  t1: TowerTier;
  t2: TowerTier;
  t3Options: TowerTier[];
}

export interface Soldier {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: number;
  respawnTime: number;
  isDead: boolean;
  targetEnemyId: string | null;
}

export interface ActiveTower {
  id: string;
  x: number;
  y: number;
  defId: string;
  tier: 1 | 2 | 3;
  t3Index?: number;
  lastAttackTime: number;
  level: number;
  soldiers: Soldier[]; 
  rallyPoint?: { x: number, y: number };
}

export enum EnemyType {
  SLIME = 'SLIME',
  GOBLIN = 'GOBLIN',
  WOLF = 'WOLF',
  ORC = 'ORC',
  HARPY = 'HARPY',
  ARMORED_KNIGHT = 'ARMORED_KNIGHT',
  DARK_MAGE = 'DARK_MAGE',
  GOLEM = 'GOLEM',
  DEMON = 'DEMON',
  VOID_LORD = 'VOID_LORD'
}

export interface EnemyDef {
  type: EnemyType;
  name: string;
  description: string;
  baseHp: number;
  baseSpeed: number;
  armor: number; // 0-1
  isFlying: boolean;
  reward: number;
  visualColor: string;
}

export interface Enemy {
  id: string;
  defId: EnemyType; // Refers to EnemyDef
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathId: number;
  pathIndex: number;
  isFlying: boolean;
  // Combat Status
  isBlocked: boolean;
  blockedBy: string | null;
  // Status Effects
  freezeTime: number;
  burnTime: number;
  stunTime: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  type: ProjectileType;
  splashRadius?: number;
  hit: boolean;
  isHeroProjectile?: boolean; // New flag to distinguish tower vs hero shots
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
}

export interface HeroVisualTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  weaponType: 'SWORD' | 'BOW' | 'GUN' | 'MAGIC' | 'GAUNTLET';
  feature: 'HORNS' | 'FOX_EARS' | 'HAT' | 'TAILS' | 'ARMOR';
  eyeColor: string;
  hairStyle: 'LONG' | 'SHORT' | 'PONYTAIL' | 'TWINTAILS';
}

// Talent System Types
export interface Talent {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  icon: string; // Lucide icon name placeholder
}

export interface SelectedTalents {
  t1: string | null;
  t2: string | null;
  t3: string | null;
}

export interface Hero {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  ultimateName: string;
  ultimateDesc: string;
  baseStats: {
    hp: number;
    atk: number;
    armor: number;
    respawnTime: number;
    skillCooldown: number; // Seconds
  };
  visualTheme: HeroVisualTheme;
  talentTree: {
    t1: Talent[]; // Choice of 2
    t2: Talent[]; // Choice of 2
    t3: Talent[]; // Single powerful upgrade or choice
  };
}

export interface LevelTheme {
  background: string; // CSS color or gradient
  pathColor: string;
  decorationType: 'FOREST' | 'DESERT' | 'SNOW' | 'LAVA' | 'VOID';
}

export interface LevelConfig {
  id: number;
  name: string;
  waves: number;
  paths: { x: number; y: number }[][];
  buildSlots: { x: number; y: number }[];
  startMoney: number;
  theme: LevelTheme;
}

export interface GameState {
  money: number;
  lives: number;
  wave: number;
  activeTowers: ActiveTower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  selectedHeroDef: Hero | null;
  heroEntity: {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    isDead: boolean;
    respawnTimer: number;
    state: 'IDLE' | 'MOVING' | 'FIGHTING';
    targetX?: number;
    targetY?: number;
    fightingEnemyId?: string | null;
    skillCooldownTimer: number; // Frames
    isSkillActive: boolean;
    lastAttackTime: number; // For ranged attack rate
    // Applied Talent Flags
    talents: SelectedTalents; 
  } | null;
  
  // Visual Effects State
  skillEffect: {
    type: 'RIN_BLAST' | 'YUKI_RAIN' | 'SAKURA_LASER' | 'TAMAMO_FOG' | 'IBARAKI_HAND';
    timer: number;
    x: number;
    y: number;
  } | null;

  gameSpeed: number;
  isPaused: boolean;
  selectedTowerId: string | null;
  score: number;
  view: GameView;
}
