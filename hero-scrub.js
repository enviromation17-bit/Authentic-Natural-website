'use strict';
/* Authentic Naturals — hero story
   Desktop: long pin scrub. Mobile: SHORT pin scrub (no blank gaps) + light swipe assist.
   Performance-minded preloading and reduced mobile filter cost.
*/
(function () {
  const hero = document.querySelector('main > .hero');
  const stage = document.getElementById('gsap-hero-stage');
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!hero || !stage || !gsap) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  const filenames = [
    'process-01.png','process-02.png','process-03.png','process-04.png',
    'process-05.png','process-06.png','process-08.png','botanicals.png','ritual.png','product.png'
  ];
  const frames = filenames.map(function (name) {
    return 'public/assets/' + name;
  });
  const firstLayer = document.getElementById('scrub-current');
  const secondLayer = document.getElementById('scrub-next');
  const progressFill = document.getElementById('scrub-progress-fill');
  const progressCount = document.getElementById('scrub-frame-counter');
  const headline = document.getElementById('scrub-title');
  const description = document.getElementById('scrub-description');
  const copy = stage.querySelector('.scrub-copy');
  if (![firstLayer, secondLayer, progressFill, progressCount, headline, description, copy].every(Boolean)) return;

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
  const highlightPhrases = [
    'daily-care essential','botanical inspiration','routine that feels like your own',
    'nourish and condition','everyday care','consistent routine',
    'quiet moments','botanicals','Hair Repair & Revive Growth Oil','everyday conditioning ritual'
  ];

  const ready = new Set();
  const failed = new Set();
  const inFlight = new Map();
  let latestProgress = 0;
  let currentIndex = -1;
  let displayedStory = -1;
  let trigger = null;
  let mobile = window.matchMedia('(max-width: 900px)').matches;
  let phone = window.matchMedia('(max-width: 720px)').matches;

  gsap.defaults({ ease: 'power3.out', force3D: true });

  function preload(i) {
    if (i < 0 || i >= frames.length || ready.has(i) || failed.has(i)) return Promise.resolve(ready.has(i));
    if (inFlight.has(i)) return inFlight.get(i);
    if (i === 0) {
      if (firstLayer.complete && firstLayer.naturalWidth > 0) { ready.add(0); return Promise.resolve(true); }
      if (firstLayer.complete && firstLayer.naturalWidth === 0) { failed.add(0); return Promise.resolve(false); }
      return new Promise(function (resolve) {
        firstLayer.addEventListener('load', function () { ready.add(0); resolve(true); }, { once: true });
        firstLayer.addEventListener('error', function () { failed.add(0); resolve(false); }, { once: true });
      });
    }
    var pending = new Promise(function (resolve) {
      var picture = new Image();
      picture.decoding = 'async';
      picture.onload = function () {
        ready.add(i);
        inFlight.delete(i);
        resolve(true);
        if (trigger) render(latestProgress);
      };
      picture.onerror = function () {
        failed.add(i);
        inFlight.delete(i);
        resolve(false);
      };
      picture.src = frames[i];
    });
    inFlight.set(i, pending);
    return pending;
  }

  function showStory(index) {
    if (index === displayedStory || index < 0 || index >= stories.length) return;
    displayedStory = index;
    var story = stories[index];
    var reverse = index % 2 === 1;
    gsap.killTweensOf([headline, description]);
    headline.replaceChildren(document.createTextNode(story[0] + ' '));
    var emphasis = document.createElement('em');
    emphasis.textContent = story[1];
    headline.appendChild(emphasis);
    var phrase = highlightPhrases[index] || '';
    var position = phrase ? story[2].indexOf(phrase) : -1;
    if (position < 0) {
      description.textContent = story[2];
    } else {
      var accent = document.createElement('strong');
      accent.className = 'copy-accent';
      accent.textContent = phrase;
      description.replaceChildren(
        document.createTextNode(story[2].slice(0, position)),
        accent,
        document.createTextNode(story[2].slice(position + phrase.length))
      );
    }
    stage.dataset.story = String(index + 1);
    var mobileNow = window.matchMedia('(max-width: 900px)').matches;
    if (mobileNow) {
      gsap.fromTo(headline,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', overwrite: true });
      gsap.fromTo(description,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.65, delay: 0.06, ease: 'power2.out', overwrite: true });
    } else {
      gsap.fromTo(headline,
        { autoAlpha: 0, x: reverse ? 24 : -24, y: 6 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.85, ease: 'power3.out', overwrite: true });
      gsap.fromTo(description,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.95, delay: 0.1, ease: 'power3.out', overwrite: true });
    }
  }

  function updateChrome(index, progress) {
    var p = typeof progress === 'number' ? progress : (index / Math.max(1, frames.length - 1));
    progressFill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
    progressCount.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(frames.length).padStart(2, '0');
  }

  function render(progress) {
    var p = Math.min(1, Math.max(0, progress));
    latestProgress = p;
    var rawIndex = p * (frames.length - 1);
    var lower = Math.min(frames.length - 1, Math.floor(rawIndex));
    var upper = Math.min(frames.length - 1, lower + 1);

    preload(lower);
    if (p > 0.01 && upper !== lower) preload(upper);
    if (!phone && upper + 1 < frames.length) preload(upper + 1);

    var displayIndex = ready.has(lower) ? lower : currentIndex;
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
    updateChrome(Math.max(0, displayIndex), p);
    showStory(Math.max(0, displayIndex));
  }

  function enableHeroChrome() {
    document.documentElement.classList.add('has-gsap-hero');
    document.documentElement.classList.remove('hero-mobile-autoplay');
    hero.classList.remove('reveal');
    hero.classList.add('gsap-hero-enabled');
    hero.style.removeProperty('transform');
  }

  function pinDistance() {
    var h = window.innerHeight || 700;
    if (phone) {
      return Math.max(Math.round(h * 1.65), 900);
    }
    if (mobile) return Math.max(Math.round(h * 2.2), 1200);
    return Math.max(Math.round(h * 5.2), 2800);
  }

  function bindTouchAssist() {
    var sx = 0, sy = 0;
    stage.addEventListener('touchstart', function (e) {
      sx = e.changedTouches[0].clientX;
      sy = e.changedTouches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (!trigger) return;
      var step = 1 / Math.max(1, frames.length - 1);
      var next = Math.min(1, Math.max(0, latestProgress + (dx < 0 ? step : -step)));
      var start = trigger.start;
      var end = trigger.end;
      if (typeof start !== 'number' || typeof end !== 'number') return;
      var y = start + (end - start) * next;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, { passive: true });
  }

  preload(0).then(function (ok) {
    if (!ok) {
      document.documentElement.classList.remove('hero-boot');
      return;
    }
    if (!ScrollTrigger) {
      enableHeroChrome();
      showStory(0);
      updateChrome(0, 0);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    firstLayer.src = frames[0];
    stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[0] + '")');
    currentIndex = 0;
    firstLayer.removeAttribute('loading');
    enableHeroChrome();
    showStory(0);
    updateChrome(0, 0);
    preload(1);

    mobile = window.matchMedia('(max-width: 900px)').matches;
    phone = window.matchMedia('(max-width: 720px)').matches;

    var hint = stage.querySelector('.scrub-hint');
    if (hint) {
      hint.textContent = phone
        ? 'Scroll to explore the story · swipe sideways to step'
        : 'Scroll to discover the story';
    }

    render(0);
    trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: function () { return '+=' + pinDistance(); },
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      scrub: phone ? 0.35 : (mobile ? 0.45 : 0.7),
      onUpdate: function (self) { render(self.progress); },
      onRefresh: function (self) { render(self.progress); }
    });

    if (phone || mobile) bindTouchAssist();

    var refresh = function () { ScrollTrigger.refresh(true); };
    window.addEventListener('pageshow', refresh);
    window.addEventListener('load', refresh, { once: true });
    window.addEventListener('orientationchange', function () { setTimeout(refresh, 280); });
    setTimeout(refresh, 400);
    refresh();
  });
})();
