# Authentic Naturals — Final release QA
Date: 2026-11-05
Branch: main

## Static verification completed
- [x] Six JavaScript files parsed without syntax errors: app.js, hero-scrub.js, product360.js, lead-popup.js, polish.js, scrub.js.
- [x] No duplicate HTML id attributes.
- [x] 46 referenced media files located in GitHub: 45 images and one product video.
- [x] Hero retains 10 image frames and 10 text stories; scroll logic and image-first fallback present.
- [x] Ingredient list retains 23 entries, filtering and detail dialogs.
- [x] Editorial gallery retains 15 photos with visibility-based loading.
- [x] Ritual carousel retains six steps.
- [x] Shopping cart, quantity, checkout-to-WhatsApp, privacy dialog, lead enquiry, and social links remain wired.
- [x] Reduced-motion rules present.
- [x] CSS bracket counts balanced in the three local stylesheets.

## Fixes in final audit
- Product photo viewer now opens the existing native image dialog instead of running a permanent 3D animation loop. Its original-size toggle uses the correct CSS class.
- Product video no longer auto-starts on scroll.
- Shopping cart storage is guarded where localStorage is disabled.
- Ingredient detail photographs and lazily loaded media have graceful fallback states.
- Closed dialog images do not request full-size media before the dialogs are opened.
- Offscreen ingredient water/cards, ticker and footer branches pause their motion.
- Contact popup restores keyboard focus to the button that opened it.
- Image-loading placeholders stay visible until the images actually load.
- Browser asset versions refreshed.

## Manual acceptance checks — NOT YET VERIFIED
Perform on a deployed site (not just source code) at desktop 1440px, tablet 768px, and mobile 390px:
1. Cold-load on mobile cellular / throttle Fast 3G; check hero first paint, no excessive layout shift, and no permanently blank images.
2. Scroll hero forward/backward through all 10 photos; verify image, headline, counter, and pin behavior.
3. Search/filter ingredient cards and open detail dialogs; check photos and no console errors.
4. Swipe editorial gallery; ensure late items load when they approach the viewport.
5. Operate six ritual steps via touch, arrows, and keyboard.
6. Open product photo and toggle between fit and original size.
7. Add items to bag, update quantity, and submit WhatsApp order.
8. Open and close enquiry popup from the floating button and footer; verify keyboard focus restoration and WhatsApp handoff.
9. Verify footer icons, branches, leaf movement, and no blank band after footer.
10. Test with reduced motion and with JavaScript disabled.
11. Run Lighthouse mobile Performance, Accessibility, Best Practices, and SEO; investigate scores and Core Web Vitals.

## Remaining launch considerations
- The HTML currently contains `<meta name="robots" content="noindex,nofollow">`. Remove only when the site is ready to appear in search engines.
- GSAP and fonts depend on third-party CDNs; animation will not initialize when those resources are blocked. Static hero fallback remains.
- Original photographs have not all been converted to optimized responsive image variants; measured image compression is still recommended.
- A static GitHub Pages site does not store leads. The WhatsApp popup prepares a message that the visitor must send.
- No live-browser, real-device, Lighthouse or network-timing verification was possible in this audit. Passing static checks does not establish that all visual/interaction behavior is flawless.
