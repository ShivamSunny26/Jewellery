const W = 320

function niceBounds(values) {
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min -= 1
    max += 1
  }
  const pad = (max - min) * 0.12
  return { min: min - pad, max: max + pad }
}

export default function LineChart({ series, height = 170, format = (v) => v }) {
  const all = series.flatMap((s) => s.points)
  if (!all.length) {
    return <div className="chart-empty">No history recorded yet.</div>
  }

  const dates = [...new Set(all.map((p) => p.date))].sort()
  const { min, max } = niceBounds(all.map((p) => p.rate_value))

  const padX = 14
  const padY = 18
  const innerW = W - padX * 2
  const innerH = height - padY * 2

  const x = (date) => {
    const i = dates.indexOf(date)
    return padX + (dates.length === 1 ? innerW / 2 : (i * innerW) / (dates.length - 1))
  }
  const y = (value) => padY + innerH - ((value - min) / (max - min)) * innerH

  const gridLines = [0, 0.5, 1].map((t) => ({
    yPos: padY + innerH * t,
    label: format(min + (max - min) * (1 - t))
  }))

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="linechart"
        role="img"
        aria-label="Rate trend chart"
      >
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padX} x2={W - padX} y1={g.yPos} y2={g.yPos} className="grid-line" />
            <text x={2} y={g.yPos + 3} className="axis-label">{g.label}</text>
          </g>
        ))}

        {series.map((s) => {
          const pts = s.points
          if (!pts.length) return null
          const d = pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date).toFixed(1)},${y(p.rate_value).toFixed(1)}`)
            .join(' ')
          const last = pts[pts.length - 1]
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
              {pts.map((p) => (
                <circle key={p.date} cx={x(p.date)} cy={y(p.rate_value)} r="6" fill="transparent">
                  <title>{`${p.date}: ${format(p.rate_value)}`}</title>
                </circle>
              ))}
              <circle
                cx={x(last.date)}
                cy={y(last.rate_value)}
                r="3.5"
                fill={s.color}
              />
            </g>
          )
        })}

        <text x={padX} y={height - 4} className="axis-label">{dates[0]}</text>
        <text x={W - padX} y={height - 4} textAnchor="end" className="axis-label">
          {dates[dates.length - 1]}
        </text>
      </svg>

      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.key} className="legend-item">
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
