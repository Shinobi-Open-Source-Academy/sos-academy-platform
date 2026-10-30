import { Client, GatewayIntentBits } from 'discord.js';
import { assertRuntimeConfig } from './config';
import { startScheduler } from './scheduler';

async function main() {
  const runtime = assertRuntimeConfig();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', () => {
    console.log(`[kunai-bot] Logged in as ${client.user?.tag}`);
    startScheduler(client, runtime);
  });

  await client.login(runtime.discordToken);

  const shutdown = () => {
    console.log('[kunai-bot] Shutting down...');
    client.destroy();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('[kunai-bot] Fatal error during startup:', error);
  process.exit(1);
});
