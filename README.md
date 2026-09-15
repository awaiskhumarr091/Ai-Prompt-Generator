# AI Prompt Generator

Eight prompt-engineering tools, each on its own page. Works deployed on Vercel
and locally, with the API key kept server-side.

---

## Fixing "Failed to fetch" on Vercel

If your deployed site shows **Failed to fetch**, one of these three is the cause.

### 1. The `api/` folder wasn't deployed

The tools call `/api/claude`. That endpoint comes from `api/claude.js`. If you
only uploaded the HTML files, nothing answers the request and every tool fails.

Your whole project must be deployed, keeping this shape:

    ai-prompt-generator/
    |-- api/
    |   |-- claude.js        <-- required, this is the endpoint
    |-- public/
    |   |-- index.html
    |   |-- ...
    |-- package.json
    |-- vercel.json

### 2. The API key isn't set on Vercel

In your Vercel dashboard:

1. Open your project
2. **Settings** -> **Environment Variables**
3. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`
   - Environments: tick Production, Preview, and Development
4. Click Save
5. Go to **Deployments**, open the newest one, choose **... -> Redeploy**

The redeploy matters. Environment variables are read at build time, so a
deployment made before you added the key will not pick it up.

Get a key at <https://console.anthropic.com> under *API Keys*. API usage is
billed separately from a Claude.ai subscription.

### 3. You're on an older deployment

If the address bar shows a `#` in it, like `/#generate`, that's an earlier
single-file version that had no backend. The current version uses real pages —
URLs look like `/generate.html`. Deploy this project fresh and hard-refresh
(Ctrl+Shift+R) to clear the cached old page.

---

## Deploying to Vercel

**Option A — drag and drop**

Go to <https://vercel.com/new>, drag the whole project folder in, deploy, then
add the environment variable as described above and redeploy.

**Option B — Git**

    git init
    git add .
    git commit -m "AI Prompt Generator"
    git remote add origin <your-repo-url>
    git push -u origin main

Then import the repo at <https://vercel.com/new>, add the environment variable,
and deploy.

**Option C — CLI**

    npm i -g vercel
    vercel
    vercel env add ANTHROPIC_API_KEY
    vercel --prod

No build settings are needed. Vercel serves `public/` as the site root and turns
`api/claude.js` into a serverless function automatically.

---

## Running locally

Requires **Node.js 18+** (check with `node -v`).

    npm install
    cp .env.example .env      # then paste your key into .env
    npm start

Open **<http://localhost:3000>**.

Open that address, not the HTML file itself. Double-clicking `index.html` gives
"Failed to fetch", because there's no server running to answer `/api/claude`.

---

## Why a backend is required at all

A web page cannot call the AI provider directly:

1. **A key in the browser is public.** Anything inside a `.html` or `.js` file
   can be read by any visitor, so the key would leak instantly.
2. **CORS.** The provider refuses requests sent straight from a web page.

So the request goes: page -> your own `/api/claude` -> provider. The key stays
on the server. `api/claude.js` does this on Vercel; `server.js` does the same
thing locally.

---

## The tools

| Page | What it does |
|---|---|
| `index.html` | Landing page — hero, tool grid, how it works, FAQ |
| `generate.html` | Rough idea to a structured prompt (target model + detail level) |
| `check.html` | Scores a prompt out of 10 with specific fixes |
| `humanize.html` | Rewrites stiff text in a natural voice |
| `image-to-prompt.html` | Image to a generation prompt (plain text or JSON) |
| `image-to-text.html` | Pulls text out of a photo or screenshot |
| `two-images.html` | Merges two images into one combined prompt |
| `product-description.html` | Name + features + tone to finished copy |
| `video-prompt.html` | Scene idea to a structured video prompt |

Uploads are capped at 3MB, since Vercel limits request bodies to about 4.5MB and
images are base64-encoded on the way up.

---

## Troubleshooting

**"No API key set on the server"**
The variable isn't saved, or you haven't redeployed since adding it. Do both.

**401 error**
The key is wrong, has a typo, or was revoked. Generate a fresh one.

**429 error**
Rate limited, or the account is out of credit. Check your billing page.

**404 on /api/claude**
The `api/` folder wasn't included in the deployment. Re-upload the full project.

**Works locally but not deployed**
Almost always the environment variable. Local reads `.env`; Vercel does not —
it needs the variable set in the dashboard.
