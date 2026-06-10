/* ══════════════════════════════════════════════════════
   ALTIVE v4 — JS
   ══════════════════════════════════════════════════════ */

const reduced  = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMobile = innerWidth < 760;

/* ── NAV ── */
const topbar     = document.querySelector('.topbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

if (topbar) window.addEventListener('scroll', () => {
  topbar.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

/* ── SCROLL PROGRESS ── */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function upd() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  }
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* ── SCROLL REVEAL ── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ── COUNTERS ── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, end = +(el.dataset.target || el.dataset.count), dur = 1600, t0 = performance.now();
      (function step(now) {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = Math.floor(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target],[data-count]').forEach(el => io.observe(el));
})();

/* ── SECTION DOTS ── */
(function () {
  const dotLinks = document.querySelectorAll('#dots a');
  const ids = ['topo', 'servicos', 'processo', 'planos', 'contato'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !dotLinks.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = sections.indexOf(e.target);
        dotLinks.forEach((d, i) => d.classList.toggle('on', i === idx));
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => io.observe(s));
})();

/* ── CARD SPOTLIGHT ── */
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ── 3D TILT ── */
if (!reduced && !isMobile) {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(6px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ── MAGNETIC BUTTONS ── */
if (!reduced && !isMobile) {
  document.querySelectorAll('.btn-prime, .btn-ghost, .nav-cta-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ── CUSTOM CURSOR ── */
if (!reduced && matchMedia('(pointer:fine)').matches) {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring) {
    let rx = 0, ry = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
    });
    (function follow() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, .svc-card, .plan-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }
}

/* ══════════════════════════════════════════════════════
   THREE.JS — roda por último, isolado em try/catch
   ══════════════════════════════════════════════════════ */
try {
  (function () {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('bg3d');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 9;

    const BLUE = new THREE.Color(0x00b4ff);
    const CYAN = new THREE.Color(0x00d4ff);

    /* ── Morphing particles ── */
    const P = isMobile ? 800 : 1800;

    /* montanha do logo: pico central + 2 picos laterais + base curva */
    function mountain() {
      const a = new Float32Array(P * 3);
      for (let i = 0; i < P; i++) {
        const r = Math.random();
        let x, y, z = (Math.random() - 0.5) * 1.2 - 1.5;
        if (r < 0.48) {
          // pico central — triângulo grande
          const u = Math.random(), v = Math.random() * (1 - u);
          x = u * 0   + v * (-4.2) + (1-u-v) * 4.2;
          y = u * 5.2 + v * (-0.8) + (1-u-v) * (-0.8);
        } else if (r < 0.68) {
          // pico esquerdo
          const u = Math.random(), v = Math.random() * (1 - u);
          x = u * (-3.0) + v * (-5.8) + (1-u-v) * (-1.4);
          y = u *  2.0   + v * (-0.8) + (1-u-v) * (-0.8);
        } else if (r < 0.88) {
          // pico direito
          const u = Math.random(), v = Math.random() * (1 - u);
          x = u * 3.0 + v * 1.4 + (1-u-v) * 5.8;
          y = u * 2.0 + v * (-0.8) + (1-u-v) * (-0.8);
        } else {
          // base curvada
          const t = (Math.random() - 0.5) * 14;
          x = t;
          y = -1.1 - Math.pow(Math.abs(t) / 7, 1.8) * 0.9;
          z = (Math.random() - 0.5) * 0.4 - 1.5;
        }
        a[i*3] = x; a[i*3+1] = y; a[i*3+2] = z;
      }
      return a;
    }

    function grid()    { const a=new Float32Array(P*3),s=Math.ceil(Math.sqrt(P)); for(let i=0;i<P;i++){const x=i%s,y=Math.floor(i/s);a[i*3]=(x/s-.5)*16;a[i*3+1]=(y/s-.5)*9;a[i*3+2]=-3+Math.sin(x*.5)*Math.cos(y*.5)*.8;} return a; }
    function helix()   { const a=new Float32Array(P*3); for(let i=0;i<P;i++){const t=i/P*Math.PI*8,x=i/P*16-8,s=i%2?1:-1;a[i*3]=x;a[i*3+1]=Math.sin(t)*1.6*s;a[i*3+2]=Math.cos(t)*1.6*s-2;} return a; }
    function diamond() { const a=new Float32Array(P*3); for(let i=0;i<P;i++){let x=Math.random()*2-1,y=Math.random()*2-1,z=Math.random()*2-1;const m=Math.abs(x)+Math.abs(y)+Math.abs(z)||1,r=4.6;a[i*3]=x/m*r;a[i*3+1]=y/m*r;a[i*3+2]=z/m*r-2;} return a; }
    function knot()    { const a=new Float32Array(P*3); for(let i=0;i<P;i++){const t=i/P*Math.PI*2,p=2,q=3,r=2.6,rr=Math.cos(q*t)+2;a[i*3]=r*rr*Math.cos(p*t)*.8;a[i*3+1]=r*rr*Math.sin(p*t)*.8;a[i*3+2]=r*Math.sin(q*t)-2;} return a; }

    const shapes = [mountain(), grid(), helix(), diamond(), knot()];
    const colors = [CYAN.clone(), BLUE.clone(), new THREE.Color(0x0066ff), BLUE.clone(), CYAN.clone()];

    const mPos = new Float32Array(shapes[0]);
    const mGeo = new THREE.BufferGeometry();
    mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
    const mMat = new THREE.PointsMaterial({ color: BLUE.clone(), size: 0.05, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(mGeo, mMat));

    /* stars */
    const stPos = new Float32Array((isMobile ? 300 : 600) * 3);
    for (let i = 0; i < stPos.length; i++) stPos[i] = (Math.random() - 0.5) * 40;
    const stGeo = new THREE.BufferGeometry();
    stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
    scene.add(new THREE.Points(stGeo, new THREE.PointsMaterial({ color: 0x8B96B8, size: 0.04, transparent: true, opacity: 0.5 })));

    let mx = 0, my = 0, scrollT = 0, smoothT = 0;
    addEventListener('mousemove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      scrollT = max > 0 ? window.scrollY / max : 0;
    }, { passive: true });

    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();

    const ease = t => t * t * (3 - 2 * t);
    const clock = new THREE.Clock();
    const tmp = new THREE.Color();
    const morph = scene.children.find(c => c instanceof THREE.Points && c.geometry === mGeo);

    (function tick() {
      const t = clock.getElapsedTime();
      smoothT += (scrollT - smoothT) * 0.05;

      const seg = shapes.length - 1;
      const pp = Math.min(smoothT * seg, seg - 0.0001);
      const i0 = Math.floor(pp), i1 = Math.min(i0 + 1, seg);
      const f = ease(pp - i0);
      const A = shapes[i0], B = shapes[i1];
      for (let i = 0; i < P * 3; i++) mPos[i] = A[i] + (B[i] - A[i]) * f;
      mGeo.attributes.position.needsUpdate = true;
      tmp.copy(colors[i0]).lerp(colors[i1], f);
      mMat.color.copy(tmp);
      if (morph) { morph.rotation.y = t * 0.08 + mx * 0.4; morph.rotation.x = Math.sin(t * 0.15) * 0.1 + my * 0.2; }
      mMat.size = 0.05 + Math.sin(t * 1.4) * 0.012;

      camera.position.x += (mx * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (-my - camera.position.y) * 0.04;
      camera.lookAt(0, 0, -2);

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    })();
  })();
} catch (e) {
  console.warn('Three.js scene error (non-critical):', e);
}
