import type { HitGrade } from '../types';

interface CombatStats {
  gloveLv: number;
  hammerLv: number;
  droneLv: number;
}

interface HitResult {
  grade: HitGrade;
  damage: number;
  gradeMultiplier: number;
  comboMultiplier: number;
  hitstop: number;
  shake: number;
}

export class CombatSystem {
  private stats: CombatStats;
  combo = 0;
  maxCombo = 0;
  comboTimer = 0;
  comboTimerMax = 1.2;
  counterGauge = 0;
  stunRemaining = 0;
  perfectCount = 0;
  totalDamage = 0;

  constructor(stats: CombatStats) {
    this.stats = stats;
  }

  getTapDamage() {
    return 10 + this.stats.gloveLv;
  }

  getChargedDamage() {
    return 45 + this.stats.hammerLv * 3;
  }

  update(deltaSeconds: number) {
    if (this.stunRemaining > 0) {
      this.stunRemaining = Math.max(0, this.stunRemaining - deltaSeconds);
    }

    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - deltaSeconds);
      if (this.comboTimer === 0) {
        this.combo = 0;
        this.comboTimerMax = 1.2;
      }
    }
  }

  applyHit(grade: HitGrade, baseDamage: number): HitResult {
    if (this.stunRemaining > 0) {
      return {
        grade: 'Miss',
        damage: 0,
        gradeMultiplier: 0,
        comboMultiplier: this.getComboMultiplier(),
        hitstop: 0,
        shake: 0,
      };
    }

    let gradeMultiplier = 0;
    let comboGain = 0;
    let hitstop = 0;
    let shake = 0;

    if (grade === 'Perfect') {
      gradeMultiplier = 2.0;
      comboGain = 2;
      hitstop = 0.09;
      shake = 0.012;
      this.perfectCount += 1;
      this.counterGauge = Math.max(0, this.counterGauge - (15 + this.stats.droneLv));
      this.comboTimerMax = Math.min(2.0, this.comboTimerMax + 0.3);
    } else if (grade === 'Great') {
      gradeMultiplier = 1.5;
      comboGain = 1;
      hitstop = 0.05;
      shake = 0.006;
    } else if (grade === 'Good') {
      gradeMultiplier = 1.0;
      comboGain = 1;
    } else {
      gradeMultiplier = 0;
      comboGain = 0;
      this.counterGauge += 10;
      this.combo = 0;
      this.comboTimer = 0;
      this.comboTimerMax = 1.2;
    }

    if (comboGain > 0) {
      this.combo += comboGain;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboTimer = this.comboTimerMax;
    }

    if (this.counterGauge >= 100) {
      this.counterGauge = 0;
      this.stunRemaining = 0.7;
      this.combo = 0;
      this.comboTimer = 0;
      this.comboTimerMax = 1.2;
    }

    const comboMultiplier = this.getComboMultiplier();
    const damage = Math.round(baseDamage * gradeMultiplier * comboMultiplier);

    if (damage > 0) {
      this.totalDamage += damage;
    }

    return {
      grade,
      damage,
      gradeMultiplier,
      comboMultiplier,
      hitstop,
      shake,
    };
  }

  private getComboMultiplier() {
    if (this.combo >= 60) {
      return 1.6;
    }
    if (this.combo >= 40) {
      return 1.4;
    }
    if (this.combo >= 20) {
      return 1.25;
    }
    if (this.combo >= 10) {
      return 1.1;
    }
    return 1.0;
  }
}
