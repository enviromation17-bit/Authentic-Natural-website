'use strict';
/* Authentic Naturals immersive photographic story.
   Seven uploaded process frames + botanicals.png + ritual.png.
   Full viewport imagery, scroll-linked typography, lazy frame decoding,
   and an intact original-carousel fallback if GSAP or the first photo fails. */
(function () {
  const hero = document.querySelector('main > .hero');
  const stage = document.getElementById('gsap-hero-stage');
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!hero || !stage || !gsap || !ScrollTrigger) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  const filenames = [
    'process-01.png','process-02.png','process-03.png','process-04.png',
    'process-05.png','process-06.png','process-08.png','botanicals.png','ritual.png'
  ];
  const frames = filenames.map(name => 'public/assets/' + name);
  const firstLayer = document.getElementById('scrub-current');
  const secondLayer = document.getElementById('scrub-next');
  const progressFill = document.getElementById('scrub-progress-fill');
  const progressCount = document.getElementById('scrub-frame-counter');
  const headline = document.getElementById('scrub-title');
  const description = document.getElementById('scrub-description');
  const copy = stage.querySelector('.scrub-copy');
  if (![firstLayer,secondLayer,progressFill,progressCount,headline,description,copy].every(Boolean)) return;

  const chapters = [
    ['Give your hair', 'a little more care.', 'Discover a more beautiful way to make botanical hair care part of your everyday routine.'],
    ['Inspired by', 'the natural world.', 'A thoughtful blend of familiar oils and botanicals for conditioning care.'],
    ['Your ritual.', 'Your moment.', 'Make time for your hair with a simple, nourishing weekly routine.'],
    ['Discover the', 'Authentic difference.', 'Explore the blend, learn the ritual and find your everyday essential.']
  ];
  // URLs, not image objects, are retained; on phones only the current and nearest frames are decoded.
  const ready = new Set();
  const failed = new Set();
  const inFlight = new Map();
  let latestProgress = 0;
  let currentIndex = -1;
  let chapter = 0;
  let textTween = null;
  let trigger = null;
  let mobile = window.matchMedia('(max-width: 900px)').matches;

  function preload(i) {
    if (i < 0 || i >= frames.length || ready.has(i) || failed.has(i)) return Promise.resolve(ready.has(i));
    if (inFlight.has(i)) return inFlight.get(i);
    const pending = new Promise(resolve => {
      const picture = new Image();
      picture.onload = () => {
        ready.add(i);
        inFlight.delete(i);
        resolve(true);
        if (trigger) render(latestProgress);
      };
      picture.onerror = () => {
        failed.add(i);
        inFlight.delete(i);
        resolve(false);
        if (trigger) render(latestProgress);
      };
      picture.src = frames[i];
    });
    inFlight.set(i,pending);
    return pending;
  }
  function captionFor(progress) {
    return Math.min(chapters.length - 1,Math.floor(progress * chapters.length));
  }
  function showChapter(index) {
    if (index === chapter) return;
    chapter = index;
    if (textTween) textTween.kill();
    // Kill earlier opacity tweens to prevent rapid-scroll race conditions.
    gsap.killTweensOf(copy);
    textTween = gsap.to(copy,{opacity:0.65,duration:0.12,overwrite:true,onComplete:()=>{
      headline.replaceChildren(document.createTextNode(chapters[index][0]+' '));
      const italic = document.createElement('em');
      italic.textContent = chapters[index][1];
      headline.appendChild(italic);
      description.textContent = chapters[index][2];
      textTween = gsap.to(copy,{opacity:1,duration:0.25,overwrite:true});
    }});
  }
  function render(progress) {
    const p = Math.min(1,Math.max(0,progress));
    latestProgress = p;
    const rawIndex = p * (frames.length - 1);
    const lower = Math.min(frames.length-1,Math.floor(rawIndex));
    const upper = Math.min(frames.length-1,lower+1);

    // Load only the frames needed immediately; prefetch their neighbours.
    preload(lower);
    preload(upper);
    if (lower+2 < frames.length) preload(lower+2);

    const displayIndex = ready.has(lower) ? lower : currentIndex;
    if (displayIndex >= 0 && displayIndex !== currentIndex) {
      firstLayer.src = frames[displayIndex];
      currentIndex = displayIndex;
    }
    if (ready.has(upper) && upper !== displayIndex && ready.has(lower)) {
      if (secondLayer.getAttribute('src') !== frames[upper]) secondLayer.src = frames[upper];
      secondLayer.style.opacity = String(rawIndex - lower);
    } else {
      secondLayer.style.opacity = '0';
    }
    progressFill.style.width = (p*100).toFixed(3) + '%';
    progressCount.textContent = String(lower+1).padStart(2,'0') + ' / ' + String(frames.length).padStart(2,'0');
    showChapter(captionFor(p));
  }

  preload(0).then(ok => {
    if (!ok || !gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    firstLayer.src = frames[0];
    currentIndex = 0;
    firstLayer.removeAttribute('loading');
    // Establish proper stage dimensions before ScrollTrigger measures positions.
    document.documentElement.classList.add('has-gsap-hero');
    hero.classList.remove('reveal');
    hero.classList.add('gsap-hero-enabled');
    hero.style.removeProperty('transform');
    stage.style.willChange = 'auto';
    render(0);

    trigger = ScrollTrigger.create({
      trigger:stage,
      start:'top top',
      end:()=>'+='+Math.max(mobile ? 1500 : 2300, Math.round(window.innerHeight*(mobile ? 3.1 : 5))),
      pin:stage,
      pinSpacing:true,
      anticipatePin:1,
      invalidateOnRefresh:true,
      scrub:0.2,
      onUpdate:self=>render(self.progress),
      onRefresh:self=>render(self.progress)
    });
    const refresh = () => ScrollTrigger.refresh(true);
    window.addEventListener('pageshow',refresh);
    window.addEventListener('load',refresh,{once:true});
    // Re-evaluate pin distance on rotation; do not create duplicate triggers.
    window.addEventListener('orientationchange',refresh);
    refresh();
  });
})();
