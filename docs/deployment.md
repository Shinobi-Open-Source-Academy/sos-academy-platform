# Docker & deployment

Every part of the platform ships as a container image built from the single [`Dockerfile`](../Dockerfile)
at the repository root. The images are host-agnostic: they listen on `$PORT`, run as an unprivileged
user, and take their configuration from environment variables, so the same image runs on Cloud Run,
Fly.io, Railway, Kubernetes, or a plain VPS with `docker compose`.

**Nothing has a default.** Every deployment-specific value (URLs, secrets, database) must be set
explicitly. A missing one stops `docker compose` with a message naming the variable, and the web
images refuse to build without their public URLs. That is deliberate: a misconfiguration should fail
loudly at deploy time, not surface later as a login that redirects to the wrong host.

- [Images](#images)
- [Deploy with Docker Compose](#deploy-with-docker-compose)
- [Configuration reference](#configuration-reference)
- [Deploy the images elsewhere](#deploy-the-images-elsewhere)
- [Releases](#releases)
- [Known limitations](#known-limitations)

## Images

| Image | `--target` | Default port | Notes |
|-------|-----------|--------------|-------|
| `server` | `server` | 4200 | NestJS API, shipped as a single bundled file (no `node_modules`). Needs MongoDB. |
| `website` | `next` + `APP=website` | 3000 | Public site |
| `admin` | `next` + `APP=admin` | 3001 | Admin panel |
| `hacker` | `next` + `APP=hacker` | 3002 | Hacker portal |
| `blog` | `next` + `APP=blog` | 3003 | Blog |
| `kunai-bot` | `kunai-bot` | none | Discord reminder bot (long-running worker) |

Released images are published to GitHub Container Registry:

```
ghcr.io/shinobi-open-source-academy/sos-academy-platform/<image>:<version>
```

Each release is tagged `1.2.3`, `1.2`, `1`, and `latest`. New packages start **private**: after the
first publish, set each one to public under *Organization → Packages → (package) → Package settings*.

## Deploy with Docker Compose

[`docker-compose.yml`](../docker-compose.yml) runs the API, website, admin, hacker portal and blog
(plus the bot behind a profile). It builds the images on the host, so the public URLs you configure
are compiled into the web apps.

```sh
cp .env.docker.example .env      # on the deployment host
$EDITOR .env                     # fill in every value; the file explains each one
docker compose up -d --build
```

If a required value is missing or empty, Compose stops immediately:

```
required variable JWT_REFRESH_SECRET is missing a value: JWT_REFRESH_SECRET is not set - long random string ...
```

It reports one variable at a time, so fix and re-run until it passes. Keeping the file next to a
development `.env`? Use `docker compose --env-file .env.docker ...` on every command, or export
`COMPOSE_ENV_FILES=.env.docker`.

Ports are published on `BIND_ADDRESS`, which you must choose: `127.0.0.1` (reachable only from the
host, for use behind a TLS reverse proxy such as Caddy or nginx) or `0.0.0.0` (reachable from
anywhere, only if something else already provides TLS). The API and web apps speak plain HTTP.

### Database

MongoDB is not part of the main file. Two options:

- **Managed database (recommended):** set `MONGODB_URI` to your Atlas (or other) connection string.
- **Self-hosted:** add [`docker-compose.mongo.yml`](../docker-compose.mongo.yml). It requires
  `MONGO_ROOT_USERNAME` / `MONGO_ROOT_PASSWORD`, does not publish the database on any host port, and
  keeps data in the `mongo-data` volume (back it up yourself). Point `MONGODB_URI` at
  `mongodb://<user>:<password>@mongo:27017/sos-academy?authSource=admin`.

  ```sh
  docker compose -f docker-compose.yml -f docker-compose.mongo.yml up -d --build
  ```

The API seeds an empty database on first start (communities, projects, and the admin account from
`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Everyday commands

```sh
docker compose ps                                        # status and health
docker compose logs -f server                            # follow one service
docker compose exec server node dist/main.js status      # database seeding status
docker compose --profile bot up -d                       # also run the Discord bot
docker compose up -d --build website                     # rebuild after changing a NEXT_PUBLIC_* value
```

### Trying it on your own machine

The stack has no localhost mode, but you can run it locally by choosing local values yourself: set
every public URL to `http://localhost:<port>` (website 3000, admin 3001, hacker 3002, blog 3003, API
4200, plus `/api` on the API URL), `BIND_ADDRESS=127.0.0.1`, and the self-hosted Mongo file. Two
caveats: the API runs in production mode, so its session cookies are `Secure` and some browsers
refuse them over plain HTTP (Chrome accepts them on `localhost`); and this machine's own `mongod`
and dev servers must not already hold ports 27017 or 3000-3003. For day-to-day development keep using
`pnpm dev` with `.env.example`.

## Configuration reference

### API (runtime environment)

Read when the container starts. Required, and enforced by `docker-compose.yml`:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET` | Signing secrets; use three different random strings. The API's built-in fallbacks are insecure placeholders. |
| `RESEND_API_KEY` | Email; the API refuses to start without it |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account seeded on first start (the built-in fallback password is a well-known default) |
| `CORS_ORIGIN` | Comma-separated public origins of the four web apps |
| `ADMIN_URL`, `HACKER_PORTAL_URL` | Public URLs of the admin panel and hacker portal; GitHub login redirects to the latter |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` | GitHub OAuth app; the callback must be the public `…/api/auth/github/callback` and match the app's settings |

Optional, passed through only when set: `APP_URL`, `EMAIL_FROM`, `LOG_LEVEL`, `JWT_EXPIRATION`,
`JWT_REFRESH_EXPIRATION`, `GITHUB_API_TOKEN`, `GITHUB_ORG_NAME`, `GITHUB_ORG_ADMIN_TOKEN`. `PORT`
and `HOST` are honoured (defaults `4200` / `0.0.0.0` inside the image), which is what platforms like
Cloud Run rely on when they inject their own `PORT`.

### Web apps (build time)

Next.js compiles `NEXT_PUBLIC_*` values into the browser bundle, so they are **baked into the image
when it is built**: build one image per environment. Each app requires only what it uses, and the
build fails naming any that are missing or empty:

| App | Required build args |
|-----|---------------------|
| `website` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BLOG_URL`, `NEXT_PUBLIC_HACKER_URL` |
| `blog` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEBSITE_URL` |
| `admin` | `NEXT_PUBLIC_API_URL` |
| `hacker` | `NEXT_PUBLIC_API_URL` |

```sh
docker build --target next \
  --build-arg APP=website --build-arg PORT=3000 \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.org/api \
  --build-arg NEXT_PUBLIC_BLOG_URL=https://blog.example.org \
  --build-arg NEXT_PUBLIC_HACKER_URL=https://hacker.example.org \
  -t sos-website .
```

They are public by nature; never put secrets in a `NEXT_PUBLIC_*` value.

### Server-side API URL (website, blog)

Pages rendered on the server run inside the container network, where the public API URL is often not
the right address. `website` and `blog` therefore read an optional **runtime** variable
`API_URL_INTERNAL` for their server-side fetches (the browser keeps using `NEXT_PUBLIC_API_URL`).
`docker-compose.yml` sets it to the API's Docker service name. On other platforms set it to the
internal address of the API if there is one; if unset, server-side fetches use the public URL.

## Deploy the images elsewhere

The compose file is one way to run the images. Any platform that runs containers works: the API image
needs the required variables above at runtime; each web image needs its `NEXT_PUBLIC_*` values at
build time (build your own, or use the released ones if they were built with your URLs, see
[Releases](#releases)).

### Google Cloud Run

Cloud Run pulls from Artifact Registry (or Docker Hub), not directly from GHCR, so copy the release
image across once and deploy it. A starting point for the API (adapt project, region and secrets; the
variables shown are the required ones from the table above):

```sh
VERSION=1.2.3
SRC=ghcr.io/shinobi-open-source-academy/sos-academy-platform/server:$VERSION
DST=europe-west1-docker.pkg.dev/MY_PROJECT/sos/server:$VERSION

docker pull $SRC && docker tag $SRC $DST && docker push $DST

gcloud run deploy sos-server \
  --image $DST --region europe-west1 --port 4200 --allow-unauthenticated \
  --set-env-vars CORS_ORIGIN=...,ADMIN_URL=...,HACKER_PORTAL_URL=...,ADMIN_EMAIL=...,GITHUB_CALLBACK_URL=... \
  --set-secrets MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,JWT_REFRESH_SECRET=jwt-refresh-secret:latest,SESSION_SECRET=session-secret:latest,RESEND_API_KEY=resend-api-key:latest,ADMIN_PASSWORD=admin-password:latest,GITHUB_CLIENT_ID=github-client-id:latest,GITHUB_CLIENT_SECRET=github-client-secret:latest
```

Web apps are deployed the same way, one service each, with `--port` matching the image.

### Other platforms

- **Fly.io / Railway / Render:** point the service at the image, set the variables, expose its port.
- **Kubernetes:** one Deployment per image; `GET /api` on the API and `GET /` on the web apps make
  simple liveness probes.
- **Managed MongoDB** (Atlas) is the recommended database everywhere.

### Moving off App Engine

`app.yaml` and `.gcloudignore` are unchanged, so the current App Engine deployment keeps working.
To cut over: deploy the API on the new platform with the same variables, point
`NEXT_PUBLIC_API_URL` (and the DNS record) at it, and once traffic has moved delete `app.yaml` and
`.gcloudignore`.

## Releases

Versions and images are produced automatically by [semantic-release](https://semantic-release.gitbook.io)
from [Conventional Commit](https://www.conventionalcommits.org/) messages (see
[CONTRIBUTING.md](../CONTRIBUTING.md#3-commit-your-changes)). On every push to `main`,
[`release.yml`](../.github/workflows/release.yml):

1. decides the next version (`fix`/`perf` → patch, `feat` → minor, breaking → major; `docs`, `chore`,
   `refactor`, `test`, `build`, `ci`, `style` do not release),
2. updates `CHANGELOG.md` and the root `package.json` version and commits them as
   `chore(release): x.y.z [skip ci]`,
3. tags `vX.Y.Z` and publishes a GitHub Release,
4. builds all six images from that tag and pushes them to GHCR ([`docker.yml`](../.github/workflows/docker.yml)).

Pull requests get a compose-file check (the files against `.env.docker.example`), a Docker build of
every image (no push), and a PR-title check. Preview a release locally without publishing anything:
`GITHUB_TOKEN=$(gh auth token) pnpm exec semantic-release --dry-run --no-ci` (from a clone whose
current branch is `main`).

### One-time setup

1. **Create a baseline tag before the first release.** Without any tag, semantic-release treats the
   whole history as unreleased and would publish `v1.0.0` with hundreds of commits as its changelog.
   The release job refuses to run until a `v*` tag exists:

   ```sh
   git fetch origin
   git tag -a v0.1.0 origin/main -m "Baseline before automated releases"
   git push origin v0.1.0
   ```

2. **Set the four `NEXT_PUBLIC_*` repository variables** (Settings → Secrets and variables → Actions →
   *Variables*): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEBSITE_URL`, `NEXT_PUBLIC_BLOG_URL`,
   `NEXT_PUBLIC_HACKER_URL`. The released web images are built with these, and there are no
   fallbacks: if any is missing the image job fails, naming it, after the release is created. Add the
   variable and use *Re-run failed jobs*. Released web images therefore only fit the environment those
   URLs describe; other environments build their own.
3. After the first publish, make the GHCR packages public.
4. Recommended: allow only **squash merging** (Settings → General → Pull Requests) with "default to
   pull request title", so each PR becomes exactly one Conventional Commit on `main`. With plain merge
   commits, only the individual commits inside the PR count and non-conventional ones are ignored.
5. If you later protect `main`, let `github-actions[bot]` push to it (or bypass the rule for the
   release job), since the release commit is pushed directly.

## Known limitations

- **One image per environment for web apps** (see [Web apps](#web-apps-build-time)). Making
  `NEXT_PUBLIC_*` runtime-configurable would need a small config-injection layer in each app.
- **The `kunai-bot` image is large (~1.4 GB).** pnpm always installs the workspace root's dependencies
  alongside a filtered install, and the root `package.json` lists every app's runtime dependencies
  (Next, React, Nest, ...). Moving those into the apps that use them would shrink it to a few hundred
  MB. Nothing is wrong functionally; the API image is unaffected (246 MB).
- **Images are `linux/amd64` only.** Add `linux/arm64` to the `docker.yml` build (ideally on a native
  arm64 runner) if you deploy to Graviton/Ampere hosts. Local builds on Apple Silicon are arm64
  already.
- **Sessions are held in memory.** The API uses `express-session` without a store
  (`apps/server/src/main.ts`), so admin logins live in one process. Run a **single API replica**, or
  first configure a shared store (`connect-mongo` is already a dependency of the server), before
  scaling out.
- **The API has insecure built-in fallbacks** for its secrets and admin password
  (`apps/server/src/common/config/env.config.ts`). The compose file and this guide require you to set
  them, but the API itself would still start with the fallbacks if run some other way. Failing on them
  in production is a natural follow-up.
- **The health check is `GET /api`**, which answers once the app is listening but does not query the
  database. A dedicated readiness endpoint would be a natural follow-up.
