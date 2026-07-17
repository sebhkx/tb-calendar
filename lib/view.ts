import { addDays, startOfWeek, startOfMonth, endOfMonth, toKey } from "./date"

export type ViewMode = "day" | "week" | "month"

export interface ViewConfig {
  mode: ViewMode
  // day mode
  dayCount: number // total number of day columns
  daysBefore: number // how many of those days fall before the anchor date
  // week mode
  weekCount: number // total number of week rows
  weeksBefore: number // how many week rows fall before the anchor's week
  // shared
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
}

export const DEFAULT_VIEW: ViewConfig = {
  mode: "week",
  dayCount: 2,
  daysBefore: 1,
  weekCount: 3,
  weeksBefore: 1,
  weekStartsOn: 1,
}

export interface Preset {
  id: string
  label: string
  apply: (c: ViewConfig) => ViewConfig
}

// Presets encode the requested defaults:
//  - "Today + Yesterday": anchored on today, previous day also shown.
//  - Multi-week presets: one week before the anchor, the rest below.
export const PRESETS: Preset[] = [
  { id: "day", label: "Day", apply: (c) => ({ ...c, mode: "day", dayCount: 1, daysBefore: 0 }) },
  { id: "day2", label: "2 Days (+ yesterday)", apply: (c) => ({ ...c, mode: "day", dayCount: 2, daysBefore: 1 }) },
  { id: "day3", label: "3 Days", apply: (c) => ({ ...c, mode: "day", dayCount: 3, daysBefore: 1 }) },
  { id: "week", label: "Week", apply: (c) => ({ ...c, mode: "week", weekCount: 1, weeksBefore: 0 }) },
  { id: "week2", label: "2 Weeks", apply: (c) => ({ ...c, mode: "week", weekCount: 2, weeksBefore: 1 }) },
  { id: "week3", label: "3 Weeks", apply: (c) => ({ ...c, mode: "week", weekCount: 3, weeksBefore: 1 }) },
  { id: "week4", label: "4 Weeks", apply: (c) => ({ ...c, mode: "week", weekCount: 4, weeksBefore: 1 }) },
  { id: "month", label: "Month", apply: (c) => ({ ...c, mode: "month" }) },
]

export interface DayGridItem {
  key: string
  date: Date
  isAnchor: boolean
  inCurrentMonth: boolean
}

/**
 * Returns the flat list of visible days plus grid layout info.
 * columns = number of columns in the CSS grid; rows fill from that.
 */
export function computeGrid(config: ViewConfig, anchor: Date): { days: DayGridItem[]; columns: number } {
  const anchorKey = toKey(anchor)

  if (config.mode === "day") {
    const start = addDays(anchor, -config.daysBefore)
    const days: DayGridItem[] = []
    for (let i = 0; i < Math.max(1, config.dayCount); i++) {
      const date = addDays(start, i)
      days.push({
        key: toKey(date),
        date,
        isAnchor: toKey(date) === anchorKey,
        inCurrentMonth: date.getMonth() === anchor.getMonth(),
      })
    }
    return { days, columns: Math.max(1, config.dayCount) }
  }

  if (config.mode === "month") {
    const first = startOfMonth(anchor)
    const last = endOfMonth(anchor)
    const gridStart = startOfWeek(first, config.weekStartsOn)
    const totalDays = Math.ceil((diffDays(gridStart, last) + 1) / 7) * 7
    const days: DayGridItem[] = []
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(gridStart, i)
      days.push({
        key: toKey(date),
        date,
        isAnchor: toKey(date) === anchorKey,
        inCurrentMonth: date.getMonth() === anchor.getMonth(),
      })
    }
    return { days, columns: 7 }
  }

  // week mode
  const anchorWeekStart = startOfWeek(anchor, config.weekStartsOn)
  const gridStart = addDays(anchorWeekStart, -config.weeksBefore * 7)
  const totalDays = Math.max(1, config.weekCount) * 7
  const days: DayGridItem[] = []
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(gridStart, i)
    days.push({
      key: toKey(date),
      date,
      isAnchor: toKey(date) === anchorKey,
      inCurrentMonth: date.getMonth() === anchor.getMonth(),
    })
  }
  return { days, columns: 7 }
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

// Move the anchor by one "page" in the given direction (-1 back, +1 forward).
export function pageAnchor(config: ViewConfig, anchor: Date, dir: number): Date {
  if (config.mode === "day") return addDays(anchor, dir * Math.max(1, config.dayCount))
  if (config.mode === "month") {
    const d = new Date(anchor)
    d.setMonth(d.getMonth() + dir)
    return d
  }
  return addDays(anchor, dir * Math.max(1, config.weekCount) * 7)
}
