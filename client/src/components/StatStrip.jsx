import './StatStrip.css'

/** The 4-column summary strip used by Arrival Book and Sale Register.
 *  Was copy-pasted identically into both pages; extracted after review.
 *  `items`: [{ label, value }] */
export default function StatStrip({ items }) {
  return (
    <div className="stat-strip">
      {items.map((item) => (
        <div key={item.label}>
          <p className="stat-strip__label">{item.label}</p>
          <p className="stat-strip__value">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
