# Lease Risk Dashboard — Philippine Lease Contract Review

A one-page, bilingual (English / Tagalog) risk dashboard for Philippine lease contracts. Upload a PDF lease and get a clause-by-clause risk breakdown: a SIGN / NEGOTIATE / WALK AWAY verdict, a risk score, the three riskiest clauses quoted verbatim with plain-English explanations, a negotiation cheat sheet (counter-language + walk-away trigger) next to every red flag, and a list of protections the contract is missing.

Legal grounding: Civil Code of the Philippines (Arts. 1642–1688, incl. Art. 536 on illegal self-help eviction), RA 9653 (Rent Control Act of 2009), RA 7394 (Consumer Act), and BIR rules on rental income documentation/withholding.

## Stack

- Next.js (App Router) + Tailwind CSS
- `pdf-parse` for server-side PDF text extraction
- Anthropic API (`@anthropic-ai/sdk`) for the actual clause-by-clause legal analysis, called from `app/api/analyze/route.js` with a forced tool call so the response is always structured JSON

## Setup

```bash
npm install
```

Create `.env.local` with your Anthropic API key (never commit this file):

```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```

Open http://localhost:3000, upload a text-based PDF lease (not a scanned image — it needs selectable text), and the dashboard renders once the analysis comes back.

## Notes

- PDF only, up to 15MB, must have extractable text (a scanned image with no text layer will be rejected with a clear error).
- The site is a general-informational tool, not a substitute for advice from a licensed Philippine lawyer — this is stated on both the upload screen and in the dashboard's disclaimer.
