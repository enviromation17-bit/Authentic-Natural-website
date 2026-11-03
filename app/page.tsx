'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const PRICE = 1499;
const WHATSAPP = '923248019501';

const ingredients = [
  { name: 'Argan Oil', desc: 'Deeply moisturises and adds natural shine', tag: 'Moisture' },
  { name: 'Castor Oil', desc: 'Supports thicker, stronger looking hair', tag: 'Growth' },
  { name: 'Coconut Oil', desc: 'Nourishes from root to tip', tag: 'Nourish' },
  { name: 'Amla', desc: 'Traditional scalp and hair tonic', tag: 'Strength' },
  { name: 'Bhringraj', desc: 'Ayurvedic herb for healthy scalp', tag: 'Scalp' },
  { name: 'Vitamin E', desc: 'Protects and softens hair strands', tag: 'Protect' },
];

const steps = [
  { img: '/assets/use-01.png', title: 'Part your hair', text: 'Create sections so the oil reaches the scalp evenly.' },
  { img: '/assets/use-02.png', title: 'Apply to scalp', text: 'Massage gently with fingertips in circular motions.' },
  { img: '/assets/use-03.png', title: 'Work through lengths', text: 'Coat mid-lengths and ends for full nourishment.' },
  { img: '/assets/use-04.png', title: 'Leave on', text: 'Leave for at least 1 hour or overnight for best results.' },
  { img: '/assets/use-05.png', title: 'Rinse', text: 'Wash with a mild shampoo. Repeat 2–3 times a week.' },
  { img: '/assets/use-06.png', title: 'Enjoy', text: 'Notice softer, stronger, healthier-looking hair over time.' },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 60]);

  const orderLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I want to order Authentic Naturals Hair Oil (Qty: ${qty})`)}`;

  return (
    <>
      <style jsx global>{`
        .container { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
        .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        @media (max-width: 768px) {
          .desk-nav { display: none !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(247,243,235,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(31,51,36,0.08)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/assets/logo-transparent.png" alt="Authentic Naturals" width={44} height={44} style={{ objectFit: 'contain' }} />
            <span className="font-serif" style={{ fontSize: 20, color: '#1f3324', letterSpacing: '0.02em' }}>Authentic Naturals</span>
          </a>
          <nav className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 500, color: '#1f3324' }}>
            <a href="#story" style={{ transition: 'color 0.2s' }}>Our Story</a>
            <a href="#ritual">The Ritual</a>
            <a href="#product">Product</a>
            <a href="#shop" style={{ padding: '10px 22px', background: '#1f3324', color: '#f7f3eb', borderRadius: 999, transition: 'background 0.2s' }}>Shop Now</a>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', padding: 8 }} aria-label="Menu" className="mobile-menu-btn">
            <div style={{ width: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ display: 'block', height: 2, background: '#1f3324', transition: '0.2s', transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }} />
              <span style={{ display: 'block', height: 2, background: '#1f3324', transition: '0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', height: 2, background: '#1f3324', transition: '0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }} />
            </div>
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', background: '#f7f3eb', borderBottom: '1px solid rgba(31,51,36,0.08)' }}>
              <div className="container" style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16, color: '#1f3324' }}>
                <a href="#story" onClick={() => setMenuOpen(false)}>Our Story</a>
                <a href="#ritual" onClick={() => setMenuOpen(false)}>The Ritual</a>
                <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
                <a href="#shop" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600 }}>Shop Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 72, overflow: 'hidden' }}>
        <motion.div style={{ position: 'absolute', inset: 0, zIndex: 0, y: heroY }}>
          <Image src="/assets/family-care.png" alt="" fill style={{ objectFit: 'cover', opacity: 0.35 }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(247,243,235,0.4), rgba(247,243,235,0.75), #f7f3eb)' }} />
        </motion.div>
        <div className="container" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', padding: '64px 20px' }}>
          <div>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a86c', marginBottom: 16 }}>Pure Botanical Care</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-serif" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#1f3324', marginBottom: 20, lineHeight: 1.15 }}>Hair Repair & Revive Growth Oil</motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ fontSize: 17, color: '#6b6b6b', marginBottom: 32, maxWidth: 420, lineHeight: 1.65 }}>A carefully balanced blend of argan, castor, coconut, amla, bhringraj and vitamin E — crafted to nourish the scalp and strengthen hair from root to tip.</motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a href="#shop" style={{ padding: '14px 28px', background: '#1f3324', color: '#f7f3eb', borderRadius: 999, fontWeight: 500, transition: 'background 0.2s' }}>Shop the Oil — Rs {PRICE}</a>
              <a href="#ritual" style={{ padding: '14px 28px', border: '1px solid #1f3324', color: '#1f3324', borderRadius: 999, fontWeight: 500 }}>The Ritual</a>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, duration: 0.8 }} style={{ position: 'relative', aspectRatio: '4/5', maxWidth: 400, margin: '0 auto' }}>
            <Image src="/assets/product.png" alt="Authentic Naturals Hair Oil" fill style={{ objectFit: 'contain', filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15))' }} priority />
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section id="story" style={{ padding: '96px 0', background: '#1f3324', color: '#f7f3eb' }}>
        <div className="container">
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a86c', marginBottom: 12 }}>Our Story</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', marginBottom: 32, maxWidth: 560 }}>Rooted in tradition. Refined for today.</h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <FadeIn delay={0.12}>
              <p style={{ fontSize: 17, color: 'rgba(247,243,235,0.85)', lineHeight: 1.7, marginBottom: 20 }}>Authentic Naturals was born from a simple belief: the most powerful care for hair comes from nature. Our Hair Repair & Revive Growth Oil is a carefully balanced formula of six time-tested botanicals, each chosen for its ability to nourish the scalp and strengthen the hair shaft.</p>
              <p style={{ fontSize: 17, color: 'rgba(247,243,235,0.85)', lineHeight: 1.7 }}>No fillers. No synthetic fragrance. Just pure, plant-powered care you can feel from the first application.</p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, overflow: 'hidden' }}>
                <Image src="/assets/ritual.png" alt="Hair care ritual" fill style={{ objectFit: 'cover' }} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Ritual */}
      <section id="ritual" style={{ padding: '96px 0' }}>
        <div className="container">
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a86c', marginBottom: 12, textAlign: 'center' }}>The Ritual</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', textAlign: 'center', color: '#1f3324', marginBottom: 48 }}>How to use</h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 28 }}>
            {steps.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                    <Image src={step.img} alt={step.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <h3 className="font-serif" style={{ fontSize: 18, color: '#1f3324', marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.5 }}>{step.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.35}>
            <div style={{ marginTop: 56, position: 'relative', aspectRatio: '16/9', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}>
              <video src="/assets/product-video.mp4" autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product */}
      <section id="product" style={{ padding: '96px 0', background: '#f0ebe3' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <FadeIn>
              <div style={{ position: 'relative', aspectRatio: '1', maxWidth: 420 }}>
                <Image src="/assets/product.png" alt="Product bottle" fill style={{ objectFit: 'contain' }} />
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a86c', marginBottom: 12 }}>The Formula</p>
              <h2 className="font-serif" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', color: '#1f3324', marginBottom: 20 }}>Six botanicals. One powerful oil.</h2>
              <p style={{ color: '#6b6b6b', marginBottom: 28, lineHeight: 1.65 }}>Each ingredient is selected for its proven benefits and carefully proportioned to work in harmony. The result is a lightweight yet deeply nourishing oil that absorbs well and leaves hair soft, strong and full of life.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ingredients.map((ing) => (
                  <li key={ing.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ marginTop: 7, width: 8, height: 8, borderRadius: '50%', background: '#c9a86c', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 500, color: '#1f3324' }}>{ing.name}</span>
                      <span style={{ color: '#6b6b6b' }}> — {ing.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" style={{ padding: '96px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9a86c', marginBottom: 12 }}>Ready to begin?</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', color: '#1f3324', marginBottom: 16 }}>Experience Authentic Naturals</h2>
            <p style={{ color: '#6b6b6b', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>Start your hair recovery ritual today. Pure ingredients, thoughtful craftsmanship, and results you can see and feel.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 24, background: '#f0ebe3', padding: '10px 20px', borderRadius: 999 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: '#1f3324', color: '#f7f3eb', fontSize: 18, lineHeight: 1 }}>−</button>
              <span style={{ fontWeight: 600, minWidth: 24 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#1f3324', color: '#f7f3eb', fontSize: 18, lineHeight: 1 }}>+</button>
            </div>
            <div>
              <a href={orderLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '16px 40px', background: '#1f3324', color: '#f7f3eb', borderRadius: 999, fontSize: 17, fontWeight: 500, boxShadow: '0 8px 24px rgba(31,51,36,0.25)' }}>
                Order on WhatsApp — Rs {PRICE * qty}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid rgba(31,51,36,0.1)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/assets/logo-transparent.png" alt="" width={32} height={32} style={{ objectFit: 'contain' }} />
            <span className="font-serif" style={{ color: '#1f3324' }}>Authentic Naturals</span>
          </div>
          <p style={{ fontSize: 13, color: '#6b6b6b' }}>© {new Date().getFullYear()} Authentic Naturals. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
