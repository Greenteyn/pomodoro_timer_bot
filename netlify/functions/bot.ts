import { Handler } from '@netlify/functions';
import { Telegraf } from 'telegraf';
import PomodoroTimer from '../../timer';

const bot = new Telegraf(process.env.BOT_TOKEN!);
const pomodoroTimer = new PomodoroTimer();

// Здесь должен быть код бота из index.ts (без bot.launch())

export const handler: Handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body!));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};