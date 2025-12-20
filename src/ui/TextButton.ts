import Phaser from 'phaser';

export class TextButton extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width = 240,
    height = 64,
  ) {
    super(scene, x, y);
    this.background = scene.add
      .rectangle(0, 0, width, height, 0x1f2a44, 0.9)
      .setStrokeStyle(2, 0x74a2ff);
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '24px',
        color: '#e9eef6',
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    this.setSize(width, height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    this.on('pointerover', () => {
      this.background.setFillStyle(0x2a3a5f, 1);
    });
    this.on('pointerout', () => {
      this.background.setFillStyle(0x1f2a44, 0.9);
    });
    this.on('pointerdown', () => {
      this.background.setFillStyle(0x16213a, 1);
    });
    this.on('pointerup', () => {
      this.background.setFillStyle(0x2a3a5f, 1);
    });
  }

  setText(text: string) {
    this.label.setText(text);
  }
}
