# Trao AI Interview Prep Kit

Full-Stack Engineering Assessment implementation. 

## Project Overview

This application turns a job description and company URL into a tailored interview preparation kit. It crawls the company site, researches the interview process online, and uses Google Gemini to generate a complete study kit with a company brief, a categorized question bank, flashcards, and a day-by-day study schedule.

### Deployed Environments

- **Frontend**: Hosted on Firebase Hosting (`https://prepaligner.web.app`)
- **Backend**: Hosted on Render 
- **Database**: Hosted on MongoDB Atlas
*(Environment variables are securely injected in the hosting platforms).*

#### Test Credentials
To quickly test the deployed application without registering a new account, you can use the following credentials:
- **Email**: `mohamednafees1613@gmail.com`
- **Password**: `1234567890`

### Tech Stack & Justification

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui. 
  *Justification*: Chosen over Next.js because for this specific use case—a private, authenticated dashboard—Server-Side Rendering (SSR) is mostly unnecessary. Additionally, using Vite made it straightforward to deploy to Firebase Hosting to get the exact custom URL I wanted.
- **Backend**: Node.js + Express + TypeScript. 
  *Justification*: Chosen for fast I/O and easy LLM streaming integration. Follows Clean Architecture principles.
- **Database**: MongoDB. 
  *Justification*: Native document storage fits the heavily nested, varied structure of the generated Kits perfectly.
- **Scraping**: Axios + Cheerio with custom heuristics.
- **LLM Providers**: Google Gemini, Groq, and Cohere (Free Tiers) via a dynamic factory pattern.

## Setup Instructions

### Local Setup (Docker)

Ensure you have Docker installed and a `.env` file at the root.

1. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
2. **Fill in your API keys** inside the new `.env` file (e.g., `GEMINI_API_KEY`, `GROQ_API_KEY`, `COHERE_API_KEY`).
3. Start the stack:
   ```bash
   docker compose up --build
   ```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5005`

### Batch Entry Point (Mandatory CLI)

To run the mandatory batch evaluation CLI over a set of postings:

```bash
# 1. Install dependencies at the root (which installs backend/frontend)
npm install

# 2. Run the evaluate script
npm run evaluate -- --input cases.json --output kits.json
```
*(This command internally forwards to the backend pipeline and runs the evaluation headless from a clean clone).*



## LLM Providers and Models

We implemented a robust `LLMProviderFactory` allowing the system to use and switch between multiple providers:

- **Google Gemini** (`gemini-1.5-flash`): *Primary choice.* Provides a generous free tier and excellent native structured JSON output, which is critical for reliably generating deeply nested kit structures without constant parsing failures.
- **Groq** (`llama-3.1-70b-versatile`): Extremely fast inference; excellent as a high-speed fallback.
- **Cohere** (`command-r`): A highly reliable, enterprise-grade alternative.

*Reasoning*: Providing multiple free-tier LLM integrations ensures the application remains highly resilient. Free tiers strictly limit tokens/minute and frequently throw 503 "High Demand" errors. Having multiple fallback providers is the most effective way to guarantee robustness without paying for API keys.

## High-Level Architecture

The architecture strictly separates concerns across the stack:
- **Presentation Layer (Frontend)**: React application handling real-time editing, drag-and-drop reordering, and optimistic UI updates for instant feedback.
- **API Layer (Backend)**: Express routes validating incoming requests (using `Zod`) before handing off to services.
- **Pipeline Layer (Backend)**: A dedicated `KitGenerationOrchestrator` manages the multi-step research, LLM generation, and validation lifecycle as background tasks.
- **Persistence Layer (Backend)**: Mongoose models handle document storage, utilizing compound indexes for fast lookup.

## Retrieval Approach and Sources

1. **Robots.txt & Security**: All external URLs are validated (rejecting loopback/private IPs like `localhost` in production) and checked against `robots-parser` before fetching.
2. **Company Crawl**: The pipeline fetches the given homepage and extracts links. It uses a scoring heuristic to rank links (prioritizing `/careers`, `/about`, `/jobs`, `/handbook`, and engineering blogs). It visits the top links up to a safe limit.
3. **Public Discussion**: We perform targeted web queries (acting as a search agent) to look up company interview experiences on public forums.
4. **Resilience**: If a site returns 404 or times out, the error is caught, recorded in the kit's log, and the pipeline gracefully continues with whatever data it *did* find.

## Sequencing of Research and Generation Steps

The generation is broken down into deliberate steps, avoiding single-shot prompts:

1. **Requirement Extraction (LLM)**: Parses the raw Job Description into distinct `must` and `nice` requirements, assigning stable IDs.
2. **External Research (Deterministic + Network)**: Crawls the company URL and searches for public discussion concurrently based on the company name and JD.
3. **Draft Generation (LLM)**: Generates the Company Brief, Questions (split by category), and Flashcards using the extracted requirements and research context.
4. **First Coverage Check (Deterministic)**: Code compares generated questions against the must-have requirement IDs.
5. **The Second Pass (LLM)**: If must-have requirements are uncovered, a targeted LLM prompt generates questions *specifically* for those missing IDs to close the gap.
6. **Schedule Allocation (Deterministic)**: Code distributes the final pool of questions across the requested days using arithmetic.

## State Representation (Generated, Edited, Pinned)

This is the hardest state problem, solved at the entity level via a `metadata` object on every question, flashcard, and brief section:
- `origin`: `'generated'` | `'manual'` | `'regenerated'`
- `is_edited`: boolean
- `is_pinned`: boolean

When a user edits an item inline, `is_edited` becomes true. When adding an item manually, it defaults to `is_pinned: true`. 
When a user regenerates a section, the backend queries the existing kit, filters out items that are `is_edited` or `is_pinned`, and only replaces the untouched `generated` items. This ensures manual work survives completely intact.

## Schedule Allocation

The `DeterministicScheduler` allocates the schedule using strict arithmetic (no LLMs):
- Groups questions by requirement priority (`must` vs `nice`).
- Calculates daily capacity.
- Distributes `must` questions first, front-loading the hardest (Level 3) topics into earlier days to ensure the user isn't tackling the hardest concepts the night before the interview.
- Spreads remaining capacity with `nice` questions, ensuring exactly the requested number of days are utilized.

## Creative Feature: Mock Interview Mode

**Feature**: An interactive "Mock Interview" Mode where users can test themselves against the generated questions, reveal answers, mark their confidence, and receive a diagnostic summary.
**Problem it Solves**: A static document isn't enough for interview prep. Candidates need active recall practice. The confidence tracking also powers a smart retry mechanism, where their lowest-confidence topics can be prioritized in future sessions or regenerations.

## Edge Cases and Failure Handling

- **Invalid/404 Company URL**: Caught gracefully; recorded in the kit's errors. The kit generates based purely on the JD.
- **No Discoverable Hiring Page**: The scraper falls back to the homepage and about page. The brief reflects exactly what is known without hallucinating.
- **Two-line JD stub**: The extraction extracts what it can. The LLM generates a thin, honest kit rather than fabricating requirements.
- **No Public Discussion**: The prompt is instructed to state that no public interview data was found.
- **Invalid JSON from LLM**: The pipeline uses Zod to validate the LLM's JSON. If it fails, it utilizes Gemini's structured output enforcement or retries the prompt.
- **Rate Limits**: Handled via a central `LLMRateLimiter` using a Token Bucket algorithm and exponential backoff to handle 429s automatically.
- **Duplicate Submissions**: Creates a separate unique Kit instance for the user, allowing them to prepare differently if desired.
- **1-day or 60-day Schedules**: The deterministic scheduler adapts mathematically. For 1 day, all priority items are packed into Day 1. For 60 days, items are spread out. (We enforce a max of 90 days via validation).

## Key Design Decisions & Trade-offs

- **Client-Side SPA vs SSR**: The choice to use Vite instead of Next.js was primarily driven by deployment flexibility. Since this is an authenticated dashboard, SSR is mostly unneeded for this use case, and a pure SPA allowed for a simple deployment to Firebase Hosting to secure a custom URL.
- **LLM JSON Validation**: Relying strictly on the LLM to output perfect JSON can be brittle. We mitigate this by using Zod validation and fallback mechanisms, but the trade-off is slightly longer generation times on failure.
- **Database Indexes**: Used compound indexes (`{ userId: 1, createdAt: -1 }`) to ensure fast lookup of a user's dashboard kits without performing in-memory sorting, trading a tiny bit of write speed for massive read performance gains.
