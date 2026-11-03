'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const ingredients = [
  { name: 'Amla', benefit: 'Strengthens roots & prevents hair loss', image: '/assets/botanicals.png' },
  { name: 'Coconut Oil', benefit: 'Deep moisture & shine', image: '/assets/botanicals.png' },
  { name: 'Fenugreek', benefit: 'Promotes growth & thickness', image: '/assets/botanicals.png' },
  { name: 'Kalonji', benefit: 'Nourishes scalp & reduces dandruff', image: '/assets/botanicals.png' },
  { name: 'Rosemary', benefit: 'Stimulates circulation', image: '/assets/botanicals.png' },
];

const steps = [
  { num: '01', title: 'Warm the Oil', desc: 'Gently warm a small amount of oil between your palms.' },
  { num: '02', title: 'Massage Scalp', desc: 'Apply to scalp and massage in circular motions for 5–10 minutes.' },
  { num: '03', title: 'Coat Lengths', desc: 'Work through mid-lengths and ends for full nourishment.' },
  { num: '04', title: 'Leave & Rinse', desc: 'Leave on for at least 1 hour or overnight, then wash with mild shampoo.' },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(247,243,235,0.9)] backdrop-blur-md border-b border-[rgba(31,51,36,0.08)]">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <a href="#" className="flex items-center gap-3">
            <Image src="/assets/logo-transparent.png" alt="Authentic Naturals" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <span className="font-serif text-lg md:text-xl tracking-wide text-[#1f3324]">Authentic Naturals</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1f3324]/a>
            <a href="#story" className="hover:text-[#c9a86c] transition">Our Story</a>
            <a href="#ritual" className="hover:text-[#c9a86c] transition">The Ritual</a>
            <a href="#product" className="hover:text-[#c9a86c] transition">Product</a>
            <a href="#shop" className="px-5 py-2.5 bg-[#1f3324] text-[#f7f3eb] rounded-full hover:bg-[#2d4a35] transition">Shop Now</a>
          </nav>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-[#1f3324] transition ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-[#1f3324] transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-[#1f3324] transition ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-[#f7f3eb] border-b border-[rgba(31,51,36,0.08)]"
            >
              <div className="container py-6 flex flex-col gap-4 text-[#1f3324]">
                <a href="#story" onClick={() => setMenuOpen(false)}>Our Story</a>
                <a href="#ritual" onClick={() => setMenuOpen(false)}>The Ritual</a>
                <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
                <a href="#shop" onClick={() => setMenuOpen(false)} className="font-medium">Shop Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <Image src="/assets/family-care.png" alt="" fill className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f7f3eb]/30 via-[#f7f3eb]/60 to-[#f7f3eb]" />
        </motion.div>
        <div className="container relative z-10 grid md:grid-cols-2 gap-12 items-center py-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm tracking-[0.2em] uppercase text-[#c9a86c] mb-4"
            >
              Pure Botanical Care
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-4xl md:text-6xl lg:text-7xl text-[#1f3324] mb-6"
            >
              Hair Repair &amp; Revive Growth Oil
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-[#6b6b6b] mb-8 max-w-md"
            >
              A time-honored blend of amla, coconut, fenugreek, kalonji and rosemary — crafted to strengthen, nourish and revive your hair from root to tip.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#shop" className="px-8 py-3.5 bg-[#1f3324] text-[#f7f3eb] rounded-full font-medium hover:bg-[#2d4a35] transition">
                Shop the Oil
              </a>
              <a href="#ritual" className="px-8 py-3.5 border border-[#1f3324] text-[#1f3324] rounded-full font-medium hover:bg-[#1f3324] hover:text-[#f7f3eb] transition">
                The Ritual
              </a>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative aspect-[4/5] max-w-md mx-auto"
          >
            <Image src="/assets/product.png" alt="Authentic Naturals Hair Oil" fill className="object-contain drop-shadow-2xl" priority />
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="py-24 md:py-32 bg-[#1f3324] text-[#f7f3eb]">
        <div className="container">
          <FadeIn>
            <p className="text-sm tracking-[0.2em] uppercase text-[#c9a86c] mb-4">Our Story</p>
            <h2 className="text-3xl md:text-5xl mb-8 max-w-2xl">Rooted in tradition. Refined for today.</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn delay={0.15}>
              <p className="text-lg text-[#f7f3eb]/80 leading-relaxed mb-6">
                Authentic Naturals was born from a simple belief: that the most powerful care for hair comes from nature’s own pantry. Our Hair Repair &amp; Revive Growth Oil is a carefully balanced formula of five time-tested botanicals, each chosen for its unique ability to nourish the scalp and strengthen the hair shaft.
              </p>
              <p className="text-lg text-[#f7f3eb]/80 leading-relaxed">
                No fillers. No synthetic fragrance. Just pure, plant-powered care you can feel from the first application.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image src="/assets/ritual.png" alt="Hair care ritual" fill className="object-cover" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Ritual */}
      <section id="ritual" className="py-24 md:py-32">
        <div className="container">
          <FadeIn>
            <p className="text-sm tracking-[0.2em] uppercase text-[#c9a86c] mb-4 text-center">The Ritual</p>
            <h2 className="text-3xl md:text-5xl text-center text-[#1f3324] mb-16">How to use</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-4xl font-serif text-[#c9a86c] mb-4">{step.num}</div>
                  <h3 className="text-xl text-[#1f3324] mb-2">{step.title}</h3>
                  <p className="text-[#6b6b6b]">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.4}>
            <div className="mt-16 relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl">
              <video
                src="/assets/product-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product */}
      <section id="product" className="py-24 md:py-32 bg-[#f0ebe3]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="relative aspect-square max-w-lg">
                <Image src="/assets/product.png" alt="Product bottle" fill className="object-contain" />
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-sm tracking-[0.2em] uppercase text-[#c9a86c] mb-4">The Formula</p>
              <h2 className="text-3xl md:text-5xl text-[#1f3324] mb-6">Five botanicals. One powerful oil.</h2>
              <p className="text-[#6b6b6b] mb-8 leading-relaxed">
                Each ingredient is selected for its proven benefits and carefully proportioned to work in harmony. The result is a lightweight yet deeply nourishing oil that absorbs well and leaves hair soft, strong and full of life.
              </p>
              <ul className="space-y-4">
                {ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#c9a86c] flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1f3324]">{ing.name}</span>
                      <span className="text-[#6b6b6b]"> — {ing.benefit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Shop / CTA */}
      <section id="shop" className="py-24 md:py-32">
        <div className="container text-center">
          <FadeIn>
            <p className="text-sm tracking-[0.2em] uppercase text-[#c9a86c] mb-4">Ready to begin?</p>
            <h2 className="text-3xl md:text-5xl text-[#1f3324] mb-6">Experience Authentic Naturals</h2>
            <p className="text-[#6b6b6b] max-w-xl mx-auto mb-10">
              Start your hair recovery ritual today. Pure ingredients, thoughtful craftsmanship, and results you can see and feel.
            </p>
            <a
              href="#"
              className="inline-block px-10 py-4 bg-[#1f3324] text-[#f7f3eb] rounded-full text-lg font-medium hover:bg-[#2d4a35] transition shadow-lg"
            >
              Shop Now
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[rgba(31,51,36,0.1)]">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo-transparent.png" alt="" width={36} height={36} className="w-9 h-9 object-contain" />
            <span className="font-serif text-[#1f3324]">Authentic Naturals</span>
          </div>
          <p className="text-sm text-[#6b6b6b]">© {new Date().getFullYear()} Authentic Naturals. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
