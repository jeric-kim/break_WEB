import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { CombatSystem } from '../systems/CombatSystem';
import type { HitGrade, StageType, RunResult } from '../types';

interface StageInfo {
  type: StageType;
  maxHp: number;
  speed: number;
}

const stages: StageInfo[] = [
  { type: 'Shield', maxHp: 180, speed: 240 },
  { type: 'WeakPoint', maxHp: 120, speed: 260 },
  { type: 'Core', maxHp: 220, speed: 300 },
];

export class RunScene extends Phaser.Scene {
  private combat!: CombatSystem;
  private stageIndex = 0;
  private stageHp = 0;
  private stageMaxHp = 0;
  private stageLabel!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private gaugeText!: Phaser.GameObjects.Text;
  private gradeText!: Phaser.GameObjects.Text;
  private stunText!: Phaser.GameObjects.Text;
  private marker!: Phaser.GameObjects.Triangle;
  private ringGraphics!: Phaser.GameObjects.Graphics;
  private safeGraphics!: Phaser.GameObjects.Graphics;
  private crackGraphics!: Phaser.GameObjects.Graphics;
  private safeContainer!: Phaser.GameObjects.Container;
  private hitstopRemaining = 0;
  private markerAngle = 0;
  private pointerDownTime: number | null = null;
  private timeLeft = 40;
  private timeBar!: Phaser.GameObjects.Rectangle;
  private stageThresholds: number[] = [];
  private finished = false;

  constructor() {
    super('RunScene');
  }

  create() {
    const saveData = SaveSystem.load();
    this.combat = new CombatSystem(saveData.equipment);

    this.timeLeft = 40;
    this.stageIndex = 0;
    this.setupStage();

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b0d12');

    this.stageLabel = this.add
      .text(width / 2, height * 0.08, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '32px',
        color: '#e9eef6',
      })
      .setOrigin(0.5);

    this.hpText = this.add
      .text(width * 0.1, height * 0.14, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#ffd56b',
      })
      .setOrigin(0, 0.5);

    this.timeText = this.add
      .text(width * 0.9, height * 0.14, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#9ee6a2',
      })
      .setOrigin(1, 0.5);

    this.comboText = this.add
      .text(width * 0.1, height * 0.18, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#9fb0ff',
      })
      .setOrigin(0, 0.5);

    this.gaugeText = this.add
      .text(width * 0.1, height * 0.22, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#f58b8b',
      })
      .setOrigin(0, 0.5);

    this.gradeText = this.add
      .text(width / 2, height * 0.26, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.stunText = this.add
      .text(width / 2, height * 0.32, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#ff9f5a',
      })
      .setOrigin(0.5);

    const timeBarBg = this.add.rectangle(width / 2, height * 0.11, width * 0.8, 14, 0x1f2a44);
    timeBarBg.setStrokeStyle(1, 0x4a5c7b);
    this.timeBar = this.add.rectangle(width / 2 - width * 0.4, height * 0.11, width * 0.8, 10, 0x74a2ff);
    this.timeBar.setOrigin(0, 0.5);

    const safeCenterY = height * 0.6;
    const safeCenterX = width / 2;

    this.safeGraphics = this.add.graphics();
    this.crackGraphics = this.add.graphics();
    this.safeContainer = this.add.container(safeCenterX, safeCenterY, [this.safeGraphics, this.crackGraphics]);

    this.ringGraphics = this.add.graphics();
    this.ringGraphics.setPosition(safeCenterX, safeCenterY - 40);

    this.marker = this.add.triangle(0, 0, 0, -18, 12, 10, -12, 10, 0xffd56b);
    this.marker.setPosition(safeCenterX, safeCenterY - 40 - 120);

    this.input.on('pointerdown', () => {
      if (this.combat.stunRemaining > 0 || this.hitstopRemaining > 0) {
        return;
      }
      this.pointerDownTime = this.time.now;
    });

    this.input.on('pointerup', () => {
      if (this.combat.stunRemaining > 0 || this.hitstopRemaining > 0) {
        this.pointerDownTime = null;
        return;
      }
      if (this.pointerDownTime === null) {
        return;
      }
      const duration = (this.time.now - this.pointerDownTime) / 1000;
      const baseDamage = duration >= 0.35 ? this.combat.getChargedDamage() : this.combat.getTapDamage();
      const grade = this.getGradeFromMarker();
      this.handleHit(grade, baseDamage);
      this.pointerDownTime = null;
    });

    this.drawSafe();
    this.refreshUi();
  }

  update(_: number, delta: number) {
    if (this.finished) {
      return;
    }
    const deltaSeconds = delta / 1000;
    if (this.hitstopRemaining > 0) {
      this.hitstopRemaining = Math.max(0, this.hitstopRemaining - deltaSeconds);
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);
    if (this.timeLeft <= 0) {
      this.finishRun(false);
      return;
    }

    this.combat.update(deltaSeconds);
    if (this.combat.stunRemaining > 0) {
      this.stunText.setText(`STUN ${(this.combat.stunRemaining).toFixed(2)}s`);
    } else {
      this.stunText.setText('');
    }

    const speed = stages[this.stageIndex].speed;
    this.markerAngle = (this.markerAngle + speed * deltaSeconds) % 360;
    this.positionMarker();

    this.refreshUi();
  }

  private setupStage() {
    const stage = stages[this.stageIndex];
    this.stageHp = stage.maxHp;
    this.stageMaxHp = stage.maxHp;
    this.stageThresholds = [0.75, 0.5, 0.25];
  }

  private drawSafe() {
    this.safeGraphics.clear();
    this.crackGraphics.clear();
    const color = this.getStageColor();
    this.safeGraphics.fillStyle(color, 0.5);
    this.safeGraphics.lineStyle(4, 0xffffff, 0.8);
    this.safeGraphics.fillRoundedRect(-150, -120, 300, 240, 16);
    this.safeGraphics.strokeRoundedRect(-150, -120, 300, 240, 16);
    this.safeGraphics.fillStyle(0x0b0d12, 1);
    this.safeGraphics.fillCircle(0, 0, 60);
    this.safeGraphics.lineStyle(3, 0x74a2ff, 0.8);
    this.safeGraphics.strokeCircle(0, 0, 72);
  }

  private drawRing() {
    const ringRadius = 120;
    this.ringGraphics.clear();
    this.ringGraphics.lineStyle(4, 0x4a5c7b, 1);
    this.ringGraphics.strokeCircle(0, 0, ringRadius);

    this.ringGraphics.lineStyle(6, 0x74a2ff, 0.6);
    const targetAngle = Phaser.Math.DegToRad(270);
    this.ringGraphics.beginPath();
    this.ringGraphics.arc(0, 0, ringRadius, targetAngle - 0.2, targetAngle + 0.2);
    this.ringGraphics.strokePath();
  }

  private positionMarker() {
    const ringRadius = 120;
    const centerX = this.ringGraphics.x;
    const centerY = this.ringGraphics.y;
    const angleRad = Phaser.Math.DegToRad(this.markerAngle);
    const x = centerX + Math.cos(angleRad) * ringRadius;
    const y = centerY + Math.sin(angleRad) * ringRadius;
    this.marker.setPosition(x, y);
    this.marker.setRotation(angleRad + Math.PI / 2);
  }

  private getGradeFromMarker(): HitGrade {
    const targetAngle = 270;
    let diff = Math.abs(this.markerAngle - targetAngle) % 360;
    if (diff > 180) {
      diff = 360 - diff;
    }
    if (diff <= 8) {
      return 'Perfect';
    }
    if (diff <= 16) {
      return 'Great';
    }
    if (diff <= 24) {
      return 'Good';
    }
    return 'Miss';
  }

  private handleHit(grade: HitGrade, baseDamage: number) {
    const result = this.combat.applyHit(grade, baseDamage);
    this.gradeText.setText(result.grade);

    if (result.hitstop > 0) {
      this.hitstopRemaining = result.hitstop;
    }
    if (result.shake > 0) {
      this.cameras.main.shake(result.hitstop * 1000, result.shake);
    }

    if (result.damage > 0) {
      this.stageHp = Math.max(0, this.stageHp - result.damage);
      this.handleCracks();
      this.popDamage(result.damage);
    }

    if (this.stageIndex === 2 && this.stageHp / this.stageMaxHp <= 0.1) {
      this.safeContainer.setScale(1.02);
      this.tweens.add({
        targets: this.safeContainer,
        scale: 1,
        duration: 180,
        ease: 'Sine.Out',
      });
    }

    if (this.stageHp <= 0) {
      this.advanceStage();
    }
  }

  private advanceStage() {
    if (this.stageIndex < stages.length - 1) {
      this.stageIndex += 1;
      this.setupStage();
      this.drawSafe();
      this.drawRing();
      this.gradeText.setText('STAGE BREAK');
    } else {
      this.time.timeScale = 0.25;
      this.tweens.timeScale = 0.25;
      this.emitFragments(true);
      this.time.delayedCall(600, () => {
        this.time.timeScale = 1;
        this.tweens.timeScale = 1;
        this.finishRun(true);
      });
    }
  }

  private handleCracks() {
    const remainingRatio = this.stageHp / this.stageMaxHp;
    const triggered = this.stageThresholds.filter((t) => remainingRatio <= t);
    triggered.forEach(() => {
      const x = Phaser.Math.Between(-120, 120);
      const y = Phaser.Math.Between(-90, 90);
      this.crackGraphics.lineStyle(2, 0xffffff, 0.6);
      this.crackGraphics.beginPath();
      this.crackGraphics.moveTo(x, y);
      this.crackGraphics.lineTo(x + Phaser.Math.Between(-40, 40), y + Phaser.Math.Between(-40, 40));
      this.crackGraphics.strokePath();
      this.emitFragments(false);
      this.stageThresholds.shift();
    });
  }

  private emitFragments(finalBurst: boolean) {
    const count = finalBurst ? 18 : 8;
    for (let i = 0; i < count; i += 1) {
      const fragment = this.add.rectangle(
        this.safeContainer.x + Phaser.Math.Between(-120, 120),
        this.safeContainer.y + Phaser.Math.Between(-80, 80),
        Phaser.Math.Between(8, 16),
        Phaser.Math.Between(8, 16),
        0x9fb0ff,
        0.9,
      );
      const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
      const distance = Phaser.Math.Between(60, 160);
      this.tweens.add({
        targets: fragment,
        x: fragment.x + Math.cos(angle) * distance,
        y: fragment.y + Math.sin(angle) * distance,
        alpha: 0,
        duration: finalBurst ? 700 : 450,
        ease: 'Cubic.Out',
        onComplete: () => fragment.destroy(),
      });
    }
  }

  private popDamage(value: number) {
    const text = this.add
      .text(this.safeContainer.x, this.safeContainer.y - 140, `-${value}`, {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#ffd56b',
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 500,
      onComplete: () => text.destroy(),
    });
  }

  private refreshUi() {
    this.stageLabel.setText(`${stages[this.stageIndex].type} STAGE`);
    this.hpText.setText(`HP ${this.stageHp}/${this.stageMaxHp}`);
    this.timeText.setText(`TIME ${Math.ceil(this.timeLeft)}s`);
    this.comboText.setText(`Combo ${this.combat.combo}`);
    this.gaugeText.setText(`Counter ${Math.floor(this.combat.counterGauge)}/100`);
    this.timeBar.width = (this.scale.width * 0.8) * (this.timeLeft / 40);

    this.drawRing();
  }

  private getStageColor() {
    const stage = stages[this.stageIndex].type;
    if (stage === 'Shield') {
      return 0x4a5c7b;
    }
    if (stage === 'WeakPoint') {
      return 0x3a8a6a;
    }
    return 0x8a3a5a;
  }

  private finishRun(cleared: boolean) {
    if (this.finished) {
      return;
    }
    this.finished = true;
    const remainingSeconds = Math.floor(this.timeLeft);
    const score =
      this.combat.totalDamage +
      this.combat.perfectCount * 50 +
      this.combat.maxCombo * 20 +
      remainingSeconds * 10;

    const rank = this.getRank(score);
    const reward = this.rollRewards(rank);

    const result: RunResult = {
      totalDamage: this.combat.totalDamage,
      maxCombo: this.combat.maxCombo,
      perfectCount: this.combat.perfectCount,
      remainingSeconds,
      score,
      rank,
      rewards: reward,
    };

    this.scene.start('ResultScene', { result, cleared });
  }

  private getRank(score: number) {
    if (score >= 2200) {
      return 'S';
    }
    if (score >= 1700) {
      return 'A';
    }
    if (score >= 1200) {
      return 'B';
    }
    return 'C';
  }

  private rollRewards(rank: RunResult['rank']) {
    const coins = Phaser.Math.Between(50, 90);
    const parts = Phaser.Math.Between(1, 3);
    const blueprintChance = rank === 'S' ? 0.1 : 0.05;
    const blueprint = Math.random() < blueprintChance;

    return { coins, parts, blueprint };
  }
}
