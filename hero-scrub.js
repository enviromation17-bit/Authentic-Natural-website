'use strict';
/* Frame-based scroll hero for Authentic Naturals.
 * Uses the seven original files uploaded to public/assets, in numerical order.
 * process-07 is not present; it is intentionally NOT requested.
 * Existing hero slideshow remains the fallback if JS, CDN, or assets fail.
 */
(function () {
  const hero = document.querySelector('main > .hero');
  const stage = document.getElementById('gsap-hero-stage');
  if (!hero || !stage || !window.gsap || !window.ScrollTrigger) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  const paths = [1,2,3,4,5,6,8].map(n => 'public/assets/process-' + String(n).padStart(2,'0') + '.png');
  const base = document.getElementById('scrub-current');
  const next = document.getElementById('scrub-next');
  const fill = document.getElementById('scrub-progress-fill');
  const counter = document.getElementById('scrub-frame-counter');
  const title = document.getElementById('scrub-title');
  const description = document.getElementById('scrub-description');
  const reducedChange = () => { if (motion.matches) location.reload(); };
  if (typeof motion.addEventListener === 'function') motion.addEventListener('change', reducedChange);

  const narratives = [
    ['Give your hair', 'a little more care.', 'Discover our Hair Repair & Revive Growth Oil, created for an everyday conditioning ritual.'],
    ['Naturally inspired.', 'Thoughtfully made.', 'Explore the familiar botanical ingredients and oils behind the blend.'],
    ['A ritual worth', 'making time for.', 'Six simple steps to make hair care part of your weekly routine.']
  ];

  function loadFrame(path) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({url:path, ok:true});
      img.onerror = () => resolve({url:path, ok:false});
      img.src = path;
    });
  }

  Promise.all(paths.map(loadFrame)).then(records => {
    const frames = records.filter(record => record.ok).map(record => record.url);
    if (frames.length < 2 || frames[0] !== paths[0]) return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    let activeNarrative = 0;
    let lastIndex = -1;
    const total = frames.length;
    const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

    // Preloaded image layers cross-dissolve as the user scrubs in either direction.
    function render(progress) {
      const p = clamp(progress,0,1);
      const frameProgress = p * (total-1);
      const index = Math.min(total-1,Math.floor(frameProgress));
      const nextIndex = Math.min(index+1,total-1);
      if (index !== lastIndex) {
        base.src = frames[index];
        next.src = frames[nextIndex];
        lastIndex = index;
      }
      next.style.opacity = String(index === nextIndex ? 0 : frameProgress-index);
      fill.style.width = (p*100).toFixed(2) + '%';
      counter.textContent = String(index+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');

      const phase = Math.min(2,Math.floor(p*3));
      if (phase !== activeNarrative) {
        activeNarrative = phase;
        const copy = stage.querySelector('.scrub-copy');
        window.gsap.to(copy,{opacity:.55,duration:.12,onComplete:()=>{
          title.replaceChildren(document.createTextNode(narratives[phase][0]+' '));
          const emphasis = document.createElement('em');
          emphasis.textContent = narratives[phase][1];
          title.appendChild(emphasis);
          description.textContent = narratives[phase][2];
          window.gsap.to(copy,{opacity:1,duration:.28});
        }});
      }
    }

    render(0);
    document.documentElement.classList.add('has-gsap-hero');
    hero.classList.remove('reveal');
    hero.classList.add('gsap-hero-enabled');
    hero.style.removeProperty('transform');

    const trigger = window.ScrollTrigger.create({
      trigger:hero,
      start:'top top',
      end:()=>'+='+Math.max(900,Math.round(window.innerHeight*3.25)),
      pin:true,
      scrub:.35,
      anticipatePin:1,
      invalidateOnRefresh:true,
      onUpdate:self=>render(self.progress),
      onRefresh:self=>render(self.progress)
    });

    // Keep large images crisp, with no automatic autoplay or forced zoom.
    window.addEventListener('pageshow',()=>{trigger.refresh();render(trigger.progress);});
    window.addEventListener('load',()=>window.ScrollTrigger.refresh(),{once:true});
    window.ScrollTrigger.refresh();
  }).catch(()=>{/* Original hero stays visible on failure. */});
})();
