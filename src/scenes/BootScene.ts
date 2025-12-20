import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0d12');
    this.time.delayedCall(200, () => {
      this.scene.start('TitleScene');
    });
  }
}
