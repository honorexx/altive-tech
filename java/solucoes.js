const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const revealItems = document.querySelectorAll(".reveal");
const progressBar = document.getElementById("scroll-progress");

function updateHeader() {
  if (topbar) topbar.classList.toggle("is-scrolled", window.scrollY > 18);
}

if (menuToggle && navLinks) {
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
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function updateProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(pct, 100)}%`;
}

window.addEventListener("scroll", () => {
  updateHeader();
  updateProgress();
}, { passive: true });

updateHeader();
updateProgress();

(function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  const particles = [];
  const particleCount = 70;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function resetParticle(particle) {
    particle.x = rand(0, width);
    particle.y = rand(0, height);
    particle.r = rand(0.7, 2.1);
    particle.vx = rand(-0.18, 0.18);
    particle.vy = rand(-0.28, -0.04);
    particle.life = rand(0.25, 1);
    particle.decay = rand(0.0012, 0.0034);
    particle.blue = Math.random() > 0.65;
  }

  resize();

  for (let i = 0; i < particleCount; i += 1) {
    const particle = {};
    resetParticle(particle);
    particle.life = Math.random();
    particles.push(particle);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;

      if (particle.life <= 0 || particle.x < -5 || particle.x > width + 5 || particle.y < -5) {
        resetParticle(particle);
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life) * 0.82;
      ctx.shadowBlur = particle.blue ? 8 : 4;
      ctx.shadowColor = particle.blue ? "#00d4ff" : "#aaccff";
      ctx.fillStyle = particle.blue ? "rgba(0,212,255,1)" : "rgba(180,220,255,1)";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  draw();
})();
