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

(function initActivePills() {
  const sections = document.querySelectorAll('.solution-section[id]');
  const pills = document.querySelectorAll('.solution-pills a');
  if (!sections.length || !pills.length) return;

  const pillObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        pills.forEach(function(pill) {
          pill.classList.toggle('active', pill.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(function(section) { pillObserver.observe(section); });
})();

try {
  (function () {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('bg3d');
    if (!canvas) return;

    const isMob = innerWidth < 760;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 120);
    camera.position.z = 12;

    const BLUE = new THREE.Color(0x00b4ff);
    const CYAN = new THREE.Color(0x00d4ff);

    const NODE_N = isMob ? 28 : 52;
    const CONNECT_D = 4.4;

    /* posições dos nós */
    const nodePos = [];
    for (let i = 0; i < NODE_N; i++) {
      nodePos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      ));
    }

    /* conexões entre nós próximos */
    const conns = [];
    for (let i = 0; i < NODE_N; i++) {
      for (let j = i + 1; j < NODE_N; j++) {
        if (nodePos[i].distanceTo(nodePos[j]) < CONNECT_D) conns.push([i, j]);
      }
    }

    const group = new THREE.Group();

    /* esferas dos nós */
    const nodes = nodePos.map(p => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(Math.random() * 0.07 + 0.035, 8, 8),
        new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? BLUE : CYAN, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      m.position.copy(p);
      m.userData.phase = Math.random() * Math.PI * 2;
      group.add(m);
      return m;
    });

    /* linhas de conexão */
    const lineArr = new Float32Array(conns.length * 6);
    conns.forEach(([i, j], k) => {
      const a = nodePos[i], b = nodePos[j];
      lineArr[k*6]   = a.x; lineArr[k*6+1] = a.y; lineArr[k*6+2] = a.z;
      lineArr[k*6+3] = b.x; lineArr[k*6+4] = b.y; lineArr[k*6+5] = b.z;
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    /* pulsos viajando pelas conexões */
    const PULSE_N = isMob ? 6 : 14;
    const pulses = [];
    for (let k = 0; k < PULSE_N; k++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      p.userData = { ci: Math.floor(Math.random() * conns.length), t: Math.random(), speed: 0.004 + Math.random() * 0.006 };
      group.add(p);
      pulses.push(p);
    }

    scene.add(group);

    let mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();

    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();

    (function tick() {
      const t = clock.getElapsedTime();

      group.rotation.y = t * 0.034 + mx * 0.24;
      group.rotation.x = Math.sin(t * 0.12) * 0.06 + my * 0.12;

      nodes.forEach(m => {
        m.material.opacity = 0.45 + Math.sin(t * 1.1 + m.userData.phase) * 0.35;
      });

      pulses.forEach(p => {
        p.userData.t += p.userData.speed;
        if (p.userData.t >= 1) {
          p.userData.t = 0;
          p.userData.ci = Math.floor(Math.random() * conns.length);
        }
        const [i, j] = conns[p.userData.ci];
        tmp.lerpVectors(nodePos[i], nodePos[j], p.userData.t);
        p.position.copy(tmp);
        p.material.opacity = Math.sin(p.userData.t * Math.PI) * 0.95;
      });

      lineMat.opacity = 0.1 + Math.sin(t * 0.32) * 0.05;

      camera.position.x += (mx * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (-my * 0.8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    })();
  })();
} catch (e) {
  console.warn('Three.js error (solucoes):', e);
}
