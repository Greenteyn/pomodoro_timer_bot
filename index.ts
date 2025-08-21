import "dotenv/config";
import { Telegraf } from "telegraf";
import { SessionContext, setupBot } from "./botCore";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN не задан в переменных окружения");
}

const bot = new Telegraf<SessionContext>(token);
setupBot(bot);

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
