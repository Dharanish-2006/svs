import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

const CategoryContext = createContext(null)

// Transform backend category (flat: {id, name, slug, icon}) into the
// shape the existing UI components expect:
// { id, label, icon, description, subcategories: [] }
function normalizeCategory(cat) {
  return {
    id:             cat.slug || String(cat.id),
    backendId:      cat.id,
    label:          cat.name,
    icon:           cat.icon || '🛍️',
    description:    cat.description || '',
    subcategories:  [],          // backend has no subcategories yet
    productCount:   cat.product_count || 0,
  }
}

export function CategoryProvider({ children }) {
  const [categories, setCategories]   = useState([])
  const [loading,    setLoading]       = useState(true)
  const [error,      setError]         = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/categories/')
      const normalized = (res.data || []).map(normalizeCategory)
      setCategories(normalized)
    } catch (err) {
      setError('Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Helper: find a category by its slug/id string
  const getCategoryById = useCallback(
    (id) => categories.find(c => c.id === id) || null,
    [categories]
  )

  return (
    <CategoryContext.Provider value={{ categories, loading, error, getCategoryById, refetch: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategories = () => {
  const ctx = useContext(CategoryContext)
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider')
  return ctx
}