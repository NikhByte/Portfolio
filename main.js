(function() {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. SCROLL PROGRESS & NAV SCROLL EFFECT ───────────────────────
  var nav = document.getElementById('main-nav');
  var progressBar = document.getElementById('scroll-progress');

  function handleScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (nav) {
      if (scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    if (progressBar) {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (total > 0 ? (scrollY / total) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── 2. ACTIVE NAV SPY (IntersectionObserver) ────────────────────
  (function() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    var spyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(function(sec) { spyObserver.observe(sec); });
  })();

  // ── 3. SCROLL REVEALS ───────────────────────────────────────────
  (function() {
    var heroSection = document.getElementById('hero');
    var revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (!revealEls.length) return;

    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('visible');
        var children = el.querySelectorAll('.reveal-child');
        children.forEach(function(child, i) {
          setTimeout(function() { child.classList.add('visible'); }, i * 80);
        });
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function(el) {
      if (heroSection && heroSection.contains(el)) {
        el.classList.add('visible');
      } else {
        revealObserver.observe(el);
      }
    });
  })();

  // ── 4. HERO QUOTE TYPEWRITER ────────────────────────────────────
  (function() {
    var el = document.getElementById('hero-thought');
    if (!el) return;
    var text = '“The best way to predict the future is to compile it.”';
    if (prefersReduced) {
      el.textContent = text;
    } else {
      el.textContent = '';
      var idx = 0;
      function typeNext() {
        if (idx < text.length) {
          el.textContent += text.charAt(idx);
          idx++;
          setTimeout(typeNext, 25 + Math.random() * 40);
        }
      }
      setTimeout(typeNext, 800);
    }
  })();

  // ── 5. PARTICLE CANVAS & AMBIENT GLOW ───────────────────────────
  (function() {
    var glow = document.querySelector('.ambient-glow');
    window.addEventListener('mousemove', function(e) {
      if (glow && !prefersReduced) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      }
    }, { passive: true });

    if (prefersReduced) return;
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, nodes;
    var mouse = { x: -9999, y: -9999 };
    var CONNECT_DIST = 150;
    var REPEL_DIST = 85;
    var REPEL_FORCE = 0.35;
    var MAX_SPEED = 0.35;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createNode() {
      var angle = Math.random() * Math.PI * 2;
      var speed = (Math.random() * 0.5 + 0.5) * MAX_SPEED * 0.7;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      };
    }

    function initNodes() {
      var count = window.innerWidth < 768 ? Math.floor(35 + Math.random() * 10) : Math.floor(75 + Math.random() * 20);
      nodes = [];
      for (var i = 0; i < count; i++) nodes.push(createNode());
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var dx = n.x - mouse.x;
        var dy = n.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_DIST && dist > 0) {
          var force = ((REPEL_DIST - dist) / REPEL_DIST) * REPEL_FORCE;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
        n.vx *= 0.985;
        n.vy *= 0.985;
        var spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > MAX_SPEED) {
          n.vx = (n.vx / spd) * MAX_SPEED;
          n.vy = (n.vy / spd) * MAX_SPEED;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x += W;
        if (n.x > W) n.x -= W;
        if (n.y < 0) n.y += H;
        if (n.y > H) n.y -= H;
      }

      // Connecting lines
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var ddx = a.x - b.x, ddy = a.y - b.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECT_DIST) {
            var alpha = (1 - d / CONNECT_DIST) * 0.24;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(245,158,11,' + (alpha * 0.75) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.4)';
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', function() {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener('resize', function() {
      resize();
      initNodes();
    }, { passive: true });

    resize();
    initNodes();
    tick();
  })();

  // ── 6. DYNAMIC FOOTER YEAR ──────────────────────────────────────
  (function() {
    var el = document.getElementById('footer-year-line');
    if (el) {
      var yr = new Date().getFullYear();
      el.textContent = 'Nikhil · IIT Jodhpur · ' + yr;
    }
  })();

  // ── 7. WRITING POSTS ACCORDION + LIKES ───────────────────────────
  (function() {
    var STORAGE_KEY = 'nikhil_post_likes';
    var BASE = { 'post-1': 3, 'post-2': 5, 'post-3': 7 };

    function getLikes() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
      catch(e) { return {}; }
    }
    function saveLikes(data) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      catch(e) {}
    }
    function getDisplayCount(postId, liked) {
      var personal = getLikes();
      var base = BASE[postId] || 0;
      return base + (personal[postId] ? 1 : 0);
    }

    // Initialize like buttons in writing posts
    document.querySelectorAll('.writing-post .like-btn').forEach(function(btn) {
      var postId = btn.getAttribute('data-post');
      var personal = getLikes();
      var liked = !!personal[postId];
      var countEl = btn.querySelector('.like-count');
      var iconEl = btn.querySelector('.like-icon');

      if (countEl) countEl.textContent = getDisplayCount(postId, liked);
      if (liked && iconEl) {
        btn.classList.add('liked');
        iconEl.textContent = '♥';
      }

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var p = getLikes();
        p[postId] = !p[postId];
        saveLikes(p);

        var nowLiked = !!p[postId];
        if (countEl) countEl.textContent = getDisplayCount(postId, nowLiked);
        btn.classList.toggle('liked', nowLiked);
        if (iconEl) iconEl.textContent = nowLiked ? '♥' : '♡';

        btn.style.transform = 'scale(1.12)';
        setTimeout(function() { btn.style.transform = ''; }, 140);
      });
    });

    // Expand / collapse writing posts
    document.querySelectorAll('.writing-post-header').forEach(function(header) {
      function toggle() {
        var post = header.closest('.writing-post');
        if (!post) return;
        var isOpen = post.classList.contains('open');

        // Close all other posts
        document.querySelectorAll('.writing-post.open').forEach(function(p) {
          if (p !== post) {
            p.classList.remove('open');
            var h = p.querySelector('.writing-post-header');
            if (h) h.setAttribute('aria-expanded', 'false');
          }
        });

        post.classList.toggle('open', !isOpen);
        header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      }

      header.addEventListener('click', toggle);
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  })();

  // ── 8. PROJECT CASE STUDY OVERLAY DATA & LOGIC ───────────────────
  var PROJECTS = {
    'cognios': {
      name: 'CogniOS',
      sub: 'Adaptive OS Intelligence Layer · DevLUP Labs SoC · Active',
      overview: 'CogniOS is a Linux workload detection and scheduling-optimization layer that runs entirely in userspace — no kernel patches, no elevated privileges. The system collects fine-grained telemetry via psutil and /proc, feeds it through a trained XGBoost classifier to identify workload profiles (compute-bound, memory-bound, I/O-bound, idle), and uses an Isolation Forest model to flag resource anomalies in real time. An OS flight recorder keeps a rolling ring-buffer of system state with crash-dump capability. A separate offline scheduler simulator lets me compare classical scheduling heuristics against RL-based approaches using replayed telemetry.',
      timeline: [
        { date: 'Apr 2025', event: 'Joined DevLUP Labs SoC. Proposed CogniOS concept: workload-aware scheduling without kernel modification.', milestone: true },
        { date: 'May 2025', event: 'Built the telemetry collection layer. Wrote /proc parsers for CPU, memory, I/O, and context-switch metrics. Used psutil as the primary interface.' },
        { date: 'Jun 2025', event: 'Designed and ran the synthetic dataset generation pipeline. Generated ~50,000 labeled samples across four workload classes. Validated label quality with replay tests.' },
        { date: 'Jul 2025', event: 'Trained XGBoost classifier. MLflow experiment tracking set up. Achieved <2ms inference per sample on the target hardware profile.', milestone: true },
        { date: 'Aug 2025', event: 'Integrated Isolation Forest for real-time anomaly detection. Wired anomaly scores into the flight recorder alert system.' },
        { date: 'Ongoing', event: 'Building the offline scheduler simulator. Comparing CFS, EDF, and PPO-based RL scheduling policies on recorded telemetry traces.', milestone: true },
      ],
      stack: [
        { label: 'CORE', tags: ['Python', 'C', 'psutil', 'SQLite'] },
        { label: 'ML', tags: ['XGBoost', 'Isolation Forest', 'scikit-learn', 'MLflow'] },
        { label: 'OS', tags: ['Linux', '/proc', 'cgroups', 'Docker'] },
        { label: 'LLM', tags: ['Gemma LLM', 'Ollama'] },
      ],
      hurdles: [
        { title: 'Useful features without root', desc: 'Most useful scheduling signals (hardware counters, perf events) need elevated privileges. Had to design features entirely from unprivileged /proc and psutil data — which meant careful feature engineering to avoid noise.' },
        { title: 'Inference latency under 2ms', desc: 'For the classifier to not itself become a scheduling burden, inference had to stay under 2ms. Achieved this by trimming the feature set to 18 columns, using XGBoost native serialized model format, and pre-allocating numpy arrays.' },
        { title: 'Synthetic data generalization', desc: 'Real workload telemetry is hard to label. Synthetic generation needed enough realism to train a model that generalizes. Spent two weeks tuning the generators before the trained model stopped over-fitting to artificial patterns.' },
        { title: 'Flight recorder ring-buffer design', desc: 'Crash-dump capability required atomic writes and a format that stays readable even when the recorder itself crashes mid-write. Ended up with a two-file commit-log approach similar to SQLite WAL.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/CogniOS' },
        { label: '↗ Demo', href: 'https://github.com/NikhByte/CogniOS' }
      ],
    },

    'fate': {
      name: 'FATE',
      sub: 'Full Attention Telemetry Engine · Insomniac Hackathon · Runner-Up · 24 hrs',
      overview: 'FATE (Full Attention Telemetry Engine) is a mobile app that tracks focus using a Contextual Attention Score — a composite metric synthesized from spatial context (location, ambient noise), social context (communication patterns), and digital signals (app usage, screen-on time). Built end-to-end in 24 hours at the Insomniac Hackathon, it placed Runner-Up. The stack: Flutter + Android native sensor layer on the frontend, Python FastAPI backend for ML inference, and Gemini CLI for natural-language focus coaching.',
      timeline: [
        { date: 'Day 1 — 8:00 PM', event: 'Hackathon starts. Team formed on the spot. Scope locked in the first 20 minutes: real-time multi-signal focus tracking, phone-only, no wearables.', milestone: true },
        { date: 'Day 1 — 10:00 PM', event: 'Flutter app scaffolded. FastAPI server initialized. REST contract agreed between client and backend.' },
        { date: 'Day 1 — 11:30 PM', event: 'Contextual Attention Score (CAS) algorithm designed on paper. Weighted formula across spatial, social, and digital sub-scores.' },
        { date: 'Day 2 — 3:00 AM', event: 'Android native layer integrated via Flutter platform channels. GPS, accelerometer, and app-usage permission flows working.' },
        { date: 'Day 2 — 9:00 AM', event: 'Backend ML inference running. Gemini CLI integration for focus coaching nudges added. End-to-end flow demoed internally.', milestone: true },
        { date: 'Day 2 — 6:00 PM', event: 'Final polish, edge cases handled, demo video recorded. Submitted at the wire. Won Runner-Up.', milestone: true },
        { date: 'Day 2 — 8:00 PM', event: 'Hackathon closes. 24 hours, start to finish.', milestone: false },
      ],
      stack: [
        { label: 'MOBILE', tags: ['Flutter', 'Dart', 'Android'] },
        { label: 'NATIVE', tags: ['Java', 'Platform Channels', 'Android Sensors API'] },
        { label: 'BACK', tags: ['Python', 'FastAPI', 'uvicorn'] },
        { label: 'AI', tags: ['Gemini CLI'] },
      ],
      hurdles: [
        { title: 'Real-time sensor fusion', desc: 'Merging GPS, accelerometer, screen-on events, and communication logs into a single live score required careful async buffering. Flutter isolates helped but added coordination complexity.' },
        { title: 'Scoring formula under time pressure', desc: 'Defining a meaningful attention score in under 24 hours meant we could not train a model — we had to design the formula analytically. Got it right by anchoring weights to empirical distraction research.' },
        { title: 'Android permissions flow', desc: 'Android 12+ requires background location and usage-stats permissions to go through system settings, not runtime dialogs. Built a guided onboarding flow to handle this at 1am.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/FATE' },
        { label: '↗ Demo', href: 'https://github.com/NikhByte/FATE' }
      ],
    },

    'spark': {
      name: 'SPARK',
      sub: 'Self-hosted Personal Access Remote Kit · DevLUP Labs WoC · 2025',
      overview: 'SPARK is a personal self-hosted cloud built on a repurposed Ubuntu Server machine in my dorm room. It runs CasaOS as the orchestration layer over Docker microservices — Jellyfin for media streaming, Nextcloud for file storage, and Vaultwarden for passwords. The core constraint: college campus networks block all inbound traffic. Cloudflare Tunnel provided the escape hatch — a persistent outbound-only tunnel that makes internal services reachable from anywhere without exposing a public IP.',
      timeline: [
        { date: 'Jan 2025', event: 'Installed Ubuntu Server 24.04 on a spare laptop. Configured static local IP, SSH hardening, and unattended-upgrades.', milestone: true },
        { date: 'Feb 2025', event: 'Installed CasaOS. Deployed Jellyfin and Nextcloud as Docker containers. Set up Portainer for container management.' },
        { date: 'Mar 2025', event: 'Configured Cloudflare Tunnel (cloudflared) to bypass campus NAT. Each service gets a *.cfargotunnel.com subdomain.', milestone: true },
        { date: 'Apr 2025', event: 'Added Vaultwarden (self-hosted Bitwarden). Set up Prometheus + Grafana stack for server monitoring.' },
        { date: 'Ongoing', event: 'Adding more services. Experimenting with local AI inference (Ollama) alongside SPARK infrastructure.', milestone: true },
      ],
      stack: [
        { label: 'HOST', tags: ['Ubuntu Server', 'Linux', 'systemd'] },
        { label: 'ORCH', tags: ['Docker', 'CasaOS', 'Portainer'] },
        { label: 'NET', tags: ['Cloudflare Tunnel', 'Nginx', 'Tailscale'] },
        { label: 'OBS', tags: ['Prometheus', 'Grafana', 'Uptime Kuma'] },
      ],
      hurdles: [
        { title: 'Campus network blocks all inbound ports', desc: 'IIT Jodhpur campus network uses NAT with strict inbound blocking. Port forwarding is impossible. Cloudflare Tunnel (outbound-only persistent connection) was the only clean solution — no VPN or punch-through needed.' },
        { title: 'Dynamic local IP assignment', desc: 'The campus DHCP reassigns IPs every few hours. Solved by reserving the server MAC address in CasaOS network config and writing a systemd unit that checks and updates internal routing on each boot.' },
        { title: 'Power and heat management', desc: 'Running a 24/7 server in a dorm room on a laptop chassis is a thermal challenge. Configured aggressive CPU frequency scaling and added a kill-switch script that shuts down non-critical services when CPU temp exceeds 80°C.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/SPARK' },
        { label: '↗ Demo', href: 'https://github.com/NikhByte/SPARK' }
      ],
    },

    'debateos': {
      name: 'DebateOS',
      sub: 'Multi-agent AI Debate Engine · Cerebras Hackathon · 24 hrs',
      overview: 'DebateOS is a multi-agent AI system where two LLM agents argue opposing positions in a structured debate, with a third judge agent scoring each round on logic, evidence use, and rhetorical quality. Built in 24 hours at the Cerebras Hackathon. The agent graph is orchestrated with LangGraph, running Llama 3 70B via the Cerebras API for inference speeds fast enough for real-time argument generation. The judge agent produces rubric-based scores after each turn, and a final verdict at the end of the debate.',
      timeline: [
        { date: 'Hour 0–3', event: 'Architecture designed. Chose LangGraph for orchestration. Three agent roles locked: Proponent, Opponent, Judge.', milestone: true },
        { date: 'Hour 3–8', event: 'Cerebras API wired. Llama 3 70B selected for argument quality. Inference speed tested — ~800 tokens/sec, fast enough for real-time streaming.' },
        { date: 'Hour 8–14', event: 'Structured turn-taking logic built. Agents receive each other prior arguments as context. Debate format: 4 structured rounds.' },
        { date: 'Hour 14–20', event: 'Judge agent prompt-engineered to score on three rubric dimensions. Adversarial testing to prevent sycophantic verdicts.', milestone: true },
        { date: 'Hour 20–24', event: 'Web UI for live debate display. Edge cases handled (refusals, context overflow). Demo recorded. Submitted at Hour 24.', milestone: true },
      ],
      stack: [
        { label: 'AGENT', tags: ['LangGraph', 'LangChain'] },
        { label: 'LLM', tags: ['Llama 3 70B', 'Cerebras API'] },
        { label: 'BACK', tags: ['Node.js', 'Express'] },
        { label: 'UI', tags: ['HTML', 'CSS', 'Vanilla JS'] },
      ],
      hurdles: [
        { title: 'Agents agree with each other', desc: 'LLMs are RLHF-trained to be agreeable. Getting two agents to genuinely argue required system prompts that explicitly forbid concession, combined with few-shot examples of hard debate rhetoric.' },
        { title: 'Judge sycophancy', desc: 'The judge agent initially praised both sides equally regardless of argument quality. Solved with a multi-step scoring chain: first identify logical flaws, then score, never start with positives.' },
        { title: 'Context window management across rounds', desc: 'Four debate rounds of two agents plus a judge fills context fast. Implemented a selective compression scheme that keeps the last full round and summarizes prior rounds.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/DebateOS' },
        { label: '↗ Demo', href: 'https://github.com/NikhByte/DebateOS' }
      ],
    },

    'aerowse': {
      name: 'AeroWSE',
      sub: 'Warfighter Swarm Engine · Cerebras Hackathon · 24 hrs',
      overview: 'AeroWSE is a 3D drone swarm simulator built in the browser using Three.js and WebGL. Each drone agent follows a behavior tree (separation, cohesion, alignment — classic boids) overlaid with mission-specific objectives generated by Gemma 4 31B running on the Cerebras API. The result: a swarm that can be commanded in natural language ("intercept moving target at grid 7-7, maintain radar coverage") and translates that into emergent swarm behavior in real time. Built in 24 hours.',
      timeline: [
        { date: 'Hour 0–4', event: 'Three.js scene set up. Low-poly drone mesh designed. Camera rig with orbit controls. Baseline render working.', milestone: true },
        { date: 'Hour 4–10', event: 'Boids algorithm implemented (separation, cohesion, alignment). Weight tuning until swarm motion looked physically plausible.' },
        { date: 'Hour 10–16', event: 'Gemma 4 31B integrated via Cerebras API. Natural language mission commands parsed into swarm vector targets and behavior weights.', milestone: true },
        { date: 'Hour 16–21', event: 'WebGL InstancedMesh rendering — one draw call for 50+ drones. Frame rate went from ~12fps to stable 60fps. Radar sweep UI added.' },
        { date: 'Hour 21–24', event: 'Mission modes shipped: Patrol, Intercept, Scatter, Regroup. Demo video recorded. Submitted at Hour 24.', milestone: true },
      ],
      stack: [
        { label: '3D', tags: ['Three.js', 'WebGL', 'GLSL'] },
        { label: 'AI', tags: ['Gemma 4 31B', 'Cerebras API'] },
        { label: 'BACK', tags: ['Node.js', 'Express'] },
        { label: 'ALGO', tags: ['Boids', 'Behavior Trees', 'Vector Math'] },
      ],
      hurdles: [
        { title: 'Three.js performance with 50+ agents', desc: 'Naive Three.js mesh-per-drone tanks frame rate. Switched to InstancedMesh — one draw call for all 50+ drones. Frame rate went from ~12fps to stable 60fps.' },
        { title: 'Natural language to swarm vectors', desc: 'Gemma output is natural language; the swarm needs XYZ vectors and behavior weights. Built a structured output parser with a fallback grammar for ambiguous commands.' },
        { title: 'API latency visible in simulation', desc: 'Cerebras is fast but still has network latency. Commands felt laggy. Solved by streaming the swarm into its intermediate behavior state immediately on command, then applying Gemma refinement when it arrives.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/AeroWSE' },
        { label: '↗ Demo', href: 'https://github.com/NikhByte/AeroWSE' }
      ],
    },

    'credo': {
      name: 'Credo',
      sub: 'Task Management App · Bootup Hackathon · Team Elite Coders · Top 5',
      overview: 'Credo is a task management app with an AI-assisted UI generation layer. The core idea: let AI handle visual component scaffolding while human engineers wire logic, data, and state. Built at the Bootup Hackathon as Team Elite Coders, we reached the final round (Top 5). The backend runs on Node.js with SQLite for task persistence. The frontend mixes hand-coded structure with AI-generated UI components.',
      timeline: [
        { date: 'Day 1 — Morning', event: 'Team formed. Decided to experiment with hybrid AI-human UI development. Scoped to core task CRUD + reminders.', milestone: true },
        { date: 'Day 1 — Afternoon', event: 'Node.js backend scaffolded. SQLite schema designed. REST API for tasks, categories, and priorities.' },
        { date: 'Day 1 — Evening', event: 'AI-generated UI components integrated into hand-coded shell. Discovered visual consistency issues — spent evening normalizing styles.' },
        { date: 'Day 2 — Morning', event: 'Task filtering, due-date logic, and category management implemented. Core flows working end-to-end.', milestone: true },
        { date: 'Day 2 — Afternoon', event: 'Final polish. Reached finals as Team Elite Coders — Top 5.', milestone: true },
      ],
      stack: [
        { label: 'FRONT', tags: ['HTML', 'CSS', 'JavaScript'] },
        { label: 'BACK', tags: ['Node.js', 'Express', 'SQLite'] },
        { label: 'AI', tags: ['AI Component Synthesis', 'Prompt Engineering'] },
      ],
      hurdles: [
        { title: 'AI-generated UI consistency', desc: 'AI-generated components used different spacing, color variables, and interaction patterns. Normalizing them into a coherent design system took longer than building equivalent components by hand.' },
        { title: 'SQLite concurrency in Node.js', desc: 'Multiple concurrent requests caused SQLite lock errors. Solved by wrapping all writes in a queue with a single serialized DB connection using better-sqlite3 synchronous API.' },
        { title: 'Scope creep nearly killed the demo', desc: 'Added priority tiers, recurring tasks, and a calendar view on Day 1. Had to cut all three on Day 2 morning to ensure the core flow was stable and demoable. Lesson: demo path first.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/Credo' },
        { label: '↗ Demo', href: 'https://github.com/NikhByte/Credo' }
      ],
    },

    'localai': {
      name: 'Local AI Environment',
      sub: 'Self-hosted Inference Stack · Personal Project · Ongoing',
      overview: 'A personal local LLM inference stack running on an RTX 3050 laptop GPU (4GB VRAM). Ollama handles model management and inference; Open WebUI provides a clean browser-based chat interface. The goal: run useful language models locally with zero cloud dependency and zero per-query cost. VRAM constraints meant learning quantization in depth — running 7B models at Q4_K_M fits, 13B at Q3 is marginal, and 34B+ requires CPU offload.',
      timeline: [
        { date: 'Month 1', event: 'Ollama installed. First models pulled: Llama 3 8B, Mistral 7B. Verified GPU inference via nvidia-smi memory monitoring.', milestone: true },
        { date: 'Month 2', event: 'Open WebUI deployed as a Docker container. Model management UI working. Set up persistent model storage on an external SSD.' },
        { date: 'Month 3', event: 'Began quantization experimentation. Built a benchmark script that measures tokens/sec and VRAM usage across quant levels for each model.', milestone: true },
        { date: 'Month 4', event: 'Integrated with CogniOS telemetry — inference sessions are labeled as compute-bound workloads in classifier training data.' },
        { date: 'Ongoing', event: 'Testing new models (Gemma 3, Qwen 2.5, DeepSeek-R1). Experimenting with local RAG using ChromaDB.', milestone: true },
      ],
      stack: [
        { label: 'INFRA', tags: ['Ollama', 'Open WebUI', 'Docker'] },
        { label: 'GPU', tags: ['CUDA', 'RTX 3050', 'cuDNN'] },
        { label: 'QUANT', tags: ['GGUF', 'Q4_K_M', 'llama.cpp'] },
        { label: 'RAG', tags: ['ChromaDB', 'LangChain', 'Nomic Embed'] },
      ],
      hurdles: [
        { title: '4GB VRAM ceiling', desc: 'RTX 3050 Mobile has only 4GB VRAM. Any model above ~7B at Q4 needs CPU offload, which tanks inference speed. Built a config matrix of model × quant × speed to pick the right tradeoff per task.' },
        { title: 'Thermal throttling during long inference', desc: 'Long inference sessions cause laptop GPU to thermal-throttle at ~75°C, halving token output. Mitigated with aggressive fan curve config and context-length limits in Ollama.' },
        { title: 'VRAM fragmentation between sessions', desc: 'Ollama keeps models warm in VRAM. Loading a second model while one is resident causes OOM. Wrote a shell alias that sends an unload command before switching models.' },
      ],
      links: [
        { label: '↗ GitHub', href: 'https://github.com/NikhByte/LocalAI-Setup' },
        { label: '↗ Setup Guide', href: 'https://github.com/NikhByte/LocalAI-Setup' }
      ],
    },
  };

  var overlay = document.getElementById('proj-overlay');
  var overlayBody = document.getElementById('proj-overlay-body');
  var overlayTitle = document.getElementById('proj-overlay-title');
  var overlaySub = document.getElementById('proj-overlay-sub');
  var closeBtn = document.getElementById('proj-overlay-close');
  var lastFocus = null;

  function renderStack(groups) {
    return '<div class="proj-stack-groups">' + groups.map(function(g) {
      return '<div class="proj-stack-row">' +
        '<span class="proj-stack-label">' + g.label + '</span>' +
        '<div class="stack-tags">' + g.tags.map(function(t) {
          return '<span class="tag">' + t + '</span>';
        }).join('') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderTimeline(items) {
    return '<div class="proj-timeline">' + items.map(function(item) {
      return '<div class="proj-timeline-item' + (item.milestone ? ' milestone' : '') + '">' +
        '<p class="proj-tl-date">' + item.date + '</p>' +
        '<p class="proj-tl-event">' + item.event + '</p>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderHurdles(hurdles) {
    return '<div class="proj-hurdle-list">' + hurdles.map(function(h) {
      return '<div class="proj-hurdle">' +
        '<p class="proj-hurdle-title">' + h.title + '</p>' +
        '<p class="proj-hurdle-desc">' + h.desc + '</p>' +
      '</div>';
    }).join('') + '</div>';
  }

  function openOverlay(projectId) {
    var p = PROJECTS[projectId];
    if (!p || !overlay) return;

    lastFocus = document.activeElement;
    if (overlayTitle) overlayTitle.textContent = p.name;
    if (overlaySub) overlaySub.textContent = p.sub;

    if (overlayBody) {
      overlayBody.innerHTML =
        '<div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Overview</p>' +
            '<p class="proj-overview">' + p.overview + '</p>' +
          '</div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Timeline</p>' +
            renderTimeline(p.timeline) +
          '</div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Links</p>' +
            '<div class="proj-link-row">' + p.links.map(function(l) {
              return '<a href="' + l.href + '" class="proj-ext-link" target="_blank" rel="noopener noreferrer">' + l.label + '</a>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Stack</p>' +
            renderStack(p.stack) +
          '</div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Hurdles & How I Solved Them</p>' +
            renderHurdles(p.hurdles) +
          '</div>' +
        '</div>';
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeOverlay();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay();
    });
  }

  // Prevent project link clicks from opening the modal
  document.querySelectorAll('.project-link, .project-links a, .card-like-btn').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  // Featured project click
  var featured = document.querySelector('.featured-project');
  if (featured) {
    featured.addEventListener('click', function(e) {
      if (e.target.closest('.card-like-btn') || e.target.closest('.project-link') || e.target.closest('a')) return;
      openOverlay('cognios');
    });
    featured.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.card-like-btn') || e.target.closest('.project-link') || e.target.closest('a')) return;
        e.preventDefault();
        openOverlay('cognios');
      }
    });
  }

  // Project cards click
  document.querySelectorAll('.project-card').forEach(function(card) {
    var pid = card.getAttribute('data-pid');
    if (!pid) return;

    card.addEventListener('click', function(e) {
      if (e.target.closest('.card-like-btn') || e.target.closest('.project-link') || e.target.closest('a')) return;
      openOverlay(pid);
    });

    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.card-like-btn') || e.target.closest('.project-link') || e.target.closest('a')) return;
        e.preventDefault();
        openOverlay(pid);
      }
    });
  });

  // ── 9. PROJECT CARD LIKES & SORT BY POPULARITY ──────────────────
  (function() {
    var STORAGE_KEY = 'nikhil_card_likes';
    var BASE_LIKES = { cognios: 24, aerowse: 18, debateos: 15, fate: 12, localai: 10, spark: 8, credo: 6 };

    function getLikes() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
      catch(e) { return {}; }
    }
    function saveLikes(data) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      catch(e) {}
    }
    function getCount(pid) {
      return (BASE_LIKES[pid] || 0) + (getLikes()[pid] ? 1 : 0);
    }

    function sortGrid() {
      var grid = document.getElementById('project-grid');
      if (!grid) return;
      var cards = Array.from(grid.querySelectorAll('.project-card'));
      cards.sort(function(a, b) {
        var pidA = a.getAttribute('data-pid') || '';
        var pidB = b.getAttribute('data-pid') || '';
        return getCount(pidB) - getCount(pidA);
      });
      cards.forEach(function(c) { grid.appendChild(c); });
    }

    document.querySelectorAll('.card-like-btn').forEach(function(btn) {
      var pid = btn.getAttribute('data-pid');
      if (!pid) return;
      var countEl = btn.querySelector('.card-like-count');
      var iconEl  = btn.querySelector('.card-like-icon');
      var liked = !!getLikes()[pid];

      if (countEl) countEl.textContent = getCount(pid);
      if (liked) {
        btn.classList.add('liked');
        if (iconEl) iconEl.textContent = '♥';
      }

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var p = getLikes();
        p[pid] = !p[pid];
        saveLikes(p);

        var nowLiked = !!p[pid];
        if (countEl) countEl.textContent = getCount(pid);
        btn.classList.toggle('liked', nowLiked);
        if (iconEl) iconEl.textContent = nowLiked ? '♥' : '♡';

        btn.style.transform = 'scale(1.15)';
        setTimeout(function() { btn.style.transform = ''; }, 140);

        if (btn.closest('#project-grid')) {
          setTimeout(sortGrid, 350);
        }
      });
    });

    sortGrid();
  })();

  // ── 10. 3D TILT & SPOTLIGHT RADIAL GLOW ──────────────────────────
  (function() {
    // Spotlight cursor tracking
    var spotlightCards = document.querySelectorAll('.project-card, .featured-project');
    spotlightCards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
        var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
        card.style.setProperty('--mx', x);
        card.style.setProperty('--my', y);
      }, { passive: true });
    });

    if (prefersReduced) return;

    // 3D Perspective Tilt on project cards
    document.querySelectorAll('.project-card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = (e.clientX - cx) / (rect.width  / 2);
        var dy   = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = 'perspective(750px) rotateY(' + (dx * 4) + 'deg) rotateX(' + (-dy * 4) + 'deg) scale(1.012)';
      }, { passive: true });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });

    // 3D Tilt on featured project
    if (featured) {
      featured.addEventListener('mousemove', function(e) {
        var rect = featured.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = (e.clientX - cx) / (rect.width  / 2);
        var dy   = (e.clientY - cy) / (rect.height / 2);
        featured.style.transform = 'perspective(1200px) rotateY(' + (dx * 2) + 'deg) rotateX(' + (-dy * 2) + 'deg)';
      }, { passive: true });

      featured.addEventListener('mouseleave', function() {
        featured.style.transform = '';
      });
    }
  })();

  // ── 11. NAV TEXT SCRAMBLE EFFECT ────────────────────────────────
  (function() {
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#%&*';
    function scramble(el) {
      var original = el.dataset.origText || el.textContent;
      el.dataset.origText = original;
      var steps = original.length * 2;
      var frame = 0;
      var raf;

      function tick() {
        el.textContent = original.split('').map(function(ch, i) {
          if (ch === ' ') return ' ';
          if (i < frame / 2) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        frame++;
        if (frame <= steps) {
          raf = requestAnimationFrame(tick);
        } else {
          el.textContent = original;
        }
      }
      cancelAnimationFrame(raf);
      tick();
    }

    document.querySelectorAll('.nav-links a').forEach(function(a) {
      a.addEventListener('mouseenter', function() { scramble(a); });
    });
  })();

  // ── 12. RIPPLE CLICK ON BUTTONS ──────────────────────────────────
  (function() {
    function addRipple(el) {
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.addEventListener('click', function(e) {
        var rect = el.getBoundingClientRect();
        var r = document.createElement('span');
        var size = Math.max(rect.width, rect.height) * 2;
        r.style.cssText = [
          'position:absolute',
          'border-radius:50%',
          'transform:scale(0)',
          'background:rgba(245,158,11,0.28)',
          'animation:ripple-grow 500ms cubic-bezier(0.16,1,0.3,1)',
          'pointer-events:none',
          'width:' + size + 'px',
          'height:' + size + 'px',
          'left:' + (e.clientX - rect.left - size / 2) + 'px',
          'top:'  + (e.clientY - rect.top  - size / 2) + 'px',
        ].join(';');
        el.appendChild(r);
        setTimeout(function() { r.remove(); }, 520);
      });
    }

    var style = document.createElement('style');
    style.textContent = '@keyframes ripple-grow{to{transform:scale(2);opacity:0;}}';
    document.head.appendChild(style);

    document.querySelectorAll('.hero-cta, .opportunity-btn, .form-submit').forEach(addRipple);
  })();

  // ── 13. CONTACT FORM (Formspree AJAX) ────────────────────────────
  (function() {
    var form    = document.getElementById('contact-form');
    var btn     = document.getElementById('cf-submit');
    var btnLbl  = document.getElementById('cf-btn-label');
    var status  = document.getElementById('cf-status');
    if (!form) return;

    var ENDPOINT = 'https://formspree.io/f/xeajzddb';

    function setState(state) {
      if (btn) btn.disabled = (state === 'loading');
      if (status) status.className = 'form-status ' + state;
      if (state === 'loading') {
        if (btnLbl) btnLbl.textContent = 'Sending...';
        if (status) status.textContent = '';
      } else if (state === 'success') {
        if (btnLbl) btnLbl.textContent = 'Send Message';
        if (status) status.textContent = '// message_sent → stand by for response';
        form.reset();
      } else if (state === 'error') {
        if (btnLbl) btnLbl.textContent = 'Send Message';
        if (status) status.textContent = '// delivery_failed → try nikhil010407@gmail.com';
      } else {
        if (btnLbl) btnLbl.textContent = 'Send Message';
        if (status) status.textContent = '';
      }
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var nameInput = form.querySelector('#cf-name');
      var emailInput = form.querySelector('#cf-email');
      var msgInput = form.querySelector('#cf-message');

      var name  = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var msg   = msgInput ? msgInput.value.trim() : '';

      if (!name || !email || !msg) {
        if (status) {
          status.className = 'form-status error';
          status.textContent = '// validation_failed → please fill all fields';
        }
        if (!name && nameInput) nameInput.focus();
        else if (!email && emailInput) emailInput.focus();
        else if (!msg && msgInput) msgInput.focus();
        return;
      }

      setState('loading');

      fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, email: email, message: msg })
      })
      .then(function(res) {
        if (res.ok) {
          setState('success');
        } else {
          setState('error');
        }
      })
      .catch(function() {
        setState('error');
      });
    });
  })();

})();
