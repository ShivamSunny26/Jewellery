import { useEffect, useState } from 'react'
import { api } from '../api.js'
import OrnamentCard from './OrnamentCard.jsx'
import { GridSkeleton } from './Skeletons.jsx'

const PAGE_SIZE = 12
const SORTS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['name', 'Name A–Z'],
  ['weight_asc', 'Weight: low to high'],
  ['weight_desc', 'Weight: high to low']
]

export default function OrnamentExplorer({ category, q }) {
  const [sort, setSort] = useState('newest')
  const [purity, setPurity] = useState('')
  const [page, setPage] = useState(1)
  const [purities, setPurities] = useState([])
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const filter = { category, q, purity, sort }

  const [applied, setApplied] = useState(filter)
  if (
    applied.category !== category ||
    applied.q !== q ||
    applied.purity !== purity ||
    applied.sort !== sort
  ) {
    setApplied(filter)
    setPage(1)
  }

  useEffect(() => {
    api.purities().then(setPurities).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    api
      .ornaments({ category, q, purity, sort, page, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
        setMeta({ total: res.total, pages: res.pages })
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category, q, purity, sort, page, reloadKey])

  const retry = () => {
    setPage(1)
    setReloadKey((k) => k + 1)
  }

  const hasFilters = purities.length > 1

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-row">
          <span className="count">
            {loading && page === 1 ? '…' : `${meta.total} piece${meta.total === 1 ? '' : 's'}`}
          </span>
          <label className="sort-wrap">
            <span className="sr-only">Sort by</span>
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
            >
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {hasFilters && (
          <div className="fchips" role="group" aria-label="Filter by purity">
            <button
              className={`fchip ${purity === '' ? 'active' : ''}`}
              onClick={() => setPurity('')}
            >
              All
            </button>
            {purities.map((p) => (
              <button
                key={p}
                className={`fchip ${purity === p ? 'active' : ''}`}
                onClick={() => setPurity(purity === p ? '' : p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        {err ? (
          <div className="error-box">
            Could not load pieces. <button className="link-btn" onClick={retry}>Retry</button>
          </div>
        ) : loading && page === 1 ? (
          <GridSkeleton />
        ) : items.length === 0 ? (
          <div className="empty">
            {q
              ? `No pieces match “${q}”. Try another word or browse categories.`
              : 'No pieces here right now. Ask us in store.'}
          </div>
        ) : (
          <>
            <div className="grid">
              {items.map((o) => <OrnamentCard key={o.id} o={o} />)}
            </div>
            {page < meta.pages && (
              <button
                className="load-more"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
              >
                {loading ? 'Loading…' : `Load more (${meta.total - items.length} left)`}
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
