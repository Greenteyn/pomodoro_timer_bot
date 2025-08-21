class PomodoroTimer {
  private workDuration: number = 25 * 60; // 25 минут в секундах
  private shortBreakDuration: number = 5 * 60; // 5 минут
  private longBreakDuration: number = 15 * 60; // 15 минут
  private cyclesBeforeLongBreak: number = 4;
  
  private timerId: NodeJS.Timeout | null = null;
  private remainingTime: number = 0;
  private isWorking: boolean = false;
  private isPaused: boolean = true;
  private cycleCount: number = 0;
  
  constructor() {
    this.reset();
  }
  
  // Запуск/продолжение таймера
  startTimer(): void {
    if (this.isPaused) {
      this.isPaused = false;
      
      if (!this.timerId) {
        this.timerId = setInterval(() => this.tick(), 1000);
      }
    }
  }
  
  // Остановка таймера
  stopTimer(): void {
    this.isPaused = true;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
  
  // Сброс таймера
  reset(): void {
    this.stopTimer();
    this.isWorking = true;
    this.isPaused = true;
    this.cycleCount = 0;
    this.remainingTime = this.workDuration;
  }
  
  // Тик таймера (вызывается каждую секунду)
  private tick(): void {
    if (this.isPaused) return;
    
    this.remainingTime--;
    
    if (this.remainingTime <= 0) {
      if (this.isWorking) {
        this.cycleCount++;
        
        if (this.cycleCount >= this.cyclesBeforeLongBreak) {
          this.remainingTime = this.longBreakDuration;
          this.cycleCount = 0;
        } else {
          this.remainingTime = this.shortBreakDuration;
        }
      } else {
        this.remainingTime = this.workDuration;
      }
      
      this.isWorking = !this.isWorking;
    }
  }
  
  // Форматирование времени для вывода
  getFormattedTime(): string {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Получение статуса таймера
  getStatus(): string {
    if (this.isPaused) {
      return "Таймер остановлен";
    }
    
    const mode = this.isWorking ? "РАБОТА" : "ПЕРЕРЫВ";
    return `${mode}: ${this.getFormattedTime()}`;
  }
  
  // Получение текущего режима
  getCurrentMode(): string {
    return this.isWorking ? "work" : "break";
  }
}

export default PomodoroTimer;