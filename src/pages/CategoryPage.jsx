// src/pages/CategoryPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Filter, Grid, List, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import { cartService } from '../services'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, getCategoryById } from '../data/categories'
import styles from './CategoryPage.module.css'

gsap.registerPlugin(ScrollTrigger)

const SORT_OPTIONS = [
  { value: 'default',     label: 'Featured' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'name-asc',    label: 'Name: A–Z' },
]

export default function CategoryPage() {
  const { categoryId, subcategoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate  = useNavigate()

  const [allProducts,  setAllProducts]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [viewMode,     setViewMode]     = useState('grid')
  const [sort,         setSort]         = useState('default')
  const [priceRange,   setPriceRange]   = useState([0, 5000])
  const [filterOpen,   setFilterOpen]   = useState(false)  // mobile

  const { increment }       = useCart()
  const { isAuthenticated } = useAuth()

  const category    = getCategoryById(categoryId)
  const searchQuery = searchParams.get('q') || ''
  const gridRef     = useRef(null)

  // ── Fetch products ─────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    api.get('/api/home/')
      .then(r => setAllProducts(r.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [categoryId, subcategoryId])

  // ── GSAP on product grid change ────────────────────────────────────────────
  useEffect(() => {
    if (!loading && gridRef.current) {
      gsap.from(gridRef.current.querySelectorAll('.product-item'), {
        y: 30, opacity: 0, duration: 0.5,
        stagger: 0.06, ease: 'power3.out',
        clearProps: 'all',
      })
    }
  }, [loading, sort, priceRange])

  // ── Filter + sort products ─────────────────────────────────────────────────
  const filtered = [...allProducts]
    .filter(p => {
      if (searchQuery) return p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      return true
    })
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sort === 'price-asc')  return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'name-asc')   return a.product_name.localeCompare(b.product_name)
      return 0
    })

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      await cartService.add(product.id, 1)
      increment()
      toast.success(`${product.product_name} added to bag`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add item')
    }
  }

  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    ...(categoryId && categoryId !== 'all'
      ? [{ label: category?.label || categoryId, to: `/category/${categoryId}` }]
      : [{ label: 'All Products', to: '/category/all' }]),
    ...(subcategoryId
      ? [{ label: subcategoryId, to: null }]
      : []),
    ...(searchQuery
      ? [{ label: `"${searchQuery}"`, to: null }]
      : []),
  ]

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : category?.label || 'All Products'

  return (
    <div className={styles.page}>

      {/* ── Category Hero ── */}
      <div className={styles.hero}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className={styles.crumbItem}>
                {crumb.to
                  ? <Link to={crumb.to} className={styles.crumbLink}>{crumb.label}</Link>
                  : <span className={styles.crumbCurrent}>{crumb.label}</span>
                }
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight size={13} className={styles.crumbSep} />
                )}
              </span>
            ))}
          </nav>

          <h1 className={`display-md ${styles.heroTitle}`}>{pageTitle}</h1>

          {category && (
            <p className={styles.heroDesc}>{category.description}</p>
          )}

          {/* Sub-category pills */}
          {category && (
            <div className={styles.subPills}>
              <Link to={`/category/${categoryId}`}
                className={`${styles.subPill} ${!subcategoryId ? styles.subPillActive : ''}`}>
                All
              </Link>
              {category.subcategories.flatMap(sub => sub.items).map(item => (
                <Link key={item.id}
                  to={`/category/${categoryId}/${item.id}`}
                  className={`${styles.subPill} ${subcategoryId === item.id ? styles.subPillActive : ''}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container">
        <div className={styles.layout}>

          {/* ── Sidebar (desktop) ── */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarHead}>Categories</h3>
              {CATEGORIES.map(cat => (
                <div key={cat.id}>
                  <Link to={`/category/${cat.id}`}
                    className={`${styles.sidebarCat} ${cat.id === categoryId ? styles.sidebarCatActive : ''}`}>
                    {cat.icon} {cat.label}
                  </Link>
                  {cat.id === categoryId && (
                    <div className={styles.sidebarSubs}>
                      {cat.subcategories.flatMap(sub => sub.items).map(item => (
                        <Link key={item.id}
                          to={`/category/${cat.id}/${item.id}`}
                          className={`${styles.sidebarSub} ${item.id === subcategoryId ? styles.sidebarSubActive : ''}`}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarHead}>Price Range</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceField}>
                  <label className="label">Min ₹</label>
                  <input type="number" className="input" style={{ padding: '8px 12px', fontSize: 13 }}
                    value={priceRange[0]}
                    onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} />
                </div>
                <div className={styles.priceField}>
                  <label className="label">Max ₹</label>
                  <input type="number" className="input" style={{ padding: '8px 12px', fontSize: 13 }}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} />
                </div>
              </div>
              <input type="range" min="0" max="10000" value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className={styles.rangeSlider} />
              <p className={styles.priceLabel}>Up to ₹{priceRange[1].toLocaleString('en-IN')}</p>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <div className={styles.main}>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <p className={styles.resultCount}>
                {loading ? 'Loading…' : `${filtered.length} products`}
              </p>
              <div className={styles.toolbarRight}>
                <button className={`${styles.mobileFilter} btn btn-ghost`}
                  onClick={() => setFilterOpen(true)}>
                  <SlidersHorizontal size={16} /> Filters
                </button>

                <select value={sort} onChange={e => setSort(e.target.value)}
                  className={styles.sortSelect}>
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <div className={styles.viewToggle}>
                  <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                    onClick={() => setViewMode('grid')}>
                    <Grid size={16} />
                  </button>
                  <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                    onClick={() => setViewMode('list')}>
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'products-grid' : styles.listGrid}>
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div className="skeleton" style={{ aspectRatio: viewMode === 'grid' ? '3/4' : '120px / 140px', minHeight: viewMode === 'list' ? 120 : undefined }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Filter size={28} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
                <Link to="/category/all" className="btn btn-outline">View All Products</Link>
              </div>
            ) : (
              <div
                ref={gridRef}
                className={viewMode === 'grid' ? 'products-grid' : styles.listGrid}
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((p, i) => (
                    <motion.div key={p.id} className="product-item"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}>
                      <ProductCard product={p} onAddToCart={handleAddToCart}
                        viewMode={viewMode} delay={0} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div className={styles.filterOverlay}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)} />
            <motion.div className={styles.filterDrawer}
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}>
              <div className={styles.filterDrawerHead}>
                <h3>Filters</h3>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
              {/* reuse sidebar content */}
              <div className={styles.sidebarSection} style={{ padding: '0 20px 20px' }}>
                <h4 className={styles.sidebarHead}>Categories</h4>
                {CATEGORIES.map(cat => (
                  <Link key={cat.id} to={`/category/${cat.id}`}
                    className={styles.sidebarCat}
                    onClick={() => setFilterOpen(false)}>
                    {cat.icon} {cat.label}
                  </Link>
                ))}
              </div>
              <div style={{ padding: '0 20px', borderTop: '1px solid var(--beige)' }}>
                <h4 className={styles.sidebarHead} style={{ marginTop: 20 }}>Price (up to)</h4>
                <input type="range" min="0" max="10000" value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className={styles.rangeSlider} />
                <p className={styles.priceLabel}>₹{priceRange[1].toLocaleString('en-IN')}</p>
              </div>
              <div style={{ padding: 20 }}>
                <button className="btn btn-primary" style={{ width: '100%' }}
                  onClick={() => setFilterOpen(false)}>
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}