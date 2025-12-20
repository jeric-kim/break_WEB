import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0d12');
    const { width, height } = this.scale;
    const loadingText = this.add
      .text(width / 2, height / 2, 'Loading...', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#9fb0ff',
      })
      .setOrigin(0.5);

    this.load.image('ui-button', 'assets/ui/button.svg');
    this.load.image('ui-panel', 'assets/ui/panel.svg');
    this.load.image('bg', 'assets/game/bg.svg');
    this.load.image('shadow', 'assets/game/shadow.svg');
    this.load.image('safe-shield', 'assets/game/safe_shield.svg');
    this.load.image('safe-weak', 'assets/game/safe_weak.svg');
    this.load.image('safe-core', 'assets/game/safe_core.svg');
    this.load.image('ring', 'assets/game/ring.svg');
    this.load.image('marker', 'assets/game/marker.svg');

    this.load.on('complete', () => {
      loadingText.destroy();
      this.scene.start('TitleScene');
    });
    this.load.start();
  }
}
