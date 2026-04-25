// src/pages/Contact.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Youtube } from 'lucide-react'
import styles from './Contact.module.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailto = `mailto:thesvscollections@gmail.com?subject=${encodeURIComponent(form.subject || 'Enquiry from Website')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
    window.open(mailto, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className="container">
          <motion.span
            className="section-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Get in Touch
          </motion.span>
          <motion.h1
            className={`display-md ${styles.heroTitle}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We'd Love to Hear <em>From You</em>
          </motion.h1>
          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Questions about an order, a custom request, or just want to say hello?
            <br />Reach out and we'll get back to you.
          </motion.p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>

          {/* ── Contact Info ── */}
          <motion.aside
            className={styles.info}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap}>
                <Mail size={20} />
              </div>
              <div>
                <p className={styles.infoLabel}>Email Us</p>
                <a href="mailto:thesvscollections@gmail.com" className={styles.infoValue}>
                  thesvscollections@gmail.com
                </a>
                <p className={styles.infoNote}>We reply within 24 hours</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap}>
                <Phone size={20} />
              </div>
              <div>
                <p className={styles.infoLabel}>Call / WhatsApp</p>
                <a href="tel:+60149773188" className={styles.infoValue}>
                  +601 4977 3188
                </a>
                <p className={styles.infoNote}>Mon – Sat, 9 AM – 7 PM</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap}>
                <MapPin size={20} />
              </div>
              <div>
                <p className={styles.infoLabel}>Visit Our Store</p>
                <a
                  href="https://share.google/vRxmzoKAsTvpq2Wef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoValue}
                >
                  133, Jalan Seri Sentosa 8A
                </a>
                <p className={styles.infoNote}>
                  Taman Sri Sentosa, 58000<br />
                  Kuala Lumpur, Malaysia
                </p>
                <a
                  href="https://share.google/vRxmzoKAsTvpq2Wef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoMapLink}
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/60149773188"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>

            <div className={styles.social}>
              <p className={styles.socialLabel}>Follow Us</p>
              <div className={styles.socialLinks}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
          </motion.aside>

          {/* ── Contact Form ── */}
          <motion.div
            className={styles.formWrap}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className={styles.formTitle}>Send a Message</h2>

            {sent && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                ✓ Your message app has opened. Send it to reach us!
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className="label">Your Name</label>
                  <input
                    name="name"
                    className="input"
                    placeholder="Anitha Kumar"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className="label">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className="label">Subject</label>
                <input
                  name="subject"
                  className="input"
                  placeholder="e.g. Bulk order inquiry / Custom saree request"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label className="label">Message</label>
                <textarea
                  name="message"
                  className="input"
                  rows={6}
                  style={{ resize: 'vertical' }}
                  placeholder="Tell us how we can help you…"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                <Send size={16} />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>

        {/* ── Map embed ── */}
        <motion.div
          className={styles.mapSection}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.mapTitle}>Find Our Store</h2>
          <p className={styles.mapAddr}>
            133, Jalan Seri Sentosa 8A, Taman Sri Sentosa, 58000 Kuala Lumpur, Malaysia
          </p>
          <div className={styles.mapFrame}>
            <iframe
              title="SVS Collection — Taman Sri Sentosa, Kuala Lumpur"
              src="https://maps.google.com/maps?q=133+Jalan+Seri+Sentosa+8A+Taman+Sri+Sentosa+58000+Kuala+Lumpur+Malaysia&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href="https://share.google/vRxmzoKAsTvpq2Wef"
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-outline ${styles.directionsBtn}`}
          >
            <MapPin size={16} />
            Get Directions
          </a>
        </motion.div>
      </div>
    </div>
  )
}