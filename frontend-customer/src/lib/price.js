export const formatINR = (value) =>
  `₹${Math.round(value).toLocaleString('en-IN')}`

/**
 * Rough material-value estimate: weight x current rate, adjusted for purity.
 * Rates are quoted per gram for the purity shown on the rate bubble (22K gold
 * / 92.5 silver), so a 24K piece is scaled by 24/22 and 18K by 18/22.
 * Making charges are excluded — they are shown separately as free text.
 */
export function estimatePrice({ weight, purity, rates }) {
  if (weight == null || !rates) return null
  const p = String(purity || '').toUpperCase()
  const metal = /925|92\.5|SILVER/.test(p) ? rates.silver : rates.gold
  if (!metal) return null

  let factor = 1
  const karat = p.match(/(\d{2})\s*K/)
  if (karat) factor = Number(karat[1]) / 22

  const value = weight * Number(metal.rate_value) * factor
  if (!Number.isFinite(value) || value <= 0) return null
  return { value, metal: /925|92\.5|SILVER/.test(p) ? 'silver' : 'gold' }
}
