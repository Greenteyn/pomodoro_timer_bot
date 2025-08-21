class PomodoroTimer {
  private workDuration: number = 25 * 60; // 25 минут в секундах
  private shortBreakDuration: number = 5 * 60; // 5 минут
  private longBreakDuration: number = 15 * 60; // 15 минут
  private cyclesBeforeLongBreak: number = 4;
  
  private startTime: number | null = null; // Время начала текущей фазы (timestamp в миллисекундах)
  private isWorking: boolean = false; // Работает ли таймер
  private currentPhase: 'work' | 'break' = 'work'; // Текущая фаза
  private cycleCount: number = 0; // Количество завершенных рабочих циклов
  private currentPhaseDuration: number = 0; // Длительность текущей фазы в секундах
  
  // Запуск таймера
  startTimer(): void {
    if (this.startTime !== null) return;
    
    this.currentPhase = 'work';
    this.currentPhaseDuration = this.workDuration;
    this.startTime = Date.now();
    this.isWorking = true;
  }
  
  // Остановка таймера
  stopTimer(): void {
    this.startTime = null;
    this.isWorking = false;
  }
  
  // Получение текущего статуса
  getStatus(): string {
    if (this.startTime === null) {
      return 'Таймер не запущен';
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
    return `Осталось: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}\nЦиклов завершено: ${this.cycleCount}`;
  }
  
  // Завершение текущей фазы и переход к следующей
  private completePhase(): void {
    if (this.startTime === null) return;
    
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
    
    if (elapsedSeconds < this.currentPhaseDuration) return;
    
    if (this.currentPhase === 'work') {
      this.cycleCount++;
      this.currentPhase = 'break';
      this.currentPhaseDuration = (this.cycleCount % this.cyclesBeforeLongBreak === 0) 
        ? this.longBreakDuration 
        : this.shortBreakDuration;
    } else {
      this.currentPhase = 'work';
      this.currentPhaseDuration = this.workDuration;
    }
    
    this.startTime = now;
  }
  
  public isTimerWorking(): boolean {
    return this.isWorking;
  }
}

export default PomodoroTimer;