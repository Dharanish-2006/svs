// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/login/', form)
      const { access, refresh } = res.data
      const payload = JSON.parse(atob(access.split('.')[1]))
      login(access, refresh, { username: payload.name || form.email.split('@')[0] })
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid credentials'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <h2 className={styles.leftTitle}>
            Where Tradition<br />
            <em>Meets Elegance</em>
          </h2>
          <p className={styles.leftSub}>
            SVS Collection — curating India's finest ethnic wear and jewelry since 1998.
          </p>
          <div className={styles.leftDecor}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 80, color: 'rgba(201,151,58,0.15)', lineHeight: 1 }}>❧</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <motion.div className={styles.card}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>

          <Link to="/" className={styles.brandLink}>
            <span className={styles.brand}>SVS Collection</span>
          </Link>

          <div className={styles.cardHead}>
            <h1 className={styles.cardTitle}>Welcome Back</h1>
            <p className={styles.cardSub}>Sign in to your account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className="label">Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input type="email" className={`input ${styles.inputPadded}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required />
              </div>
            </div>

            <div className={styles.field}>
              <label className="label">Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input type={showPass ? 'text' : 'password'}
                  className={`input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.footer}>
            New to SVS Collection?{' '}
            <Link to="/signup" className={styles.footerLink}>Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}