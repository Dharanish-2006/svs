import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { SitemapStream, streamToPromise } from 'sitemap'

const BASE_URL = 'https://www.svscollection.com'
const API_URL = 'https://svs-90l6.onrender.com/api/products'

const outputPath = './public/sitemap.xml'

fs.mkdirSync(path.dirname(outputPath), { recursive: true })

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: BASE_URL })

  sitemap.write({ url: '/', changefreq: 'daily' })
  sitemap.write({ url: '/contact' })

  const categories = [
    'sarees',
    'salwar',
    'party-wear',
    'daily-wear'
  ]

  categories.forEach(cat => {
    sitemap.write({ url: `/category/${cat}` })
  })

  const subcategories = [
    { category: 'sarees', sub: 'silk' },
    { category: 'sarees', sub: 'cotton' },
    { category: 'salwar', sub: 'designer' }
  ]

  subcategories.forEach(s => {
    sitemap.write({
      url: `/category/${s.category}/${s.sub}`
    })
  })

  try {
    const res = await fetch(API_URL)
    const products = await res.json()

    products.forEach(product => {
      sitemap.write({
        url: `/product/${product._id || product.id}`,
      })
    })

    console.log(` Added ${products.length} products`)
  } catch (err) {
    console.error(' Failed to fetch products:', err.message)
  }

  sitemap.end()

  const data = await streamToPromise(sitemap)

  fs.writeFileSync(outputPath, data)

  console.log('✅ Sitemap generated at /public/sitemap.xml')
}

generateSitemap()