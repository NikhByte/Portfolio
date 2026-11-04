# Jules portfolio review — 2026-10-30

Read all 46 insights across the two verified NikhByte/Portfolio workspaces. Status below describes local code, not Jules cloud state. No insight states were changed.

## Connection

Configured `jules_portfolio` in `/home/nikhil/.codex/config.toml`. The read-only bridge lives at `/home/nikhil/.local/share/jules-portfolio-mcp/server.py` and reuses CLI authentication. MCP initialization, tool listing, current-insight retrieval (4 results), and invalid-ID rejection passed. Restart the MCP server in Codex settings to load the new tools into the app.

## Changes

- `main.js`: Retina canvas backing resolution (DPR capped at 2); frame-coalesced resizing retaining particles; pause when hidden or reduced motion is requested; stable navigation selection; cancellable nav scrambling; frame-coalesced pointer effects disabled for coarse pointers/reduced motion; writing-like state; dialog trigger semantics; no reordering on like clicks.
- `style.css`: shared tokens replace component color literals without changing color values; controls have 44px minimum dimensions; collapsed writing content is hidden from keyboard navigation and expanded content has no fixed-height clipping.
- `index.html`: real section headings and consistent project heading levels.
- `tests/browser_check.py`: added checks for focus/order after liking, touch dimensions, writing panels/like state, high-DPI canvas resizing, and live reduced-motion preference.

## Insight triage

| Workspace | Insight | Local status |
|---|---|---|
| Current | Component styling bypasses CSS custom variables (`eca2faad-afe3-4315-81a7-9552948ee0d6`) | Fixed in this pass. |
| Current | Modal overlays lack focus trapping and focus restoration (`9a46f04e-c536-4317-8867-010631bd931a`) | Already addressed locally; retained. |
| Current | Particle canvas lacks High-DPI scaling and throttling (`594bed40-a15f-4997-9502-f7daf17e3ee7`) | Fixed in this pass. |
| Current | Mobile touch targets fall below accessibility standards (`404df0c1-3c1a-488a-a7ad-ae30cd8ddc6e`) | Fixed in this pass. |
| Older | Tech stack marquee animation lacks focus and reduced motion controls (`d00b81b8-3b7f-4ed7-be16-5cce3f5ea1f9`) | Partially addressed: reduced-motion stops the marquee; a manual pause control remains open. |
| Older | Case study overlays lack visual media and architecture diagram embeds (`638a0fc9-b187-4bbe-a0b1-57a0fba0a414`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Project card modal triggers lack ARIA popup and expanded state attributes (`5036da20-6fec-4e78-948b-23e1fe90b0c1`) | Fixed in this pass. |
| Older | Absence of role and domain filtering for work and academic timeline (`336f14de-108e-4a87-b656-995844eefd31`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Writing post like buttons lack accessible ARIA pressed state feedback (`2c086a06-916f-4d78-8a77-7e5f29cfb274`) | Fixed in this pass. |
| Older | Absence of interactive system telemetry and MLOps architecture explorer (`0aeaa173-a5a9-4119-9fb3-261b0212d883`) | Deferred: interactive telemetry conflicts with the requested removal of fake terminal UI. |
| Older | Case-study overlays lack one-touch code snippet copy utilities (`06a597a5-73ee-4b1f-8d6d-16768ad0abf1`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Absence of back-to-top navigation shortcut forces excessive reverse scrolling (`beee73f6-826b-4cac-b88d-dfe5f61ce997`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Absence of one-touch contact copy utility increases recruiter friction (`8ab09d2d-9131-4c77-b536-a4f2d23bd864`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Absence of focus indicators on header nav links impairs keyboard visibility (`88cf3b0d-7f97-4aad-88d8-f28b7e4e6254`) | Already addressed locally; retained. |
| Older | Absence of candidate availability status badge limits recruiter conversion (`85c41bb8-ec08-45e1-85f0-044853470e5d`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Inconsistent heading hierarchy skips levels and impairs screen reader landmarks (`85316abe-5860-436b-aae8-e542440f4ccb`) | Fixed in this pass. |
| Older | Unpaused background canvas loop wastes device resources on hidden tabs (`38364ba7-ba30-42e1-83b6-eb80ca42a8f5`) | Fixed in this pass. |
| Older | Nav scroll spy triggers rapid active state flickering during section scrolling (`fb75f807-ad14-4fb3-9413-db59adedce4f`) | Fixed in this pass. |
| Older | Social and external links lack accessible screen reader labels (`d82ebc7b-bfdc-4212-a6f1-0d35d31d695f`) | Already addressed locally; retained. |
| Older | Absence of theme toggle limits visual accessibility in bright environments (`c20b86ec-6fa9-4441-be28-ff9b4d943c8d`) | Deferred: retaining the requested dark theme. |
| Older | Incomplete reduced motion implementation leaves key animations active (`4e68d8ef-ab8b-4f9a-ba4a-b855c4fee803`) | Fixed in this pass. |
| Older | Absence of skip link forces repetitive navigation for keyboard users (`cde9bc32-8f6a-4631-9f8e-aeba39e25295`) | Already addressed locally; retained. |
| Older | Absence of interactive technology filtering restricts project exploration (`6ba33db3-421b-4dff-b7b9-823fe6c24f09`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Project card sorting displaces keyboard focus and causes layout thrashing (`33e2b9dc-f101-4fff-87f7-e956e93d6468`) | Fixed in this pass. |
| Older | Contact form novalidate bypasses syntax checks and triggers false server errors (`fc159422-6cd2-4c41-ba51-af1fb4ef8f3f`) | Already addressed locally; retained. |
| Older | Mobile navigation header compresses link targets below accessibility standards (`0e83b9ed-d44b-4a63-b151-02b358e47750`) | Fixed in this pass. |
| Older | Typewriter ARIA live region updates flood screen reader speech queues (`c07c55de-a277-4231-9a47-60eca271774a`) | Already addressed locally; retained. |
| Older | Navigation text scramble animation race condition corrupts link labels (`98b5f411-3923-47a6-b289-3c710b41aeae`) | Fixed in this pass. |
| Older | Absence of structured schema metadata impairs search and recruiter discovery (`0f2f8742-9367-4705-8f4d-bb2d7d5b36c5`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Orphaned duplicate project card markup corrupts HTML DOM structure (`ddab3f67-716d-4eb0-a945-f52d55c72932`) | Already addressed locally; retained. |
| Older | Modal-gated case studies obscure deep technical retrospectives (`9b382692-10fe-46cd-b909-48c189e84e9a`) | Deferred feature suggestion; outside this defect-fix pass. |
| Older | Competing scroll handlers cause navigation link active state flickering (`11b26501-5bdd-4fd0-8907-41bcf2070f7e`) | Already addressed locally; retained. |
| Older | Unthrottled card mousemove events cause layout thrashing and sticky touch tilt (`9939fcda-00ae-4781-8e86-672ba74d1551`) | Fixed in this pass. |
| Older | Hero section lacks downloadable resume CTA for recruiter user journeys (`905d05d1-81e2-40e8-bf2a-59d8f3594af8`) | Needs a real resume file from the owner. No resume or invented download added. |
| Older | Multiple concurrent scramble animation loops trigger on rapid navigation hover (`abc0031f-e00e-4b41-b0c4-b848ada1b428`) | Fixed in this pass. |
| Older | Background canvas graphics look blurry on Retina and High-DPI screens (`605041cf-5d72-40da-aed6-b1d4af95e9d0`) | Fixed in this pass. |
| Older | Duplicate CSS definition disables interactive card hover spotlight (`586ce582-7ee2-4dc2-89ef-f7091f22b5db`) | Already addressed locally; retained. |
| Older | Social links grid lacks mobile collapse causing text distortion (`0c22e7be-59ae-4fd8-92ef-a88b832d81c9`) | Already addressed locally; retained. |
| Older | Case-study modal outside click to close interaction is broken (`e17ab7d0-654e-48c8-80ef-fa9f22080645`) | Existing overlay-root click handler checked; fullscreen content has no separate backdrop. Close button and Escape work. |
| Older | Mobile scroll triggers canvas flickering and performance drops (`c9a2e26f-d1c2-4125-8ed9-25c210bf2338`) | Fixed in this pass. |
| Older | Collapsed writing accordion items trap invisible keyboard focus (`b4427068-5a16-4e6f-b501-7549b6260cf1`) | Fixed in this pass. |
| Older | Blog accordion clips content and like button on mobile and zoomed viewports (`9235f001-b92a-4193-9546-6907fd0ff677`) | Fixed in this pass. |
| Older | Case-study modal does not trap keyboard focus when open (`514dd3c6-ac70-44b7-9835-10c094869d48`) | Already addressed locally; retained. |
| Older | External links on project cards trigger modal overlays simultaneously (`32122070-5d69-4a3a-b0b6-c06bbbf2aad7`) | Already addressed locally; retained. |
| Older | Multi-tab likes synchronization causes visual state desync (`0adc2563-b959-49b9-be96-cc1a7eb376ba`) | Deferred: cross-tab likes synchronization is optional; local persistence works. |
| Older | Keyboard-only users cannot access the flagship CogniOS case study (`04dbe296-9185-4dba-bfcf-b910c854eaff`) | Already addressed locally; retained. |

## Validation

JavaScript syntax check and Playwright browser suite passed. The suite covers five viewport widths, modal keyboard handling, filters, persistent likes, native email validation, mocked form success/failure, writing panels, minimum target dimensions, Retina canvas sizing/resizing and reduced motion. Contact requests were intercepted; no messages were sent. No deployment was performed.
