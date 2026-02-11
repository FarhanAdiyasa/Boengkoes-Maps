# KI: YouTube Thumbnail Logistics & Data Integrity

## Summary
Documenting the "YouTube Gray Pixel" issue and the breakdown in thoroughness that occurred during the Boengkoes Maps data migration.

## The Problem
YouTube returns a **1x1 gray pixel** with a **200 OK** status for `maxresdefault.jpg` if the video is not high-definition. 
- **The Bug**: Frontend `onError` traps don't trigger because the image is "valid".
- **The Failure**: The agent fixed the code but didn't verify that the database already contained the broken `maxres` links, leading to persistent broken UI despite code changes.

## Solutions
1. **Source Fix**: Updated the database (Supabase) via a global repair script (`global_thumb_fix.js`) to use `hqdefault.jpg` on `i.ytimg.com`.
2. **Defensive Frontend**: Modified `RestaurantCard.tsx` to force-transform YouTube links to `hqdefault` regardless of what the DB says.

## Key Learnings
- Always verify the DB record before assuming a code-level fix is sufficient.
- Use `curl -I` for pre-flight asset checks.
- PostgreSQL array literals require explicit casting (`::text[]`).
- The scrapper's method of reading meta tags (og:image) is the most reliable way to find the "intended" thumbnail.
