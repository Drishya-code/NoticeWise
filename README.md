# NoticeWise

**Make the fine print make sense.** NoticeWise turns school, university, and community notices into a plain-language summary, a deadline-aware action list, a requirements checklist, and short evidence quotes you can verify against the source.

Built for **Hacktoberfest Hack Day New Delhi x South Asian University**. The project is designed to enter both **DeepMind Google: Best Use of Gemma 4** and **DigitalOcean: Best Open-Source AI Project**.

Live demo: **https://drishya-code.github.io/NoticeWise/** (static sample preview; run locally for live Gemma analysis).

## Why it matters

Important opportunities and obligations are often buried in dense notices, unfamiliar language, and small print. NoticeWise helps students and families quickly understand who a notice applies to, what to do, when to do it, and what remains unclear. Each action can include a brief source quote; missing information is flagged instead of guessed.

## Features

- Paste notice text or upload a photo (PNG, JPG, WebP).
- Convert it to a short, plain-language summary.
- Extract actions, deadlines, and required documents.
- Show brief source evidence and unresolved questions.
- Request the explanation in English, Hindi, Bengali, Tamil, Telugu, Marathi, or Urdu.
- Keep the API key server-side; images and notice text are processed for the request and are not written to disk.
- Explore the sample preview without an API key. Sample output is clearly labeled and does not pretend to be a live model response.

## Run locally

Requires Python 3.10+ and a Gemini API key with Gemma 4 access.

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
node app.js
```

Open http://localhost:8000. Without a key, the prebuilt sample preview still works; live analysis asks you to configure the key.

Optional: set `GEMMA_MODEL` to `gemma-4-31b-it` or another Gemma model available to your API key. The default is `gemma-4-26b-a4b-it`.

## How Gemma 4 is central

The app sends the notice text (and optional image) to the Gemma 4 model through the Gemini API. Gemma returns a structured summary, audience, action list, requirements, source quotations, and open questions. The server validates and returns the result to the browser. The browser never receives the API key. Gemma is a core product capability, not a decorative add-on.

## Prize category fit

- **Best Use of Gemma 4:** Gemma 4 performs the core notice understanding and multilingual simplification, including image-based notice reading.
- **Best Open-Source AI Project:** NoticeWise is an original, public-source application built around Google's open-weight Gemma model. The model is accessed through the Gemini API for this prototype; self-hosting the open weights is a possible extension.

## Tech

Node.js built-in HTTP server, HTML, CSS, vanilla JavaScript, Gemini API, Gemma 4 (`gemma-4-26b-a4b-it`). No package installation required.

## Responsible use

NoticeWise is a reading aid, not an official source or legal/financial advice. Always confirm deadlines, eligibility, and submission instructions in the original notice. The model can make mistakes; short source quotes and uncertainty flags help users verify.

## License

MIT. See `LICENSE`.


