import type { SaveData } from '../storage/SaveSystem';
import { SaveSystem } from '../storage/SaveSystem';
import { Combat, type HitGrade } from './Combat';

export type GameState = 'MAIN' | 'HELP_OPEN' | 'GARAGE' | 'RUN' | 'RESULT';

type OutputHandler = (message: string) => void;

export class GameEngine {
  private saveSystem: SaveSystem;
  private saveData: SaveData;
  private output: OutputHandler;
  private state: GameState = 'MAIN';
  private combat: Combat | null = null;
  private lastState: GameState = 'MAIN';

  constructor(saveSystem: SaveSystem, output: OutputHandler) {
    this.saveSystem = saveSystem;
    this.saveData = saveSystem.load();
    this.output = output;
  }

  start() {
    this.printMain();
  }

  back() {
    if (this.state === 'MAIN') {
      this.output('이미 메인입니다.');
      return;
    }
    this.state = this.lastState === 'HELP_OPEN' ? 'MAIN' : this.lastState;
    this.printCurrentState();
  }

  handleInput(rawInput: string) {
    const input = rawInput.trim().toLowerCase();
    if (!input) {
      return;
    }

    if (input === 'help') {
      this.output('도움말 버튼을 눌러 확인할 수 있습니다.');
      return;
    }

    switch (this.state) {
      case 'MAIN':
        this.handleMain(input);
        break;
      case 'GARAGE':
        this.handleGarage(input);
        break;
      case 'RUN':
        this.handleRun(input);
        break;
      case 'RESULT':
        this.handleResult(input);
        break;
      default:
        this.output('알 수 없는 상태입니다.');
    }
  }

  private printCurrentState() {
    if (this.state === 'MAIN') {
      this.printMain();
    } else if (this.state === 'GARAGE') {
      this.printGarage();
    } else if (this.state === 'RUN') {
      this.printRunPrompt();
    } else if (this.state === 'RESULT') {
      this.printResultOptions();
    }
  }

  private printMain() {
    this.state = 'MAIN';
    this.output('=== MAIN MENU ===');
    this.output('1) Start (Garage)');
    this.output('2) Help');
    this.output('3) Reset Save');
    this.output('입력 예시: 1, start, help');
  }

  private handleMain(input: string) {
    if (['1', 'start'].includes(input)) {
      this.enterGarage();
      return;
    }
    if (['2', 'help'].includes(input)) {
      this.output('상단 Help 버튼을 눌러 도움말을 확인하세요.');
      return;
    }
    if (['3', 'reset', 'reset save'].includes(input)) {
      this.saveData = this.saveSystem.reset();
      this.output('저장이 초기화되었습니다.');
      this.printMain();
      return;
    }
    this.output('MAIN 입력 예시: 1(start), 2(help), 3(reset)');
  }

  private enterGarage() {
    this.state = 'GARAGE';
    this.printGarage();
  }

  private printGarage() {
    const { coins, parts, blueprints, equipment, bestScore } = this.saveData;
    this.output('=== GARAGE ===');
    this.output(`Coins: ${coins} | Parts: ${parts} | Blueprints: ${Object.keys(blueprints).length}`);
    this.output(`Best Score: ${bestScore}`);
    this.output(`Glove Lv.${equipment.gloveLv} (tap +${equipment.gloveLv})`);
    this.output(`Hammer Lv.${equipment.hammerLv} (charge +${equipment.hammerLv * 3})`);
    this.output(`Drone Lv.${equipment.droneLv} (Perfect counter -${15 + equipment.droneLv})`);
    this.output('1) Upgrade Glove');
    this.output('2) Upgrade Hammer');
    this.output('3) Upgrade Drone');
    this.output('4) Start Run');
    this.output('5) Reset Save');
    this.output('6) Back to Main');
    this.output('입력 예시: 1, upgrade glove, 4');
  }

  private handleGarage(input: string) {
    if (['1', 'upgrade glove', 'glove'].includes(input)) {
      this.tryUpgrade('gloveLv');
      return;
    }
    if (['2', 'upgrade hammer', 'hammer'].includes(input)) {
      this.tryUpgrade('hammerLv');
      return;
    }
    if (['3', 'upgrade drone', 'drone'].includes(input)) {
      this.tryUpgrade('droneLv');
      return;
    }
    if (['4', 'start run', 'run'].includes(input)) {
      this.startRun();
      return;
    }
    if (['5', 'reset', 'reset save'].includes(input)) {
      this.saveData = this.saveSystem.reset();
      this.output('저장이 초기화되었습니다.');
      this.printGarage();
      return;
    }
    if (['6', 'back', 'main'].includes(input)) {
      this.printMain();
      return;
    }
    this.output('GARAGE 입력 예시: 1/2/3/4/5/6 또는 upgrade glove');
  }

  private tryUpgrade(type: keyof SaveData['equipment']) {
    const current = this.saveData.equipment[type];
    const nextLv = current + 1;
    if (nextLv > 10) {
      this.output('이미 최대 레벨입니다.');
      return;
    }
    const cost = nextLv * 100;
    if (this.saveData.coins < cost) {
      this.output('코인이 부족합니다.');
      return;
    }
    this.saveData.coins -= cost;
    this.saveData.equipment[type] = nextLv;
    this.saveSystem.save(this.saveData);
    this.output(`업그레이드 완료! ${type} Lv.${nextLv}`);
    this.printGarage();
  }

  private startRun() {
    this.combat = new Combat(this.saveData);
    this.state = 'RUN';
    this.output('=== RUN START ===');
    this.printRunPrompt();
  }

  private printRunPrompt() {
    if (!this.combat) {
      return;
    }
    const { stageHp, stageMaxHp, timeLeft, combo, counterGauge } = this.combat.state;
    const stage = this.combat.getCurrentStage();
    const pointerIndex = this.combat.rollIndicator();
    const indicator = this.renderIndicator(pointerIndex);

    this.output('---');
    this.output(`Stage: ${stage.type} (HP ${stageHp}/${stageMaxHp}) | Time ${timeLeft.toFixed(1)}s`);
    this.output(`Combo ${combo} | Counter ${counterGauge}`);
    this.output(`Weakness Indicator: ${indicator}`);
    this.output('Choose:');
    this.output('1) HIT');
    this.output('2) CHARGE');
    this.output('3) FOCUS');
    this.output('---');

    this.pendingIndicatorIndex = pointerIndex;
  }

  private pendingIndicatorIndex = 0;

  private handleRun(input: string) {
    if (!this.combat) {
      return;
    }

    if (this.combat.state.timeLeft <= 0) {
      this.finishRun(false);
      return;
    }

    if (this.combat.state.stunned) {
      this.output('STUN... 다음 턴은 행동 불가!');
      this.combat.resolveStun();
      this.combat.stepTime(1.0);
      if (this.combat.state.timeLeft <= 0) {
        this.finishRun(false);
      } else {
        this.printRunPrompt();
      }
      return;
    }

    if (['1', 'hit'].includes(input)) {
      this.resolveAttack('hit');
      return;
    }
    if (['2', 'charge'].includes(input)) {
      this.resolveAttack('charge');
      return;
    }
    if (['3', 'focus'].includes(input)) {
      this.resolveFocus();
      return;
    }

    this.output('RUN 입력 예시: 1(hit), 2(charge), 3(focus)');
  }

  private resolveAttack(type: 'hit' | 'charge') {
    if (!this.combat) {
      return;
    }
    const pointerIndex = this.pendingIndicatorIndex;
    const grade = this.combat.getGrade(pointerIndex);
    const baseDamage = type === 'charge' ? this.combat.getChargedDamage() : this.combat.getTapDamage();
    const timeCost = type === 'charge' ? 2.0 : 1.6;

    const result = this.combat.applyHit(baseDamage, grade);
    this.combat.stepTime(timeCost);
    this.combat.checkStun();

    this.describeHit(type, grade, result.damage);

    this.advanceStageIfNeeded();
  }

  private resolveFocus() {
    if (!this.combat) {
      return;
    }
    const damage = this.combat.applyFocus();
    this.combat.stepTime(1.2);
    this.describeFocus(damage);
    this.combat.checkStun();
    this.advanceStageIfNeeded();
  }

  private advanceStageIfNeeded() {
    if (!this.combat) {
      return;
    }
    if (this.combat.state.stageHp <= 0) {
      if (this.combat.advanceStage()) {
        this.output('방어막이 깨졌다! 약점이 드러난다!');
      } else {
        this.output('— FINAL SMASH — 코어가 산산조각났다!');
        this.finishRun(true);
        return;
      }
    }

    if (this.combat.state.timeLeft <= 0) {
      this.finishRun(false);
      return;
    }

    this.printRunPrompt();
  }

  private describeHit(type: 'hit' | 'charge', grade: HitGrade, damage: number) {
    const hitText = type === 'charge' ? '차지 강타' : '기본 타격';
    if (grade === 'Perfect') {
      this.output(`${hitText}!! 쾅!! CRITICAL! 데미지 ${damage}`);
      this.output('코어가 흔들린다!');
    } else if (grade === 'Great') {
      this.output(`${hitText}! 쿵! 좋은 타이밍! 데미지 ${damage}`);
    } else if (grade === 'Good') {
      this.output(`${hitText}. 데미지 ${damage}`);
    } else {
      this.output('헛스윙… 금고가 반격 준비!');
    }
  }

  private describeFocus(damage: number) {
    this.output(`FOCUS! 카운터 감소, 약한 타격 ${damage}`);
  }

  private finishRun(cleared: boolean) {
    if (!this.combat) {
      return;
    }
    const remainingSeconds = Math.floor(this.combat.state.timeLeft);
    const score =
      this.combat.state.totalDamage +
      this.combat.state.perfectCount * 50 +
      this.combat.state.maxCombo * 20 +
      remainingSeconds * 10;

    const rank = this.getRank(score);
    const rewards = this.rollRewards(rank);

    this.saveData.coins += rewards.coins;
    this.saveData.parts += rewards.parts;
    if (rewards.blueprint) {
      const id = `bp_${rank}`;
      this.saveData.blueprints[id] = (this.saveData.blueprints[id] ?? 0) + 1;
    }
    this.saveData.bestScore = Math.max(this.saveData.bestScore, score);
    this.saveSystem.save(this.saveData);

    this.state = 'RESULT';
    this.lastState = 'RESULT';

    this.output(cleared ? `CLEAR! Rank ${rank}` : `FAIL... Rank ${rank}`);
    this.output(`Score: ${score}`);
    this.output(`Rewards: +${rewards.coins} coins, +${rewards.parts} parts, Blueprint: ${rewards.blueprint ? 'YES' : 'NO'}`);
    this.printResultOptions();
  }

  private printResultOptions() {
    this.output('1) Run Again');
    this.output('2) Back to Garage');
    this.output('3) Back to Main');
  }

  private handleResult(input: string) {
    if (['1', 'run again', 'again'].includes(input)) {
      this.startRun();
      return;
    }
    if (['2', 'garage'].includes(input)) {
      this.enterGarage();
      return;
    }
    if (['3', 'main', 'back'].includes(input)) {
      this.printMain();
      return;
    }
    this.output('RESULT 입력 예시: 1(run again), 2(garage), 3(main)');
  }

  private renderIndicator(pointerIndex: number) {
    return `[${Array.from({ length: 7 }, (_, index) => (index === pointerIndex ? '^' : '.')).join('')}]`;
  }

  private getRank(score: number) {
    if (score >= 2200) return 'S';
    if (score >= 1700) return 'A';
    if (score >= 1200) return 'B';
    return 'C';
  }

  private rollRewards(rank: string) {
    const coins = Math.floor(Math.random() * 41) + 50;
    const parts = Math.floor(Math.random() * 3) + 1;
    const blueprintChance = rank === 'S' ? 0.1 : 0.05;
    return {
      coins,
      parts,
      blueprint: Math.random() < blueprintChance,
    };
  }
}
