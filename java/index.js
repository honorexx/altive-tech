const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const revealItems = document.querySelectorAll(".reveal");

function updateHeader() {
  topbar.classList.toggle("is-scrolled", window.scrollY > 18);
}

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

window.addEventListener("scroll", updateHeader);
updateHeader();

// ── SCROLL PROGRESS BAR ──
(function(){
  var bar = document.getElementById('scroll-progress');
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

// ── NEURAL PARTICLE NETWORK ──
(function () {
  var canvas = document.getElementById('particles-canvas');
  var ctx    = canvas.getContext('2d');
  var W, H;
  var COUNT     = 55;
  var MAX_DIST  = 130;
  var MO_DIST   = 190;
  var mouse     = { x: -999, y: -999 };
  var particles = [];
  var pulses    = [];

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
  });

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function Particle() {
    this.x  = rand(0, W || window.innerWidth);
    this.y  = rand(0, H || window.innerHeight);
    this.vx = rand(-0.28, 0.28);
    this.vy = rand(-0.28, 0.28);
    this.r  = rand(1, 2.2);
    this.op = rand(0.35, 0.85);
  }

  Particle.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
  };

  function Pulse(a, b) { this.a = a; this.b = b; this.t = 0; this.spd = rand(0.008, 0.018); }

  for (var i = 0; i < COUNT; i++) particles.push(new Particle());

  // Spawn a random pulse periodically
  setInterval(function () {
    var tries = 0;
    while (tries++ < 20) {
      var i = Math.floor(Math.random() * COUNT);
      var j = Math.floor(Math.random() * COUNT);
      if (i === j) continue;
      var dx = particles[j].x - particles[i].x;
      var dy = particles[j].y - particles[i].y;
      if (Math.sqrt(dx * dx + dy * dy) < MAX_DIST) { pulses.push(new Pulse(particles[i], particles[j])); break; }
    }
  }, 500);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function (p) { p.update(); });

    // Connection lines + mouse lines
    for (var i = 0; i < COUNT; i++) {
      var pi = particles[i];

      for (var j = i + 1; j < COUNT; j++) {
        var pj  = particles[j];
        var dx  = pj.x - pi.x, dy = pj.y - pi.y;
        var d   = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.strokeStyle = 'rgba(0,180,255,' + ((1 - d / MAX_DIST) * 0.13) + ')';
          ctx.lineWidth   = 0.5;
          ctx.beginPath(); ctx.moveTo(pi.x, pi.y); ctx.lineTo(pj.x, pj.y); ctx.stroke();
        }
      }

      // Lines to mouse
      var mdx = mouse.x - pi.x, mdy = mouse.y - pi.y;
      var md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < MO_DIST) {
        var ma = (1 - md / MO_DIST) * 0.5;
        ctx.strokeStyle = 'rgba(0,212,255,' + ma + ')';
        ctx.lineWidth   = 0.7;
        ctx.beginPath(); ctx.moveTo(pi.x, pi.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    // Pulses (electricity orbs travelling along edges)
    pulses = pulses.filter(function (pulse) {
      pulse.t += pulse.spd;
      if (pulse.t >= 1) return false;
      var x  = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.t;
      var y  = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.t;
      var fade = Math.sin(pulse.t * Math.PI);
      var g  = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, 'rgba(0,230,255,' + (fade * 0.95) + ')');
      g.addColorStop(1, 'rgba(0,180,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
      return true;
    });

    // Dots
    particles.forEach(function (p) {
      var dx = mouse.x - p.x, dy = mouse.y - p.y;
      var md = Math.sqrt(dx * dx + dy * dy);
      var boost = md < MO_DIST ? (1 - md / MO_DIST) * 0.6 : 0;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.op + boost);
      if (boost > 0.1) { ctx.shadowBlur = 10; ctx.shadowColor = '#00d4ff'; }
      ctx.fillStyle = boost > 0.15 ? '#00d4ff' : 'rgba(0,180,255,0.85)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r + boost, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize(); draw();
})();

// ── ROI CALCULATOR ──
function calcROI() {
  var emp   = parseInt(document.getElementById('roi-employees').value);
  var hrs   = parseInt(document.getElementById('roi-hours').value);
  var cost  = parseInt(document.getElementById('roi-cost').value);
  var auto  = parseInt(document.getElementById('roi-auto').value);

  document.getElementById('roi-employees-val').textContent = emp;
  document.getElementById('roi-hours-val').textContent     = hrs + 'h';
  document.getElementById('roi-cost-val').textContent      = 'R$' + cost;
  document.getElementById('roi-auto-val').textContent      = auto + '%';

  var hrsSaved   = emp * hrs * (auto / 100);           // horas/semana poupadas
  var hrsMo      = hrsSaved * 4.33;                    // horas/mês
  var savingsMo  = hrsMo * cost;                       // R$/mês
  var savingsYr  = savingsMo * 12;                     // R$/ano
  var investment = 10000 + (emp * 600) + (auto * 250);
  var paybackMo  = savingsMo > 0 ? Math.min(24, Math.max(1, Math.round(investment / savingsMo))) : 24;
  var productivity = Math.round(auto * 1.4);

  function fmt(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  document.getElementById('roi-amount').textContent     = fmt(savingsYr);
  document.getElementById('roi-monthly').textContent    = 'R$ ' + fmt(savingsMo);
  document.getElementById('roi-hours-saved').textContent= fmt(hrsMo) + 'h';
  document.getElementById('roi-payback').textContent    = paybackMo + ' ' + (paybackMo === 1 ? 'mês' : 'meses');
  document.getElementById('roi-productivity').textContent= '+' + Math.min(productivity, 200) + '%';
  document.getElementById('roi-s-emp').textContent      = emp;
  document.getElementById('roi-s-hrs').textContent      = Math.round(hrsSaved / emp * 10) / 10 + 'h';
}
calcROI();

// ── AUTOMATION BOARD SEQUENCER ──
(function () {
  var board = document.querySelector('.automation-board');
  if (!board) return;
  var nodes = board.querySelectorAll('.auto-node');
  var current = 0;
  var timer = null;

  function step() {
    nodes.forEach(function (n) { n.classList.remove('active'); });
    nodes[current].classList.add('active');
    current = (current + 1) % nodes.length;
  }

  function start() {
    if (timer) return;
    step();
    timer = setInterval(step, 900);
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { start(); obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });

  obs.observe(board);
})();

// ── HUD COUNTER ANIMATION ──
(function () {
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 1600;
    var startTs = null;

    function step(ts) {
      if (!startTs) startTs = ts;
      var progress = Math.min((ts - startTs) / duration, 1);
      el.textContent = Math.floor(easeOutCubic(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.hud-count');
  var triggered = false;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        counters.forEach(function (el, i) {
          setTimeout(function () { animateCount(el); }, i * 120);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.5 });

  if (counters.length) io.observe(counters[0].closest('.hud-panel') || document.body);
})();


// ── HUD 3D MOUSE TILT ──
(function () {
  var hero  = document.querySelector('.hero');
  var panel = document.querySelector('.hud-panel');
  if (!hero || !panel) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  hero.addEventListener('mousemove', function (e) {
    var r  = hero.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    var dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    panel.style.transition = 'transform 0.08s ease-out';
    panel.style.transform  =
      'perspective(700px) rotateY(' + (dx * 14) + 'deg) rotateX(' + (-dy * 9) + 'deg)';
  });

  hero.addEventListener('mouseleave', function () {
    panel.style.transition = 'transform 0.6s ease-out';
    panel.style.transform  = 'perspective(700px) rotateY(0deg) rotateX(0deg)';
  });
})();

// ── ABOUT TERMINAL: REVEAL LINES ONE BY ONE ──
(function () {
  var terminal = document.querySelector('.about-terminal');
  if (!terminal) return;

  var lines = terminal.querySelectorAll('.t-line');
  lines.forEach(function (l) {
    l.style.opacity   = '0';
    l.style.transform = 'translateX(-10px)';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      lines.forEach(function (line, i) {
        setTimeout(function () {
          line.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
          line.style.opacity    = '1';
          line.style.transform  = 'translateX(0)';
        }, i * 170);
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  io.observe(terminal);
})();

// ── STAT COUNTERS IN SOBRE SECTION ──
(function () {
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  document.querySelectorAll('.stat-val').forEach(function (el) {
    var em     = el.querySelector('em');
    var suffix = em ? em.innerHTML : '';
    var num    = parseInt(el.textContent, 10);
    if (isNaN(num)) return;

    el.innerHTML = '<span class="s-count">0</span><em>' + suffix + '</em>';
    var span = el.querySelector('.s-count');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var startTs = null;
        var dur = 1400;
        requestAnimationFrame(function step(ts) {
          if (!startTs) startTs = ts;
          var p = Math.min((ts - startTs) / dur, 1);
          span.textContent = Math.floor(easeOut(p) * num);
          if (p < 1) requestAnimationFrame(step);
          else span.textContent = num;
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    io.observe(el);
  });
})();

// ── SERVICE CARD TITLE SCRAMBLE ON HOVER ──
(function () {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!%';

  document.querySelectorAll('.svc-card').forEach(function (card) {
    var span    = card.querySelector('.svc-title span');
    if (!span) return;
    var original = span.textContent;
    var running  = false;

    card.addEventListener('mouseenter', function () {
      if (running) return;
      running = true;
      var frame = 0, maxFrames = 14;
      var iv = setInterval(function () {
        span.textContent = original.split('').map(function (ch, i) {
          if (ch === ' ') return ' ';
          if (i < (frame / maxFrames) * original.length) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        frame++;
        if (frame > maxFrames) {
          clearInterval(iv);
          span.textContent = original;
          running = false;
        }
      }, 35);
    });
  });
})();


// ── MAGNETIC BUTTONS ──
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.btn-prime, .btn-wa, .nav-cta-btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r  = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      var dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      btn.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s';
      btn.style.transform  = 'translate(' + (dx * 7) + 'px,' + (dy * 4) + 'px) translateY(-2px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transition = 'transform 0.5s ease-out, box-shadow 0.2s';
      btn.style.transform  = '';
    });
  });
})();

// ── STATUS CYCLING TYPEWRITER ──
(function () {
  var status = document.querySelector('.hero-status');
  if (!status) return;
  var msgs = [
    'Sistema online · Disponível agora',
    '100% · Entregas no prazo',
    '48h · Primeiro protótipo',
    '5★ · Avaliação dos clientes',
    'IA pronta · Automação ativa'
  ];
  var idx = 0;
  function getTextNode(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) return el.childNodes[i];
    }
  }
  setInterval(function () {
    idx = (idx + 1) % msgs.length;
    status.style.transition = 'opacity 0.3s';
    status.style.opacity = '0';
    setTimeout(function () {
      var tn = getTextNode(status);
      if (tn) tn.textContent = ' ' + msgs[idx];
      status.style.opacity = '1';
    }, 320);
  }, 3200);
})();



// ── HERO BUILD LOG ──
(function () {
  var ids = ['bl-ts-1','bl-ts-2','bl-ts-3'];
  function fmt(d) {
    return [d.getHours(),d.getMinutes(),d.getSeconds()]
      .map(function(n){ return String(n).padStart(2,'0'); }).join(':');
  }
  var now = new Date();
  ids.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (!el) return;
    var t = new Date(now.getTime() - (2 - i) * 2000);
    el.textContent = fmt(t);
  });
  setInterval(function() {
    var el = document.getElementById('bl-ts-3');
    if (el) el.textContent = fmt(new Date());
  }, 1000);
})();
