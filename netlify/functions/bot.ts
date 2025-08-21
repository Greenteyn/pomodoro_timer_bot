import { Handler } from '@netlify/functions';
import { Telegraf } from 'telegraf';
import { SessionContext, setupBot } from '../../botCore';

const bot = new Telegraf<SessionContext>(process.env.BOT_TOKEN!);
setupBot(bot);

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  try {
    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.error('Error handling update:', e);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};