type LogType = 'system' | 'player';

type SubmitHandler = (input: string) => void;

type HelpHandler = () => void;

export class AppShell {
  private root: HTMLElement;
  private logArea: HTMLDivElement;
  private inputField: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private helpButton: HTMLButtonElement;
  private submitHandler: SubmitHandler | null = null;
  private helpHandler: HelpHandler | null = null;

  constructor(mount: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'app-shell';

    const topbar = document.createElement('div');
    topbar.className = 'topbar';

    const title = document.createElement('div');
    title.className = 'topbar-title';
    title.textContent = 'CORE BREAKER';

    this.helpButton = document.createElement('button');
    this.helpButton.textContent = 'Help';

    topbar.append(title, this.helpButton);

    this.logArea = document.createElement('div');
    this.logArea.className = 'log-area';

    const inputBar = document.createElement('div');
    inputBar.className = 'input-bar';

    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = '명령을 입력하세요 (예: 1, hit, charge)';

    this.submitButton = document.createElement('button');
    this.submitButton.textContent = '전송';

    inputBar.append(this.inputField, this.submitButton);

    this.root.append(topbar, this.logArea, inputBar);
    mount.append(this.root);

    this.submitButton.addEventListener('click', () => this.handleSubmit());
    this.inputField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.handleSubmit();
      }
    });

    this.helpButton.addEventListener('click', () => {
      this.helpHandler?.();
    });
  }

  setTopbarTitle(text: string) {
    const title = this.root.querySelector<HTMLElement>('.topbar-title');
    if (title) {
      title.textContent = text;
    }
  }

  onSubmit(handler: SubmitHandler) {
    this.submitHandler = handler;
  }

  onHelp(handler: HelpHandler) {
    this.helpHandler = handler;
  }

  appendSystemMessage(message: string) {
    this.appendLog(message, 'system');
  }

  appendPlayerMessage(message: string) {
    this.appendLog(message, 'player');
  }

  focusInput() {
    this.inputField.focus();
  }

  clearInput() {
    this.inputField.value = '';
  }

  private appendLog(message: string, type: LogType) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    this.logArea.append(entry);
    this.logArea.scrollTop = this.logArea.scrollHeight;
  }

  private handleSubmit() {
    if (!this.submitHandler) {
      return;
    }
    const input = this.inputField.value.trim();
    if (!input) {
      return;
    }
    this.appendPlayerMessage(input);
    this.clearInput();
    this.submitHandler(input);
  }
}
