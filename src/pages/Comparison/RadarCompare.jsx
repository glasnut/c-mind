import { useEffect, useState } from 'react'
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { SERIES_COLORS } from './colors.js'

// На узком экране подписи осей не помещаются — уменьшаем диаграмму
function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 560px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 560px)')
    const onChange = () => setNarrow(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return narrow
}

// Лепестковая диаграмма: по каждому критерию — оценка каждого товара.
export default function RadarCompare({ products, criteria }) {
  const narrow = useNarrow()
  const data = criteria.map((c) => {
    const row = { criterion: c.label }
    products.forEach((p, i) => {
      row[p.id] = c.scores[i]
    })
    return row
  })

  return (
    <div className="radar" role="img" aria-label="Лепестковая диаграмма оценок по критериям">
      <ResponsiveContainer width="100%" height={narrow ? 340 : 400}>
        <RadarChart data={data} outerRadius={narrow ? '50%' : '68%'} margin={{ top: 10, right: 30, bottom: 40, left: 30 }}>
          <PolarGrid stroke="rgba(232,237,245,0.18)" />
          <PolarAngleAxis dataKey="criterion" tick={{ fill: '#e8edf5', fontSize: narrow ? 11 : 13 }} />
          <PolarRadiusAxis domain={[0, 10]} tickCount={6} tick={{ fill: 'rgba(232,237,245,0.5)', fontSize: 11 }} axisLine={false} />
          {products.map((p, i) => (
            <Radar
              key={p.id}
              name={p.name}
              dataKey={p.id}
              stroke={SERIES_COLORS[i]}
              fill={SERIES_COLORS[i]}
              fillOpacity={0.14}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
          <Legend verticalAlign="bottom" wrapperStyle={{ color: '#e8edf5', fontSize: 13, paddingTop: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
