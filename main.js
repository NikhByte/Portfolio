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
            var b = p.querySelector('.writing-post-body');
            if (b) b.hidden = true;
          }
        });

        post.classList.toggle('open', !isOpen);
        header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        var body = post.querySelector('.writing-post-body');
        if (body) body.hidden = isOpen;
      }

      header.addEventListener('click', toggle);
    });
  })();

  // ── 9. PROJECT CASE STUDY TECHNICAL DOSSIERS ────────────────────
  var PROJECTS = {
    'cognios': {
      name: 'CogniOS',
      sub: 'Linux workload detector · DevLUP Labs SoC · In progress',
      overview: 'CogniOS reads Linux process data from /proc and psutil, then uses an XGBoost model to classify a workload as compute-bound, memory-bound, I/O-bound, or idle. It runs in userspace, so it does not need kernel patches or root access. I also added an Isolation Forest for unusual behavior, a rolling crash log, and a simulator for trying scheduler ideas against recorded traces.',
      timeline: [
        { date: 'Apr 2025', event: 'I joined DevLUP Labs SoC and sketched the first version: workload detection in userspace, with no kernel changes.', milestone: true },
        { date: 'May 2025', event: 'I wrote the /proc and psutil collectors for CPU, memory, I/O, and context-switch data.' },
        { date: 'Jun 2025', event: 'I built a synthetic-data generator and produced about 50,000 labeled samples across four workload classes.' },
        { date: 'Jul 2025', event: 'I trained the XGBoost model, tracked runs in MLflow, and brought inference below 2 ms in my tests.', milestone: true },
        { date: 'Aug 2025', event: 'I added an Isolation Forest and started saving anomaly events in the rolling recorder.' },
        { date: 'Ongoing', event: 'I am building a simulator to compare CFS, EDF, and PPO policies on recorded workloads.', milestone: true },
      ],
      stack: [
        { label: 'CORE', tags: ['Python', 'C', 'psutil', 'SQLite WAL'] },
        { label: 'ML', tags: ['XGBoost', 'Isolation Forest', 'scikit-learn', 'MLflow'] },
        { label: 'OS', tags: ['Linux', '/proc Telemetry', 'cgroups', 'Docker'] },
        { label: 'LLM', tags: ['Gemma LLM', 'Ollama'] },
      ],
      hurdles: [
        { title: 'Working without root', desc: 'Many useful hardware counters need root access. I limited the model to 18 signals available through /proc and psutil, then smoothed the differences between samples to cut down noise.' },
        { title: 'Keeping inference cheap', desc: 'The detector should not become part of the problem. Trimming features, reusing NumPy arrays, and loading the native XGBoost model brought prediction time to about 1.4 ms in my tests.' },
        { title: 'Making synthetic data less tidy', desc: 'My first generated traces were too uniform, so the model learned patterns that did not look much like real workloads. I added bursts and uneven timing to make the samples less predictable.' },
        { title: 'Keeping crash data readable', desc: 'The recorder writes through a two-file WAL setup, so the last saved state can still be read if the process dies midway through a write.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/CogniOS' },
      ],
    },

    'fate': {
      name: 'FATE',
      sub: 'Full Attention Telemetry Engine · Insomniac Hackathon · Runner-Up · 24 hrs',
      overview: 'FATE is a mobile app our team built in 24 hours at the Insomniac Hackathon. It combines motion, location, ambient sound, communication frequency, app usage, and screen time into a Contextual Attention Score. The app uses Flutter and Android sensors, with a FastAPI backend. We finished as runners-up.',
      timeline: [
        { date: 'Day 1, 8:00 PM', event: 'We formed the team and cut the idea down to phone-only attention tracking with no wearable.', milestone: true },
        { date: 'Day 1, 10:00 PM', event: 'We started the Flutter app and FastAPI backend, then agreed on the request and response shapes.' },
        { date: 'Day 1, 11:30 PM', event: 'We wrote the first weighted version of the attention score.' },
        { date: 'Day 2, 3:00 AM', event: 'I connected the Android sensor layer through Flutter platform channels and started collecting GPS, motion, and usage data.' },
        { date: 'Day 2, 9:00 AM', event: 'The backend was working, and we added short coaching suggestions with Gemini CLI.', milestone: true },
        { date: 'Day 2, 6:00 PM', event: 'We fixed the demo path, recorded the submission, and sent it in before the deadline.', milestone: true },
        { date: 'Day 2, 8:00 PM', event: 'The hackathon ended. FATE placed second.', milestone: false },
      ],
      stack: [
        { label: 'MOBILE', tags: ['Flutter', 'Dart', 'Android'] },
        { label: 'NATIVE', tags: ['Java', 'Platform Channels', 'Android Sensors API'] },
        { label: 'BACK', tags: ['Python', 'FastAPI', 'uvicorn'] },
        { label: 'AI', tags: ['Gemini CLI'] },
      ],
      hurdles: [
        { title: 'Sensors arrive at different speeds', desc: 'Accelerometer data arrived far more often than GPS and app-usage updates. We moved collection into a background isolate and grouped readings into time windows.' },
        { title: 'No time to train a model', desc: 'With only 24 hours, we used a weighted rule-based score instead of pretending we had enough data for a useful model.' },
        { title: 'Android background permissions', desc: 'Android 12 makes background access easy to get wrong. We added a short guide that takes people to the right system settings.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/FATE' },
      ],
    },

    'spark': {
      name: 'SPARK',
      sub: 'Self-hosted Personal Access Remote Kit · DevLUP Labs WoC · 2025',
      overview: 'SPARK is my small homelab on a repurposed Ubuntu machine. CasaOS manages Docker containers for Jellyfin, Nextcloud, and Vaultwarden. The campus network blocks incoming ports, so I use an outbound Cloudflare Tunnel to reach the services remotely.',
      timeline: [
        { date: 'Jan 2025', event: 'I installed Ubuntu Server 24.04, set a local address, added SSH keys, and tightened the firewall.', milestone: true },
        { date: 'Feb 2025', event: 'I added CasaOS and Docker containers for Nextcloud and Jellyfin, with data stored outside the containers.' },
        { date: 'Mar 2025', event: 'I set up cloudflared so I could reach the server through campus NAT without opening ports.', milestone: true },
        { date: 'Apr 2025', event: 'I added Vaultwarden, Prometheus, and Grafana for passwords and basic machine health.' },
        { date: 'Ongoing', event: 'I am adding an Ollama container for local inference on the same machine.', milestone: true },
      ],
      stack: [
        { label: 'HOST', tags: ['Ubuntu Server', 'Linux', 'systemd'] },
        { label: 'ORCH', tags: ['Docker', 'CasaOS', 'Portainer'] },
        { label: 'NET', tags: ['Cloudflare Tunnel', 'Nginx', 'Tailscale'] },
        { label: 'OBS', tags: ['Prometheus', 'Grafana'] },
      ],
      hurdles: [
        { title: 'The campus network blocks incoming ports', desc: 'Port forwarding was not an option, so the server opens its own Cloudflare Tunnel and exposes no inbound port.' },
        { title: 'The local address keeps changing', desc: 'A small systemd script checks the active subnet at boot and updates the Docker bridge when DHCP moves the machine.' },
        { title: 'The hardware runs hot', desc: 'A temperature monitor slows non-essential containers above 80°C, and the CPU governor keeps the old laptop from sitting at full power all day.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/SPARK' },
      ],
    },

    'debateos': {
      name: 'DebateOS',
      sub: 'Three-agent debate demo · Cerebras Hackathon · 24 hrs',
      overview: 'DebateOS puts two Llama 3 70B agents on opposite sides of a motion and gives a third agent the judge role. LangGraph keeps track of turns and context, while Cerebras serves the model at roughly 800 tokens per second. The judge checks the arguments against a simple rubric and picks a winner.',
      timeline: [
        { date: 'Hour 0–3', event: 'I split the graph into three roles: one agent for each side and one judge.', milestone: true },
        { date: 'Hour 3–8', event: 'I connected Llama 3 70B through Cerebras and checked how quickly streamed responses arrived.' },
        { date: 'Hour 8–14', event: 'I built the turn loop in LangGraph and passed the previous arguments into each new response.' },
        { date: 'Hour 14–20', event: 'The agents kept agreeing with each other, so I tightened their prompts and wrote a two-step judging rubric.', milestone: true },
        { date: 'Hour 20–24', event: 'I built the web interface, tested long debates, and submitted the demo.', milestone: true },
      ],
      stack: [
        { label: 'AGENT', tags: ['LangGraph', 'LangChain'] },
        { label: 'LLM', tags: ['Llama 3 70B', 'Cerebras API'] },
        { label: 'BACK', tags: ['Node.js', 'Express'] },
        { label: 'UI', tags: ['HTML5', 'CSS3', 'Vanilla JS'] },
      ],
      hurdles: [
        { title: 'The debaters kept agreeing', desc: 'The base model often softened its position after a rebuttal. I made each role more explicit and penalized unsupported concessions in the prompt.' },
        { title: 'The judge kept calling it a draw', desc: 'A single scoring prompt produced almost identical scores. I split judging into two passes: find weaknesses first, then apply the weighted rubric.' },
        { title: 'Long debates filled the context window', desc: 'I kept the opening claims and latest rebuttals, then summarized the middle rounds once the transcript grew too large.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/DebateOS' },
      ],
    },

    'aerowse': {
      name: 'AeroWSE',
      sub: '3D drone-swarm demo · Cerebras Hackathon · 24 hrs',
      overview: 'AeroWSE is a Three.js drone-swarm demo I built during the Cerebras Hackathon. More than 50 drones follow a Boids simulation, while Gemma 4 31B turns plain-language commands into target positions. The demo supports four commands: Patrol, Intercept, Scatter, and Regroup.',
      timeline: [
        { date: 'Hour 0–4', event: 'I set up the Three.js scene, made a low-poly drone, and added the camera controls.', milestone: true },
        { date: 'Hour 4–10', event: 'I wrote the separation, alignment, and cohesion rules, then tuned the weights until the swarm stopped looking random.' },
        { date: 'Hour 10–16', event: 'I connected Gemma 4 31B through Cerebras and converted its command output into target vectors.', milestone: true },
        { date: 'Hour 16–21', event: 'Rendering each drone separately dropped the frame rate, so I moved the swarm to one InstancedMesh draw call.' },
        { date: 'Hour 21–24', event: 'I added Patrol, Intercept, Scatter, and Regroup, recorded the demo, and submitted it.', milestone: true },
      ],
      stack: [
        { label: '3D', tags: ['Three.js', 'WebGL', 'GLSL'] },
        { label: 'AI', tags: ['Gemma 4 31B', 'Cerebras API'] },
        { label: 'BACK', tags: ['Node.js', 'Express'] },
        { label: 'ALGO', tags: ['Boids Simulation', 'Vector Math'] },
      ],
      hurdles: [
        { title: 'Fifty separate meshes were too slow', desc: 'The first version fell to about 12 fps. InstancedMesh let me update all drone matrices while drawing the swarm in one call, which brought it back to 60 fps.' },
        { title: 'The model returns words, not vectors', desc: 'The physics loop needs coordinates and force weights. I constrained the response to JSON and kept a fallback target for malformed output.' },
        { title: 'Commands take time to parse', desc: 'The swarm enters a simple waiting state as soon as a command arrives, then switches to the new target when the model response is ready.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/AeroWSE' },
      ],
    },

    'credo': {
      name: 'Credo',
      sub: 'Task manager · Bootup Hackathon · Top 5 Finalist',
      overview: 'Credo is a task manager our team built at the Bootup Hackathon, where we reached the top five. It has a Node.js backend, SQLite storage, category filters, and keyboard navigation. We used generated interface fragments early on, then rewrote the layout and styles into one consistent system.',
      timeline: [
        { date: 'Day 1, morning', event: 'We formed Team Elite Coders and agreed to focus on fast task entry, categories, and reliable storage.', milestone: true },
        { date: 'Day 1, afternoon', event: 'We started the Node.js backend and designed the SQLite tables.' },
        { date: 'Day 1, evening', event: 'We pulled the early generated UI fragments into one layout and one set of CSS tokens.' },
        { date: 'Day 2, morning', event: 'We added keyboard navigation, category filters, and a queue for SQLite writes.', milestone: true },
        { date: 'Day 2, afternoon', event: 'We fixed the demo, presented it, and finished in the top five.', milestone: true },
      ],
      stack: [
        { label: 'FRONT', tags: ['HTML5', 'CSS3', 'JavaScript'] },
        { label: 'BACK', tags: ['Node.js', 'Express', 'SQLite'] },
        { label: 'PROCESS', tags: ['Generated prototype', 'CSS cleanup'] },
      ],
      hurdles: [
        { title: 'The early UI did not fit together', desc: 'Generated components came with different spacing and styling. We kept the useful pieces and moved everything onto the same CSS variables.' },
        { title: 'SQLite locked under quick repeated writes', desc: 'Several asynchronous requests could write at once. We added a small queue and ran the better-sqlite3 transactions one at a time.' },
        { title: 'We had more ideas than time', desc: 'On the second morning we dropped the calendar work and spent the remaining hours making the main task flow dependable.' },
      ],
      links: [
        { label: '↗ GitHub Repo', href: 'https://github.com/NikhByte/Credo' },
      ],
    },

    'localai': {
      name: 'Local AI Environment',
      sub: 'Offline LLM setup · RTX 3050 laptop GPU · In progress',
      overview: 'This is my offline LLM setup on a laptop RTX 3050 with 4 GB of VRAM. Ollama serves the models and Open WebUI provides the interface. I use it to compare quantization levels, memory use, speed, and temperature instead of relying on cloud inference.',
      timeline: [
        { date: 'Month 1', event: 'I installed Ollama, tried Llama 3 8B and Mistral 7B, and watched VRAM use with nvidia-smi.', milestone: true },
        { date: 'Month 2', event: 'I added Open WebUI in Docker and kept the model files on persistent SSD storage.' },
        { date: 'Month 3', event: 'I compared Q4_K_M, Q5, and Q8 using tokens per second and memory use.', milestone: true },
        { date: 'Month 4', event: 'I fed local inference sessions into CogniOS as examples of compute-bound work.' },
        { date: 'Ongoing', event: 'I am testing smaller reasoning models and trying a local RAG setup.', milestone: true },
      ],
      stack: [
        { label: 'INFRA', tags: ['Ollama', 'Open WebUI', 'Docker'] },
        { label: 'GPU', tags: ['CUDA', 'RTX 3050 (4GB)', 'cuDNN'] },
        { label: 'QUANT', tags: ['GGUF', 'Q4_K_M', 'llama.cpp'] },
      ],
      hurdles: [
        { title: 'Four gigabytes of VRAM is not much', desc: 'Models above roughly 7B at Q4 spill onto the CPU, and speed drops from about 35 to 4 tokens per second. I keep a small table of model size, quantization, context, and memory use.' },
        { title: 'Long runs heat up the laptop', desc: 'Sustained batches pushed the GPU to its thermal limit. I reduced the context size and changed the fan curve for longer tests.' },
        { title: 'Switching models leaves memory behind', desc: 'I added a shell alias that unloads the current model before the next one starts.' },
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
        '<h4 class="proj-stack-label">' + g.label + '</h4>' +
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
        '<h4 class="proj-hurdle-title">' + h.title + '</h4>' +
        '<p class="proj-hurdle-desc">' + h.desc + '</p>' +
      '</div>';
    }).join('') + '</div>';
  }

  var dialogTriggers = document.querySelectorAll('.case-study-trigger');
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
            '<h3 class="proj-section-label">The short version</h3>' +
            '<p class="proj-overview">' + p.overview + '</p>' +
          '</div>' +
          '<div class="proj-section">' +
            '<h3 class="proj-section-label">Build notes</h3>' +
            renderTimeline(p.timeline) +
          '</div>' +
          '<div class="proj-section">' +
            '<h3 class="proj-section-label">Links</h3>' +
            '<div class="proj-link-row">' + p.links.map(function(l) {
              return '<a href="' + l.href + '" class="proj-ext-link" target="_blank" rel="noopener noreferrer">' + l.label + '</a>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="proj-section">' +
            '<h3 class="proj-section-label">Tools and structure</h3>' +
            renderStack(p.stack) +
          '</div>' +
          '<div class="proj-section">' +
            '<h3 class="proj-section-label">Problems I worked through</h3>' +
            renderHurdles(p.hurdles) +
          '</div>' +
        '</div>';
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.inert = false;
    setDialogBackground(overlay, true);
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    dialogTriggers.forEach(function(trigger) { trigger.setAttribute('aria-expanded', 'false'); });
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
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
    var status = document.getElementById('project-filter-status');
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
        var visibleCount = 0;

        cards.forEach(function(card) {
          var categories = (card.getAttribute('data-category') || '').split(' ');
          if (filter === 'all' || categories.indexOf(filter) !== -1) {
            visibleCount++;
            card.classList.remove('filter-hidden');
            card.style.opacity = '0';
            setTimeout(function() { card.style.opacity = '1'; }, 40);
          } else {
            card.classList.add('filter-hidden');
          }
        });
        if (status) {
          var label = btn.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
          status.textContent = 'Showing ' + visibleCount + ' project' + (visibleCount === 1 ? '' : 's') + ' for ' + label + '.';
        }
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
    var fields = Array.from(form.querySelectorAll('.form-input'));

    var ENDPOINT = 'https://formspree.io/f/xeajzddb';

    function fieldLabel(input) {
      var label = form.querySelector('label[for="' + input.id + '"]');
      return label ? label.textContent.replace('*', '').trim() : 'This field';
    }

    function setFieldError(input, message) {
      var error = document.getElementById(input.id + '-error');
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (error) error.textContent = message || '';
    }

    function validationMessage(input) {
      if (!input.value.trim()) return fieldLabel(input) + ' is required.';
      if (input.validity.typeMismatch) return 'Enter a valid email address.';
      return '';
    }

    fields.forEach(function(input) {
      input.addEventListener('invalid', function(e) {
        e.preventDefault();
        var isFirstInvalid = !form.querySelector('.form-input[aria-invalid="true"]');
        setFieldError(input, validationMessage(input));
        if (status) {
          status.className = 'form-status error';
          status.textContent = 'Please correct the highlighted fields.';
        }
        if (isFirstInvalid) setTimeout(function() { input.focus(); }, 0);
      });
      input.addEventListener('input', function() {
        if (input.getAttribute('aria-invalid') === 'true') {
          setFieldError(input, validationMessage(input));
          if (!form.querySelector('.form-input[aria-invalid="true"]') && status) {
            status.className = 'form-status';
            status.textContent = '';
          }
        }
      });
    });

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
        fields.forEach(function(input) { setFieldError(input, ''); });
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
        fields.forEach(function(input) { setFieldError(input, validationMessage(input)); });
        if (status) {
          status.className = 'form-status error';
          status.textContent = 'Please correct the highlighted fields.';
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
