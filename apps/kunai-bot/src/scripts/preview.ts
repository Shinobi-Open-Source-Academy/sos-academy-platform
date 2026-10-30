// Prints today's reminder content without touching Discord at all.
// Useful for reviewing wording/live GitHub picks before the bot has credentials.
import { getDailyReminders } from '../reminders';

async function main() {
  const { hacker, mentor } = await getDailyReminders();

  console.log('\n=== #general (public) reminder ===\n');
  console.log(JSON.stringify(hacker, null, 2));

  console.log('\n=== #mentors (private) reminder ===\n');
  console.log(JSON.stringify(mentor, null, 2));
}

main().catch((error) => {
  console.error('[kunai-bot] Preview failed:', error);
  process.exit(1);
});
