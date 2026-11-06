'use strict';
/* Mobile-stable polish: never hide content on phones; layout fixes; soft desktop reveals */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
  var isTablet = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;

  function injectCss() {
    if (document.getElementById('an-mobile-inline')) return;
    var style = document.createElement('style');
    style.id = 'an-mobile-inline';
    style.textContent = [
      'html,body{overflow-x:hidden!important;max-width:100vw!important}',
      '*,*::before,*::after{box-sizing:border-box}',
      'img,video,svg{max-width:100%!important;height:auto}',
      '.pin-spacer{background:transparent!important}',
      '@media(max-width:900px){',
      '.reveal,.section,.product-info,.gallery,.ingredient-card,.usage-panel,',
      '.brand-manifesto,.benefit-strip,.story-layout,.video-section,.faq,.closing,',
      '.section-heading,.manifesto-inner,.footer-shell{',
      'opacity:1!important;visibility:visible!important;transform:none!important}',
      'main,main>section,.section,.product.section,.ingredients.section,.usage-section,',
      '.video-section,.story-layout,.closing,.brand-manifesto{',
      'width:100%!important;max-width:100%!important;overflow-x:hidden!important;',
      'padding-left:16px!important;padding-right:16px!important;margin-left:0!important;margin-right:0!important}',
      '.header{padding-left:10px!important;padding-right:10px!important;gap:8px!important}',
      '.header nav{overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;max-width:min(52vw,240px)!important}',
      '.header nav::-webkit-scrollbar{display:none}',
      '.header nav a{white-space:nowrap!important;font-size:11px!important;padding:6px 7px!important}',
      '.product.section,.product{display:grid!important;grid-template-columns:1fr!important;gap:18px!important}',
      '.gallery,.main-image{width:100%!important;max-width:100%!important}',
      '#gallery-image{max-width:min(100%,300px)!important;max-height:46vh!important;margin:0 auto!important;display:block!important}',
      '.purchase .button,.whatsapp-button{width:100%!important;justify-content:center!important}',
      '.ocean-floating-section .ocean-surface,.ocean-surface,.ocean-wave,.ocean-water-rings{display:none!important}',
      '.ingredient-controls{display:flex!important;flex-direction:column!important;gap:12px!important;width:100%!important}',
      '.ingredient-controls input{width:100%!important;max-width:100%!important}',
      '.filters{display:flex!important;flex-wrap:wrap!important;gap:8px!important;width:100%!important}',
      '.ingredient-grid{display:grid!important;grid-template-columns:1fr!important;gap:14px!important;width:100%!important;margin:0!important;padding:0!important}',
      '.ingredient-card{display:flex!important;flex-direction:column!important;width:100%!important;max-width:100%!important;',
      'min-width:0!important;margin:0!important;padding:0 0 16px!important;overflow:hidden!important;opacity:1!important;visibility:visible!important}',
      '.ingredient-card .ingredient-media{width:100%!important;height:180px!important;flex:0 0 180px!important;border-radius:18px 18px 0 0!important;overflow:hidden!important}',
      '.ingredient-card .ingredient-media img{width:100%!important;height:100%!important;object-fit:cover!important}',
      '.ingredient-card>span,.ingredient-card>h3,.ingredient-card>p,.ingredient-card>button,.ingredient-card .ingredient-explore{',
      'width:100%!important;max-width:100%!important;min-width:0!important;padding-left:14px!important;padding-right:14px!important;',
      'box-sizing:border-box!important;overflow-wrap:anywhere!important;word-break:break-word!important;white-space:normal!important}',
      '.ingredient-card>h3{font-size:1.25rem!important;line-height:1.25!important}',
      '.ingredient-card>p{font-size:13px!important;line-height:1.55!important}',
      '#ritual,.usage-section{overflow-x:hidden!important}',
      '.usage-nav{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch;gap:8px!important;width:100%!important}',
      '.usage-nav button{flex:0 0 auto!important;min-width:108px!important;max-width:148px!important;font-size:11px!important;white-space:normal!important}',
      '.usage-carousel{width:100%!important;overflow:hidden!important;height:auto!important}',
      '.usage-track{display:flex!important;transition:transform .7s cubic-bezier(.22,1,.36,1)!important}',
      '.usage-panel,.usage-track .usage-panel{display:flex!important;flex-direction:column!important;flex:0 0 100%!important;',
      'width:100%!important;min-width:100%!important;max-width:100%!important;gap:12px!important;opacity:1!important;visibility:visible!important}',
      '.usage-panel figure{width:100%!important;margin:0!important;overflow:hidden!important;border-radius:16px!important}',
      '.usage-panel figure img{width:100%!important;height:auto!important;max-height:min(55vh,400px)!important;object-fit:contain!important}',
      '.usage-panel .usage-caption{width:100%!important;padding:4px 2px 12px!important}',
      '.video-section{grid-template-columns:1fr!important}',
      '.video-section video{width:100%!important;max-height:42vh!important}',
      '.section{min-height:0!important}',
      '.floating-whatsapp{bottom:max(14px,env(safe-area-inset-bottom))!important;right:12px!important}',
      'html.hero-mobile-autoplay main>.hero .hero-scrub-stage{position:relative!important;height:auto!important;min-height:min(88svh,640px)!important}',
      'html.hero-mobile-autoplay main>.hero{min-height:0!important}',
      'html.hero-mobile-autoplay .pin-spacer{height:auto!important;padding:0!important;margin:0!important}',
      '}',
      '@media(max-width:420px){',
      'main>section,.section{padding-left:12px!important;padding-right:12px!important}',
      '.ingredient-card .ingredient-media{height:160px!important;flex-basis:160px!important}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  function forceVisibleMobile() {
    if (!isTablet) return;
    var nodes = document.querySelectorAll(
      'main section, .section, .reveal, .product-info, .gallery, .ingredient-card, .usage-panel, ' +
      '.brand-manifesto, .benefit-strip, .story-layout, .video-section, .faq, .closing, ' +
      '.section-heading, .manifesto-inner, .footer-shell, .ingredient-grid'
    );
    nodes.forEach(function (el) {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.transform = 'none';
    });
  }

  function stripBrokenPins() {
    if (!isMobile) return;
    function clean() {
      document.querySelectorAll('.pin-spacer').forEach(function (spacer) {
        var pinned = spacer.querySelector('.hero-scrub-stage, #gsap-hero-stage, main > .hero, .hero');
        if (pinned && spacer.parentNode) spacer.parentNode.insertBefore(pinned, spacer);
        if (spacer.parentNode) spacer.parentNode.removeChild(spacer);
      });
      var stage = document.getElementById('gsap-hero-stage');
      if (stage) {
        stage.style.position = 'relative';
        stage.style.top = 'auto';
        stage.style.width = '100%';
        stage.style.transform = 'none';
      }
    }
    setTimeout(clean, 200);
    setTimeout(clean, 800);
    setTimeout(clean, 1800);
  }

  function setupSmoothScroll() {
    document.documentElement.style.scrollBehavior = reduceMotion ? 'auto' : 'smooth';
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = document.querySelector('.header');
      var offset = header ? header.offsetHeight + 12 : 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }

  function setupHeroSlider() {
    var root = document.getElementById('hero-slider');
    if (!root) return;
    var slides = root.querySelectorAll('.hero-slide');
    var dots = root.querySelectorAll('[data-dot]');
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    if (!slides.length) return;
    var index = 0, timer = null, total = slides.length;
    function go(i) {
      index = (i + total) % total;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
    }
    function start() {
      stop();
      if (reduceMotion) return;
      timer = setInterval(function () {
        if (document.documentElement.classList.contains('has-gsap-hero')) { stop(); return; }
        if (!document.hidden) go(index + 1);
      }, 5000);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    if (prev) prev.addEventListener('click', function () { go(index - 1); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); start(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(Number(d.getAttribute('data-dot')) || 0); start(); });
    });
    go(0);
    start();
  }

  function desktopReveals() {
    if (isTablet || reduceMotion) {
      forceVisibleMobile();
      return;
    }
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    var blocks = document.querySelectorAll(
      '.brand-manifesto,.benefit-strip,.product.section,.ingredients.section,.usage-section,.video-section,.story-layout,.faq,.closing'
    );
    blocks.forEach(function (block) {
      var kids = block.querySelectorAll('.section-heading, .product-info, .gallery, .manifesto-inner, .ingredient-card, details');
      if (!kids.length) {
        gsap.fromTo(block, { autoAlpha: 0, y: 28 }, {
          autoAlpha: 1, y: 0, duration: 0.9,
          scrollTrigger: { trigger: block, start: 'top 90%', once: true }
        });
        return;
      }
      gsap.set(kids, { autoAlpha: 0, y: 24 });
      ScrollTrigger.create({
        trigger: block,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(kids, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out', overwrite: true });
        }
      });
    });
    setTimeout(function () {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
        el.style.opacity = '1';
      });
    }, 4500);
  }

  function watchIngredients() {
    var grid = document.getElementById('ingredient-grid');
    if (!grid || !('MutationObserver' in window)) return;
    new MutationObserver(function () {
      grid.querySelectorAll('.ingredient-card').forEach(function (card) {
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.classList.add('is-visible');
      });
    }).observe(grid, { childList: true });
  }

  function waitGsap(cb, n) {
    n = n || 0;
    if (window.gsap && window.ScrollTrigger) return cb();
    if (n > 40) return cb();
    setTimeout(function () { waitGsap(cb, n + 1); }, 50);
  }

  function start() {
    injectCss();
    forceVisibleMobile();
    stripBrokenPins();
    setupSmoothScroll();
    setupHeroSlider();
    watchIngredients();
    waitGsap(desktopReveals);
    setTimeout(forceVisibleMobile, 600);
    setTimeout(forceVisibleMobile, 1600);
    setTimeout(forceVisibleMobile, 3000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
