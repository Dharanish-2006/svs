export const CATEGORIES = [
  {
    id: 'clothing',
    label: 'Clothing',
    labelTa: 'ஆடைகள்',
    icon: '👘',
    description: 'Traditional & contemporary Indian wear',
    subcategories: [
      {
        id: 'men',
        label: "Men's",
        items: [
          { id: 'shirts',   label: 'Shirts'   },
          { id: 'tshirts',  label: 'T-Shirts'  },
          { id: 'veshti',   label: 'Veshti'   },
          { id: 'shorts',   label: 'Shorts'   },
        ],
      },
      {
        id: 'women',
        label: "Women's",
        items: [
          { id: 'sarees',        label: 'Sarees'        },
          { id: 'punjabi-suits', label: 'Punjabi Suits'  },
          { id: 'dresses',       label: 'Dresses'       },
          { id: 'kurtis',        label: 'Kurtis'        },
        ],
      },
    ],
  },
  {
    id: 'jewelry',
    label: 'Fashion Jewelry',
    labelTa: 'நகைகள்',
    icon: '💍',
    description: 'Handcrafted ornaments & accessories',
    subcategories: [
      {
        id: 'jewelry-types',
        label: 'Collections',
        items: [
          { id: 'necklaces', label: 'Necklaces' },
          { id: 'earrings',  label: 'Earrings'  },
          { id: 'bangles',   label: 'Bangles'   },
          { id: 'rings',     label: 'Rings'     },
        ],
      },
    ],
  },
  {
    id: 'flowers',
    label: 'Flowers',
    labelTa: 'மலர்கள்',
    icon: '🌸',
    description: 'Fresh blooms for every occasion',
    subcategories: [
      {
        id: 'flower-types',
        label: 'Types',
        items: [
          { id: 'fresh-flowers',  label: 'Fresh Flowers'  },
          { id: 'garlands',       label: 'Garlands'       },
          { id: 'bouquets',       label: 'Bouquets'       },
          { id: 'pooja-flowers',  label: 'Pooja Flowers'  },
        ],
      },
    ],
  },
  {
    id: 'pooja',
    label: 'Pooja Items',
    labelTa: 'பூஜை பொருட்கள்',
    icon: '🪔',
    description: 'Sacred essentials for daily rituals',
    subcategories: [
      {
        id: 'pooja-types',
        label: 'Items',
        items: [
          { id: 'pooja-kits',  label: 'Pooja Kits'  },
          { id: 'agarbatti',   label: 'Agarbatti'   },
          { id: 'diyas',       label: 'Diyas'       },
          { id: 'kumkum',      label: 'Kumkum'      },
          { id: 'idols',       label: 'Idols'       },
        ],
      },
    ],
  },
]

// Flat list of all subcategory items for filtering
export const ALL_SUBCATEGORIES = CATEGORIES.flatMap(cat =>
  cat.subcategories.flatMap(sub =>
    sub.items.map(item => ({
      ...item,
      parentId:    cat.id,
      parentLabel: cat.label,
      subId:       sub.id,
    }))
  )
)

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || null
}

export function getSubcategoryById(catId, subItemId) {
  const cat = getCategoryById(catId)
  if (!cat) return null
  for (const sub of cat.subcategories) {
    const item = sub.items.find(i => i.id === subItemId)
    if (item) return { ...item, parent: cat, subGroup: sub }
  }
  return null
}