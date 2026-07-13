// Logs in, fires today's reminders immediately, then exits.
// Useful for verifying real channel delivery without waiting for the 9am cron.
import { Client, GatewayIntentBits } from 'discord.js';
import { assertRuntimeConfig } from '../config';
import { runDailyReminders } from '../scheduler';

async function main() {
  const runtime = assertRuntimeConfig();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', async () => {
    try {
      await runDailyReminders(client, runtime);
    } finally {
      client.destroy();
      process.exit(0);
    }
  });

  await client.login(runtime.discordToken);
}

main().catch((error) => {
  console.error('[kunai-bot] send-now failed:', error);
  process.exit(1);
});
