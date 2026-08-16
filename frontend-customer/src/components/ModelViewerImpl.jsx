import { useEffect, useRef, useState } from 'react'

export default function ModelViewerImpl({ src }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadScript() {
      if (!window.customElements.get('model-viewer')) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js'
        script.type = 'module'
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      if (!cancelled) setReady(true)
    }
    loadScript().catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [])

  const [ready, setReady] = useState(false)

  if (failed) return <div className="loading">3D view unavailable — see photos below</div>
  if (!ready) return <div className="loading"><div className="spinner" />Loading 3D model…</div>

  return (
    <model-viewer
      ref={ref}
      src={src}
      camera-controls
      auto-rotate
      auto-rotate-delay="3000"
      interaction-prompt="auto"
      alt="3D ornament view"
      ar
    />
  )
}
