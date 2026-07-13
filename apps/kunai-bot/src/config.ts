import path from 'node:path';
import dotenv from 'dotenv';

// Mirrors apps/server's env resolution: prefer a local .env (standalone
// deploys of this app), fall back to the monorepo root .env (dev/shared).
dotenv.config({
  path: [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../../../.env'),
  ],
});

export const config = {
  discordToken: process.env.DISCORD_BOT_TOKEN,
  generalChannelId: process.env.DISCORD_GENERAL_CHANNEL_ID,
  mentorsChannelId: process.env.DISCORD_MENTORS_CHANNEL_ID,
  reminderCron: process.env.REMINDER_CRON || '0 9 * * *',
  timezone: process.env.TIMEZONE || 'UTC',
  githubApiToken: process.env.GITHUB_API_TOKEN,
  dryRun: process.env.DRY_RUN === 'true',
};

const REQUIRED_ENV_VARS = {
  discordToken: 'DISCORD_BOT_TOKEN',
  generalChannelId: 'DISCORD_GENERAL_CHANNEL_ID',
  mentorsChannelId: 'DISCORD_MENTORS_CHANNEL_ID',
} as const;

export interface RuntimeConfig {
  discordToken: string;
  generalChannelId: string;
  mentorsChannelId: string;
}

/** Validates required env vars and returns them narrowed to `string`. Call before logging in. */
export function assertRuntimeConfig(): RuntimeConfig {
  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([key]) => !config[key as keyof typeof REQUIRED_ENV_VARS])
    .map(([, envVar]) => envVar);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return config as unknown as RuntimeConfig;
}
