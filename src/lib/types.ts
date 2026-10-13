export type Category = {
  id: number
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  sortOrder: number
  isActive: boolean
  _count?: { products: number }
}

export type Flavor = {
  id?: number
  name: string
  imageUrl?: string | null
  isActive?: boolean
}

export type Product = {
  id: number
  name: string
  slug: string
  description?: string | null
  price: string | number
  imageUrl?: string | null
  stock: number
  isActive: boolean
  showOnHome: boolean
  categoryId: number
  category?: Category
  flavors?: Flavor[]
}

export type DealItem = {
  id?: number
  productId: number
  quantity: number
  product?: Product
}

export type Deal = {
  id: number
  name: string
  slug: string
  description?: string | null
  price: string | number
  imageUrl?: string | null
  isActive: boolean
  sortOrder: number
  badgeText?: string | null
  subhead?: string | null
  headline?: string | null
  headlineAccent?: string | null
  bodyText?: string | null
  ctaLabel?: string | null
  disclaimerStrong?: string | null
  disclaimerText?: string | null
  showOnHome?: boolean
  isFeatured?: boolean
  items: DealItem[]
}

export type StoreSettings = {
  storeName: string
  pickupLocation: string
  pickupAddress: string
  rewardsInfo?: string | null
  rewardsRules?: string | null
  rewardsPointsPerDollar?: number
  rewardsPointsPerItem?: number
  doublePointsDay?: boolean
  hasSitePassword?: boolean
  /** Readable gate password; null on rows saved before it was stored. */
  sitePassword?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  tiktokUrl?: string | null
  youtubeUrl?: string | null
}

export type HomePromo = {
  id: number
  headlinePre: string
  headlineAccent: string
  headlinePost: string
  bodyText: string
  ctaLabel: string
  ctaHref: string
  imageUrl?: string | null
  isActive: boolean
  updatedAt: string
}

export type LegalPage = {
  id: number
  slug: string
  title: string
  contentHtml: string
  seoDescription?: string | null
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type Customer = {
  id: number
  email: string
  name: string
  phone: string
  rewardsPoints: number
  createdAt: string
}
