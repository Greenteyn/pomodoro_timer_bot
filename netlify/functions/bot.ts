import { Handler } from '@netlify/functions';
import { Telegraf } from 'telegraf';
import PomodoroTimer from '../../timer';

const bot = new Telegraf(process.env.BOT_TOKEN!);
const pomodoroTimer = new PomodoroTimer();

// Здесь должен быть код бота из index.ts (без bot.launch())

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  try {
    const update = JSON.parse(event.body);
    console.log('Update received:', JSON.stringify(update, null, 2));
    
    try {
      // Явно обрабатываем обновление и ждем завершения
      await bot.handleUpdate(update);
      console.log('Update processed successfully');
    } catch (error) {
      console.error('Error in bot.handleUpdate:', error);
    }
    
    // Даем больше времени на отправку ответов
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Response delay completed');
    
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.error('Error handling update:', e);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};