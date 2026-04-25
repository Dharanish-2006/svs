// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService, cartService } from '../services'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../data/categories'
import styles from './Home.module.css'

gsap.registerPlugin(ScrollTrigger)

const BANNERS = [
  {
    id: 1,
    eyebrow: 'New Arrivals',
    title: 'Pure\nSilk Sarees',
    subtitle: 'Woven with centuries of tradition',
    cta: 'Explore Collection',
    link: '/category/clothing/sarees',
    bg: 'linear-gradient(135deg, #2C1810 0%, #6B2737 60%, #9A3F4F 100%)',
  },
  {
    id: 2,
    eyebrow: 'Festival Special',
    title: 'Temple\nJewelry',
    subtitle: 'Timeless ornaments for sacred moments',
    cta: 'Shop Jewelry',
    link: '/category/jewelry',
    bg: 'linear-gradient(135deg, #1C1A0E 0%, #5C4A0C 60%, #C9973A 100%)',
  },
  {
    id: 3,
    eyebrow: 'Pooja Essentials',
    title: 'Sacred\nRituals',
    subtitle: 'Complete pooja kits for every puja',
    cta: 'Discover Items',
    link: '/category/pooja',
    bg: 'linear-gradient(135deg, #0A1A10 0%, #1A4A2A 60%, #2A7A3A 100%)',
  },
]

export default function Home() {
  const [products,      setProducts]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeBanner,  setActiveBanner]  = useState(0)
  const { increment }    = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const heroRef       = useRef(null)
  const categoriesRef = useRef(null)
  const featuredRef   = useRef(null)
  const bannerRef     = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setActiveBanner(a => (a + 1) % BANNERS.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    productService.list()
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cat-card', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: categoriesRef.current, start: 'top 80%' },
      })
      gsap.from('.featured-title', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: featuredRef.current, start: 'top 85%' },
      })
      gsap.from('.product-card-gsap', {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: featuredRef.current, start: 'top 75%' },
      })
      gsap.from('.festival-content', {
        x: -60, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: bannerRef.current, start: 'top 80%' },
      })
    })
    return () => ctx.revert()
  }, [products])

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast('Sign in to add items', { icon: '🔒' })
      navigate('/login')
      return
    }
    try {
      await cartService.add(product.id, 1)
      increment()
      toast.success(`${product.product_name} added to bag`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add item')
    }
  }

  const banner = BANNERS[activeBanner]

  return (
    <div className={styles.page}>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className={styles.hero}>
        <motion.div
          key={banner.id}
          className={styles.heroBg}
          style={{ background: banner.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <div className={styles.heroPattern} />
        <div className={`container ${styles.heroContent}`}>
          <motion.div
            key={`content-${banner.id}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className={styles.heroEyebrow}>{banner.eyebrow}</span>
            <h1 className={`display-xl ${styles.heroTitle}`}>
              {banner.title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h1>
            <p className={styles.heroSubtitle}>{banner.subtitle}</p>
            <Link to={banner.link} className={`btn btn-gold ${styles.heroCta}`}>
              {banner.cta}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
          <div className={styles.heroDecor}>
            <div className={styles.heroCircle1} />
            <div className={styles.heroCircle2} />
            <div className={styles.heroOrnament}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 120, color: 'rgba(201,151,58,0.15)', fontStyle: 'italic', lineHeight: 1 }}>
                ❧
              </span>
            </div>
          </div>
        </div>
        <div className={styles.heroIndicators}>
          {BANNERS.map((_, i) => (
            <button key={i} className={`${styles.indicator} ${i === activeBanner ? styles.indicatorActive : ''}`}
              onClick={() => setActiveBanner(i)} />
          ))}
        </div>
        <div className={styles.scrollHint}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronRight size={16} style={{ transform: 'rotate(90deg)', color: 'rgba(255,255,255,0.5)' }} />
          </motion.div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          {[...Array(3)].map((_, i) => (
            <span key={i} className={styles.marqueeInner}>
              ✦ Pure silk Sarees &nbsp;·&nbsp; Temple Jewelry &nbsp;·&nbsp; Fresh Flowers &nbsp;·&nbsp;
              Pooja Kits &nbsp;·&nbsp; Silk Dupattas &nbsp;·&nbsp; Gold Bangles &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <section ref={categoriesRef} className={styles.categories}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="section-eyebrow">Browse</span>
            <h2 className="display-md">Our Collections</h2>
          </div>
          <div className={styles.catGrid}>
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.id} to={`/category/${cat.id}`}
                className={`cat-card ${styles.catCard}`}
                style={{ '--cat-delay': `${i * 0.1}s` }}>
                <div className={styles.catIcon}>{cat.icon}</div>
                <h3 className={styles.catName}>{cat.label}</h3>
                <p className={styles.catDesc}>{cat.description}</p>
                <span className={styles.catArrow}>Browse <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FESTIVAL BANNER ══ */}
      <section ref={bannerRef} className={styles.festivalBanner}>
        <div className={`container ${styles.festivalInner}`}>
          <div className={`festival-content ${styles.festivalContent}`}>
            <span className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>
              Festival Season
            </span>
            <h2 className={`display-md ${styles.festivalTitle}`}>
              Celebrate Every<br />
              <em>Sacred Occasion</em>
            </h2>
            <p className={styles.festivalText}>
              From Pongal to Diwali, dress in the finest silks and adorn yourself
              with temple jewelry that tells the story of our heritage.
            </p>
            <div className={styles.festivalBtns}>
              <Link to="/category/clothing" className="btn btn-gold">Shop Clothing</Link>
              <Link to="/category/jewelry"  className="btn btn-outline"
                style={{ borderColor: 'rgba(201,151,58,0.5)', color: 'var(--gold-light)' }}>
                Shop Jewelry
              </Link>
            </div>
          </div>
          <div className={styles.festivalRight}>
            <div className={styles.festivalStat}>
              <span className={styles.statNum}>5+</span>
              <span className={styles.statLabel}>Years of Heritage</span>
            </div>
            <div className={styles.festivalStat}>
              <span className={styles.statNum}>5K+</span>
              <span className={styles.statLabel}>Happy Customers</span>
            </div>
            <div className={styles.festivalStat}>
              <span className={styles.statNum}>50+</span>
              <span className={styles.statLabel}>Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section ref={featuredRef} className={styles.featured}>
        <div className="container">
          <div className={`featured-title ${styles.sectionHead}`}>
            <span className="section-eyebrow">Handpicked</span>
            <h2 className="display-md">Bestsellers</h2>
            <p className={styles.sectionSub}>Curated with love — our most cherished pieces</p>
          </div>
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.productSkeleton}>
                  <div className="skeleton" style={{ aspectRatio: '3/4' }} />
                  <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 10, width: '40%' }} />
                    <div className="skeleton" style={{ height: 18, width: '80%' }} />
                    <div className="skeleton" style={{ height: 14, width: '30%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((p, i) => (
                <div key={p.id} className="product-card-gsap">
                  <ProductCard product={p} delay={0} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Sparkles size={32} color="var(--gold)" />
              <p>New arrivals coming soon</p>
            </div>
          )}
          <div className={styles.viewAll}>
            <Link to="/category/all" className="btn btn-outline">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section className={styles.whyUs}>
        <div className="container">
          <div className={styles.whyGrid}>
            {[
              { icon: '🔒', title: 'Secure Payment',   desc: 'Razorpay secured checkout' },
              { icon: '🌟', title: 'Authentic Quality', desc: 'Handpicked from artisans' },
            ].map((item, i) => (
              <motion.div key={i} className={styles.whyCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}>
                <span className={styles.whyIcon}>{item.icon}</span>
                <h4 className={styles.whyTitle}>{item.title}</h4>
                <p className={styles.whyDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>SVS Collection</span>
              <p className={styles.footerTagline}>
                Weaving tradition into modern elegance.
              </p>
              <p style={{ fontSize: 12, color: 'var(--sand)', marginTop: 8 }}>
                📍 Taman Sri Sentosa, Kuala Lumpur, Malaysia
              </p>
            </div>

            <div>
              <h4 className={styles.footerHead}>Collections</h4>
              {CATEGORIES.map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`} className={styles.footerLink}>
                  {cat.label}
                </Link>
              ))}
            </div>

            <div>
              <h4 className={styles.footerHead}>Account</h4>
              <Link to="/login"   className={styles.footerLink}>Login</Link>
              <Link to="/signup"  className={styles.footerLink}>Create Account</Link>
              <Link to="/orders"  className={styles.footerLink}>My Orders</Link>
              <Link to="/cart"    className={styles.footerLink}>My Cart</Link>
            </div>

            {/* ── UPDATED with real contact data ── */}
            <div>
              <h4 className={styles.footerHead}>Support</h4>
              <a href="tel:+60149773188" className={styles.footerLink}>+601 4977 3188</a>
              <a href="mailto:thesvscollections@gmail.com" className={styles.footerLink}>thesvscollections@gmail.com</a>
              <a href="https://wa.me/60149773188" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>WhatsApp Us</a>
              <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
              <Link to="/orders"  className={styles.footerLink}>Track Order</Link>
              <a href="https://share.google/vRxmzoKAsTvpq2Wef" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Find Our Store</a>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2024 SVS Collection. All rights reserved.</p>
            <p style={{ color: 'var(--gold)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
              Made with ❤️ in Malasyia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}