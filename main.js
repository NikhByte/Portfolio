(function() {
  'use strict';

  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = motionPreference.matches;
  motionPreference.addEventListener('change', function(e) { prefersReduced = e.matches; });

  // ── 1. SCROLL PROGRESS & FLOATING NAV SCROLL EFFECT ──────────────
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

    var spyFrame;
    function updateSpy() {
      spyFrame = null;
      var activeId = '';
      sections.forEach(function(section) {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.3) activeId = section.id;
      });
      navLinks.forEach(function(link) {
        var active = link.getAttribute('href') === '#' + activeId;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function scheduleSpy() {
      if (!spyFrame) spyFrame = requestAnimationFrame(updateSpy);
    }
    window.addEventListener('scroll', scheduleSpy, { passive: true });
    window.addEventListener('resize', scheduleSpy, { passive: true });
    updateSpy();
  })();

  function setDialogBackground(dialog, locked) {
    Array.from(document.body.children).forEach(function(el) {
      if (el === dialog || el.tagName === 'SCRIPT') return;
      if (locked) {
        if (!el.inert) { el.inert = true; el.dataset.dialogInert = 'true'; }
      } else if (el.dataset.dialogInert) {
        el.inert = false;
        delete el.dataset.dialogInert;
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var dialog = document.querySelector('[role="dialog"].open');
    if (!dialog) return;
    var items = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex="0"]'))
      .filter(function(el) { return el.getClientRects().length > 0; });
    var first = items[0], last = items[items.length - 1];
    if (!first) return;
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });

  // ── 3. MOBILE FULLSCREEN MENU ───────────────────────────────────
  (function() {
    var toggleBtn = document.getElementById('nav-toggle');
    var mobileMenu = document.getElementById('mobile-menu');
    var closeBtn = document.getElementById('mobile-menu-close');
    var mobileLinks = document.querySelectorAll('.mobile-nav-link');
    if (!toggleBtn || !mobileMenu) return;

    function openMobileMenu() {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      setDialogBackground(mobileMenu, true);
      if (closeBtn) closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      setDialogBackground(mobileMenu, false);
      toggleBtn.focus();
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', function() {
      if (mobileMenu.classList.contains('open')) closeMobileMenu();
      else openMobileMenu();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMobileMenu();
        var target = document.querySelector(link.getAttribute('href'));
        if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  })();

  // ── 4. SCROLL REVEALS ───────────────────────────────────────────
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
          setTimeout(function() { child.classList.add('visible'); }, i * 75);
        });
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.1 });

    revealEls.forEach(function(el) {
      if (heroSection && heroSection.contains(el)) {
        el.classList.add('visible');
      } else {
        revealObserver.observe(el);
      }
    });
  })();

  // ── 5. HERO QUOTE TYPEWRITER ────────────────────────────────────
  (function() {
    var el = document.getElementById('hero-thought');
    if (!el) return;
    var text = '';
    if (prefersReduced) {
      el.textContent = text;
    } else {
      el.textContent = '';
      var idx = 0;
      function typeNext() {
        if (idx < text.length) {
          el.textContent += text.charAt(idx);
          idx++;
          setTimeout(typeNext, 25 + Math.random() * 35);
        }
      }
      setTimeout(typeNext, 700);
    }
  })();

  // ── 6. PARTICLE CANVAS & CURSOR AMBIENT GLOW ────────────────────
  (function() {
    var glow = document.querySelector('.ambient-glow');
    window.addEventListener('mousemove', function(e) {
      if (glow && !prefersReduced) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      }
    }, { passive: true });

    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, nodes, animationFrame, resizeFrame;
    var mouse = { x: -9999, y: -9999 };
    var CONNECT_DIST = 145;
    var REPEL_DIST = 90;
    var REPEL_FORCE = 0.35;
    var MAX_SPEED = 0.32;

    function resize() {
      var oldW = W, oldH = H;
      W = window.innerWidth;
      H = window.innerHeight;
      var scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * scale);
      canvas.height = Math.round(H * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      if (nodes && oldW && oldH) nodes.forEach(function(n) {
        n.x *= W / oldW;
        n.y *= H / oldH;
      });
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
      var count = window.innerWidth < 768 ? Math.floor(30 + Math.random() * 8) : Math.floor(70 + Math.random() * 15);
      nodes = [];
      for (var i = 0; i < count; i++) nodes.push(createNode());
    }

    function tick() {
      if (document.hidden || prefersReduced) { animationFrame = null; return; }
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

      // Connecting fine vector lines
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var ddx = a.x - b.x, ddy = a.y - b.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < CONNECT_DIST) {
            var alpha = (1 - d / CONNECT_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(245,158,11,' + (alpha * 0.7) + ')';
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }

      // Draw particle points
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.42)';
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(tick);
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
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(function() { resizeFrame = null; resize(); });
    }, { passive: true });

    resize();
    initNodes();
    function updateAnimation() {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
      if (!document.hidden && !prefersReduced) animationFrame = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', updateAnimation);
    motionPreference.addEventListener('change', updateAnimation);
    updateAnimation();
  })();

  // ── 7. DYNAMIC FOOTER YEAR ──────────────────────────────────────
  (function() {
    var el = document.getElementById('footer-year-line');
    if (el) {
      var yr = new Date().getFullYear();
      el.textContent = 'Nikhil · IIT Jodhpur · ' + yr;
    }
  })();

  // ── 8. WRITING POSTS ACCORDION + LIKES ───────────────────────────
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

    document.querySelectorAll('.writing-post .like-btn').forEach(function(btn) {
      var postId = btn.getAttribute('data-post');
      var personal = getLikes();
      var liked = !!personal[postId];
      btn.setAttribute('aria-pressed', String(liked));
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
        btn.setAttribute('aria-pressed', String(nowLiked));
        if (countEl) countEl.textContent = getDisplayCount(postId, nowLiked);
        btn.classList.toggle('liked', nowLiked);
        if (iconEl) iconEl.textContent = nowLiked ? '♥' : '♡';

        btn.style.transform = 'scale(1.15)';
        setTimeout(function() { btn.style.transform = ''; }, 140);
      });
    });

    // Expand / collapse writing posts
    document.querySelectorAll('.writing-post-header').forEach(function(header) {
      function toggle() {
        var post = header.closest('.writing-post');
        if (!post) return;
        var isOpen = post.classList.contains('open');

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

  // ── 9. PROJECT CASE STUDY TECHNICAL DOSSIERS ────────────────────
  var PROJECTS = {
    'cognios': {
      name: 'CogniOS',
      sub: 'Adaptive OS Intelligence Layer · DevLUP Labs SoC · Active',
      overview: 'CogniOS is a Linux workload detection and scheduling-optimization layer that runs entirely in userspace — no kernel patches, no elevated root privileges. The system collects fine-grained telemetry via psutil and /proc, feeds an 18-dimensional feature vector into a trained XGBoost classifier to identify workload profiles (compute-bound, memory-bound, I/O-bound, idle), and utilizes an Isolation Forest model to flag resource thrashing in real time. An OS flight recorder maintains a rolling ring-buffer of system state with crash-dump capability. An offline scheduler simulator benchmarks classical scheduling against RL-based approaches using replayed telemetry traces.',
      timeline: [
        { date: 'Apr 2025', event: 'Joined DevLUP Labs SoC. Proposed CogniOS architecture: userspace workload-aware scheduling without kernel modification.', milestone: true },
        { date: 'May 2025', event: 'Engineered telemetry collection layer. Wrote /proc parsers for CPU, memory, I/O, and context-switch metrics via psutil.' },
        { date: 'Jun 2025', event: 'Constructed synthetic dataset generation pipeline. Generated ~50,000 labeled samples across four workload classes.' },
        { date: 'Jul 2025', event: 'Trained XGBoost classifier with MLflow experiment tracking. Achieved <2ms inference latency on target hardware.', milestone: true },
        { date: 'Aug 2025', event: 'Integrated Isolation Forest for anomaly detection. Wired real-time anomaly alerts directly into flight recorder.' },
        { date: 'Ongoing', event: 'Building offline scheduler simulator to evaluate CFS vs EDF vs PPO reinforcement learning policies on recorded traces.', milestone: true },
      ],
      stack: [
        { label: 'CORE', tags: ['Python', 'C', 'psutil', 'SQLite WAL'] },
        { label: 'ML', tags: ['XGBoost', 'Isolation Forest', 'scikit-learn', 'MLflow'] },
        { label: 'OS', tags: ['Linux', '/proc Telemetry', 'cgroups', 'Docker'] },
        { label: 'LLM', tags: ['Gemma LLM', 'Ollama'] },
      ],
      hurdles: [
        { title: 'Feature engineering without root privileges', desc: 'Standard hardware counters and perf events require root. Engineered 18 normalized signals entirely from unprivileged /proc and psutil telemetry, applying rolling differential smoothing to eliminate noise.' },
        { title: 'Strict sub-2ms inference ceiling', desc: 'To prevent the scheduling daemon from creating overhead, inference must stay under 2ms. Achieved 1.4ms by trimming features, pre-allocating numpy arrays, and compiling XGBoost with native serialization.' },
        { title: 'Telemetry drift in synthetic generation', desc: 'Synthetically generated workload traces initially over-fit to uniform distributions. Tuned generators with randomized stochastic burstiness to match real production Linux server behavior.' },
        { title: 'Crash-dump WAL ring-buffer', desc: 'Built a two-file write-ahead-log commit mechanism ensuring system state remains fully readable even if the flight recorder itself is terminated.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/CogniOS' },
      ],
    },

    'fate': {
      name: 'FATE',
      sub: 'Full Attention Telemetry Engine · Insomniac Hackathon · Runner-Up · 24 hrs',
      overview: 'FATE (Full Attention Telemetry Engine) is an autonomous mobile attention telemetry system that measures cognitive focus via a Contextual Attention Score (CAS). CAS synthesizes spatial context (GPS, ambient sound), social context (communication frequency), and digital telemetry (app usage, screen-on duration). Built end-to-end in 24 hours at the Insomniac Hackathon, winning Runner-Up. Architecture combines Flutter and Android native sensors on the client with a Python FastAPI inference backend and Gemini CLI coaching.',
      timeline: [
        { date: 'Day 1 — 8:00 PM', event: 'Hackathon starts. Team formed. Locked scope in 20 minutes: phone-only multi-signal focus tracking with zero wearables.', milestone: true },
        { date: 'Day 1 — 10:00 PM', event: 'Flutter mobile client scaffolded. FastAPI backend initialized. Agreed on strict typed REST schema.' },
        { date: 'Day 1 — 11:30 PM', event: 'Engineered Contextual Attention Score (CAS) algorithm. Formulated weighted multi-tier signal fusion.' },
        { date: 'Day 2 — 3:00 AM', event: 'Android native layer wired via Flutter platform channels. Real-time background GPS, motion, and usage stats operational.' },
        { date: 'Day 2 — 9:00 AM', event: 'Backend inference pipeline active. Integrated Gemini CLI for contextual coaching nudges.', milestone: true },
        { date: 'Day 2 — 6:00 PM', event: 'Final validation, edge-case hardening, demo recorded. Submitted before deadline. Awarded Runner-Up.', milestone: true },
        { date: 'Day 2 — 8:00 PM', event: 'Hackathon concludes. 24 hours from zero to working telemetry product.', milestone: false },
      ],
      stack: [
        { label: 'MOBILE', tags: ['Flutter', 'Dart', 'Android'] },
        { label: 'NATIVE', tags: ['Java', 'Platform Channels', 'Android Sensors API'] },
        { label: 'BACK', tags: ['Python', 'FastAPI', 'uvicorn'] },
        { label: 'AI', tags: ['Gemini CLI'] },
      ],
      hurdles: [
        { title: 'Asynchronous multi-sensor stream fusion', desc: 'Merging high-frequency accelerometer streams with low-frequency GPS and app-usage timestamps caused lock contention. Solved using Flutter background isolates and time-windowed aggregation buckets.' },
        { title: 'Algorithmic attention scoring without training data', desc: 'Under 24-hour time constraints, ML training was replaced by an analytical multi-tier heuristic calibrated against distraction research.' },
        { title: 'Android 12+ background permission restrictions', desc: 'Engineered a seamless onboarding permission guide directing users through system settings for background telemetry.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/FATE' },
      ],
    },

    'spark': {
      name: 'SPARK',
      sub: 'Self-hosted Personal Access Remote Kit · DevLUP Labs WoC · 2025',
      overview: 'SPARK is a self-hosted cloud infrastructure stack deployed on a repurposed Ubuntu Server machine. It utilizes CasaOS as an orchestration interface over Docker microservices — Jellyfin for media streaming, Nextcloud for distributed file storage, and Vaultwarden for password security. Built under strict campus network constraints where all inbound ports are blocked by NAT; bypassed using outbound-only persistent Cloudflare Tunnels.',
      timeline: [
        { date: 'Jan 2025', event: 'Configured Ubuntu Server 24.04 on bare metal. Configured static subnet IP, SSH keys, and firewall hardening.', milestone: true },
        { date: 'Feb 2025', event: 'Deployed CasaOS. Provisioned Docker containers for Nextcloud and Jellyfin with persistent volume mappings.' },
        { date: 'Mar 2025', event: 'Configured Cloudflare Tunnel (cloudflared) daemon to punch through strict campus NAT without port forwarding.', milestone: true },
        { date: 'Apr 2025', event: 'Added Vaultwarden vault and configured Prometheus + Grafana telemetry for 24/7 node health monitoring.' },
        { date: 'Ongoing', event: 'Integrating local Ollama inference container into the homelab private cluster.', milestone: true },
      ],
      stack: [
        { label: 'HOST', tags: ['Ubuntu Server', 'Linux', 'systemd'] },
        { label: 'ORCH', tags: ['Docker', 'CasaOS', 'Portainer'] },
        { label: 'NET', tags: ['Cloudflare Tunnel', 'Nginx', 'Tailscale'] },
        { label: 'OBS', tags: ['Prometheus', 'Grafana'] },
      ],
      hurdles: [
        { title: 'Inbound port blocking on college network', desc: 'Campus NAT forbids port forwarding. Cloudflare Tunnel (outbound HTTP/2 tunnel to Cloudflare edge) provided authenticated ingress with zero exposed ports.' },
        { title: 'Dynamic campus IP reallocation', desc: 'Campus DHCP leases periodically reassign local addresses. Automated a systemd boot script that discovers active subnet routing and updates Docker bridge networks.' },
        { title: '24/7 thermal safety on laptop chassis', desc: 'Configured aggressive CPU frequency governors and an automated daemon that monitors thermal sensors and throttles non-essential containers above 80°C.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/SPARK' },
      ],
    },

    'debateos': {
      name: 'DebateOS',
      sub: 'Multi-agent AI Debate Engine · Cerebras Hackathon · 24 hrs',
      overview: 'DebateOS is an autonomous multi-agent reasoning system where two LLM agents engage in structured dialectical debate, evaluated turn-by-turn by an automated judge agent. Orchestrated with LangGraph running Llama 3 70B on the Cerebras high-speed inference engine (~800 tokens/sec). The judge agent grades arguments on logical coherence, fallacy detection, and evidence utilization, producing an automated rubric score and final verdict.',
      timeline: [
        { date: 'Hour 0–3', event: 'Designed agent graph architecture. Locked three distinct agent roles: Proponent, Opponent, Judge.', milestone: true },
        { date: 'Hour 3–8', event: 'Integrated Cerebras API with Llama 3 70B. Benchmarked streaming latency to ensure sub-second response times.' },
        { date: 'Hour 8–14', event: 'Constructed stateful turn-taking logic with LangGraph, feeding prior context into opposing agents.' },
        { date: 'Hour 14–20', event: 'Engineered judge scoring rubric with adversarial prompt constraints to prevent sycophancy.', milestone: true },
        { date: 'Hour 20–24', event: 'Built live web interface. Tested edge cases and context compaction. Submitted at Hour 24.', milestone: true },
      ],
      stack: [
        { label: 'AGENT', tags: ['LangGraph', 'LangChain'] },
        { label: 'LLM', tags: ['Llama 3 70B', 'Cerebras API'] },
        { label: 'BACK', tags: ['Node.js', 'Express'] },
        { label: 'UI', tags: ['HTML5', 'CSS3', 'Vanilla JS'] },
      ],
      hurdles: [
        { title: 'LLM sycophancy and agreeable convergence', desc: 'Default models tend to agree with opponents. Solved by injecting strict adversarial constraints into system prompts, explicitly penalizing concessions.' },
        { title: 'Judge impartiality', desc: 'The judge agent initially awarded equal scores. Implemented a dual-pass evaluation chain: first analyze logical fallacies, then compute weighted rubric scores.' },
        { title: 'Context window growth across multiple debate rounds', desc: 'Implemented sliding-window summarization that preserves opening premises and recent rebuttals while compressing middle turns.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/DebateOS' },
      ],
    },

    'aerowse': {
      name: 'AeroWSE',
      sub: 'Warfighter Swarm Engine · Cerebras Hackathon · 24 hrs',
      overview: 'AeroWSE (Autonomous Embedded Radar Ops — Warfighter Swarm Engine) is a 3D drone swarm tactical simulator rendered in Three.js/WebGL. 50+ autonomous drone entities follow flocking boids algorithms (separation, alignment, cohesion) overlaid with mission vector targets synthesized from natural language commands via Gemma 4 31B on the Cerebras API. Supports real-time mission execution: Patrol, Intercept, Scatter, and Regroup.',
      timeline: [
        { date: 'Hour 0–4', event: 'Three.js scene graph initialized. Designed low-poly drone geometry and camera control rig.', milestone: true },
        { date: 'Hour 4–10', event: 'Engineered Boids vector physics algorithm. Calibrated flocking weights for realistic swarm kinematics.' },
        { date: 'Hour 10–16', event: 'Integrated Gemma 4 31B via Cerebras API to parse natural language mission directives into vector targets.', milestone: true },
        { date: 'Hour 16–21', event: 'Refactored rendering to WebGL InstancedMesh, achieving single-draw-call performance at a rock-solid 60fps.' },
        { date: 'Hour 21–24', event: 'Implemented mission modes: Patrol, Intercept, Scatter, Regroup. Final demo recorded. Shipped at Hour 24.', milestone: true },
      ],
      stack: [
        { label: '3D', tags: ['Three.js', 'WebGL', 'GLSL'] },
        { label: 'AI', tags: ['Gemma 4 31B', 'Cerebras API'] },
        { label: 'BACK', tags: ['Node.js', 'Express'] },
        { label: 'ALGO', tags: ['Boids Simulation', 'Vector Math'] },
      ],
      hurdles: [
        { title: 'Three.js draw-call bottleneck with 50+ meshes', desc: 'Individual mesh instances caused frame rate drops to ~12fps. Migrated to WebGL InstancedMesh with dynamic matrix buffers, maintaining a stable 60fps with one draw call.' },
        { title: 'Natural language to 3D mission vectors', desc: 'Gemma outputs freeform text, while the physics loop requires 3D coordinates and force weights. Implemented a strict JSON-grammar parser with automatic vector fallback.' },
        { title: 'API latency compensation in active simulation', desc: 'When receiving a command, the swarm immediately transitions into an intermediate alert state while the LLM parses vectors, ensuring zero perceived UI lag.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/AeroWSE' },
      ],
    },

    'credo': {
      name: 'Credo',
      sub: 'Task Management Engine · Bootup Hackathon · Top 5 Finalist',
      overview: 'Credo is a task orchestration application with an AI-assisted UI synthesis layer. Engineered at the Bootup Hackathon as Team Elite Coders, advancing to the Top 5 finals. Features a Node.js backend with SQLite persistence, concurrency locking, and a clean, accessible frontend interface with complete keyboard-driven navigation.',
      timeline: [
        { date: 'Day 1 — Morning', event: 'Formed Team Elite Coders. Scoped core requirements: high-speed task management and structured persistence.', milestone: true },
        { date: 'Day 1 — Afternoon', event: 'Scaffolded Node.js backend and relational SQLite schema with normalized task categories.' },
        { date: 'Day 1 — Evening', event: 'Integrated AI-generated UI scaffolding into hand-crafted structure; normalized CSS design tokens.' },
        { date: 'Day 2 — Morning', event: 'Implemented keyboard navigation, category filtering, and atomic SQLite transaction queues.', milestone: true },
        { date: 'Day 2 — Afternoon', event: 'Final polish and demo presentation. Selected as Top 5 finalist in the hackathon.', milestone: true },
      ],
      stack: [
        { label: 'FRONT', tags: ['HTML5', 'CSS3', 'JavaScript'] },
        { label: 'BACK', tags: ['Node.js', 'Express', 'SQLite'] },
        { label: 'AI', tags: ['UI Component Synthesis', 'Prompt Engineering'] },
      ],
      hurdles: [
        { title: 'Normalizing disparate AI-generated UI fragments', desc: 'AI-synthesized components varied widely in spacing and styling. Standardized all elements into a unified CSS variable design system.' },
        { title: 'SQLite concurrency locks under rapid requests', desc: 'Multiple asynchronous HTTP writes created SQLite database lock exceptions. Built a synchronized write queue serialized through better-sqlite3 transactions.' },
        { title: 'Scope management under hackathon pressure', desc: 'Cut secondary calendar features on morning of Day 2 to guarantee the core flow was 100% stable for the judges.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/Credo' },
      ],
    },

    'localai': {
      name: 'Local AI Environment',
      sub: 'Personal Inference Hardware Stack · Active Project',
      overview: 'A personal offline LLM inference stack engineered on an RTX 3050 mobile GPU (4GB VRAM). Ollama powers model serving and quantization; Open WebUI provides a clean interface. Enables running quantized 7B and 8B parameter models locally with zero cloud dependence, zero per-query latency, and verified thermal constraints.',
      timeline: [
        { date: 'Month 1', event: 'Installed Ollama. Pulled Llama 3 8B and Mistral 7B. Monitored VRAM allocation via nvidia-smi.', milestone: true },
        { date: 'Month 2', event: 'Deployed Open WebUI Docker container. Set up persistent SSD storage for model weights.' },
        { date: 'Month 3', event: 'Constructed quantization benchmarking matrix across Q4_K_M, Q5, and Q8 levels for tokens/sec vs memory.', milestone: true },
        { date: 'Month 4', event: 'Integrated inference sessions into CogniOS telemetry as labeled compute-bound training data.' },
        { date: 'Ongoing', event: 'Benchmarking lightweight reasoning models (Qwen 2.5, DeepSeek) and experimenting with local RAG.', milestone: true },
      ],
      stack: [
        { label: 'INFRA', tags: ['Ollama', 'Open WebUI', 'Docker'] },
        { label: 'GPU', tags: ['CUDA', 'RTX 3050 (4GB)', 'cuDNN'] },
        { label: 'QUANT', tags: ['GGUF', 'Q4_K_M', 'llama.cpp'] },
      ],
      hurdles: [
        { title: '4GB VRAM ceiling', desc: 'Any model exceeding ~7B at Q4 offloads to CPU, dropping throughput from 35 tok/sec to 4 tok/sec. Calibrated a model-quantization matrix to keep active context entirely in VRAM.' },
        { title: 'Thermal management during sustained inference', desc: 'Prolonged batch inference caused laptop GPU throttling at 75°C. Configured aggressive fan curves and context limits in Ollama.' },
        { title: 'VRAM fragmentation between model switches', desc: 'Automated an unload command alias in bash to release resident weights before initializing new model tensors.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/LocalAI-Setup' },
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
        '<div class="tag-list">' + g.tags.map(function(t) {
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

  var dialogTriggers = document.querySelectorAll('.case-study-trigger, .featured-project, .project-card');
  dialogTriggers.forEach(function(trigger) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'proj-overlay');
    trigger.setAttribute('aria-expanded', 'false');
  });

  function openOverlay(projectId) {
    var p = PROJECTS[projectId];
    if (!p || !overlay) return;

    lastFocus = document.activeElement;
    dialogTriggers.forEach(function(trigger) {
      trigger.setAttribute('aria-expanded', String(trigger === lastFocus || trigger.contains(lastFocus)));
    });
    if (overlayTitle) overlayTitle.textContent = p.name;
    if (overlaySub) overlaySub.textContent = p.sub;

    if (overlayBody) {
      overlayBody.innerHTML =
        '<div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">The short version</p>' +
            '<p class="proj-overview">' + p.overview + '</p>' +
          '</div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Build notes</p>' +
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
            '<p class="proj-section-label">Tools and structure</p>' +
            renderStack(p.stack) +
          '</div>' +
          '<div class="proj-section">' +
            '<p class="proj-section-label">Problems I worked through</p>' +
            renderHurdles(p.hurdles) +
          '</div>' +
        '</div>';
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setDialogBackground(overlay, true);
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    dialogTriggers.forEach(function(trigger) { trigger.setAttribute('aria-expanded', 'false'); });
    overlay.setAttribute('aria-hidden', 'true');
    setDialogBackground(overlay, false);
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

  document.querySelectorAll('.case-study-trigger').forEach(function(button) {
    button.addEventListener('click', function() {
      openOverlay(button.closest('[data-pid]').getAttribute('data-pid'));
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

  // ── 10. PROJECT CARD LIKES & DYNAMIC SORTING ─────────────────────
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
      btn.setAttribute('aria-pressed', String(liked));

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
        btn.setAttribute('aria-pressed', String(nowLiked));
        if (countEl) countEl.textContent = getCount(pid);
        btn.classList.toggle('liked', nowLiked);
        if (iconEl) iconEl.textContent = nowLiked ? '♥' : '♡';

        btn.style.transform = 'scale(1.22) rotate(-4deg)';
        setTimeout(function() { btn.style.transform = ''; }, 160);


      });
    });

    sortGrid();
  })();

  // ── 11. PROJECT DISCIPLINE FILTER SYSTEM ─────────────────────────
  (function() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        var filter = btn.getAttribute('data-filter');

        cards.forEach(function(card) {
          var categories = (card.getAttribute('data-category') || '').split(' ');
          if (filter === 'all' || categories.indexOf(filter) !== -1) {
            card.classList.remove('filter-hidden');
            card.style.opacity = '0';
            setTimeout(function() { card.style.opacity = '1'; }, 40);
          } else {
            card.classList.add('filter-hidden');
          }
        });
      });
    });
  })();

  // ── 12. 3D TILT & SPOTLIGHT RADIAL GLOW ──────────────────────────
  (function() {
    if (prefersReduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.project-card, .featured-project, .link-card').forEach(function(card) {
      var frame, pointerX, pointerY;
      card.addEventListener('mousemove', function(e) {
        pointerX = e.clientX;
        pointerY = e.clientY;
        if (prefersReduced || frame) return;
        frame = requestAnimationFrame(function() {
          frame = null;
          if (prefersReduced) return;
          var rect = card.getBoundingClientRect();
          var x = (pointerX - rect.left) / rect.width;
          var y = (pointerY - rect.top) / rect.height;
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          if (card.classList.contains('project-card') || card.classList.contains('featured-project')) {
            var amount = card.classList.contains('featured-project') ? 1.8 : 3.5;
            card.style.transform = 'perspective(1200px) rotateY(' + ((x * 2 - 1) * amount) + 'deg) rotateX(' + (-(y * 2 - 1) * amount) + 'deg)';
          }
        });
      }, { passive: true });
      function reset() { cancelAnimationFrame(frame); frame = null; card.style.transform = ''; }
      card.addEventListener('mouseleave', reset);
      motionPreference.addEventListener('change', reset);
    });
  })();

  // ── 13. NAV TEXT SCRAMBLE MATRIX EFFECT ──────────────────────────
  (function() {
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#%&*+/=';
    var scrambleFrames = new WeakMap();
    function scramble(el) {
      if (prefersReduced) return;
      cancelAnimationFrame(scrambleFrames.get(el));
      var original = el.dataset.text || el.textContent;
      el.dataset.text = original;
      var steps = original.length * 2;
      var frame = 0;
      var raf;

      function tick() {
        if (prefersReduced) { el.textContent = original; return; }
        el.textContent = original.split('').map(function(ch, i) {
          if (ch === ' ') return ' ';
          if (i < frame / 2) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        frame++;
        if (frame <= steps) {
          raf = requestAnimationFrame(tick);
          scrambleFrames.set(el, raf);
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

  // ── 14. OPPORTUNITY CTA SMOOTH SCROLL & FORM FOCUS ───────────────
  (function() {
    var oppBtn = document.getElementById('opportunity-cta');
    var form = document.getElementById('contact-form');
    var nameInput = document.getElementById('cf-name');
    if (!oppBtn || !form) return;

    oppBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var formCard = form.closest('.contact-form-card');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formCard.style.boxShadow = '0 0 0 2px var(--accent), 0 0 32px rgba(245, 158, 11, 0.25)';
        setTimeout(function() {
          formCard.style.boxShadow = '';
        }, 1200);
      }
      if (nameInput) {
        setTimeout(function() { nameInput.focus(); }, 400);
      }
    });
  })();

  // ── 15. CONTACT FORM (Formspree AJAX) ────────────────────────────
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
        if (btnLbl) btnLbl.textContent = 'Sending…';
        if (status) status.textContent = '';
      } else if (state === 'success') {
        if (btnLbl) btnLbl.textContent = 'Send message';
        if (status) status.textContent = 'Message sent. Thanks for getting in touch.';
        form.reset();
      } else if (state === 'error') {
        if (btnLbl) btnLbl.textContent = 'Send message';
        if (status) status.textContent = 'Message could not be sent. Please try again or email nikhil010407@gmail.com.';
      } else {
        if (btnLbl) btnLbl.textContent = 'Send message';
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
          status.textContent = 'Please complete all fields.';
        }
        if (!name && nameInput) nameInput.focus();
        else if (!email && emailInput) emailInput.focus();
        else if (!msg && msgInput) msgInput.focus();
        return;
      }

      if (!form.reportValidity() || btn.disabled) return;
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
