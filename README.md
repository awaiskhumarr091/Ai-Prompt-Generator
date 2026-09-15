# AI Prompt Generator

Eight prompt-engineering tools, each on its own page, with a small backend that
keeps your API key out of the browser.

## Why there's a server

A web page cannot call the AI provider directly. Two things stop it:

1. **No key in the browser.** Anything in a `.html` or `.js` file is visible to
   every visitor. An API key there would be public immediately.
2. **CORS.** The provider refuses requests made straight from a web page.

So `server.js` sits in between: the page posts to `/api/claude`, the server adds
the key and forwards the request. This is why opening `index.html` by
double-clicking it shows **"Failed to fetch"** — there's no server running to
answer. Start the server and open `http://localhost:3000` instead.

## Setup

You need **Node.js 18 or newer** (check with `node -v`).

**1. Install dependencies**

    npm install

**2. Add your API key**

Copy `.env.example` to `.env`, then open `.env` and paste in your key:

    ANTHROPIC_API_KEY=sk-ant-...

Get a key at <https://console.anthropic.com> under *API Keys*. Note that API
usage is billed separately from a Claude.ai subscription.

**3. Start it**

    npm start

Then open **<http://localhost:3000>** in your browser.

> Open the localhost address, not the file itself. `file:///.../index.html`
> will not work — that's the "Failed to fetch" case.

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

## File layout

    ai-prompt-generator/
    |-- server.js          backend; holds the key, relays requests
    |-- package.json       dependencies and the start script
    |-- .env.example       copy to .env and add your key
    |-- README.md
    |-- public/            everything the browser loads
        |-- index.html
        |-- generate.html
        |-- check.html
        |-- humanize.html
        |-- image-to-prompt.html
        |-- image-to-text.html
        |-- two-images.html
        |-- product-description.html
        |-- video-prompt.html
        |-- style.css      all styling
        |-- common.js      shared logic: API calls, uploads, copy buttons

## Deploying

Any host that runs Node works — Render, Railway, Fly.io, a VPS. Set
`ANTHROPIC_API_KEY` as an environment variable in the host's dashboard rather
than uploading your `.env` file.

Static-only hosts (GitHub Pages, plain shared hosting) will **not** work on
their own, because there's no server to run `server.js`.

## Troubleshooting

**"Failed to fetch" / "Can't reach the server"**
The server isn't running, or you opened the file directly. Run `npm start` and
go to `http://localhost:3000`.

**"No API key set"**
You haven't created `.env` yet, or the server was started before you saved it.
Create the file and restart.

**A 401 error**
The key is wrong or was revoked. Generate a fresh one in the console.

**A 429 error**
You're being rate limited, or the account is out of credit. Check your billing
page.
