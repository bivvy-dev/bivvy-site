// ========================================
// ATMOSPHERE SYSTEM (shared across pages)
// ========================================

const config = {
  staticStars: 120,
  twinkleStars: 15,
  colors: {
    stages: [
      { lime: '#c8ff00', purple: '#a78bfa', teal: '#2dd4bf', coral: '#ff6b4a' },
      { lime: '#22d3ee', purple: '#f472b6', teal: '#a78bfa', coral: '#fbbf24' },
      { lime: '#f472b6', purple: '#22d3ee', teal: '#fbbf24', coral: '#a78bfa' },
    ]
  }
};

// --- LAYER 1: Static Stars ---
const starsStatic = document.getElementById('stars-static');
if (starsStatic) {
  for (let i = 0; i < config.staticStars; i++) {
    const star = document.createElement('div');
    const isBright = Math.random() > 0.85;
    star.className = 'star-static' + (isBright ? ' bright' : '');
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    starsStatic.appendChild(star);
  }
}

// --- LAYER 2: Twinkling Stars ---
const starsTwinkle = document.getElementById('stars-twinkle');
if (starsTwinkle) {
  for (let i = 0; i < config.twinkleStars; i++) {
    const star = document.createElement('div');
    star.className = 'star-twinkle';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 80}%`;
    star.style.setProperty('--twinkle-duration', `${4 + Math.random() * 4}s`);
    star.style.setProperty('--twinkle-delay', `${Math.random() * 5}s`);
    starsTwinkle.appendChild(star);
  }
}

// --- LAYER 2b: Flickering Stars (JS-driven state cycling) ---
const starsFlicker = document.getElementById('stars-flicker');
const flickerStarCount = 35;
const flickerStars = [];

if (starsFlicker) {
  for (let i = 0; i < flickerStarCount; i++) {
    const star = document.createElement('div');
    star.className = 'star-flicker';
    star.dataset.state = 'off';
    const baseOpacity = 0.05 + Math.random() * 0.2;
    const size = 1 + Math.random() * 1.5;
    star.style.setProperty('--transition-duration', `${150 + Math.random() * 400}ms`);
    star.style.setProperty('--star-base-opacity', baseOpacity);
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    starsFlicker.appendChild(star);
    flickerStars.push(star);
  }

  function flickerTwinkle() {
    const r = Math.random();
    if (r < 0.12) { scheduleNext(); return; }
    const count = r > 0.85 ? 4 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const star = flickerStars[Math.floor(Math.random() * flickerStars.length)];
      star.style.setProperty('--transition-duration', `${80 + Math.random() * 500}ms`);
      const intensity = Math.random();
      if (intensity > 0.7) { star.dataset.state = 'high'; }
      else if (intensity > 0.3) { star.dataset.state = 'medium'; }
      else { star.dataset.state = 'low'; }
      const holdTime = 100 + Math.random() * 1200;
      if (Math.random() > 0.6 && star.dataset.state === 'high') {
        setTimeout(() => { star.dataset.state = 'medium'; }, holdTime * 0.5);
        setTimeout(() => { star.dataset.state = 'low'; }, holdTime * 0.8);
        setTimeout(() => { star.dataset.state = 'off'; }, holdTime);
      } else {
        setTimeout(() => { star.dataset.state = 'off'; }, holdTime);
      }
    }
    scheduleNext();
  }

  function scheduleNext() {
    const delay = Math.random() < 0.15 ? 300 + Math.random() * 500 : 60 + Math.random() * 200;
    setTimeout(flickerTwinkle, delay);
  }

  flickerTwinkle();
}

// --- LAYER 3: Color Blurs with Parallax ---
const blurs = document.querySelectorAll('.color-blur');
const blursContainer = document.getElementById('blurs-container');

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

const blurData = Array.from(blurs).map(blur => ({
  el: blur,
  parallax: parseFloat(blur.dataset.parallax) || 0.05,
}));

document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// --- SCROLL HANDLING ---
let scrollY = 0;
let targetScrollY = 0;
const maxScroll = () => document.body.scrollHeight - window.innerHeight;

window.addEventListener('scroll', () => {
  targetScrollY = window.scrollY;
}, { passive: true });

// --- COLOR INTERPOLATION ---
function lerp(a, b, t) { return a + (b - a) * t; }

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function lerpColor(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  return `rgb(${Math.round(lerp(c1.r, c2.r, t))}, ${Math.round(lerp(c1.g, c2.g, t))}, ${Math.round(lerp(c1.b, c2.b, t))})`;
}

function getScrollColors(scrollPercent) {
  const stages = config.colors.stages;
  const stageCount = stages.length - 1;
  const stageProgress = scrollPercent * stageCount;
  const stageIndex = Math.min(Math.floor(stageProgress), stageCount - 1);
  const t = stageProgress - stageIndex;
  return {
    lime: lerpColor(stages[stageIndex].lime, stages[stageIndex + 1].lime, t),
    purple: lerpColor(stages[stageIndex].purple, stages[stageIndex + 1].purple, t),
    teal: lerpColor(stages[stageIndex].teal, stages[stageIndex + 1].teal, t),
    coral: lerpColor(stages[stageIndex].coral, stages[stageIndex + 1].coral, t)
  };
}

// --- MAIN ANIMATION LOOP ---
function animate() {
  scrollY = lerp(scrollY, targetScrollY, 0.1);
  const scrollPercent = Math.min(scrollY / maxScroll(), 1);

  mouseX = lerp(mouseX, targetMouseX, 0.08);
  mouseY = lerp(mouseY, targetMouseY, 0.08);

  blurData.forEach(({ el, parallax }) => {
    const moveX = mouseX * 100 * parallax;
    const moveY = mouseY * 60 * parallax;
    el.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  const colors = getScrollColors(scrollPercent);
  const blur1 = document.querySelector('.blur-1');
  const blur2 = document.querySelector('.blur-2');
  const blur3 = document.querySelector('.blur-3');
  const blur4 = document.querySelector('.blur-4');
  if (blur1) blur1.style.backgroundColor = colors.lime;
  if (blur2) blur2.style.backgroundColor = colors.purple;
  if (blur3) blur3.style.backgroundColor = colors.teal;
  if (blur4) blur4.style.backgroundColor = colors.coral;

  if (starsStatic) starsStatic.style.opacity = Math.max(0.15, 1 - scrollPercent * 1.5);
  if (starsFlicker) starsFlicker.style.opacity = Math.max(0.15, 1 - scrollPercent * 1.5);

  requestAnimationFrame(animate);
}

animate();
