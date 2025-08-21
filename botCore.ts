import { Telegraf, Markup, Context } from "telegraf";
import { session } from "telegraf";
import PomodoroTimer from './timer';

export interface SessionContext extends Context {
  session: {
    statusMessageId?: number;
  };
}

export function setupBot(bot: Telegraf<SessionContext>) {
  const pomodoroTimer = new PomodoroTimer();

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

  bot.hears("Запустить новый таймер", async (ctx) => {
    pomodoroTimer.startTimer();
    
    const message = await ctx.reply("Таймер запущен! 25 минут работы начались 🍅\n\n" + pomodoroTimer.getStatus());
    console.log('Start timer message sent:', message);
    
    ctx.session.statusMessageId = message.message_id;
  });

  bot.hears("Остановить текущий таймер", async (ctx) => {
    pomodoroTimer.stopTimer();
    
    if (ctx.session.statusMessageId) {
      delete ctx.session.statusMessageId;
    }
    
    const reply = await ctx.reply("Таймер остановлен");
    console.log('Stop timer reply:', reply);
  });

  bot.hears("Показать статус", async (ctx) => {
    const status = pomodoroTimer.isTimerWorking() ? 
      "Текущий статус:\n\n" + pomodoroTimer.getStatus() :
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