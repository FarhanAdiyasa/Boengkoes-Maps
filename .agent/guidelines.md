# Master Engineering Rules & Thoroughness Guidelines

These rules are non-negotiable and apply to every task in this project. Failure to follow these is a failure in engineering excellence.

## 1. Requirement & Assumption Policy
- **Clarify First**: If a request is ambiguous (e.g., "fix the data"), ask for the specific definition of "fixed" (is it names, coordinates, or thumbnails?).
- **Challenge Constraints**: If a requested approach seems sub-optimal or dangerous (like hardcoding a thumbnail resolution), suggest a robust alternative (like a fallback chain or dynamic extraction).
- **Proactive Verification**: Before starting a fix, manually check the current state (DB, Console, or Network logs) to confirm the "Starting Point".

## 2. The "End-to-End" Verification Loop
Every fix/feature must pass the **Full Circle Check**:
1. **The Source (Data)**: Is the database schema correct? Are the stored values accurate? (Check Supabase).
2. **The Pipe (Service/Logic)**: Is the transformer mapping the DB snake_case to CamelCase correctly? Are types handled?
3. **The View (UI)**: Does the component handle empty states, loading, and edge cases (like low-res assets)?
4. **The Audit**: Run a script (e.g., `verify_data.js`) to prove the change is persistent and not just local.

## 3. Data Integrity & SQL Rules
- **PostgreSQL Strictness**:
    - Always use explicit casting for arrays: `ARRAY[]::text[]`.
    - Use `JSON.stringify()` or similar when data-logging errors to see the full context of a failed insert.
- **Migration Scripts**: Never "just insert". Build scripts (like `push_to_supabase.js`) that handle conflicts (`upsert`) and log every success/failure specifically.
- **Coordinate Precision**: Always resolve short URLs to landing pages to extract real latitude/longitude. Never "guess" coordinates from a city name.

## 4. External Asset Management (YouTube, Maps, etc.)
- **No Zonk Assets**: YouTube returns status 200 for broken `maxresdefault`.
- **Validation tool**: For any external URL pattern, use `curl.exe -I` to confirm headers and existence before committing a logic change.
- **Robust Fallbacks**: Always implement a "Stable Baseline" (like `hqdefault`) before trying "Premium Assets" (like `maxres`).

## 5. Development Discipline
- **Don't leave placeholders**: If an image or data is needed, use the scraper or generation tools to get REAL data.
- **Sync Environments**: If a fix requires a new environment variable, check `.env.local` and `.env` and instruct the user to update their dashboard.
- **Respect Patterns**: If common utilities exist in `scripts/`, use them or improve them rather than writing ad-hoc logic.

## 6. Self-Correction protocol
- If a fix fails to show in the UI after a code change, **IMMEDIATELY** stop and look at the raw database data. The problem is almost certainly a mismatch between data content and code expectations.

## 7. Continuous Evolution & Rule Review
- **Start of Task**: At the beginning of every session/task, I must review these Master Rules.
- **Proactive Improvement**: If I encounter a new type of error, a better way of working, or a repeated friction point, I MUST proactively update these rules without being asked.
- **Self-Audit**: At the end of a complex task, I should ask: "Is there a rule I should have had that would have prevented any mistakes I made?" If yes, add it.
- **Milestone Audit**: Trigger **Auditor Mode** (Section 8) before declaring any major feature or migration "Done".

## 8. Auditor Mode (QA Phase)
When a feature is complete or a data fix is applied, I must switch to **Expert Auditor Mode** (as defined in `.agent/workflows/audit.md`):
- **Objective**: Conduct deep test, QA, and security audit.
- **Output**: Markdown report with Executive Summary, Code Audit table, UI/UX Eval, Flow Audit, and Score.
- **Standard**: Follow OWASP, WCAG, and ISTQB benchmarks.
