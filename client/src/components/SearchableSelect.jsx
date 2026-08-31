import { useEffect, useMemo, useRef, useState } from 'react'
import './SearchableSelect.css'

/** A plain-input + filtered-list combobox. No component library exists in
 *  this project, and this is the one control the Stock Sale spec calls
 *  for by name ("all the dropdowns should be able to exercise search
 *  feature as well") — worth its own small component rather than
 *  duplicating the filter/open/close logic per field. */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  disabled = false,
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    setQuery(selected ? selected.label : '')
  }, [selected?.label, value])

  useEffect(() => {
    const onClickAway = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q === selected?.label.toLowerCase()) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query, selected])

  const pick = (option) => {
    onChange(option.value)
    setQuery(option.label)
    setOpen(false)
  }

  return (
    <div className="searchable-select" ref={rootRef}>
      <input
        className="ledger-input"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          if (e.target.value === '') onChange('')
        }}
      />
      {open && filtered.length > 0 ? (
        <ul className="searchable-select__menu" role="listbox">
          {filtered.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className="searchable-select__option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
