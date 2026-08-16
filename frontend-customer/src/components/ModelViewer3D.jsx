import { lazy, Suspense, useEffect, useState } from 'react'

const ModelViewer = lazy(() => import('./ModelViewerImpl.jsx'))

export default function ModelViewer3D({ modelUrl, photos, name }) {
  const [show3D, setShow3D] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)

  const has3D = Boolean(modelUrl)
  const activeView = show3D && has3D

  useEffect(() => {
    setShow3D(true)
    setPhotoIdx(0)
  }, [modelUrl])

  if (has3D) {
    return (
      <>
        <div className="detail-viewer">
          {activeView ? (
            <Suspense fallback={<div className="loading">Loading 3D view…</div>}>
              <ModelViewer src={modelUrl} />
            </Suspense>
          ) : (
            <img className="detail-photo" src={photos[photoIdx] || photos[0]} alt={name} />
          )}
          {activeView && <div className="viewer-hint">Tap &amp; drag to rotate · pinch to zoom</div>}
        </div>
        {(has3D || photos.length > 1) && (
          <div className="thumb-strip">
            {has3D && (
              <button
                className={`thumb ${activeView ? 'active' : ''}`}
                style={{ border: 'none', background: 'var(--bg-card)' }}
                onClick={() => setShow3D(true)}
                aria-label="3D view"
              >
                <span style={{ color: 'var(--gold)' }}>3D</span>
              </button>
            )}
            {photos.map((p, i) => (
              <img
                key={i}
                className={`thumb ${!activeView && photoIdx === i ? 'active' : ''}`}
                src={p}
                alt={`${name} photo ${i + 1}`}
                onClick={() => { setShow3D(false); setPhotoIdx(i) }}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="detail-viewer">
        <img className="detail-photo" src={photos[photoIdx] || photos[0]} alt={name} />
      </div>
      {photos.length > 1 && (
        <div className="thumb-strip">
          {photos.map((p, i) => (
            <img
              key={i}
              className={`thumb ${photoIdx === i ? 'active' : ''}`}
              src={p}
              alt={`${name} photo ${i + 1}`}
              onClick={() => setPhotoIdx(i)}
            />
          ))}
        </div>
      )}
    </>
  )
}
