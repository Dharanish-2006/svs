// src/components/ProductCard.jsx
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react'
import { getImageUrl } from '../utils/api'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, onAddToCart, delay = 0, viewMode = 'grid' }) {
  const [wishlist,    setWishlist]    = useState(false)
  const [imgLoaded,   setImgLoaded]   = useState(false)
  const [addingCart,  setAddingCart]  = useState(false)
  const cardRef = useRef(null)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.is_in_stock) return
    setAddingCart(true)
    try {
      await onAddToCart?.(product)
    } finally {
      setTimeout(() => setAddingCart(false), 800)
    }
  }

  const isOutOfStock = !product.is_in_stock || product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5

  if (viewMode === 'list') {
    return (
      <motion.div
        ref={cardRef}
        className={styles.listCard}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        <Link to={`/product/${product.id}`} className={styles.listImage}>
          {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton}`} />}
          <img src={getImageUrl(product.image)} alt={product.product_name}
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)} />
        </Link>
        <div className={styles.listInfo}>
          <Link to={`/product/${product.id}`}>
            <h3 className={styles.listName}>{product.product_name}</h3>
          </Link>
          <p className={styles.listDesc}>{product.description?.slice(0, 80)}…</p>
          <div className={styles.listFooter}>
            <span className={styles.price}>RM{product.price?.toLocaleString('en-IN')}</span>
            <button className={`btn btn-primary ${styles.listBtn}`}
              onClick={handleAddToCart} disabled={isOutOfStock}>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className={styles.imageWrap}>
        {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton}`} />}
        <img
          src={getImageUrl(product.image)}
          alt={product.product_name}
          className={`${styles.image} ${imgLoaded ? styles.imageLoaded : ''}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />

        {/* Overlay actions */}
        <div className={styles.overlay}>
          <motion.button
            className={styles.overlayBtn}
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingCart}
            whileTap={{ scale: 0.92 }}
          >
            <ShoppingBag size={16} />
            {addingCart ? 'Adding…' : isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
          </motion.button>
          <Link to={`/product/${product.id}`} className={styles.overlayIconBtn}>
            <Eye size={16} />
          </Link>
        </div>

        {/* Badges */}
        <div className={styles.badges}>
          {isOutOfStock && (
            <span className={`badge badge-error ${styles.badge}`}>Out of Stock</span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className={`badge badge-gold ${styles.badge}`}>Only {product.stock} left</span>
          )}
          {product.is_new && (
            <span className={`badge badge-maroon ${styles.badge}`}>New</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`${styles.wishlistBtn} ${wishlist ? styles.wishlisted : ''}`}
          onClick={(e) => { e.preventDefault(); setWishlist(w => !w) }}>
          <Heart size={16} fill={wishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.rating}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11}
              fill={i < 4 ? 'var(--gold)' : 'none'}
              color="var(--gold)" />
          ))}
          <span className={styles.ratingCount}>(24)</span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className={styles.name}>{product.product_name}</h3>
        </Link>

        <div className={styles.priceRow}>
          <span className={styles.price}>RM{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              RM{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}