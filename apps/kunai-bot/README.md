# Kunai Bot

Discord bot for the SOS Academy server. Every day at ~9am (UTC by default) it posts:

- **#general** (public) — a "daily mission" for hackers: a rotating motivational intro, a live
  open "good first issue"/"help wanted" issue pulled from the Academy's featured project repos,
  and a rotating OSS contribution tip.
- **#mentors** (private) — a "Sensei briefing" for mentors: 3 randomly-picked action items
  (check in on a quiet hacker, review a PR, shout out a contribution, etc.) plus a live issue
  they can hand out to a hacker in #general.

Content pools live in `src/content/messagePools.ts` — edit freely, no code changes needed to
tweak wording.

## 1. Finish setting up the Discord application

You've already created the app in the [Developer Portal](https://discord.com/developers/applications)
(General Information tab). Next:

1. **Bot tab** → Reset/copy the **Token**. This is `DISCORD_BOT_TOKEN` — treat it like a password.
   - No privileged intents are required (the bot only sends messages, it never reads them).
2. **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `View Channels`, `Send Messages`, `Embed Links`
   - Open the generated URL and invite the bot to the SOS Academy server.
3. In Discord, enable **Developer Mode** (User Settings → Advanced), then right-click
   `#general` and the private `#mentors` channel → **Copy Channel ID** for the env vars below.

## 2. Configure environment variables

Add these to the repo root `.env` (see `.env.example` for the full block):

```
DISCORD_BOT_TOKEN=...
DISCORD_GENERAL_CHANNEL_ID=...
DISCORD_MENTORS_CHANNEL_ID=...
REMINDER_CRON=0 9 * * *
TIMEZONE=UTC
DRY_RUN=false
```

Optional: `GITHUB_API_TOKEN` (any GitHub PAT, no scopes needed) raises the GitHub search API
rate limit from 10 req/min to 30 req/min — not required, but recommended if you also run other
GitHub integrations against the same IP.

## 3. Run it

From the repo root:

```bash
# Preview today's message content — no Discord token needed at all.
pnpm kunai-bot:preview

# Full bot: connects to Discord and starts the 9am scheduler.
pnpm dev:kunai-bot

# Fire today's reminders immediately (useful for testing without waiting for 9am).
pnpm kunai-bot:send-now
```

Set `DRY_RUN=true` to have the bot log what it *would* send instead of posting, while still
staying logged in to Discord — useful for testing the cron schedule itself.

## 4. Deploying

This is a long-running process (it holds a Discord gateway connection), so it can't run on
Vercel/serverless like the other apps. Deploy it to anything that can keep a Node process alive:
a small VPS, a container on Fly.io/Railway, or a systemd service. Build with `pnpm build:kunai-bot`
and run `pnpm start:kunai-bot`, with the same env vars set on the host.

## How the daily content is built

`src/reminders.ts` fetches up to 30 open, unassigned `good first issue`/`help wanted` issues
across the repos in `src/data/projects.ts` (one GitHub API call, shared by both messages), then
`src/content/hackerMessage.ts` and `src/content/mentorMessage.ts` each pick a different issue and
pair it with rotating flavor text from `src/content/messagePools.ts`. If GitHub returns nothing
(rate limit, no matches), both messages fall back to a generic prompt instead of failing.
