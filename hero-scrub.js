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

  // Distinct storytelling typography for each of the nine verified photographs.
  const stories = [
    ['Give your hair','a little more care.','A simple daily-care essential, inspired by nature.'],
    ['From nature,','with intention.','Discover the botanical inspiration behind every ritual.'],
    ['Small moments.','Beautiful care.','Make space for a routine that feels like your own.'],
    ['A little oil.','A lot of care.','Take the time to nourish and condition your hair.'],
    ['Thoughtfully','botanical.','Familiar oils and plants, brought together for everyday care.'],
    ['Your hair.','Your ritual.','Build a consistent routine with care that feels good.'],
    ['Take time','for yourself.','A few quiet moments can make your routine feel special.'],
    ['Nature in','every detail.','Explore the botanicals that inspire Authentic Naturals.'],
    ['Meet your','everyday essential.','Discover Hair Repair & Revive Growth Oil and how to use it.']
  ];
  // URLs, not image objects, are retained; on phones only the current and nearest frames are decoded.
  const ready = new Set();
  const failed = new Set();
  const inFlight = new Map();
  let latestProgress = 0;
  let currentIndex = -1;
  let displayedStory = 0;
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
  function showStory(index) {
    if (index === displayedStory) return;
    displayedStory = index;
    const story = stories[index];
    const reverse = index % 2 === 1;
    gsap.killTweensOf([copy,headline,description]);
    // Change copy synchronously so fast forward/reverse scroll never reveals stale text.
    headline.replaceChildren(document.createTextNode(story[0] + ' '));
    const emphasis = document.createElement('em');
    emphasis.textContent = story[1];
    headline.appendChild(emphasis);
    // Highlight one meaningful phrase without parsing dynamic text as HTML.
    const highlightPhrases = [
      'daily-care essential','botanical inspiration','routine that feels like your own',
      'nourish and condition','everyday care','consistent routine',
      'quiet moments','botanicals','Hair Repair & Revive Growth Oil'
    ];
    const phrase = highlightPhrases[index] || '';
    const position = phrase ? story[2].indexOf(phrase) : -1;
    if (position < 0) {
      description.textContent = story[2];
    } else {
      const accent = document.createElement('strong');
      accent.className = 'copy-accent';
      accent.textContent = phrase;
      description.replaceChildren(
        document.createTextNode(story[2].slice(0,position)),
        accent,
        document.createTextNode(story[2].slice(position+phrase.length))
      );
    }
    stage.dataset.story = String(index+1);
    const mobileNow = window.matchMedia('(max-width: 900px)').matches;
    gsap.fromTo(headline,{autoAlpha:0,x:mobileNow?0:(reverse?22:-22),y:mobileNow?14:0},
      {autoAlpha:1,x:0,y:0,duration:0.48,ease:'power2.out',overwrite:true});
    gsap.fromTo(description,{autoAlpha:0,y:16},{autoAlpha:1,y:0,duration:0.6,delay:0.09,ease:'power2.out',overwrite:true});
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
    // On phones, limit speculative decoding to the immediate next frame.
    if (!mobile && lower+2 < frames.length) preload(lower+2);

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
    // Composite-only progress animation: no repeated width/layout calculations.
    progressFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    progressCount.textContent = String(lower+1).padStart(2,'0') + ' / ' + String(frames.length).padStart(2,'0');
    showStory(lower);
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
      scrub:mobile ? 0.12 : 0.2,
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
