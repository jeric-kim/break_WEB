type CloseHandler = () => void;

export class HelpModal {
  private backdrop: HTMLDivElement;
  private closeHandler: CloseHandler | null = null;

  constructor(mount: HTMLElement) {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';

    const sheet = document.createElement('div');
    sheet.className = 'modal-sheet';

    sheet.innerHTML = `
      <h2>Core Breaker 도움말</h2>
      <p>텍스트 입력으로 금고를 부수는 턴제 러너입니다.</p>
      <h3>명령어</h3>
      <ul>
        <li>1 / hit: 기본 타격</li>
        <li>2 / charge: 차지 타격 (느리지만 강함)</li>
        <li>3 / focus: 카운터 게이지 감소</li>
      </ul>
      <h3>판정</h3>
      <p>Weakness Indicator에서 ^가 위쪽(0)에 가까울수록 좋습니다.</p>
      <ul>
        <li>Perfect: diff 0 (x2.0)</li>
        <li>Great: diff 1 (x1.5)</li>
        <li>Good: diff 2 (x1.0)</li>
        <li>Miss: diff 3+ (x0)</li>
      </ul>
      <h3>점수/보상</h3>
      <p>총 데미지 + Perfect/Combo/잔여 시간으로 점수 계산.</p>
      <p>Coins 50~90, Parts 1~3, Blueprint 5%(S랭크 10%).</p>
      <h3>저장</h3>
      <p>강화/보상은 localStorage에 저장됩니다. Reset Save로 초기화 가능.</p>
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '닫기';
    closeButton.addEventListener('click', () => this.close());

    sheet.append(closeButton);
    this.backdrop.append(sheet);
    this.backdrop.addEventListener('click', (event) => {
      if (event.target === this.backdrop) {
        this.close();
      }
    });

    mount.append(this.backdrop);
  }

  onClose(handler: CloseHandler) {
    this.closeHandler = handler;
  }

  open() {
    this.backdrop.classList.add('open');
  }

  close() {
    this.backdrop.classList.remove('open');
    this.closeHandler?.();
  }
}
