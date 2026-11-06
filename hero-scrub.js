'use strict';
/* Authentic Naturals immersive photographic story.
   Desktop: pinned GSAP scrub. Mobile: short pin OR autoplay (no huge blank gaps). */
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
    'process-05.png','process-06.png','process-08.png','botanicals.png','ritual.png','product.png'
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

  const stories = [
    ['Give your hair','a little more care.','A simple daily-care essential, inspired by nature.'],
    ['From nature,','with intention.','Discover the botanical inspiration behind every ritual.'],
    ['Small moments.','Beautiful care.','Make space for a routine that feels like your own.'],
    ['A little oil.','A lot of care.','Take the time to nourish and condition your hair.'],
    ['Thoughtfully','botanical.','Familiar oils and plants, brought together for everyday care.'],
    ['Your hair.','Your ritual.','Build a consistent routine with care that feels good.'],
    ['Take time','for yourself.','A few quiet moments can make your routine feel special.'],
    ['Nature in','every detail.','Explore the botanicals that inspire Authentic Naturals.'],
    ['Meet your','everyday essential.','Discover Hair Repair & Revive Growth Oil and how to use it.'],
    ['Meet the oil.','Make it your ritual.','Explore Authentic Naturals Hair Repair & Revive Growth Oil, made for an everyday conditioning ritual.']
  ];
  const ready = new Set();
  const failed = new Set();
  const inFlight = new Map();
  let latestProgress = 0;
  let currentIndex = -1;
  let displayedStory = 0;
  let trigger = null;
  let autoTimer = null;
  let mobile = window.matchMedia('(max-width: 900px)').matches;
  let phone = window.matchMedia('(max-width: 720px)').matches;

  function preload(i) {
    if (i < 0 || i >= frames.length || ready.has(i) || failed.has(i)) return Promise.resolve(ready.has(i));
    if (inFlight.has(i)) return inFlight.get(i);
    if (i === 0) {
      if (firstLayer.complete) {
        if (firstLayer.naturalWidth > 0) { ready.add(0); return Promise.resolve(true); }
        failed.add(0); return Promise.resolve(false);
      }
      return new Promise(resolve => {
        firstLayer.addEventListener('load', () => { ready.add(0); resolve(true); }, {once:true});
        firstLayer.addEventListener('error', () => { failed.add(0); resolve(false); }, {once:true});
      });
    }
    const pending = new Promise(resolve => {
      const picture = new Image();
      picture.onload = () => {
        ready.add(i); inFlight.delete(i); resolve(true);
        if (trigger) render(latestProgress);
      };
      picture.onerror = () => {
        failed.add(i); inFlight.delete(i); resolve(false);
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
    headline.replaceChildren(document.createTextNode(story[0] + ' '));
    const emphasis = document.createElement('em');
    emphasis.textContent = story[1];
    headline.appendChild(emphasis);
    const highlightPhrases = [
      'daily-care essential','botanical inspiration','routine that feels like your own',
      'nourish and condition','everyday care','consistent routine',
      'quiet moments','botanicals','Hair Repair & Revive Growth Oil','everyday conditioning ritual'
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

    preload(lower);
    if (p > 0.008 && upper !== lower) preload(upper);

    const displayIndex = ready.has(lower) ? lower : currentIndex;
    if (displayIndex >= 0 && displayIndex !== currentIndex) {
      firstLayer.src = frames[displayIndex];
      stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[displayIndex] + '")');
      currentIndex = displayIndex;
    }
    if (ready.has(upper) && upper !== displayIndex && ready.has(lower)) {
      if (secondLayer.getAttribute('src') !== frames[upper]) secondLayer.src = frames[upper];
      secondLayer.style.opacity = String(rawIndex - lower);
    } else {
      secondLayer.style.opacity = '0';
    }
    progressFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    progressCount.textContent = String(Math.max(0,displayIndex)+1).padStart(2,'0') + ' / ' + String(frames.length).padStart(2,'0');
    showStory(Math.max(0,displayIndex));
  }

  function showFrameIndex(index) {
    const i = ((index % frames.length) + frames.length) % frames.length;
    preload(i).then(() => {
      firstLayer.src = frames[i];
      stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[i] + '")');
      currentIndex = i;
      secondLayer.style.opacity = '0';
      progressFill.style.transform = 'scaleX(' + (i / (frames.length - 1)).toFixed(4) + ')';
      progressCount.textContent = String(i+1).padStart(2,'0') + ' / ' + String(frames.length).padStart(2,'0');
      showStory(i);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    let i = Math.max(0, currentIndex);
    autoTimer = setInterval(() => {
      i = (i + 1) % frames.length;
      showFrameIndex(i);
    }, 3800);
  }
  function stopAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  preload(0).then(ok => {
    if (!ok) { document.documentElement.classList.remove('hero-boot'); return; }
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    firstLayer.src = frames[0];
    stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[0] + '")');
    currentIndex = 0;
    firstLayer.removeAttribute('loading');
    document.documentElement.classList.add('has-gsap-hero');
    hero.classList.remove('reveal');
    hero.classList.add('gsap-hero-enabled');
    hero.style.removeProperty('transform');
    stage.style.willChange = 'auto';
    render(0);

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!(connection && (connection.saveData || /2g/.test(connection.effectiveType || '')))) {
      const warm = () => preload(1);
      if ('requestIdleCallback' in window) requestIdleCallback(warm, {timeout:2400});
      else window.addEventListener('load', warm, {once:true});
    }

    mobile = window.matchMedia('(max-width: 900px)').matches;
    phone = window.matchMedia('(max-width: 720px)').matches;

    // Phones: autoplay frames (no long pinned blank gap). Tablets+: short pin scrub.
    if (phone) {
      document.documentElement.classList.add('hero-mobile-autoplay');
      const hint = stage.querySelector('.scrub-hint');
      if (hint) hint.textContent = 'Story plays automatically · swipe page to continue';
      startAutoplay();
      // Pause when off-screen
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) startAutoplay();
            else stopAutoplay();
          });
        }, { threshold: 0.35 });
        io.observe(stage);
      }
      // Touch: advance frame on horizontal swipe on stage
      let sx = 0;
      stage.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) < 40) return;
        stopAutoplay();
        const next = currentIndex + (dx < 0 ? 1 : -1);
        showFrameIndex(next);
        startAutoplay();
      }, { passive: true });
    } else {
      trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        // Much shorter on tablet so content below is not buried under empty pin space
        end: () => '+=' + Math.max(mobile ? 900 : 2300, Math.round(window.innerHeight * (mobile ? 1.55 : 5))),
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: mobile ? 0.15 : 0.2,
        onUpdate: self => render(self.progress),
        onRefresh: self => render(self.progress)
      });
      const refresh = () => ScrollTrigger.refresh(true);
      window.addEventListener('pageshow', refresh);
      window.addEventListener('load', refresh, { once: true });
      window.addEventListener('orientationchange', () => {
        setTimeout(refresh, 200);
      });
      refresh();
    }
  });
})();
