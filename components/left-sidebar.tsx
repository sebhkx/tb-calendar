"use client"

import { useMemo, useState } from "react"
import { useApp, type Selection } from "@/components/store"
import { getColor, COLOR_OPTIONS } from "@/lib/colors"
import { toKey, today, addDays } from "@/lib/date"
import { cn } from "@/lib/utils"
import { Popover } from "@/components/popover"
import { CalendarDays, CalendarClock, Layers, Plus, Trash2, Hash } from "lucide-react"

export function LeftSidebar() {
  const { lists, tasks, selection, setSelection, addList, removeList } = useApp()
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("blue")

  const todayKey = toKey(today())
  const in7 = toKey(addDays(today(), 7))

  const counts = useMemo(() => {
    let all = 0
    let todayCount = 0
    let upcoming = 0
    const byList = new Map<number, number>()
    for (const t of tasks) {
      if (t.completed) continue
      all++
      if (t.dueDate === todayKey) todayCount++
      if (t.dueDate && t.dueDate >= todayKey && t.dueDate <= in7) upcoming++
      if (t.listId != null) byList.set(t.listId, (byList.get(t.listId) ?? 0) + 1)
    }
    return { all, todayCount, upcoming, byList }
  }, [tasks, todayKey, in7])

  function isActive(s: Selection) {
    if (s.kind !== selection.kind) return false
    if (s.kind === "list" && selection.kind === "list") return s.listId === selection.listId
    return true
  }

  const smart: { s: Selection; label: string; icon: typeof Layers; count: number }[] = [
    { s: { kind: "all" }, label: "All Tasks", icon: Layers, count: counts.all },
    { s: { kind: "today" }, label: "Today", icon: CalendarDays, count: counts.todayCount },
    { s: { kind: "upcoming" }, label: "Next 7 Days", icon: CalendarClock, count: counts.upcoming },
  ]

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-3">
        <div className="text-sm font-semibold">Timeline</div>
        <div className="text-xs text-muted-foreground">Calendar to-do</div>
      </div>

      <nav className="px-2">
        {smart.map(({ s, label, icon: Icon, count }) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelection(s)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive(s) ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {count > 0 && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-4 flex items-center justify-between px-4 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lists</span>
        <Popover
          align="start"
          trigger={({ toggle }) => (
            <button
              type="button"
              aria-label="Add list"
              onClick={toggle}
              className="rounded p-0.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        >
          {({ close }) => (
            <div className="w-56 p-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  if (e.key === "Enter" && newName.trim()) {
                    addList(newName.trim(), newColor)
                    setNewName("")
                    close()
                  }
                }}
                placeholder="List name"
                className="mb-2 w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
              />
              <div className="mb-2 flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.label}
                    onClick={() => setNewColor(c.id)}
                    className={cn(
                      "h-5 w-5 rounded-full",
                      c.dot,
                      newColor === c.id && "ring-2 ring-offset-2 ring-offset-popover ring-foreground",
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={!newName.trim()}
                onClick={() => {
                  addList(newName.trim(), newColor)
                  setNewName("")
                  close()
                }}
                className="w-full rounded-md bg-primary px-2 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Add list
              </button>
            </div>
          )}
        </Popover>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {lists.map((l) => {
          const color = getColor(l.color)
          const active = selection.kind === "list" && selection.listId === l.id
          const count = counts.byList.get(l.id) ?? 0
          return (
            <div
              key={l.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <button
                type="button"
                onClick={() => setSelection({ kind: "list", listId: l.id })}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {l.isInbox ? (
                  <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color.dot)} />
                )}
                <span className="truncate">{l.name}</span>
              </button>
              {count > 0 && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
              {!l.isInbox && (
                <button
                  type="button"
                  aria-label={`Delete ${l.name}`}
                  onClick={() => removeList(l.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
