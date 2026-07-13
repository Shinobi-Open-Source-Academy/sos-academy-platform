import { buildHackerEmbed } from './content/hackerMessage';
import { buildMentorEmbed } from './content/mentorMessage';
import type { EmbedPayload } from './content/types';
import { fetchOpenGoodFirstIssues } from './github';
import { pickTwoDistinct } from './utils/random';

export interface DailyReminders {
  hacker: EmbedPayload;
  mentor: EmbedPayload;
}

export async function getDailyReminders(): Promise<DailyReminders> {
  const issues = await fetchOpenGoodFirstIssues();
  const [hackerIssue, mentorIssue] = pickTwoDistinct(issues);

  return {
    hacker: buildHackerEmbed(hackerIssue),
    mentor: buildMentorEmbed(mentorIssue),
  };
}
