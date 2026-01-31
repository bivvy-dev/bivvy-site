// ========================================
// ATMOSPHERE SYSTEM
// ========================================

const config = {
  staticStars: 120,
  twinkleStars: 15,
  colors: {
    // Color palettes for scroll-based shifting
    stages: [
      { lime: '#c8ff00', purple: '#a78bfa', teal: '#2dd4bf', coral: '#ff6b4a' }, // Top
      { lime: '#22d3ee', purple: '#f472b6', teal: '#a78bfa', coral: '#fbbf24' }, // Mid - more dramatic shift
      { lime: '#f472b6', purple: '#22d3ee', teal: '#fbbf24', coral: '#a78bfa' }, // Deep - colors swap around
    ]
  }
};

// --- LAYER 1: Static Stars ---
const starsStatic = document.getElementById('stars-static');

for (let i = 0; i < config.staticStars; i++) {
  const star = document.createElement('div');
  const isBright = Math.random() > 0.85;
  star.className = 'star-static' + (isBright ? ' bright' : '');
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  // Size variation: 1px to 3px (matching twinkling star range)
  const size = 1 + Math.random() * 2;
  star.style.setProperty('--star-size', `${size}px`);
  // Opacity variation: 0.5 to 0.9
  const opacity = 0.5 + Math.random() * 0.4;
  star.style.setProperty('--star-opacity', opacity);
  starsStatic.appendChild(star);
}

// --- LAYER 2: Twinkling Stars ---
const starsTwinkle = document.getElementById('stars-twinkle');

for (let i = 0; i < config.twinkleStars; i++) {
  const star = document.createElement('div');
  star.className = 'star-twinkle';
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 80}%`;
  // Size variation: 1px to 3px
  const size = 1 + Math.random() * 2;
  star.style.setProperty('--star-size', `${size}px`);
  star.style.setProperty('--twinkle-duration', `${4 + Math.random() * 4}s`);
  star.style.setProperty('--twinkle-delay', `${Math.random() * 5}s`);
  starsTwinkle.appendChild(star);
}

// --- LAYER 3: Color Blurs with Parallax ---
const blurs = document.querySelectorAll('.color-blur');
const blursContainer = document.getElementById('blurs-container');

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// Store original positions
const blurData = Array.from(blurs).map(blur => ({
  el: blur,
  parallax: parseFloat(blur.dataset.parallax) || 0.05,
  offsetX: 0,
  offsetY: 0
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
function lerp(a, b, t) {
  return a + (b - a) * t;
}

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

  const r = Math.round(lerp(c1.r, c2.r, t));
  const g = Math.round(lerp(c1.g, c2.g, t));
  const b = Math.round(lerp(c1.b, c2.b, t));

  return `rgb(${r}, ${g}, ${b})`;
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

// --- SPARK PERIOD ---
const sparkPeriod = document.querySelector('[data-spark-period]');
let periodSparked = false;

function checkPeriodSpark() {
  if (periodSparked || !sparkPeriod) return;

  const rect = sparkPeriod.getBoundingClientRect();
  const triggerPoint = window.innerHeight * 0.8;

  if (rect.top < triggerPoint && rect.bottom > 0) {
    periodSparked = true;
    sparkPeriod.classList.add('sparked');
  }
}

// --- SEQUENTIAL STAR LIST ---
const demoFeatures = document.getElementById('demo-features');
let starsTriggered = false;

function checkSequentialStars() {
  if (starsTriggered || !demoFeatures) return;

  const rect = demoFeatures.getBoundingClientRect();
  const triggerPoint = window.innerHeight * 0.7;

  if (rect.top < triggerPoint && rect.bottom > 0) {
    starsTriggered = true;

    const listItems = demoFeatures.querySelectorAll('[data-star-sequence]');
    listItems.forEach((item, index) => {
      const star = item.querySelector('.list-star');
      if (star) {
        setTimeout(() => {
          star.classList.add('visible');
        }, index * 300); // 300ms stagger for gentle sequential reveal
      }
    });
  }
}

// --- FEATURE CARD SPARKS (on scroll) ---
const featureCards = document.querySelectorAll('.feature-card h3[data-spark]');
const sparkedFeatures = new Set();

function checkFeatureCardSparks() {
  featureCards.forEach(el => {
    if (sparkedFeatures.has(el)) return;

    const rect = el.getBoundingClientRect();
    const triggerPoint = window.innerHeight * 0.75;

    if (rect.top < triggerPoint && rect.bottom > 0) {
      sparkedFeatures.add(el);
      // Add a subtle glow effect to the heading
      el.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
      setTimeout(() => {
        el.style.textShadow = 'none';
        el.style.transition = 'text-shadow 0.5s ease';
      }, 500);
    }
  });
}

// --- LANGUAGE PILLS BORDER SHINE ---
const languagesSection = document.querySelector('.languages');
const langPills = document.querySelectorAll('.lang-pill');
let pillsShone = false;

function checkLanguagePillsShine() {
  if (pillsShone || !languagesSection) return;

  const rect = languagesSection.getBoundingClientRect();
  const triggerPoint = window.innerHeight * 0.65;

  if (rect.top < triggerPoint && rect.bottom > 0) {
    pillsShone = true;

    // Stagger the shine effect across all pills
    langPills.forEach((pill, index) => {
      setTimeout(() => {
        pill.classList.add('shining');
      }, index * 30); // 30ms stagger for a quick wave
    });
  }
}

// --- MAIN ANIMATION LOOP ---
function animate() {
  // Smooth scroll tracking
  scrollY = lerp(scrollY, targetScrollY, 0.1);
  const scrollPercent = Math.min(scrollY / maxScroll(), 1);

  // Smooth mouse tracking
  mouseX = lerp(mouseX, targetMouseX, 0.08);
  mouseY = lerp(mouseY, targetMouseY, 0.08);

  // Update blur positions (mouse parallax)
  blurData.forEach(({ el, parallax }) => {
    const moveX = mouseX * 100 * parallax;
    const moveY = mouseY * 60 * parallax;
    el.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  // Update blur colors (scroll-based) - more aggressive application
  const colors = getScrollColors(scrollPercent);
  const blur1 = document.querySelector('.blur-1');
  const blur2 = document.querySelector('.blur-2');
  const blur3 = document.querySelector('.blur-3');
  const blur4 = document.querySelector('.blur-4');

  if (blur1) blur1.style.backgroundColor = colors.lime;
  if (blur2) blur2.style.backgroundColor = colors.purple;
  if (blur3) blur3.style.backgroundColor = colors.teal;
  if (blur4) blur4.style.backgroundColor = colors.coral;

  // Dim static stars as user scrolls
  const starDim = Math.max(0.15, 1 - scrollPercent * 1.5);
  starsStatic.style.opacity = starDim;

  // Check for spark triggers
  checkPeriodSpark();
  checkSequentialStars();
  checkFeatureCardSparks();
  checkLanguagePillsShine();

  requestAnimationFrame(animate);
}

animate();

// --- COPY BUTTON ---
document.querySelector('.copy-btn').addEventListener('click', () => {
  navigator.clipboard.writeText('curl -fsSL https://bivvy.dev/install.sh | sh');
  const btn = document.querySelector('.copy-btn');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  setTimeout(() => {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  }, 2000);
});



