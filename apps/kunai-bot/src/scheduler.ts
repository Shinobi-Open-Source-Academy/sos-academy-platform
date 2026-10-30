import type { Client } from 'discord.js';
import { schedule } from 'node-cron';
import { config, type RuntimeConfig } from './config';
import { sendEmbedToChannel } from './discord/sendReminder';
import { getDailyReminders } from './reminders';

export async function runDailyReminders(client: Client, runtime: RuntimeConfig): Promise<void> {
  console.log('[kunai-bot] Running daily reminders...');
  const { hacker, mentor } = await getDailyReminders();

  await sendEmbedToChannel(client, runtime.generalChannelId, hacker);
  console.log('[kunai-bot] Hacker reminder sent to #general');

  await sendEmbedToChannel(client, runtime.mentorsChannelId, mentor);
  console.log('[kunai-bot] Mentor reminder sent to #mentors');
}

export function startScheduler(client: Client, runtime: RuntimeConfig): void {
  schedule(
    config.reminderCron,
    () => {
      runDailyReminders(client, runtime).catch((error) => {
        console.error('[kunai-bot] Daily reminder run failed:', error);
      });
    },
    { timezone: config.timezone, name: 'kunai-daily-reminders' }
  );

  console.log(
    `[kunai-bot] Scheduled daily reminders: "${config.reminderCron}" (${config.timezone})`
  );
}
