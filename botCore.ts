import { Telegraf, Markup, Context } from "telegraf";
import { session } from "telegraf";
import PomodoroTimer from './timer';

// Таймеры для каждого чата
const userTimers = new Map<number, PomodoroTimer>();

// Очистка неактивных таймеров (24 часа)
setInterval(() => {
  const now = Date.now();
  // Преобразуем Map в массив для безопасной итерации
  Array.from(userTimers.entries()).forEach(([chatId, timer]) => {
    if (timer.isTimerWorking()) {
      // Если таймер работает, пропускаем
      return;
    }
    
    // Если таймер остановлен более 24 часов назад, удаляем
    const lastActivity = timer.getLastActivityTime();
    if (now - lastActivity > 24 * 60 * 60 * 1000) {
      userTimers.delete(chatId);
    }
  });
}, 60 * 60 * 1000); // Каждый час

export interface SessionContext extends Context {
  session: {
    statusMessageId?: number;
  };
}

export function setupBot(bot: Telegraf<SessionContext>) {
  bot.use(session({
    defaultSession: () => ({})
  }));

  const menuKeyboard = Markup.keyboard([
    ["Запустить новый таймер"],
    ["Остановить текущий таймер"],
    ["Показать статус"],
    ["Про Помодоро Таймер"]
  ]).resize();

  bot.start((ctx) => {
    return ctx.reply(
      "Добро пожаловать в Pomodoro Timer Bot!",
      menuKeyboard
    );
  });

  // Получение или создание таймера для чата
  const getOrCreateTimer = (chatId: number) => {
    if (!userTimers.has(chatId)) {
      userTimers.set(chatId, new PomodoroTimer());
    }
    return userTimers.get(chatId)!;
  };

  bot.hears("Запустить новый таймер", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const timer = getOrCreateTimer(chatId);
    timer.startTimer();
    
    const message = await ctx.reply("Таймер запущен! 25 минут работы начались 🍅\n\n" + timer.getStatus());
    console.log('Start timer message sent:', message);
    
    ctx.session.statusMessageId = message.message_id;
  });

  bot.hears("Остановить текущий таймер", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const timer = userTimers.get(chatId);
    if (!timer) return;
    
    timer.stopTimer();
    
    if (ctx.session.statusMessageId) {
      delete ctx.session.statusMessageId;
    }
    
    const reply = await ctx.reply("Таймер остановлен");
    console.log('Stop timer reply:', reply);
  });

  bot.hears("Показать статус", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const timer = userTimers.get(chatId);
    const status = timer?.isTimerWorking() ?
      "Текущий статус:\n\n" + timer.getStatus() :
      "Таймер остановлен";
      
    const reply = await ctx.reply(status);
    console.log('Status reply:', reply);
  });

  bot.hears("Про Помодоро Таймер", async (ctx) => {
    const reply = await ctx.reply(
      "Pomodoro Timer - бот для управления временем по методу Помодоро:\n\n" +
        "🍅 25 минут работы\n☕ 5 минут перерыва\n" +
        "После 4 циклов - длинный перерыв 15-30 минут"
    );
    console.log('About bot reply:', reply);
  });
}