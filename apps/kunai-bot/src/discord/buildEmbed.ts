import { EmbedBuilder } from 'discord.js';
import type { EmbedPayload } from '../content/types';

export function buildEmbed(payload: EmbedPayload): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(payload.color).setTitle(payload.title).setTimestamp();

  if (payload.description) {
    embed.setDescription(payload.description);
  }
  if (payload.fields?.length) {
    embed.addFields(payload.fields);
  }
  if (payload.footerText) {
    embed.setFooter({ text: payload.footerText });
  }

  return embed;
}
