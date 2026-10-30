# Portfolio copy and styling changes

Scope: visible copy and CSS. Existing dark background, navigation destinations, source URLs, code comments, and behavior are retained.

## Copy

| File | Before | After |
|---|---|---|
| index.html | nikhil // B25CS1044 // IIT Jodhpur · Class of 2029 | Nikhil · CSE at IIT Jodhpur, '29 |
| index.html | [SYS-ARCH-01] | Removed |
| index.html | Systems that don’t fall over at 3 AM. | I build ML tools that read Linux workloads. |
| index.html | AI needs infrastructure. I build it. | I’m a CSE student at IIT Jodhpur. I work with Python and Linux, and I’m learning how to turn models into useful tools. |
| index.html | Simulated terminal: cognios-daemon.service, CPU/MEM gauges, PID 2841, [SYS], [INFER], [ANOMALY], IsolationForest score, blinking cursor | I’m building CogniOS, an ML pipeline that detects Linux workloads by reading /proc. |
| index.html | #Systems / #MLOps / #Infra / #Linux Kernel /proc | Removed |
| index.html | The best way to predict the future is to compile it. | Removed, including its visible quote container |
| index.html | SCROLL // TELEMETRY | Explore my projects |
| index.html | Roll Number / Student Roll: B25CS1044 | Removed both rows |
| index.html | // NAVIGATION_INDEX | Navigation |
| index.html | Nikhil // B25CS1044 // Indian Institute of Technology Jodhpur | Nikhil · CSE at IIT Jodhpur, '29 |
| index.html | 01 // About & Philosophy | About me |
| index.html | [OPERATIONAL_SPEC] | About me |
| index.html | 02 // Work & Hackathons | Work & hackathons |
| index.html | 24H DOUBLE SHIP | Two projects in 24 hours |
| index.html | 03 // Engineered Projects | Projects |
| index.html | FLAGSHIP PROJECT // DEVUP LABS SOC | CogniOS · DevLUP Labs Summer of Code |
| index.html | [01/06] | Removed |
| index.html | [02/06] | Removed |
| index.html | [03/06] | Removed |
| index.html | [04/06] | Removed |
| index.html | [05/06] | Removed |
| index.html | [06/06] | Removed |
| index.html | 04 // Technical Stack | Tools I use |
| index.html | 05 // Academic Record | Education |
| index.html | COURSEWORK TAKEN // SCHEDULED: | Completed and planned coursework: |
| index.html | [ACADEMIC_METRICS] | Academic record |
| index.html | 06 // Engineering Writing | Writing |
| index.html | SYSTEMS // ML | Systems & ML |
| index.html | MLOPS // DAEMONS | MLOps & background processes |
| index.html | HACKATHONS // SPEED | Hackathon notes |
| index.html | // DISPATCH MESSAGE | Message me |
| index.html | TECHNICAL SPECIFICATION DOSSIER | Project details |
| index.html | ESC / CLOSE | Close |
| index.html | SYSTEM ONLINE // LATENCY NORMAL | Thanks for stopping by. |
| index.html | Built with zero external frameworks. Pure precision. | Built with HTML, CSS, and JavaScript. |
| index.html | // 07 · TRANSMIT & CONNECT | Get in touch |
| main.js | “The best way to predict the future is to compile it.” | Removed |
| main.js | Executive Overview | The short version |
| main.js | Engineering Timeline & Milestones | Build notes |
| main.js | Project Resources | Links |
| main.js | Architecture & Stack | Tools and structure |
| main.js | Key Engineering Hurdles & Solutions | Problems I worked through |

## Styling — style.css

- Display-font hero and monospace prose → Geist sans-serif sentences; monospace retained for code and commands.
- Oversized headline → responsive 2–3.5rem headline with readable line length.
- Fake terminal panel → one plain CogniOS sentence in the existing second hero column; stacks below the text on mobile.
- Amber plus green/cyan decorative accents → amber accent; neutral text and surfaces retained.
- Glowing buttons, pills, and focus shadows → flat fills/borders and visible keyboard outlines.
- Existing particle canvas, ambient background, navigation, and GitHub/LinkedIn destinations → retained.

## Headline options

1. **Used:** I build ML tools that read Linux workloads.
   Subline: I’m a CSE student at IIT Jodhpur. I work with Python and Linux, and I’m learning how to turn models into useful tools.
2. I’m learning how to make ML useful on Linux.
   Subline: I’m a CSE student at IIT Jodhpur. My current project, CogniOS, reads process data from /proc to detect workloads.
3. I’m building CogniOS to understand what’s running on Linux.
   Subline: I study CSE at IIT Jodhpur and work with Python, Linux, and machine learning. This is where I share my projects.

## Validation

- No targeted visible separators, bracket labels, hashtag chips, fake telemetry, or roll number remain.
- Remaining double slashes belong to URLs or preserved code comments/examples.
- HTML URL attributes and comments match the pre-cleanup baseline. JavaScript URLs and line comments match.
- Browser suite covers five viewport widths, keyboard dialogs, filters, saved likes, contact validation and mocked success/failure.
