// All calendar math works on local dates represented as YYYY-MM-DD strings
// so they line up with the Postgres `date` column with no timezone drift.

export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function startOfWeek(d: Date, weekStartsOn: number): Date {
  const r = new Date(d)
  const day = r.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  r.setDate(r.getDate() - diff)
  r.setHours(0, 0, 0, 0)
  return r
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b)
}

export function today(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

const WEEKDAYS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const WEEKDAYS_SUN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function weekdayLabels(weekStartsOn: number): string[] {
  return weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function monthName(d: Date): string {
  return MONTHS[d.getMonth()]
}

export function formatDayName(d: Date): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return names[d.getDay()]
}

export function diffInDays(a: Date, b: Date): number {
  const ms = fromKey(toKey(a)).getTime() - fromKey(toKey(b)).getTime()
  return Math.round(ms / 86400000)
}
