import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { TextButton } from '../ui/TextButton';
import type { SaveData } from '../types';

export class GarageScene extends Phaser.Scene {
  private saveData!: SaveData;
  private coinsText!: Phaser.GameObjects.Text;
  private partsText!: Phaser.GameObjects.Text;
  private blueprintText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private gloveText!: Phaser.GameObjects.Text;
  private hammerText!: Phaser.GameObjects.Text;
  private droneText!: Phaser.GameObjects.Text;

  constructor() {
    super('GarageScene');
  }

  create() {
    const { width, height } = this.scale;
    this.saveData = SaveSystem.load();

    this.add
      .text(width / 2, height * 0.08, 'GARAGE', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '42px',
        color: '#e9eef6',
      })
      .setOrigin(0.5);

    this.coinsText = this.add
      .text(width * 0.1, height * 0.16, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#ffd56b',
      })
      .setOrigin(0, 0.5);
    this.partsText = this.add
      .text(width * 0.1, height * 0.2, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#9ee6a2',
      })
      .setOrigin(0, 0.5);
    this.blueprintText = this.add
      .text(width * 0.1, height * 0.24, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#9fb0ff',
      })
      .setOrigin(0, 0.5);
    this.bestScoreText = this.add
      .text(width * 0.1, height * 0.28, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);

    this.gloveText = this.add
      .text(width * 0.1, height * 0.38, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#e9eef6',
      })
      .setOrigin(0, 0.5);
    const gloveButton = new TextButton(this, width * 0.8, height * 0.38, 'UPGRADE', 200, 52);
    gloveButton.on('pointerup', () => {
      this.tryUpgrade('gloveLv');
    });

    this.hammerText = this.add
      .text(width * 0.1, height * 0.46, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#e9eef6',
      })
      .setOrigin(0, 0.5);
    const hammerButton = new TextButton(this, width * 0.8, height * 0.46, 'UPGRADE', 200, 52);
    hammerButton.on('pointerup', () => {
      this.tryUpgrade('hammerLv');
    });

    this.droneText = this.add
      .text(width * 0.1, height * 0.54, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#e9eef6',
      })
      .setOrigin(0, 0.5);
    const droneButton = new TextButton(this, width * 0.8, height * 0.54, 'UPGRADE', 200, 52);
    droneButton.on('pointerup', () => {
      this.tryUpgrade('droneLv');
    });

    const runButton = new TextButton(this, width / 2, height * 0.7, 'RUN START', 260, 64);
    runButton.on('pointerup', () => {
      this.scene.start('RunScene');
    });

    const resetButton = new TextButton(this, width / 2, height * 0.78, 'RESET SAVE', 260, 56);
    resetButton.on('pointerup', () => {
      this.saveData = SaveSystem.reset();
      this.refresh();
    });

    const backButton = new TextButton(this, width / 2, height * 0.86, 'BACK TO TITLE', 260, 56);
    backButton.on('pointerup', () => {
      this.scene.start('TitleScene');
    });

    this.add.existing(gloveButton);
    this.add.existing(hammerButton);
    this.add.existing(droneButton);
    this.add.existing(runButton);
    this.add.existing(resetButton);
    this.add.existing(backButton);

    this.refresh();
  }

  private refresh() {
    this.coinsText.setText(`Coins: ${this.saveData.coins}`);
    this.partsText.setText(`Parts: ${this.saveData.parts}`);
    this.blueprintText.setText(`Blueprints: ${Object.keys(this.saveData.blueprints).length}`);
    this.bestScoreText.setText(`Best Score: ${this.saveData.bestScore}`);

    this.gloveText.setText(`Glove Lv.${this.saveData.equipment.gloveLv} (Tap Damage +${this.saveData.equipment.gloveLv})`);
    this.hammerText.setText(`Hammer Lv.${this.saveData.equipment.hammerLv} (Charged +${this.saveData.equipment.hammerLv * 3})`);
    this.droneText.setText(`Drone Lv.${this.saveData.equipment.droneLv} (Perfect Gauge -${15 + this.saveData.equipment.droneLv})`);
  }

  private tryUpgrade(type: 'gloveLv' | 'hammerLv' | 'droneLv') {
    const currentLv = this.saveData.equipment[type];
    const nextLv = currentLv + 1;
    if (nextLv > 10) {
      return;
    }
    const cost = nextLv * 100;
    if (this.saveData.coins < cost) {
      return;
    }
    this.saveData.coins -= cost;
    this.saveData.equipment[type] = nextLv;
    SaveSystem.save(this.saveData);
    this.refresh();
  }
}
