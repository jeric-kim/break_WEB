import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import type { RunResult, SaveData } from '../types';
import { TextButton } from '../ui/TextButton';

interface ResultData {
  result: RunResult;
  cleared: boolean;
}

export class ResultScene extends Phaser.Scene {
  private runResult!: RunResult;
  private cleared = false;
  private saveData!: SaveData;

  constructor() {
    super('ResultScene');
  }

  init(data: ResultData) {
    this.runResult = data.result;
    this.cleared = data.cleared;
  }

  create() {
    const { width, height } = this.scale;
    this.saveData = SaveSystem.load();

    this.applyRewards();

    this.add
      .text(width / 2, height * 0.1, this.cleared ? 'CORE BREACHED!' : 'TIME UP', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '40px',
        color: '#e9eef6',
      })
      .setOrigin(0.5);

    const infoLines = [
      `Score: ${this.runResult.score}`,
      `Rank: ${this.runResult.rank}`,
      `Total Damage: ${this.runResult.totalDamage}`,
      `Perfect: ${this.runResult.perfectCount}`,
      `Max Combo: ${this.runResult.maxCombo}`,
      `Remaining: ${this.runResult.remainingSeconds}s`,
    ];

    this.add
      .text(width / 2, height * 0.24, infoLines.join('\n'), {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#9fb0ff',
        align: 'center',
      })
      .setOrigin(0.5, 0);

    const rewardLines = [
      `Rewards Applied`,
      `Coins +${this.runResult.rewards.coins}`,
      `Parts +${this.runResult.rewards.parts}`,
      `Blueprint: ${this.runResult.rewards.blueprint ? 'DROP!' : 'None'}`,
      `Best Score: ${this.saveData.bestScore}`,
    ];

    this.add
      .text(width / 2, height * 0.55, rewardLines.join('\n'), {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#ffd56b',
        align: 'center',
      })
      .setOrigin(0.5, 0);

    const runAgain = new TextButton(this, width / 2, height * 0.78, 'RUN AGAIN', 260, 64);
    runAgain.on('pointerup', () => {
      this.scene.start('RunScene');
    });

    const backButton = new TextButton(this, width / 2, height * 0.86, 'BACK TO GARAGE', 260, 58);
    backButton.on('pointerup', () => {
      this.scene.start('GarageScene');
    });

    this.add.existing(runAgain);
    this.add.existing(backButton);
  }

  private applyRewards() {
    this.saveData.coins += this.runResult.rewards.coins;
    this.saveData.parts += this.runResult.rewards.parts;

    if (this.runResult.rewards.blueprint) {
      const id = `bp_${this.runResult.rank}`;
      this.saveData.blueprints[id] = (this.saveData.blueprints[id] ?? 0) + 1;
    }

    this.saveData.bestScore = Math.max(this.saveData.bestScore, this.runResult.score);
    SaveSystem.save(this.saveData);
  }
}
