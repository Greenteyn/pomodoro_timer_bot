class PomodoroTimer {
  private workDuration: number = 25 * 60; // 25 минут в секундах
  private shortBreakDuration: number = 5 * 60; // 5 минут
  private longBreakDuration: number = 15 * 60; // 15 минут
  private cyclesBeforeLongBreak: number = 4;

  private startTime: number | null = null;
  private isWorking: boolean = false;
  private currentPhase: "work" | "break" = "work";
  private cycleCount: number = 0;
  private currentPhaseDuration: number = 0; // Длительность текущей фазы в секундах
  private lastActivityTime: number = Date.now();

  // Запуск таймера
  startTimer(): void {
    if (this.startTime !== null) return;

    this.currentPhase = "work";
    this.currentPhaseDuration = this.workDuration;
    this.startTime = Date.now();
    this.isWorking = true;
    this.updateActivityTime();
  }

  // Остановка таймера
  stopTimer(): void {
    this.startTime = null;
    this.isWorking = false;
    this.updateActivityTime();
  }

  // Получение текущего статуса
  getStatus(): string {
    if (this.startTime === null) {
      return "Таймер не запущен";
    }

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
    const remaining = this.currentPhaseDuration - elapsedSeconds;

    if (remaining <= 0) {
      this.completePhase();
      return this.getStatus();
    }

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `Осталось: ${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}\nЦиклов завершено: ${this.cycleCount}`;
  }

  // Обновление времени последней активности
  updateActivityTime(): void {
    this.lastActivityTime = Date.now();
  }

  // Получение времени последней активности
  getLastActivityTime(): number {
    return this.lastActivityTime;
  }

  // Проверка работы таймера
  isTimerWorking(): boolean {
    return this.isWorking;
  }

  // Завершение текущей фазы и переход к следующей
  private completePhase(): void {
    if (this.startTime === null) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.startTime) / 1000);

    if (elapsedSeconds < this.currentPhaseDuration) return;

    if (this.currentPhase === "work") {
      this.cycleCount++;
      this.currentPhase = "break";
      this.currentPhaseDuration =
        this.cycleCount % this.cyclesBeforeLongBreak === 0
          ? this.longBreakDuration
          : this.shortBreakDuration;
    } else {
      this.currentPhase = "work";
      this.currentPhaseDuration = this.workDuration;
    }

    this.startTime = now;
    this.updateActivityTime();
  }
}

export default PomodoroTimer;
