/* ------------------------------------------------------------------
   Date helpers for the app screens (arrival/sale dates are always a
   plain calendar day, never a timestamp).
   ------------------------------------------------------------------ */

/** Today as YYYY-MM-DD, in the browser's local timezone.
 *  Deliberately NOT `new Date().toISOString().slice(0, 10)` — that
 *  returns the UTC date, which is the wrong calendar day for part of
 *  the night for anyone east of UTC (e.g. IST, midnight–5:30am). */
export function todayIso() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
