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

(function(){
  var bar = document.getElementById('scroll-progress');
  function up(){
    var st=window.scrollY||document.documentElement.scrollTop;
    var dh=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(dh>0?Math.min(st/dh*100,100):0)+'%';
  }
  window.addEventListener('scroll',up,{passive:true}); up();
})();
try {
  (function () {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const isMob = innerWidth < 760;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 8;

    const BLUE = new THREE.Color(0x00b4ff);
    const CYAN = new THREE.Color(0x00d4ff);

    /* ── cristal central: octaedro detalhado ── */
    const coreGeo = new THREE.OctahedronGeometry(1.9, 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false });
    const wireMat = new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
    const glowMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false });

    const crystal = new THREE.Group();
    crystal.add(new THREE.Mesh(coreGeo, coreMat));
    crystal.add(new THREE.Mesh(coreGeo.clone(), wireMat));
    crystal.add(new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), glowMat));

    /* anéis decorativos em planos diferentes */
    [[3.1, BLUE, 0.24, 0.32], [3.7, CYAN, 0.14, -0.55]].forEach(([r, c, o, rx]) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.006, 8, 110),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending })
      );
      ring.rotation.x = Math.PI / 2 + rx;
      crystal.add(ring);
    });

    /* mini-cristais em órbita */
    const orbs = [];
    [0, 1, 2, 3].forEach(i => {
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13 + i * 0.02, 0),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? CYAN : BLUE, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      m.userData = { angle: (i / 4) * Math.PI * 2, radius: 2.75 + i * 0.38, speed: 0.38 + i * 0.07, tilt: i * 0.45 };
      crystal.add(m);
      orbs.push(m);
    });

    crystal.position.x = isMob ? 0 : 2.8;
    scene.add(crystal);

    /* estrelas de fundo */
    const sN = isMob ? 200 : 480;
    const sPos = new Float32Array(sN * 3);
    for (let i = 0; i < sN * 3; i++) sPos[i] = (Math.random() - 0.5) * 40;
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0x5577aa, size: 0.04, transparent: true, opacity: 0.5 })));

    let mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      crystal.position.x = innerWidth > 760 ? 2.8 : 0;
    }
    addEventListener('resize', resize); resize();

    const clock = new THREE.Clock();

    (function tick() {
      const t = clock.getElapsedTime();

      crystal.rotation.y = t * 0.1 + mx * 0.42;
      crystal.rotation.x = t * 0.055 + my * 0.24;

      orbs.forEach(m => {
        m.userData.angle += m.userData.speed * 0.012;
        const a = m.userData.angle;
        m.position.x = Math.cos(a) * m.userData.radius;
        m.position.z = Math.sin(a) * m.userData.radius;
        m.position.y = Math.sin(a * 0.7 + m.userData.tilt) * 0.72;
        m.rotation.y = t * 2.2;
      });

      wireMat.opacity = 0.2 + Math.sin(t * 0.85) * 0.11;
      glowMat.opacity = 0.07 + Math.sin(t * 0.55) * 0.06;

      camera.position.x += (mx * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    })();
  })();
} catch (e) {
  console.warn('Three.js error (planos):', e);
}
