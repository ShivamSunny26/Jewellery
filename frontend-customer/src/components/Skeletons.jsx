export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="sk-card" key={i}>
          <div className="sk-img shimmer" />
          <div className="sk-line shimmer" style={{ width: '70%' }} />
          <div className="sk-line shimmer" style={{ width: '45%' }} />
        </div>
      ))}
    </div>
  )
}

export function LineSkeleton({ width = '100%', height = 16 }) {
  return <div className="sk-line shimmer" style={{ width, height }} aria-hidden="true" />
}

export function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="sk-img shimmer detail-sk" />
      <div className="detail-info">
        <LineSkeleton width="35%" height={12} />
        <LineSkeleton width="75%" height={26} />
        <div className="meta-row">
          <div className="sk-card" style={{ flex: 1 }}>
            <div className="sk-line shimmer" style={{ width: '50%' }} />
            <div className="sk-line shimmer" style={{ width: '70%' }} />
          </div>
          <div className="sk-card" style={{ flex: 1 }}>
            <div className="sk-line shimmer" style={{ width: '50%' }} />
            <div className="sk-line shimmer" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
