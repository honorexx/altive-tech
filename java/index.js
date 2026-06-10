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

    /* ── Shader blob orgânico ── */
    const noise = `
      vec3 _m3(vec3 x){return x-floor(x*(1./289.))*289.;}
      vec4 _m4(vec4 x){return x-floor(x*(1./289.))*289.;}
      vec4 _pm(vec4 x){return _m4(((x*34.)+1.)*x);}
      vec4 _ti(vec4 r){return 1.79284291400159-.85373472095314*r;}
      float snoise(vec3 v){
        const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
        vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
        vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
        vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
        i=_m3(i);
        vec4 p=_pm(_pm(_pm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
        float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
        vec4 xv=x_*ns.x+ns.yyyy;vec4 yv=y_*ns.x+ns.yyyy;vec4 h=1.-abs(xv)-abs(yv);
        vec4 b0=vec4(xv.xy,yv.xy);vec4 b1=vec4(xv.zw,yv.zw);
        vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
        vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=_ti(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
        vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m*=m;
        return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
      }`;

    /* ── Montanha: silhueta do logo via ExtrudeGeometry ── */
    const mShape = new THREE.Shape();
    // pico central (topo)
    mShape.moveTo(0, 4.2);
    // lado direito externo descendo
    mShape.lineTo(1.3, 1.9);
    // mini pico direito
    mShape.lineTo(2.0, -0.1);
    mShape.lineTo(2.5,  0.6);
    mShape.lineTo(3.0, -0.2);
    mShape.lineTo(4.3, -1.0);
    // base direita
    mShape.lineTo(3.2, -1.0);
    // curva base (swoosh)
    mShape.quadraticCurveTo(0, -0.2, -3.2, -1.0);
    // base esquerda
    mShape.lineTo(-4.3, -1.0);
    // mini pico esquerdo
    mShape.lineTo(-3.0, -0.2);
    mShape.lineTo(-2.5,  0.6);
    mShape.lineTo(-2.0, -0.1);
    mShape.lineTo(-1.3,  1.9);
    mShape.closePath();

    // buraco interior do "A" (chevron azul)
    const hole = new THREE.Path();
    hole.moveTo(0, 3.4);
    hole.lineTo( 1.0, 1.9);
    hole.lineTo( 1.8, -0.5);
    hole.lineTo( 0.5,  0.5);
    hole.lineTo( 0,  0.0);
    hole.lineTo(-0.5,  0.5);
    hole.lineTo(-1.8, -0.5);
    hole.lineTo(-1.0,  1.9);
    hole.closePath();
    mShape.holes.push(hole);

    const mGeoExtrude = new THREE.ExtrudeGeometry(mShape, {
      depth: 0.6, bevelEnabled: true,
      bevelThickness: 0.35, bevelSize: 0.22, bevelSegments: 8
    });

    const bU = { uTime:{value:0}, uAmp:{value:.18}, uOpacity:{value:1}, uColorA:{value:BLUE.clone()}, uColorB:{value:CYAN.clone()} };
    const bVert = noise + `
      uniform float uTime,uAmp; varying vec3 vNormal,vView; varying float vNoise;
      void main(){
        float n=snoise(position*.7+uTime*.3)+snoise(position*1.8-uTime*.18)*.25;
        vNoise=n; vec3 np=position+normal*n*uAmp;
        vec4 mv=modelViewMatrix*vec4(np,1.);
        vNormal=normalize(normalMatrix*normal); vView=normalize(-mv.xyz);
        gl_Position=projectionMatrix*mv;
      }`;
    const bFrag = `
      uniform vec3 uColorA,uColorB; uniform float uOpacity;
      varying vec3 vNormal,vView; varying float vNoise;
      void main(){
        float fr=pow(1.-abs(dot(vNormal,vView)),2.0);
        vec3 col=mix(uColorA,uColorB,vNoise*.5+.5)+fr*1.1;
        gl_FragColor=vec4(col,(0.08+fr*0.92)*uOpacity);
      }`;

    const blobGroup = new THREE.Group();
    blobGroup.add(new THREE.Mesh(mGeoExtrude,
      new THREE.ShaderMaterial({ uniforms:bU, vertexShader:bVert, fragmentShader:bFrag,
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide })));
    blobGroup.position.set(0, -0.5, 0);
    scene.add(blobGroup);

    /* ── Morphing particles ── */
    const P = isMobile ? 800 : 1800;

    function sphere()  { const a=new Float32Array(P*3); for(let i=0;i<P;i++){const u=Math.random()*2-1,t=Math.random()*Math.PI*2,r=5.4,s=Math.sqrt(1-u*u);a[i*3]=r*s*Math.cos(t);a[i*3+1]=r*u;a[i*3+2]=r*s*Math.sin(t)-2;} return a; }
    function grid()    { const a=new Float32Array(P*3),s=Math.ceil(Math.sqrt(P)); for(let i=0;i<P;i++){const x=i%s,y=Math.floor(i/s);a[i*3]=(x/s-.5)*16;a[i*3+1]=(y/s-.5)*9;a[i*3+2]=-3+Math.sin(x*.5)*Math.cos(y*.5)*.8;} return a; }
    function helix()   { const a=new Float32Array(P*3); for(let i=0;i<P;i++){const t=i/P*Math.PI*8,x=i/P*16-8,s=i%2?1:-1;a[i*3]=x;a[i*3+1]=Math.sin(t)*1.6*s;a[i*3+2]=Math.cos(t)*1.6*s-2;} return a; }
    function diamond() { const a=new Float32Array(P*3); for(let i=0;i<P;i++){let x=Math.random()*2-1,y=Math.random()*2-1,z=Math.random()*2-1;const m=Math.abs(x)+Math.abs(y)+Math.abs(z)||1,r=4.6;a[i*3]=x/m*r;a[i*3+1]=y/m*r;a[i*3+2]=z/m*r-2;} return a; }
    function knot()    { const a=new Float32Array(P*3); for(let i=0;i<P;i++){const t=i/P*Math.PI*2,p=2,q=3,r=2.6,rr=Math.cos(q*t)+2;a[i*3]=r*rr*Math.cos(p*t)*.8;a[i*3+1]=r*rr*Math.sin(p*t)*.8;a[i*3+2]=r*Math.sin(q*t)-2;} return a; }

    const shapes = [sphere(), grid(), helix(), diamond(), knot()];
    const colors = [BLUE.clone(), CYAN.clone(), new THREE.Color(0x0066ff), BLUE.clone(), CYAN.clone()];

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

      bU.uTime.value = t;
      bU.uAmp.value  = 0.45 + Math.sin(t * 0.7) * 0.08 + my * 0.15;
      blobGroup.rotation.y = t * 0.08 + mx * 0.4;
      blobGroup.rotation.x = my * 0.2;

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
