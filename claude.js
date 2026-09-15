// ---------------------------------------------------------------
// Vercel serverless function -> available at /api/claude
//
// This is what makes the tools work when deployed. The API key lives
// in Vercel's environment variables and is never sent to the browser.
//
// Set the key here:
//   Vercel dashboard -> your project -> Settings -> Environment Variables
//   Name:  ANTHROPIC_API_KEY
//   Value: sk-ant-...
// Then redeploy (Deployments -> ... -> Redeploy).
// ---------------------------------------------------------------

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

  if (!API_KEY) {
    return res.status(500).json({
      error: 'No API key set on the server. Add ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables, then redeploy.'
    });
  }

  // Vercel parses JSON bodies automatically, but fall back just in case.
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { payload = null; }
  }
  if (!payload || !payload.content) {
    return res.status(400).json({ error: 'Nothing was sent to process.' });
  }

  const content = payload.content;
  const system = payload.system;
  const maxTokens = payload.maxTokens;

  try {
    const body = {
      model: MODEL,
      max_tokens: maxTokens || 1000,
      messages: [{ role: 'user', content: content }]
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

    const textBlock = (data.content || []).find(function (b) { return b.type === 'text'; });
    if (!textBlock) {
      return res.status(502).json({ error: 'No text came back from the model.' });
    }

    return res.status(200).json({ text: textBlock.text });
  } catch (err) {
    console.error('Upstream error:', err);
    return res.status(502).json({ error: 'Could not reach the AI provider.' });
  }
};
