const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('.nav-menu');
const themeButtons=document.querySelectorAll('[data-theme-value]');
let savedTheme='light';
try{const storedTheme=localStorage.getItem('altive-theme');if(storedTheme==='light'||storedTheme==='dark')savedTheme=storedTheme}catch{}
function applyTheme(theme){document.documentElement.dataset.theme=theme;try{localStorage.setItem('altive-theme',theme)}catch{}themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeValue===theme)))}
applyTheme(savedTheme);
themeButtons.forEach(button=>button.addEventListener('click',()=>applyTheme(button.dataset.themeValue)));
if(menuButton&&menu){menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}))}
const revealItems=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});revealItems.forEach(item=>observer.observe(item))}else{revealItems.forEach(item=>item.classList.add('visible'))}
document.querySelectorAll('.service-card,.plan').forEach(card=>card.addEventListener('pointermove',event=>{const box=card.getBoundingClientRect();card.style.setProperty('--pointer-x',`${event.clientX-box.left}px`);card.style.setProperty('--pointer-y',`${event.clientY-box.top}px`)}));
