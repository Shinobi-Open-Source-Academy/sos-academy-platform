# Deploying the API to Cloud Run

Scope: **only the NestJS API** (`apps/server`). The four Next.js apps (website, admin, hacker,
blog) deploy to Vercel instead — see [vercel.com/docs/monorepos](https://vercel.com/docs/monorepos),
one Vercel Project per app with its Root Directory set to `apps/<app>`. `app.yaml` / `.gcloudignore`
(App Engine) are retired once this is live; delete them yourself when ready.

Project: `sos-academy-483918`. Region: `us-central1`. All commands are plain `gcloud`/`docker`, run
from the repo root.

- [Phase 0 — Prerequisites](#phase-0--prerequisites)
- [Phase 1 — Artifact Registry](#phase-1--artifact-registry)
- [Phase 2 — Secrets](#phase-2--secrets)
- [Phase 3 — Service account](#phase-3--service-account)
- [Phase 4 — Build and push the image](#phase-4--build-and-push-the-image)
- [Phase 5 — Deploy](#phase-5--deploy)
- [Phase 6 — Point GitHub OAuth and the frontends at it](#phase-6--point-github-oauth-and-the-frontends-at-it)
- [Phase 7 (optional) — Custom domain](#phase-7-optional--custom-domain)
- [Phase 8 — CI/CD](#phase-8--cicd)
- [Redeploying manually](#redeploying-manually)

## Phase 0 — Prerequisites

1. **Billing must be enabled** on `sos-academy-483918` — fix at
   https://console.developers.google.com/billing/enable?project=sos-academy-483918. Nothing below
   works until `gcloud billing projects describe sos-academy-483918` shows `billingEnabled: true`.
2. Your local `.env` has the real secret values already (per the project's `.env.example`).
3. Config used below — fill in once known, same values everywhere they appear:

   ```sh
   export PROJECT_ID=sos-academy-483918
   export REGION=us-central1
   export WEBSITE_URL=https://TODO
   export ADMIN_URL=https://TODO
   export HACKER_URL=https://TODO
   export BLOG_URL=https://TODO
   gcloud config set project "$PROJECT_ID"
   ```

## Phase 1 — Artifact Registry

One Docker repository to hold the image:

```sh
gcloud artifacts repositories create sos-academy \
  --repository-format=docker \
  --location="$REGION" \
  --description="SOS Academy platform images"

gcloud auth configure-docker "${REGION}-docker.pkg.dev"
```

## Phase 2 — Secrets

Everything sensitive goes into Secret Manager, read directly from your `.env` — the value is never
printed or echoed, only `gcloud`'s non-sensitive confirmation is:

```sh
for name in JWT_SECRET JWT_REFRESH_SECRET SESSION_SECRET RESEND_API_KEY MONGODB_URI \
            GITHUB_CLIENT_SECRET ADMIN_PASSWORD; do
  value=$(grep -m1 "^${name}=" .env | cut -d= -f2-)
  [ -n "$value" ] || { echo "missing $name in .env" >&2; continue; }
  printf '%s' "$value" | gcloud secrets create "$name" --data-file=- \
    || printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=-
  unset value
done
```

(The `||` branch lets you re-run this safely later to rotate a value — it adds a new version
instead of failing because the secret already exists.)

## Phase 3 — Service account

A dedicated identity for the Cloud Run service, with access to only the secrets above — not the
broad default Compute Engine service account:

```sh
gcloud iam service-accounts create sos-server-run \
  --display-name="SOS Academy server (Cloud Run)"

for name in JWT_SECRET JWT_REFRESH_SECRET SESSION_SECRET RESEND_API_KEY MONGODB_URI \
            GITHUB_CLIENT_SECRET ADMIN_PASSWORD; do
  gcloud secrets add-iam-policy-binding "$name" \
    --member="serviceAccount:sos-server-run@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Phase 4 — Build and push the image

Cloud Run only runs `linux/amd64`. This Mac is arm64, so the build must cross-compile explicitly —
a plain `docker build` here would silently produce an arm64 image that fails on Cloud Run.

```sh
docker buildx build --platform linux/amd64 \
  --target server \
  -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/sos-academy/server:$(git rev-parse --short HEAD)" \
  -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/sos-academy/server:latest" \
  --push .
```

## Phase 5 — Deploy

Required env vars and secrets from [`docker-compose.yml`](../docker-compose.yml), minus everything
that was only there for the web apps:

```sh
gcloud run deploy server \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/sos-academy/server:latest" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=4200 \
  --service-account="sos-server-run@${PROJECT_ID}.iam.gserviceaccount.com" \
  --min-instances=0 --max-instances=2 \
  --set-env-vars="NODE_ENV=production,ADMIN_EMAIL=$(grep -m1 '^ADMIN_EMAIL=' .env | cut -d= -f2-),GITHUB_CLIENT_ID=$(grep -m1 '^GITHUB_CLIENT_ID=' .env | cut -d= -f2-),ADMIN_URL=${ADMIN_URL},HACKER_PORTAL_URL=${HACKER_URL},CORS_ORIGIN=${WEBSITE_URL}\,${ADMIN_URL}\,${HACKER_URL}\,${BLOG_URL}" \
  --set-secrets="JWT_SECRET=JWT_SECRET:latest,JWT_REFRESH_SECRET=JWT_REFRESH_SECRET:latest,SESSION_SECRET=SESSION_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest,MONGODB_URI=MONGODB_URI:latest,GITHUB_CLIENT_SECRET=GITHUB_CLIENT_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest"
```

Two values depend on the URL this command prints when it finishes (`Service URL: https://...`), so
they're set in a second pass once you have it:

```sh
API_URL=$(gcloud run services describe server --region="$REGION" --format='value(status.url)')
echo "$API_URL"

gcloud run services update server --region="$REGION" \
  --set-env-vars="APP_URL=${API_URL},GITHUB_CALLBACK_URL=${API_URL}/api/auth/github/callback"
```

Verify:

```sh
curl -s "$API_URL/api"          # {"message":"Server is running with MongoDB connection"}
curl -s "$API_URL/api/docs" -o /dev/null -w '%{http_code}\n'   # 200
```

## Phase 6 — Point GitHub OAuth and the frontends at it

1. **GitHub OAuth App** (github.com → Settings → Developer settings → OAuth Apps → your app):
   set *Authorization callback URL* to `${API_URL}/api/auth/github/callback` (the exact value just
   set above). Not scriptable — GitHub doesn't expose this over `gcloud` or a CLI we're using here.
2. **Vercel**: on each of the four projects, set the environment variable
   `NEXT_PUBLIC_API_URL=${API_URL}/api` (Project Settings → Environment Variables), then redeploy.

## Phase 7 (optional) — Custom domain

Once `shinobi-open-source.academy` is verified under this Google account (Search Console → Add
property → DNS verification, then it shows up in `gcloud domains list-user-verified`):

```sh
gcloud run domain-mappings create \
  --service=server --domain=api.shinobi-open-source.academy --region="$REGION"
```

It prints the DNS records to add at your registrar (a CNAME, typically to `ghs.googlehosted.com`).
After DNS propagates and the managed certificate provisions (can take a while), re-run Phase 5's
second pass with `API_URL=https://api.shinobi-open-source.academy`, and update step 1 and 2 above to
match.

## Phase 8 — CI/CD

[`.github/workflows/deploy-server.yml`](../.github/workflows/deploy-server.yml) builds, pushes and
deploys automatically on every push to `main` that touches `apps/server`, `libs/shared`, the
`Dockerfile`, or the lockfile — independent of whether `release.yml` (semantic-release) decides that
push also warrants a version bump; a server fix shouldn't wait on that.

Auth is keyless: GitHub's OIDC token is exchanged for short-lived GCP credentials via **Workload
Identity Federation**, scoped to this exact repo and the `main` branch only — no service account
JSON key sits in a GitHub secret. One-time setup already done (kept here so it can be recreated if
ever needed):

```sh
PROJECT_ID=sos-academy-483918
PROJECT_NUMBER=194253303838
REPO="Shinobi-Open-Source-Academy/sos-academy-platform"

gcloud iam workload-identity-pools create "github-actions-pool" \
  --project="$PROJECT_ID" --location="global" --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Actions OIDC" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
  --attribute-condition="assertion.repository == '${REPO}' && assertion.ref == 'refs/heads/main'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

gcloud iam service-accounts create "github-deployer" \
  --project="$PROJECT_ID" --display-name="GitHub Actions deployer (CI/CD)"

# Push images + deploy revisions...
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" --condition=None
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.developer" --condition=None
# ...as the Cloud Run service's own runtime identity...
gcloud iam service-accounts add-iam-policy-binding "sos-server-run@${PROJECT_ID}.iam.gserviceaccount.com" \
  --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
# ...impersonable only by this repo's main-branch workflows, via the WIF provider above.
gcloud iam service-accounts add-iam-policy-binding "github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${REPO}"
```

**Important:** the workflow deploys with `gcloud run deploy --image=...` and nothing else — no
`--set-env-vars`/`--set-secrets`. Verified directly against the live service: a bare `--image`
redeploy leaves every existing env var and secret reference byte-for-byte unchanged, it only swaps
the image. Env var and secret changes go through the CLI by hand (Phase 2 / Phase 5 above), and CI
preserves whatever that left in place — it never overwrites config.

## Redeploying manually

Only needed for an out-of-band deploy (CI handles normal pushes to `main`):

```sh
docker buildx build --platform linux/amd64 --target server \
  -t "${REGION}-docker.pkg.dev/${PROJECT_ID}/sos-academy/server:$(git rev-parse --short HEAD)" \
  --push .
gcloud run deploy server \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/sos-academy/server:$(git rev-parse --short HEAD)" \
  --region="$REGION"
```

Rotating a secret: re-run its loop line from Phase 2 (it adds a new version), then
`gcloud run services update server --region="$REGION"` with no flags to roll the service onto the
new version — Cloud Run reads `:latest` at container start, so a fresh revision is required.
