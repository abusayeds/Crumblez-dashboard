// Storefront URLs for the pages that already existed as static routes. Anything
// the admin creates beyond these is served from /legal/<slug>.
const KNOWN_PATHS: Record<string, string> = {
  'do-not-sell': '/data-privacy-rights',
  privacy: '/content/privacy',
  'terms-of-use': '/content/terms-of-use',
  'accessibility-policy': '/content/accessibility-policy',
  'customer-support': '/content/customer-support',
  'gift-cards': '/content/gift-cards',
  nutrition: '/content/nutrition',
  ingredients: '/content/ingredients',
}

export function legalPagePath(slug: string) {
  return KNOWN_PATHS[slug] ?? `/legal/${slug}`
}
