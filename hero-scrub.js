'use strict';
/* Hero story — stable mobile (no blank gaps)
   Phone: scroll-linked scrub WITHOUT pin + swipe assist + gentle autoplay when idle
   Desktop/tablet: pinned scrub
*/
(function () {
  var hero = document.querySelector('main > .hero');
  var stage = document.getElementById('gsap-hero-stage');
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!hero || !stage || !gsap) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var filenames = [
    'process-01.png','process-02.png','process-03.png','process-04.png',
    'process-05.png','process-06.png','process-08.png','botanicals.png','ritual.png','product.png'
  ];
  var frames = filenames.map(function (n) { return 'public/assets/' + n; });
  var firstLayer = document.getElementById('scrub-current');
  var secondLayer = document.getElementById('scrub-next');
  var progressFill = document.getElementById('scrub-progress-fill');
  var progressCount = document.getElementById('scrub-frame-counter');
  var headline = document.getElementById('scrub-title');
  var description = document.getElementById('scrub-description');
  if (![firstLayer, secondLayer, progressFill, progressCount, headline, description].every(Boolean)) return;

  var stories = [
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
  var highlightPhrases = [
    'daily-care essential','botanical inspiration','routine that feels like your own',
    'nourish and condition','everyday care','consistent routine',
    'quiet moments','botanicals','Hair Repair & Revive Growth Oil','everyday conditioning ritual'
  ];

  var ready = new Set();
  var failed = new Set();
  var inFlight = new Map();
  var latestProgress = 0;
  var currentIndex = -1;
  var displayedStory = -1;
  var trigger = null;
  var autoTimer = null;
  var phone = window.matchMedia('(max-width: 720px)').matches;
  var mobile = window.matchMedia('(max-width: 900px)').matches;

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
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { ready.add(i); inFlight.delete(i); resolve(true); if (trigger) render(latestProgress); };
      img.onerror = function () { failed.add(i); inFlight.delete(i); resolve(false); };
      img.src = frames[i];
    });
    inFlight.set(i, pending);
    return pending;
  }

  function showStory(index) {
    if (index === displayedStory || index < 0 || index >= stories.length) return;
    displayedStory = index;
    var story = stories[index];
    gsap.killTweensOf([headline, description]);
    headline.replaceChildren(document.createTextNode(story[0] + ' '));
    var em = document.createElement('em');
    em.textContent = story[1];
    headline.appendChild(em);
    var phrase = highlightPhrases[index] || '';
    var pos = phrase ? story[2].indexOf(phrase) : -1;
    if (pos < 0) {
      description.textContent = story[2];
    } else {
      var strong = document.createElement('strong');
      strong.className = 'copy-accent';
      strong.textContent = phrase;
      description.replaceChildren(
        document.createTextNode(story[2].slice(0, pos)),
        strong,
        document.createTextNode(story[2].slice(pos + phrase.length))
      );
    }
    stage.dataset.story = String(index + 1);
    gsap.fromTo(headline, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: true });
    gsap.fromTo(description, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55, delay: 0.05, ease: 'power2.out', overwrite: true });
  }

  function updateChrome(index, progress) {
    var p = typeof progress === 'number' ? progress : (index / Math.max(1, frames.length - 1));
    progressFill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
    progressCount.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(frames.length).padStart(2, '0');
  }

  function render(progress) {
    var p = Math.min(1, Math.max(0, progress));
    latestProgress = p;
    var raw = p * (frames.length - 1);
    var lower = Math.min(frames.length - 1, Math.floor(raw));
    var upper = Math.min(frames.length - 1, lower + 1);
    preload(lower);
    if (upper !== lower) preload(upper);

    var displayIndex = ready.has(lower) ? lower : currentIndex;
    if (displayIndex >= 0 && displayIndex !== currentIndex) {
      firstLayer.src = frames[displayIndex];
      stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[displayIndex] + '")');
      currentIndex = displayIndex;
    }
    if (ready.has(upper) && upper !== displayIndex && ready.has(lower)) {
      if (secondLayer.getAttribute('src') !== frames[upper]) secondLayer.src = frames[upper];
      secondLayer.style.opacity = String(raw - lower);
    } else {
      secondLayer.style.opacity = '0';
    }
    updateChrome(Math.max(0, displayIndex), p);
    showStory(Math.max(0, displayIndex));
  }

  function showFrameIndex(i) {
    var index = ((i % frames.length) + frames.length) % frames.length;
    preload(index).then(function () {
      firstLayer.src = frames[index];
      stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[index] + '")');
      secondLayer.style.opacity = '0';
      currentIndex = index;
      updateChrome(index, index / Math.max(1, frames.length - 1));
      showStory(index);
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(function () {
      if (document.hidden) return;
      showFrameIndex((currentIndex < 0 ? 0 : currentIndex) + 1);
    }, 4500);
  }
  function stopAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  function enableChrome() {
    document.documentElement.classList.add('has-gsap-hero');
    document.documentElement.classList.remove('hero-mobile-autoplay');
    hero.classList.remove('reveal');
    hero.classList.add('gsap-hero-enabled');
    hero.style.removeProperty('transform');
  }

  preload(0).then(function (ok) {
    if (!ok) {
      document.documentElement.classList.remove('hero-boot');
      return;
    }
    firstLayer.src = frames[0];
    stage.style.setProperty('--hero-photo-backdrop', 'url("' + frames[0] + '")');
    currentIndex = 0;
    firstLayer.removeAttribute('loading');
    enableChrome();
    showStory(0);
    updateChrome(0, 0);
    preload(1);

    phone = window.matchMedia('(max-width: 720px)').matches;
    mobile = window.matchMedia('(max-width: 900px)').matches;
    var hint = stage.querySelector('.scrub-hint');

    if (phone) {
      document.documentElement.classList.add('hero-mobile-autoplay');
      if (hint) hint.textContent = 'Scroll or swipe to explore the story';

      if (ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        trigger = ScrollTrigger.create({
          trigger: stage,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.4,
          onUpdate: function (self) { render(self.progress); stopAutoplay(); },
          onLeave: function () { startAutoplay(); },
          onEnterBack: function () { stopAutoplay(); }
        });
      }

      var sx = 0, sy = 0;
      stage.addEventListener('touchstart', function (e) {
        sx = e.changedTouches[0].clientX;
        sy = e.changedTouches[0].clientY;
        stopAutoplay();
      }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - sx;
        var dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          showFrameIndex(currentIndex + (dx < 0 ? 1 : -1));
        }
        startAutoplay();
      }, { passive: true });

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) startAutoplay();
            else stopAutoplay();
          });
        }, { threshold: 0.25 });
        io.observe(stage);
      } else {
        startAutoplay();
      }
      return;
    }

    if (!ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    if (hint) hint.textContent = 'Scroll to discover the story';
    render(0);
    trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: function () {
        var h = window.innerHeight || 800;
        return '+=' + Math.max(mobile ? Math.round(h * 2) : Math.round(h * 5), mobile ? 1100 : 2600);
      },
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      scrub: mobile ? 0.4 : 0.65,
      onUpdate: function (self) { render(self.progress); },
      onRefresh: function (self) { render(self.progress); }
    });
    var refresh = function () { ScrollTrigger.refresh(true); };
    window.addEventListener('pageshow', refresh);
    window.addEventListener('load', refresh, { once: true });
    window.addEventListener('orientationchange', function () { setTimeout(refresh, 250); });
    setTimeout(refresh, 350);
  });
})();
