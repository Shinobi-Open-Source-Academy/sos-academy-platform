import type { Client } from 'discord.js';
import { config } from '../config';
import type { EmbedPayload } from '../content/types';
import { buildEmbed } from './buildEmbed';

export async function sendEmbedToChannel(
  client: Client,
  channelId: string,
  payload: EmbedPayload
): Promise<void> {
  if (config.dryRun) {
    console.log(`[kunai-bot] DRY_RUN — would send to channel ${channelId}:`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased() || !('send' in channel)) {
    throw new Error(`Channel ${channelId} is missing or not a sendable text channel`);
  }

  await channel.send({ embeds: [buildEmbed(payload)] });
}
