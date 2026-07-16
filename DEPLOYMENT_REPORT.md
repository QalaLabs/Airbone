# DEPLOYMENT_REPORT.md

Category B — fixed in `main`, live site not updated. No `.vercel` link or `vercel.json` in repo (hosting config lives in Vercel dashboard only) — cannot redeploy or check env from here.

| Issue | Commit | Current Live Status | Expected After Redeploy | Files | Reason |
|---|---|---|---|---|---|
| Address helper text on Contact page | `81bf0b5` (feat: implement client UAT feedback fixes) | Shows old text: "Located just a short walk (approximately 50–100 metres) from Ramphal Chowk Metro Station." | Shows current `main` text: "Our Ground Academy and Simulator Centre are located approximately 50 metres from Ramphal Chowk." | [src/app/contact/page.jsx:144](src/app/contact/page.jsx:144) | `git log -p` confirms text was replaced in this commit; live site predates it |
| Route-map mobile overlap (first attempt) | `30d05ba` (Fix mobile alumni panel overlap...) | Still overlapping on live (per your screenshot) | Will still show old behavior even after redeploy — that commit's fix was insufficient (see next row) | [src/components/GlobalRouteMap.jsx](src/components/GlobalRouteMap.jsx) | Commit kept the `-2rem` negative margin + flex-row layout; didn't add mobile stacking |
| Route-map mobile overlap (actual fix) | uncommitted, this session (CODE_FIX_REPORT #2) | N/A — not committed yet | Will resolve the overlap once committed + deployed | [src/components/GlobalRouteMap.jsx:463-464,766](src/components/GlobalRouteMap.jsx:463) | Real root cause fix — column stack + drop negative margin on mobile |
| Student count `5000+` | uncommitted, this session | Live shows `5000+` (bug was actually in current `main` code too, not just stale deploy) | Will show `2,500+` | [src/components/GlobalRouteMap.jsx:98](src/components/GlobalRouteMap.jsx:98) | This one was a genuine code bug, not deploy staleness — confirmed present in latest `main` before my fix |
| Sitemap 404/redirect slugs, missing course routes | uncommitted, this session | Live sitemap likely serving broken/incomplete URLs (same code, same bug — this is Category A code bug not deploy issue, listed here only for cross-reference) | Corrected sitemap | [src/app/sitemap.js](src/app/sitemap.js) | See CODE_FIX_REPORT #4 |
| FAQ "50% PCM" / "disease-approved academy" wording | unconfirmed | Unknown — client reports it exists live | Repo has no trace of this text anywhere (checked `src` + `admin`) | n/a | Either (a) stale-deploy artifact from an even older commit than the address text, or (b) admin-backend/CMS-driven content not in this repo. **Need a live screenshot of this specific FAQ to tell which.** |

## Action required
1. Trigger a redeploy of `main` to production in Vercel (after the uncommitted fixes above are committed).
2. Confirm which Vercel deployment is currently promoted to the `airborneaviation.in` production alias — check if auto-deploy-on-push is enabled and whether a recent build failed silently (would explain why 3+ commits' worth of fixes never reached production).
3. Once redeployed, re-screenshot the address text, route-map section, and homepage stat cards to confirm parity with `main`.
