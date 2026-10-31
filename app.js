const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
const MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
const MAX_BODY = 8 * 1024 * 1024;
const PROMPT = `You are NoticeWise, an assistant that helps people understand public notices and school or community circulars. Analyze only the supplied notice. Never invent facts, deadlines, eligibility rules, or required documents. If something is absent or unclear, say "Not stated" or flag it for confirmation. Return ONLY valid JSON with this exact shape:
{"title":"short plain-language title","summary":"one or two short sentences","language":"language detected","translated_summary":"summary in requested language","who":"who this applies to, or Not stated","actions":[{"task":"specific action","deadline":"date or Not stated","evidence":"short exact quote from source"}],"requirements":[{"item":"document or requirement","evidence":"short exact quote from source"}],"unclear":["question the reader should confirm"],"confidence":"high, medium, or low"}
Use plain friendly language. Keep quotes brief and exact. The requested output language is: `;

function send(res, status, data, type = 'application/json; charset=utf-8') {
  const body = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': body.length, 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('Please use a smaller image or shorter notice (8 MB max).'), { status: 413 })); req.destroy(); }
      else chunks.push(chunk);
    });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(Object.assign(new Error('Invalid request data.'), { status: 400 })); } });
    req.on('error', reject);
  });
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, { configured: Boolean(process.env.GEMINI_API_KEY), model: MODEL });
  if (req.method === 'POST' && url.pathname === '/api/analyze') {
    try {
      const payload = await readBody(req);
      const text = String(payload.text || '').trim();
      const language = String(payload.language || 'English').slice(0, 60);
      const image = payload.image;
      if (!text && !image) return send(res, 400, { error: 'Paste notice text or add an image first.' });
      if (!process.env.GEMINI_API_KEY) return send(res, 503, { error: 'Gemma is not connected yet. Add GEMINI_API_KEY to .env and restart the app. You can still explore the sample demo.' });
      const parts = [{ text: `${PROMPT}${language}.\n\nNOTICE TEXT:\n${text}` }];
      if (image?.data && ['image/png', 'image/jpeg', 'image/webp'].includes(image.mime)) parts.push({ inline_data: { mime_type: image.mime, data: image.data } });
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2, maxOutputTokens: 1500 } }), signal: AbortSignal.timeout(75000) });
      const result = await response.json();
      if (!response.ok) return send(res, 502, { error: `Gemma request failed (${response.status}). Check the API key and model access.`, detail: result.error?.message || '' });
      const raw = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error('Gemma returned an empty response.');
      const clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      return send(res, 200, JSON.parse(clean));
    } catch (err) {
      return send(res, err.status || 500, { error: err.status ? err.message : 'Could not read that notice. Try clearer text or another image.', detail: String(err.message || '').slice(0, 300) });
    }
  }
  if (req.method === 'GET') {
    const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const target = path.resolve(ROOT, 'static', name);
    const base = path.resolve(ROOT, 'static') + path.sep;
    if (!target.startsWith(base)) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    fs.readFile(target, (err, data) => {
      if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
      const ext = path.extname(target);
      const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.css' ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8';
      return send(res, 200, data, type);
    });
    return;
  }
  return send(res, 404, { error: 'Not found' });
});
const port = Number(process.env.PORT || 8000);
server.listen(port, '127.0.0.1', () => console.log(`NoticeWise running at http://localhost:${port}`));
