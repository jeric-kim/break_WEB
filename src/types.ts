export type StageType = 'Shield' | 'WeakPoint' | 'Core';

export type HitGrade = 'Perfect' | 'Great' | 'Good' | 'Miss';

export interface SaveData {
  coins: number;
  parts: number;
  blueprints: Record<string, number>;
  equipment: {
    gloveLv: number;
    hammerLv: number;
    droneLv: number;
  };
  bestScore: number;
}

export interface RunResult {
  totalDamage: number;
  maxCombo: number;
  perfectCount: number;
  remainingSeconds: number;
  score: number;
  rank: 'S' | 'A' | 'B' | 'C';
  rewards: {
    coins: number;
    parts: number;
    blueprint: boolean;
  };
}
