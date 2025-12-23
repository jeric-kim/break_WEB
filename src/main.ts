import './styles.css';
import { AppShell } from './ui/AppShell';
import { HelpModal } from './ui/HelpModal';
import { GameEngine } from './game/GameEngine';
import { SaveSystem } from './storage/SaveSystem';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root missing');
}

const saveSystem = new SaveSystem();
const appShell = new AppShell(app);
const helpModal = new HelpModal(document.body);
const engine = new GameEngine(saveSystem, appShell.appendSystemMessage.bind(appShell));

appShell.setTopbarTitle('CORE BREAKER TEXT');
appShell.onHelp(() => {
  helpModal.open();
});

helpModal.onClose(() => {
  appShell.focusInput();
});

appShell.onSubmit((input) => {
  if (!input) {
    return;
  }
  if (input.toLowerCase() === 'help') {
    helpModal.open();
    return;
  }
  if (input.toLowerCase() === 'back') {
    engine.back();
    return;
  }
  engine.handleInput(input);
});

appShell.appendSystemMessage('Core Breaker 텍스트 버전에 오신 것을 환영합니다.');
engine.start();
