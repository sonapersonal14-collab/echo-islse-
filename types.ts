
export interface Treasure {
  id: string;
  x: number;
  y: number;
  type: 'crystal' | 'relic' | 'scroll';
  name: string;
  collected: boolean;
  rhythmSpeed: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  type: 'parrot' | 'crab' | 'spirit';
  range: number;
  speed: number;
  angle: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  beatPhase: number; // 0 or 1 for appearing/disappearing
}

export interface GameState {
  currentIslandIndex: number;
  playerPos: { x: number; y: number };
  score: number;
  scannerActive: boolean;
  scannerCooldown: number;
  scannerRange: number;
  isHiding: boolean;
  treasures: Treasure[];
  enemies: Enemy[];
  obstacles: Obstacle[];
  isLevelCleared: boolean;
}

export interface LoreData {
  title: string;
  content: string;
}
