"use client"

import { useMemo, useState } from "react"
import { useApp } from "@/components/store"
import { computeGrid, type DayGridItem } from "@/lib/view"
import { toKey, today, weekdayLabels, formatDayName } from "@/lib/date"
import { cn } from "@/lib/utils"
import { TaskChip } from "./task-chip"
import type { Task } from "@/lib/db/schema"
import { Plus } from "lucide-react"

export function CalendarGrid() {
  const { config, anchor, tasks, lists, selection, addTask, moveTask, setAnchor } = useApp()
  const [dragOver, setDragOver] = useState<string | null>(null)

  const { days, columns } = useMemo(() => computeGrid(config, anchor), [config, anchor])
  const todayKey = toKey(today())

  const listColorById = useMemo(() => {
    const m = new Map<number, string>()
    for (const l of lists) m.set(l.id, l.color)
    return m
  }, [lists])

  const inboxId = useMemo(() => lists.find((l) => l.isInbox)?.id ?? null, [lists])

  // Filter tasks by the active sidebar selection, then bucket by day.
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.dueDate) continue
      if (selection.kind === "list" && t.listId !== selection.listId) continue
      const arr = map.get(t.dueDate) ?? []
      arr.push(t)
      map.set(t.dueDate, arr)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.dueTime ?? "99").localeCompare(b.dueTime ?? "99"))
    }
    return map
  }, [tasks, selection])

  const showWeekdayHeader = config.mode !== "day"
  const labels = weekdayLabels(config.weekStartsOn)

  const targetListId = selection.kind === "list" ? selection.listId : inboxId

  // Keep columns readable: never let a day column get narrower than this.
  // If the available width can't fit them all, the grid scrolls horizontally.
  const minColPx = 116
  const gridTemplate = `repeat(${columns}, minmax(${minColPx}px, 1fr))`

  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-auto">
      {showWeekdayHeader ? (
        <div
          className="grid shrink-0 border-b border-border"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {labels.map((l) => (
            <div key={l} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {l}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 auto-rows-fr" style={{ gridTemplateColumns: gridTemplate }}>
        {days.map((d) => (
          <DayCell
            key={d.key}
            day={d}
            dayMode={config.mode === "day"}
            isToday={d.key === todayKey}
            faded={config.mode === "month" && !d.inCurrentMonth}
            tasks={tasksByDay.get(d.key) ?? []}
            listColorById={listColorById}
            dragOver={dragOver === d.key}
            onDragEnter={() => setDragOver(d.key)}
            onDragLeaveGrid={() => setDragOver((cur) => (cur === d.key ? null : cur))}
            onDrop={(taskId) => {
              moveTask(taskId, d.key)
              setDragOver(null)
            }}
            onQuickAdd={(title) => addTask({ title, listId: targetListId, dueDate: d.key })}
            onFocusDay={() => setAnchor(d.date)}
          />
        ))}
      </div>
    </div>
  )
}

function DayCell({
  day,
  dayMode,
  isToday,
  faded,
  tasks,
  listColorById,
  dragOver,
  onDragEnter,
  onDragLeaveGrid,
  onDrop,
  onQuickAdd,
  onFocusDay,
}: {
  day: DayGridItem
  dayMode: boolean
  isToday: boolean
  faded: boolean
  tasks: Task[]
  listColorById: Map<number, string>
  dragOver: boolean
  onDragEnter: () => void
  onDragLeaveGrid: () => void
  onDrop: (taskId: number) => void
  onQuickAdd: (title: string) => void
  onFocusDay: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")

  const dateNum = day.date.getDate()
  const isFirstOfMonth = dateNum === 1

  function submit() {
    const v = draft.trim()
    if (v) onQuickAdd(v)
    setDraft("")
    setAdding(false)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragEnter()
      }}
      onDragLeave={onDragLeaveGrid}
      onDrop={(e) => {
        e.preventDefault()
        const id = Number(e.dataTransfer.getData("text/task-id"))
        if (!Number.isNaN(id)) onDrop(id)
      }}
      className={cn(
        "group relative flex min-h-24 flex-col border-b border-r border-border p-1",
        faded && "bg-background/40",
        dragOver && "bg-primary/10 ring-1 ring-inset ring-primary/50",
      )}
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onFocusDay}
          className={cn(
            "flex items-center gap-1 text-xs font-medium tabular-nums",
            faded ? "text-muted-foreground/60" : "text-foreground",
          )}
        >
          {dayMode && <span className="text-muted-foreground">{formatDayName(day.date)}</span>}
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1",
              isToday && "bg-primary text-primary-foreground",
            )}
          >
            {dateNum}
          </span>
          {isFirstOfMonth && !dayMode && (
            <span className="text-muted-foreground">
              {day.date.toLocaleString("en-US", { month: "short" })}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Add task"
          onClick={() => setAdding(true)}
          className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {tasks.map((t) => (
          <TaskChip key={t.id} task={t} listColorId={t.listId ? (listColorById.get(t.listId) ?? null) : null} />
        ))}

        {adding && (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "Enter") submit()
              if (e.key === "Escape") {
                setDraft("")
                setAdding(false)
              }
            }}
            placeholder="Task title"
            className="w-full rounded-md border border-border bg-background px-1.5 py-1 text-xs outline-none focus:border-primary"
          />
        )}
      </div>
    </div>
  )
}
