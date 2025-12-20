import Phaser from 'phaser';

export class TextButton extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width = 240,
    height = 64,
    textureKey = 'ui-button',
  ) {
    super(scene, x, y);
    this.background = scene.add.image(0, 0, textureKey);
    this.background.setDisplaySize(width, height);
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#e9eef6',
        shadow: { offsetX: 0, offsetY: 2, color: '#0b0d12', blur: 2, fill: true },
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    this.setSize(width, height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    this.on('pointerover', () => {
      this.background.setTint(0xc3d6ff);
    });
    this.on('pointerout', () => {
      this.background.clearTint();
    });
    this.on('pointerdown', () => {
      this.background.setTint(0x94b2ff);
    });
    this.on('pointerup', () => {
      this.background.setTint(0xc3d6ff);
    });
  }

  setText(text: string) {
    this.label.setText(text);
  }
}
