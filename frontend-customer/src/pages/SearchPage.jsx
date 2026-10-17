import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import OrnamentExplorer from '../components/OrnamentExplorer.jsx'

const SUGGESTIONS = ['Ring', 'Necklace', 'Bangle', 'Earring', 'Pendant', 'Bridal']

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const [text, setText] = useState(q)
  const inputRef = useRef(null)

  useEffect(() => {
    setText(q)
  }, [q])

  useEffect(() => {
    document.title = `${q ? `Search: ${q}` : 'Search'} · Shree Om Jwellers`
    inputRef.current?.focus({ preventScroll: true })
  }, [q])

  const submit = (value) => {
    const next = value.trim()
    setParams(next ? { q: next } : {})
  }

  return (
    <>
      <div className="page-head">
        <h2>Search the collection</h2>
        <p className="sub">Find a piece by name, material or description.</p>
      </div>

      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit(text)
        }}
      >
        <input
          ref={inputRef}
          className="search-input"
          type="search"
          value={text}
          placeholder="Try “gold ring”, “22K”…"
          aria-label="Search ornaments"
          maxLength={60}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-gold" type="submit">Search</button>
      </form>

      <div className="fchips">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className={`fchip ${q === s ? 'active' : ''}`}
            onClick={() => {
              setText(s)
              submit(s)
            }}
          >
            {s}
          </button>
        ))}
        {q && (
          <button className="fchip" onClick={() => { setText(''); submit('') }}>
            Clear ✕
          </button>
        )}
      </div>

      <OrnamentExplorer q={q || undefined} />
    </>
  )
}
