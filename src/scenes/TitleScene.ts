import Phaser from 'phaser';
import { TextButton } from '../ui/TextButton';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);

    this.add.image(width / 2, height * 0.18, 'ui-panel').setDisplaySize(width * 0.8, 160);
    this.add
      .text(width / 2, height * 0.18, 'CORE BREAKER', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '52px',
        color: '#e9eef6',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.28, 'MINI RUN: SHIELD → WEAKPOINT → CORE', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '20px',
        color: '#9fb0cc',
      })
      .setOrigin(0.5);

    const startButton = new TextButton(this, width / 2, height * 0.55, 'START');
    startButton.on('pointerup', () => {
      this.scene.start('GarageScene');
    });

    this.add.existing(startButton);

    this.add
      .text(width / 2, height * 0.75, 'Tap: 기본 타격 / Hold 후 Release: 차지 강타', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '18px',
        color: '#6f83a3',
      })
      .setOrigin(0.5);
  }
}
