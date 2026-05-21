# FastBid

FastBid is a mobile-first bid assistant for contractors who quote jobs from photos, voice notes, old invoices, and memory.

The first prototype focuses on the core promise:

- Capture job context without typing.
- Draft a customer-ready bid.
- Show similar past jobs as evidence.
- Surface risk notes before the contractor sends the quote.

Read the product direction in [docs/product-brief.md](docs/product-brief.md).

## Run The App

```bash
npm install
npm run start
```

For the web preview:

```bash
npm run web
```

## Current Prototype

- `Bid` tab: mobile bid intake, generated quote preview, line items, and pre-send risk flags.
- `Memory` tab: similar historical jobs, estimator defaults, and the intended AI/RAG stack.

## MVP Architecture Direction

- Expo React Native frontend.
- OpenAI API for first-pass extraction, drafting, and risk review.
- Postgres plus pgvector for company-specific bid memory.
- S3-compatible storage for photos, PDFs, invoices, and generated bid artifacts.
- A swappable model provider so local models can be tested later for lower-risk tasks.
