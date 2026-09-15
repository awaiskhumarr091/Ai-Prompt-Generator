// ---------------------------------------------------------------
// AI Prompt Generator — backend
// Serves the site and relays AI requests so the API key stays private.
// Run:  npm install  &&  npm start     then open http://localhost:3000
// ---------------------------------------------------------------
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

// JSON limit is generous because images arrive base64-encoded
app.use(express.json({ limit: '12mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/claude', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: 'No API key set. Copy .env.example to .env and put your key in it, then restart the server.'
    });
  }

  const { content, system, maxTokens } = req.body || {};
  if (!content) {
    return res.status(400).json({ error: 'Nothing was sent to process.' });
  }

  try {
    const body = {
      model: MODEL,
      max_tokens: maxTokens || 1000,
      messages: [{ role: 'user', content }]
    };
    if (system) body.system = system;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const msg = (data && data.error && data.error.message) || 'The AI provider rejected the request.';
      return res.status(upstream.status).json({ error: msg });
    }

    const textBlock = (data.content || []).find(b => b.type === 'text');
    if (!textBlock) return res.status(502).json({ error: 'No text came back from the model.' });

    res.json({ text: textBlock.text });
  } catch (err) {
    console.error('Upstream error:', err);
    res.status(502).json({ error: 'Could not reach the AI provider. Check your internet connection.' });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('  AI Prompt Generator running');
  console.log('  ->  http://localhost:' + PORT);
  if (!API_KEY) console.log('  !   No API key found yet — see README.md step 2');
  console.log('');
});
