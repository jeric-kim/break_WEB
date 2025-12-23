import type { SaveData } from '../storage/SaveSystem';

export type StageType = 'Shield' | 'WeakPoint' | 'Core';
export type HitGrade = 'Perfect' | 'Great' | 'Good' | 'Miss';

export interface RunState {
  stageIndex: number;
  stageHp: number;
  stageMaxHp: number;
  timeLeft: number;
  combo: number;
  maxCombo: number;
  counterGauge: number;
  perfectCount: number;
  totalDamage: number;
  stunned: boolean;
}

const stages: Array<{ type: StageType; hp: number }> = [
  { type: 'Shield', hp: 180 },
  { type: 'WeakPoint', hp: 120 },
  { type: 'Core', hp: 220 },
];

export class Combat {
  private save: SaveData;
  state: RunState;

  constructor(save: SaveData) {
    this.save = save;
    this.state = {
      stageIndex: 0,
      stageHp: stages[0].hp,
      stageMaxHp: stages[0].hp,
      timeLeft: 40,
      combo: 0,
      maxCombo: 0,
      counterGauge: 0,
      perfectCount: 0,
      totalDamage: 0,
      stunned: false,
    };
  }

  getCurrentStage() {
    return stages[this.state.stageIndex];
  }

  getTapDamage() {
    return 10 + this.save.equipment.gloveLv;
  }

  getChargedDamage() {
    return 45 + this.save.equipment.hammerLv * 3;
  }

  getFocusDamage() {
    return Math.round(this.getTapDamage() * 0.4);
  }

  rollIndicator() {
    return Math.floor(Math.random() * 7);
  }

  getGrade(pointerIndex: number): HitGrade {
    const diff = Math.abs(pointerIndex - 0);
    if (diff === 0) return 'Perfect';
    if (diff === 1) return 'Great';
    if (diff === 2) return 'Good';
    return 'Miss';
  }

  applyHit(baseDamage: number, grade: HitGrade) {
    if (grade === 'Perfect') {
      this.state.combo += 2;
      this.state.perfectCount += 1;
      this.state.counterGauge = Math.max(0, this.state.counterGauge - (15 + this.save.equipment.droneLv));
    } else if (grade === 'Great' || grade === 'Good') {
      this.state.combo += 1;
    } else {
      this.state.combo = 0;
      this.state.counterGauge += 10;
    }

    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

    const gradeMultiplier = this.getGradeMultiplier(grade);
    const comboMultiplier = this.getComboMultiplier();
    const damage = Math.round(baseDamage * gradeMultiplier * comboMultiplier);

    if (damage > 0) {
      this.state.stageHp = Math.max(0, this.state.stageHp - damage);
      this.state.totalDamage += damage;
    }

    return { damage, gradeMultiplier, comboMultiplier };
  }

  applyFocus() {
    this.state.counterGauge = Math.max(0, this.state.counterGauge - (10 + this.save.equipment.droneLv));
    const damage = this.getFocusDamage();
    this.state.stageHp = Math.max(0, this.state.stageHp - damage);
    this.state.totalDamage += damage;
    this.state.combo += 1;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
    return damage;
  }

  stepTime(cost: number) {
    this.state.timeLeft = Math.max(0, Number((this.state.timeLeft - cost).toFixed(1)));
  }

  checkStun() {
    if (this.state.counterGauge >= 100) {
      this.state.counterGauge = 0;
      this.state.stunned = true;
      this.state.combo = 0;
    }
  }

  resolveStun() {
    this.state.stunned = false;
  }

  advanceStage() {
    if (this.state.stageIndex < stages.length - 1) {
      this.state.stageIndex += 1;
      const stage = stages[this.state.stageIndex];
      this.state.stageHp = stage.hp;
      this.state.stageMaxHp = stage.hp;
      return true;
    }
    return false;
  }

  isCleared() {
    return this.state.stageIndex === stages.length - 1 && this.state.stageHp <= 0;
  }

  getComboMultiplier() {
    const combo = this.state.combo;
    if (combo >= 60) return 1.6;
    if (combo >= 40) return 1.4;
    if (combo >= 20) return 1.25;
    if (combo >= 10) return 1.1;
    return 1.0;
  }

  getGradeMultiplier(grade: HitGrade) {
    if (grade === 'Perfect') return 2.0;
    if (grade === 'Great') return 1.5;
    if (grade === 'Good') return 1.0;
    return 0;
  }
}
