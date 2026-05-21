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

// ── PARTICLES ──
(function(){
  var canvas = document.getElementById('particles-canvas');
  var ctx = canvas.getContext('2d');
  var W, H, particles = [];
  var PARTICLE_COUNT = 80;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function() {
    this.x    = rand(0, W);
    this.y    = rand(0, H);
    this.r    = rand(0.8, 2.2);
    this.vx   = rand(-0.25, 0.25);
    this.vy   = rand(-0.35, -0.05);
    this.life = rand(0.3, 1);
    this.decay= rand(0.0015, 0.004);
    this.blue = Math.random() > 0.7;
  };

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var p = new Particle();
    p.life = Math.random(); // stagger start
    particles.push(p);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.x < -5 || p.x > W+5 || p.y < -5) p.reset();

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life) * 0.9;
      var color = p.blue ? 'rgba(0,212,255,' : 'rgba(180,220,255,';
      ctx.shadowBlur  = p.blue ? 8 : 4;
      ctx.shadowColor = p.blue ? '#00d4ff' : '#aaccff';
      ctx.fillStyle   = color + '1)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
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
