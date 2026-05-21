# FastBid Product Brief

FastBid is an AI bid assistant for blue-collar contractors who do not want to type. The first customer image is a small owner-operator who already quotes work from job photos, text messages, old invoices, memory, and voice notes.

## Wedge

Start with small contractors who quote similar-but-not-identical jobs from photos and quick site notes. Safer early trades include handyman work, drywall, painting, fencing, flooring, landscaping, and light repair.

## MVP Promise

The contractor can:

- Add job photos.
- Record or paste a voice note.
- Attach old bids, invoices, or notes.
- Receive a professional draft bid with scope, line items, assumptions, exclusions, risk notes, and a recommended price.

The app should feel like a helper who writes down what the contractor said and remembers past jobs.

## First Workflow

1. Capture current job context from photos, voice notes, and basic customer details.
2. Extract a structured scope with trade, tasks, quantities, labor hints, materials, and unknowns.
3. Retrieve similar historical jobs from company memory.
4. Generate a draft bid with citations to old bids and invoices.
5. Flag risky assumptions before the owner sends anything.
6. Let the contractor tune price, add exclusions, and send the customer-ready version.

## Trust Requirements

FastBid should never position itself as an autonomous estimator. It is an estimator copilot for human review.

Every generated bid should include:

- Similar past jobs used as support.
- Assumptions and exclusions.
- Risk warnings.
- A confidence indicator.
- Clear places where the contractor needs to confirm scope.

## Model Strategy

Use OpenAI API first for the MVP so the product feels reliable from day one. Keep the AI layer swappable so local or cheaper models can later handle low-risk tasks.

Recommended phases:

- Phase 1: OpenAI for extraction, bid drafting, RAG-grounded reasoning, and risk review.
- Phase 2: Hybrid model use for cheaper classification, OCR cleanup, summaries, and embedding prep.
- Phase 3: Optional private or local model tier for larger contractors with stronger privacy requirements.

## Initial Architecture

- Expo React Native mobile app.
- Node or Kotlin backend.
- Postgres for core data.
- pgvector for company memory retrieval.
- S3-compatible storage for photos, PDFs, invoices, and generated bid files.
- OpenAI model provider behind an internal interface.
- PDF and email/text export once bid drafts are stable.

## Validation Test

Before building deep automation, manually run the workflow for 3 to 5 contractors:

> Send me one current job plus a few old bids or invoices. I will turn them into a professional bid draft with risk notes and comparisons to past work.

Charge something real, such as $20 per finished bid or $250 to $500 for a pilot package. If they pay and ask for it again, build the next layer.
