# Trao AI Interview Prep Kit

Full-Stack Engineering Assessment implementation. 

## Project Overview

This application turns a job description and company URL into a tailored interview preparation kit. It crawls the company site, researches the interview process online, and uses LLM (Google Gemini Flash) to generate a complete study kit with a company brief, a categorized question bank, flashcards, and a day-by-day study schedule.

### Tech Stack & Justification

- **Workspace**: 2-folder structure (`frontend/` + `backend/`) for strict separation of concerns.
- **Docker**: Single `docker compose up` starts MongoDB, the Express backend, and the React frontend.
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui. (Vite instead of Next.js per user requirement; React SPA provides rapid interactive editing).
- **Backend**: Node.js + Express + TypeScript. Chosen for fast I/O and easy LLM integration. Designed with SOLID principles and Lead Engineer design patterns (Factory, Strategy, Singleton).
- **Database**: MongoDB. Native document storage fits the heavily nested, varied structure of the generated Kits perfectly.
- **LLM Provider**: Google Gemini (Free Tier) with built-in token-bucket rate limiting and exponential backoff.
- **Scraping**: Axios + Cheerio with intelligent heuristics for `/careers`, `/about`, and `/handbook` pages.

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure you have set your `GEMINI_API_KEY`. If you don't have one or want to run offline deterministic tests, set `USE_MOCK_LLM=true`.

### 2. Running with Docker (Recommended)

To start the entire application stack (Database + Backend + Frontend):
```bash
docker compose up --build
```
- The frontend will be available at `http://localhost:3000`
- The backend API will be at `http://localhost:5000`

### 3. Running the Batch Entry Point (Section 9)

To run the mandatory batch evaluation CLI over a set of postings:

```bash
npm run evaluate -- --input backend/tests/fixtures/cases.json --output backend/tests/fixtures/output.json
```
*Note: This command runs strictly headless using the same backend generation pipeline.*

## Architecture Highlights

1. **Deterministic Schedule Allocation**: The `DeterministicScheduler` class uses pure arithmetic (no LLMs) to distribute topics based on difficulty and priority over the requested days, guaranteeing must-haves are covered early.
2. **Deterministic Coverage Loop (The Second Pass)**: The `DeterministicCoverageChecker` evaluates if all must-have requirements have assigned questions. If not, the pipeline runs a targeted second pass.
3. **State Preservation (The Builder)**: User edits and pins are preserved during single-section regeneration through `origin`, `is_pinned`, and `is_edited` flags at the entity level.
4. **Creative Feature**: Interactive AI Mock Interviewer & Diagnostic Weak Spots Engine (with printable 1-pager export).
