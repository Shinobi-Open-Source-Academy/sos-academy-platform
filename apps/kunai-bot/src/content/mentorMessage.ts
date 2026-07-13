import type { OpenIssue } from '../github';
import { pickManyDistinct } from '../utils/random';
import { formatIssueLink } from './formatIssue';
import { MENTOR_ACTIONS, MENTOR_ACTIONS_PER_BRIEFING } from './messagePools';
import type { EmbedPayload } from './types';

const PURPLE = 0x8b5cf6;

export function buildMentorEmbed(issue: OpenIssue | undefined): EmbedPayload {
  const actions = pickManyDistinct(MENTOR_ACTIONS, MENTOR_ACTIONS_PER_BRIEFING);

  const handoutField = {
    name: 'Ready to Hand Out',
    value: issue
      ? `${formatIssueLink(issue)}\nDrop this in #general for a hacker to claim.`
      : 'No fresh good-first-issues found right now — worth triaging one yourself today.',
  };

  return {
    color: PURPLE,
    title: '🧭 Sensei Briefing',
    description: 'Three ways to level up your community today:',
    fields: [
      { name: "Today's Actions", value: actions.map((action) => `• ${action}`).join('\n') },
      handoutField,
    ],
    footerText: 'Kunai Bot • Mentors only',
  };
}
