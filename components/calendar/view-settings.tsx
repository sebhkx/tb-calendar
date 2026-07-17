"use client"

import { useApp } from "@/components/store"
import type { ViewMode } from "@/lib/view"
import { cn } from "@/lib/utils"

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-6 w-6 rounded-md border border-border text-sm hover:bg-accent"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
          }}
          className="h-6 w-12 rounded-md border border-border bg-background text-center text-sm tabular-nums outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-6 w-6 rounded-md border border-border text-sm hover:bg-accent"
        >
          +
        </button>
      </div>
    </div>
  )
}

export function ViewSettings() {
  const { config, setConfig } = useApp()

  const modes: { id: ViewMode; label: string }[] = [
    { id: "day", label: "Days" },
    { id: "week", label: "Weeks" },
    { id: "month", label: "Month" },
  ]

  return (
    <div className="w-72 p-2">
      <div className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Customize view
      </div>

      <div className="mb-2 grid grid-cols-3 gap-1">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setConfig((c) => ({ ...c, mode: m.id }))}
            className={cn(
              "rounded-md border px-2 py-1.5 text-sm transition-colors",
              config.mode === m.id
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="border-t border-border px-1">
        {config.mode === "day" && (
          <>
            <NumberField
              label="Number of days"
              hint="Any number of day columns"
              value={config.dayCount}
              min={1}
              max={31}
              onChange={(v) => setConfig((c) => ({ ...c, dayCount: v }))}
            />
            <NumberField
              label="Days before today"
              hint="e.g. 1 shows yesterday too"
              value={config.daysBefore}
              min={0}
              max={Math.max(0, config.dayCount - 1)}
              onChange={(v) => setConfig((c) => ({ ...c, daysBefore: v }))}
            />
          </>
        )}

        {config.mode === "week" && (
          <>
            <NumberField
              label="Number of weeks"
              hint="Stacked week rows"
              value={config.weekCount}
              min={1}
              max={12}
              onChange={(v) => setConfig((c) => ({ ...c, weekCount: v }))}
            />
            <NumberField
              label="Weeks before current"
              hint="e.g. 1 shows last week on top"
              value={config.weeksBefore}
              min={0}
              max={Math.max(0, config.weekCount - 1)}
              onChange={(v) => setConfig((c) => ({ ...c, weeksBefore: v }))}
            />
          </>
        )}

        {config.mode === "month" && (
          <div className="py-2 text-xs text-muted-foreground">
            Month view shows the full calendar month with leading and trailing days.
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border py-2">
          <div className="text-sm">Week starts on</div>
          <div className="flex overflow-hidden rounded-md border border-border">
            {(
              [
                { v: 1, l: "Mon" },
                { v: 0, l: "Sun" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setConfig((c) => ({ ...c, weekStartsOn: o.v }))}
                className={cn(
                  "px-2.5 py-1 text-sm",
                  config.weekStartsOn === o.v ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
