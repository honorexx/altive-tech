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
(function(){
  var c=document.getElementById('particles-canvas'),ctx=c.getContext('2d'),W,H,ps=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  function P(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*1.4+0.8;this.vx=(Math.random()-.5)*.25;this.vy=-(Math.random()*.3+.05);this.life=Math.random();this.decay=Math.random()*.003+.0015;this.blue=Math.random()>.7;}
  P.prototype.reset=function(){this.x=Math.random()*W;this.y=H+5;this.life=1;};
  for(var i=0;i<80;i++){ps.push(new P());}
  function draw(){
    ctx.clearRect(0,0,W,H);
    ps.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;p.life-=p.decay;
      if(p.life<=0||p.y<-5)p.reset();
      ctx.save();ctx.globalAlpha=Math.max(0,p.life)*.9;
      ctx.shadowBlur=p.blue?8:4;ctx.shadowColor=p.blue?'#00d4ff':'#aaccff';
      ctx.fillStyle=p.blue?'rgba(0,212,255,1)':'rgba(180,220,255,1)';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);resize();draw();
})();
