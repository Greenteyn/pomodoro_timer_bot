import "dotenv/config";
import { Handler } from '@netlify/functions';
import { Telegraf, Markup, Context } from "telegraf";
import { session } from "telegraf";
import PomodoroTimer from '../../timer';

interface SessionContext extends Context {
  session: {
    statusInterval?: NodeJS.Timeout;
    statusMessageId?: number;
  };
}

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN не задан в переменных окружения");
}

const bot = new Telegraf<SessionContext>(token);
const pomodoroTimer = new PomodoroTimer();

bot.use(session({
  defaultSession: () => ({})
}));

const menuKeyboard = Markup.keyboard([
  ["Запустить новый таймер"],
  ["Остановить текущий таймер"],
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
  
  const statusInterval = setInterval(async () => {
    try {
      const chatId = ctx.chat?.id;
      if (!chatId) {
        console.error('Chat ID is undefined');
        return;
      }
      
      console.log('Editing message for chat:', chatId);
      const result = await ctx.telegram.editMessageText(
        chatId,
        ctx.session.statusMessageId,
        undefined,
        "Таймер запущен! 🍅\n\n" + pomodoroTimer.getStatus()
      );
      console.log('Message edit result:', result);
    } catch (e) {
      console.error("Ошибка при редактировании сообщения:", e);
    }
  }, 1000);
  
  ctx.session.statusInterval = statusInterval;
});

bot.hears("Остановить текущий таймер", async (ctx) => {
  pomodoroTimer.stopTimer();
  
  if (ctx.session.statusInterval) {
    clearInterval(ctx.session.statusInterval);
    delete ctx.session.statusInterval;
  }
  
  if (ctx.session.statusMessageId) {
    delete ctx.session.statusMessageId;
  }
  
  const reply = await ctx.reply("Таймер остановлен");
  console.log('Stop timer reply:', reply);
});

bot.hears("Про Помодоро Таймер", async (ctx) => {
  const reply = await ctx.reply(
    "Pomodoro Timer - бот для управления временем по методу Помодоро:\n\n" +
      "🍅 25 минут работы\n☕ 5 минут перерыва\n" +
      "После 4 циклов - длинный перерыв 15-30 минут"
  );
  console.log('About bot reply:', reply);
});

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  try {
    const update = JSON.parse(event.body);
    console.log('Update received:', JSON.stringify(update, null, 2));
    
    try {
      await bot.handleUpdate(update);
      console.log('Update processed successfully');
    } catch (error) {
      console.error('Error in bot.handleUpdate:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Response delay completed');
    
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.error('Error handling update:', e);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};