import type { OpenIssue } from '../github';
import { pickRandom } from '../utils/random';
import { formatIssueLink } from './formatIssue';
import { HACKER_INTROS, HACKER_TIPS } from './messagePools';
import type { EmbedPayload } from './types';

const EMERALD = 0x10b981;
const PROJECTS_URL = 'https://shinobi-open-source.academy/#projects';

export function buildHackerEmbed(issue: OpenIssue | undefined): EmbedPayload {
  const pickField = {
    name: "Today's Pick",
    value: issue
      ? formatIssueLink(issue)
      : `No fresh good-first-issues right now — browse our [featured projects](${PROJECTS_URL}) and pick something that interests you.`,
  };

  return {
    color: EMERALD,
    title: '🥷 Daily Mission',
    description: pickRandom(HACKER_INTROS),
    fields: [pickField, { name: 'Shinobi Tip', value: pickRandom(HACKER_TIPS) ?? '' }],
    footerText: 'Kunai Bot • SOS Academy',
  };
}
