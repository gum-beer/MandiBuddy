import './DateRangeFilter.css'

/** The "From / To / OK" bar used by Arrival Book and Sale Register.
 *  Was copy-pasted identically into both pages; extracted after review. */
export default function DateRangeFilter({ fromDate, toDate, onFromChange, onToChange, onApply }) {
  return (
    <div className="date-range-filter">
      <label>
        From
        <input
          className="ledger-input"
          type="date"
          value={fromDate}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </label>
      <label>
        To
        <input
          className="ledger-input"
          type="date"
          value={toDate}
          onChange={(e) => onToChange(e.target.value)}
        />
      </label>
      <button className="btn" type="button" onClick={onApply}>
        OK
      </button>
    </div>
  )
}
