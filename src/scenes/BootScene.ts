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

    const progressBg = this.add.rectangle(width / 2, height / 2 + 40, 320, 14, 0x1f2a44);
    const progressFill = this.add.rectangle(width / 2 - 160, height / 2 + 40, 0, 10, 0x74a2ff);
    progressFill.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      progressFill.width = 320 * value;
    });

    const baseUrl = import.meta.env.BASE_URL ?? '/';
    this.load.setBaseURL(baseUrl);

    this.load.image('ui-button', 'assets/ui/button.svg');
    this.load.image('ui-panel', 'assets/ui/panel.svg');
    this.load.image('bg', 'assets/game/bg.svg');
    this.load.image('shadow', 'assets/game/shadow.svg');
    this.load.image('safe-shield', 'assets/game/safe_shield.svg');
    this.load.image('safe-weak', 'assets/game/safe_weak.svg');
    this.load.image('safe-core', 'assets/game/safe_core.svg');
    this.load.image('ring', 'assets/game/ring.svg');
    this.load.image('marker', 'assets/game/marker.svg');

    const failNotice = this.add
      .text(width / 2, height / 2 + 80, '', {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '16px',
        color: '#ff9f5a',
        align: 'center',
      })
      .setOrigin(0.5);

    const missingAssets: string[] = [];
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      missingAssets.push(file.key);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      progressBg.destroy();
      progressFill.destroy();
      if (missingAssets.length > 0) {
        failNotice.setText(`Assets missing: ${missingAssets.join(', ')}`);
      }
      this.time.delayedCall(200, () => this.scene.start('TitleScene'));
    });

    this.time.delayedCall(2000, () => {
      if (!this.scene.isActive('TitleScene')) {
        failNotice.setText('Loader timeout. Starting with fallbacks.');
        this.scene.start('TitleScene');
      }
    });
    this.load.start();
  }
}
