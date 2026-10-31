<p align="center">
  <img src="docs/images/noticewise-cover.svg" alt="NoticeWise — Make the fine print make sense" width="100%">
</p>

<p align="center">
  <a href="https://drishya-code.github.io/NoticeWise/"><strong>Open the live demo</strong></a> ·
  <a href="https://github.com/Drishya-code/NoticeWise">Source on GitHub</a>
</p>

<p align="center"><sub>The public site is a sample preview. Run the app locally for live Gemma 4 analysis.</sub></p>

# NoticeWise

**Make the fine print make sense.** NoticeWise turns school, university, and community notices into a plain-language summary, a deadline-aware action list, a requirements checklist, and short evidence quotes readers can verify against the original.

Built for **Hacktoberfest Hack Day New Delhi x South Asian University**. NoticeWise is designed for both **Best Use of Gemma 4** and **Best Open-Source AI Project**.

## Product preview

<p align="center"><img src="docs/images/noticewise-screenshot.png" alt="Screenshot of NoticeWise with a sample university notice on the left and its summary, action, deadline, requirements, and open question on the right" width="100%"></p>

*The public preview uses clearly labeled sample content. Live notice analysis runs through the local app and keeps the API key on the server.*

## Why NoticeWise

Important opportunities and obligations are often buried in dense circulars, unfamiliar language, and small print. NoticeWise helps people quickly see who a notice applies to, what to do, when to do it, and what still needs confirmation. It highlights uncertainty instead of filling gaps with guesses.

## What it does

- Accepts pasted notice text or a photo (PNG, JPG, WebP).
- Produces a concise, plain-language summary.
- Extracts audiences, tasks, deadlines, and required documents.
- Includes brief source quotes to help readers verify important details.
- Explains the result in English, Hindi, Bengali, Tamil, Telugu, Marathi, or Urdu.
- Keeps the Gemini API key on the server; the browser never receives it.
- Offers a no-key sample preview on the public GitHub Pages site.

## How it works

### From notice to next step

<p align="center"><img src="docs/images/noticewise-user-flow.svg" alt="User flow: add a notice, choose a language, let Gemma 4 find key details, then verify and act" width="100%"></p>

### App architecture

<p align="center"><img src="docs/images/noticewise-architecture.svg" alt="Architecture: browser to local Node.js server to Gemma 4 through Gemini API, with the API key kept server-side; GitHub Pages hosts a sample preview" width="100%"></p>

Gemma 4 is central to the product: it reads the notice, creates the summary and action list, and flags unclear details. The model is accessed through the Gemini API; the API key is stored locally in `.env` and is never included in the public site.

## Run it locally

Requires **Node.js 18+** and a Gemini API key with Gemma 4 access.

1. Clone this repository and enter its folder.
2. Create your private environment file and add your key:

   ```powershell
   Copy-Item .env.example .env
   ```

   Open `.env` and replace `your_key` with your Gemini API key. `.env` is excluded from Git.

3. Start the app:

   ```powershell
   node app.js
   ```

4. Open [http://localhost:8000](http://localhost:8000).

Without an API key, use **Try a sample** to explore the example clarity card. Live analysis needs a configured key. Set `GEMMA_MODEL` to `gemma-4-31b-it` to use that supported model; the default is `gemma-4-26b-a4b-it`.

## Prize category fit

- **Best Use of Gemma 4:** Gemma 4 performs the core notice understanding and multilingual simplification, including image-based notice reading.
- **Best Open-Source AI Project:** NoticeWise is an original, MIT-licensed application built around Google's open-weight Gemma model. The prototype accesses Gemma through the Gemini API; self-hosting the open weights is a possible extension.

## Responsible use

NoticeWise is a reading aid, not an official source or legal or financial advice. Always confirm eligibility, deadlines, and submission instructions in the original notice. AI can make mistakes; check the source and confirm unclear details with the issuing organization.

## Technology

Node.js built-in HTTP server · HTML · CSS · Vanilla JavaScript · Gemini API · Gemma 4. No package installation required.

## License

MIT. See [`LICENSE`](LICENSE).
