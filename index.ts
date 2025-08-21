import "dotenv/config";
import { Telegraf, Markup, Context } from "telegraf";
import { session } from "telegraf";
import PomodoroTimer from "./timer";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN не задан в переменных окружения");
}

// Расширяем стандартный контекст
interface SessionContext extends Context {
  session: {
    statusInterval?: NodeJS.Timeout;
    statusMessageId?: number;
  };
}

const bot = new Telegraf<SessionContext>(token);
const pomodoroTimer = new PomodoroTimer();

// Инициализируем middleware сессии
bot.use(session({
  defaultSession: () => ({})
}));

// Создаем клавиатуру для меню
const menuKeyboard = Markup.keyboard([
  ["Запустить новый таймер"],
  ["Остановить текущий таймер"],
  ["Про Помодоро Таймер"]
]).resize();

// Обработчик команды /start с меню кнопок
bot.start((ctx) => {
  return ctx.reply(
    "Добро пожаловать в Pomodoro Timer Bot!",
    menuKeyboard
  );
});

// Обработчик текстовых команд
bot.hears("Запустить новый таймер", async (ctx) => {
  pomodoroTimer.startTimer();
  
  // Отправляем начальное сообщение о запуске
  const message = await ctx.reply("Таймер запущен! 25 минут работы начались 🍅\n\n" + pomodoroTimer.getStatus());
  
  // Сохраняем ID сообщения для последующего редактирования
  ctx.session.statusMessageId = message.message_id;
  
  // Запускаем интервал для обновления сообщения
  const statusInterval = setInterval(async () => {
    try {
      // Редактируем существующее сообщение
      await ctx.telegram.editMessageText(
        ctx.chat?.id,
        ctx.session.statusMessageId,
        undefined,
        "Таймер запущен! 🍅\n\n" + pomodoroTimer.getStatus()
      );
    } catch (e) {
      console.error("Ошибка при редактировании сообщения:", e);
    }
  }, 1000); // Обновление каждую секунду
  
  // Сохраняем интервал в сессии
  ctx.session.statusInterval = statusInterval;
});

bot.hears("Остановить текущий таймер", (ctx) => {
  pomodoroTimer.stopTimer();
  
  // Останавливаем интервал обновлений
  if (ctx.session.statusInterval) {
    clearInterval(ctx.session.statusInterval);
    delete ctx.session.statusInterval;
  }
  
  // Удаляем ID сообщения
  if (ctx.session.statusMessageId) {
    delete ctx.session.statusMessageId;
  }
  
  return ctx.reply("Таймер остановлен");
});

bot.hears("Про Помодоро Таймер", (ctx) => {
  return ctx.reply(
    "Pomodoro Timer - бот для управления временем по методу Помодоро:\n\n" +
      "🍅 25 минут работы\n☕ 5 минут перерыва\n" +
      "После 4 циклов - длинный перерыв 15-30 минут"
  );
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  pomodoroTimer.stopTimer();
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  pomodoroTimer.stopTimer();
});
