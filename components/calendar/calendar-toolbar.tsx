"use client"

import { useMemo } from "react"
import { useApp } from "@/components/store"
import { PRESETS, pageAnchor, computeGrid } from "@/lib/view"
import { today, monthName } from "@/lib/date"
import { Popover } from "@/components/popover"
import { ViewSettings } from "./view-settings"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronDown, PanelLeft, PanelRight, Settings2 } from "lucide-react"

function currentPresetLabel(config: ReturnType<typeof useApp>["config"]): string {
  if (config.mode === "month") return "Month"
  if (config.mode === "day") {
    if (config.dayCount === 1) return "Day"
    return `${config.dayCount} Days`
  }
  if (config.weekCount === 1) return "Week"
  return `${config.weekCount} Weeks`
}

export function CalendarToolbar() {
  const { config, setConfig, anchor, setAnchor, leftOpen, setLeftOpen, rightOpen, setRightOpen } = useApp()

  const title = useMemo(() => {
    const { days } = computeGrid(config, anchor)
    const first = days[0]?.date ?? anchor
    const last = days[days.length - 1]?.date ?? anchor
    if (config.mode === "month") return `${monthName(anchor)} ${anchor.getFullYear()}`
    if (first.getMonth() === last.getMonth()) return `${monthName(first)} ${first.getFullYear()}`
    if (first.getFullYear() === last.getFullYear())
      return `${monthName(first).slice(0, 3)} – ${monthName(last).slice(0, 3)} ${first.getFullYear()}`
    return `${monthName(first).slice(0, 3)} ${first.getFullYear()} – ${monthName(last).slice(0, 3)} ${last.getFullYear()}`
  }, [config, anchor])

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
      <button
        type="button"
        aria-label="Toggle lists sidebar"
        onClick={() => setLeftOpen(!leftOpen)}
        className={cn(
          "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
          leftOpen && "text-foreground",
        )}
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <h1 className="mr-auto text-lg font-semibold text-balance">{title}</h1>

      {/* Preset selector */}
      <Popover
        trigger={({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-accent"
          >
            {currentPresetLabel(config)}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      >
        {({ close }) => (
          <div className="w-44">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setConfig((c) => p.apply(c))
                  close()
                }}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </Popover>

      {/* Customization */}
      <Popover
        align="end"
        trigger={({ toggle, open }) => (
          <button
            type="button"
            aria-label="Customize view"
            onClick={toggle}
            className={cn(
              "rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
              open && "text-foreground",
            )}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
      >
        {() => <ViewSettings />}
      </Popover>

      {/* Navigation */}
      <div className="flex items-center overflow-hidden rounded-md border border-border">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => setAnchor(pageAnchor(config, anchor, -1))}
          className="p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setAnchor(today())}
          className="border-x border-border px-2.5 py-1 text-sm hover:bg-accent"
        >
          Today
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => setAnchor(pageAnchor(config, anchor, 1))}
          className="p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        aria-label="Toggle detail panel"
        onClick={() => setRightOpen(!rightOpen)}
        className={cn(
          "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
          rightOpen && "text-foreground",
        )}
      >
        <PanelRight className="h-4 w-4" />
      </button>
    </div>
  )
}
