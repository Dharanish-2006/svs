import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Package,
  Shield,
  ChevronLeft,
  ChevronRight,
  XCircle,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { productService, cartService } from '../services'
import { getImageUrl } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import styles from './ProductDetail.module.css'

// ── Zoom Modal ─────────────────────────────────────────────────────────────────
function ZoomModal({ images, initialIndex, onClose }) {
  const [activeImg, setActiveImg] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(null)
  const imgRef = useRef(null)

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom(z => Math.max(1, Math.min(4, z + delta)))
    if (zoom + delta <= 1) setPan({ x: 0, y: 0 })
  }, [zoom])

  const handleMouseDown = (e) => {
    if (zoom <= 1) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart.current) return
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  const handleMouseUp = () => { setIsDragging(false); dragStart.current = null }

  const prev = () => { setActiveImg(i => (i - 1 + images.length) % images.length); resetZoom() }
  const next = () => { setActiveImg(i => (i + 1) % images.length); resetZoom() }

  useEffect(() => {
    const el = imgRef.current
    if (el) el.addEventListener('wheel', handleWheel, { passive: false })
    return () => { if (el) el.removeEventListener('wheel', handleWheel) }
  }, [handleWheel])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      className={styles.zoomModal}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.zoomHeader}>
        <div className={styles.zoomControls}>
          <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.max(1, z - 0.5))} disabled={zoom <= 1}>
            <ZoomOut size={18} />
          </button>
          <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
          <button className={styles.zoomBtn} onClick={() => setZoom(z => Math.min(4, z + 0.5))}>
            <ZoomIn size={18} />
          </button>
          <button className={styles.zoomBtn} onClick={resetZoom} disabled={zoom === 1}>
            Reset
          </button>
        </div>
        <button className={styles.zoomClose} onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      <div
        ref={imgRef}
        className={styles.zoomImgWrap}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={getImageUrl(images[activeImg])}
          alt=""
          className={styles.zoomImg}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>

      {images.length > 1 && (
        <>
          <button className={`${styles.zoomNav} ${styles.zoomNavPrev}`} onClick={prev}>
            <ChevronLeft size={28} />
          </button>
          <button className={`${styles.zoomNav} ${styles.zoomNavNext}`} onClick={next}>
            <ChevronRight size={28} />
          </button>
          <div className={styles.zoomDots}>
            {images.map((_, i) => (
              <button
                key={i}
                className={`${styles.zoomDot} ${i === activeImg ? styles.zoomDotActive : ''}`}
                onClick={() => { setActiveImg(i); resetZoom() }}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [thumbsRef] = useState(() => ({ current: null }))

  const { increment } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    productService.get(id)
      .then(setProduct)
      .catch(() => { toast.error('Product not found'); navigate('/') })
      .finally(() => setLoading(false))
  }, [id])

  const allImages = product
    ? [product.image, ...(product.images?.map(i => i.image) || [])].filter(Boolean)
    : []

  const goTo = (idx) => {
    setActiveImg(idx)
    // scroll thumb into view
    const thumbEl = document.querySelector(`[data-thumb="${idx}"]`)
    if (thumbEl) thumbEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const prev = () => goTo((activeImg - 1 + allImages.length) % allImages.length)
  const next = () => goTo((activeImg + 1) % allImages.length)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Log in to add items to your cart', { icon: '🔒' })
      navigate('/login')
      return
    }
    try {
      await cartService.add(product.id, qty)
      for (let i = 0; i < qty; i++) increment()
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }
  if (!product) return null

  return (
    <div className="page">
      <div className="container">
        <motion.button
          className={styles.back}
          onClick={() => navigate(-1)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div className={styles.grid}>

          {/* ── GALLERY ── */}
          <motion.div
            className={styles.gallery}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Main image */}
            <div className={styles.mainImage}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  className={styles.mainImageInner}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                >
                  {allImages[activeImg] ? (
                    <img
                      src={getImageUrl(allImages[activeImg])}
                      alt={product.product_name}
                      className={styles.mainImg}
                    />
                  ) : (
                    <div className={styles.imgPlaceholder}>
                      <Package size={60} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Zoom button */}
              {allImages.length > 0 && (
                <button
                  className={styles.zoomTrigger}
                  onClick={() => setZoomOpen(true)}
                  title="Zoom image"
                >
                  <Maximize2 size={16} />
                  <span>Zoom</span>
                </button>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className={styles.imgCounter}>
                  {activeImg + 1} / {allImages.length}
                </div>
              )}

              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={prev}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className={`${styles.navBtn} ${styles.navNext}`} onClick={next}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {allImages.length > 1 && (
              <div className={styles.dotRow}>
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === activeImg ? styles.dotActive : ''}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            )}

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className={styles.thumbs}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    data-thumb={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                    onClick={() => goTo(i)}
                  >
                    <img src={getImageUrl(img)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── INFO ── */}
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={styles.badge}>
              <span className={`badge ${product.is_in_stock ? 'badge-accent' : 'badge-error'}`}>
                {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="badge badge-gold" style={{ marginLeft: 8 }}>
                  Only {product.stock} left!
                </span>
              )}
            </div>

            <h1 className={styles.name}>{product.product_name}</h1>

            <div className={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? 'var(--gold)' : 'none'} color="var(--gold)" />
              ))}
              <span className={styles.ratingCount}>(124 reviews)</span>
            </div>

            <div className={styles.price}>
              <span className={styles.priceSymbol}>₹</span>
              <span className={styles.priceValue}>{product.price?.toLocaleString('en-IN')}</span>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Quantity</span>
              <div className={styles.qtyControl}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className={styles.qtyBtn}>-</button>
                <span className={styles.qtyValue}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className={styles.qtyBtn}>+</button>
              </div>
            </div>

            {!product.is_in_stock || product.stock === 0 ? (
              <div className={styles.outOfStock}>
                <XCircle size={18} />
                Out of Stock
              </div>
            ) : (
              <motion.button
                className={`btn btn-primary ${styles.addCartBtn}`}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
              >
                <ShoppingCart size={18} />
                {isAuthenticated ? 'Add to Cart' : 'Log in to Add'}
              </motion.button>
            )}

            <div className={styles.guarantees}>
              <div className={styles.guarantee}>
                <Shield size={16} />
                <span>Secure payment</span>
              </div>
              <div className={styles.guarantee}>
                <Package size={16} />
                <span>Free shipping above ₹999</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <ZoomModal
            images={allImages}
            initialIndex={activeImg}
            onClose={() => setZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}