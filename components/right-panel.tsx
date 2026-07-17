"use client"

import { useMemo, useState } from "react"
import { useApp } from "@/components/store"
import type { Task } from "@/lib/db/schema"
import { getColor } from "@/lib/colors"
import { toKey, today, addDays, fromKey, diffInDays } from "@/lib/date"
import { cn } from "@/lib/utils"
import { Popover } from "@/components/popover"
import { Check, Trash2, X, CalendarDays, Flag, Plus, ChevronDown } from "lucide-react"

const PRIORITY_LABELS = ["None", "Low", "Medium", "High"]
const PRIORITY_COLORS = ["text-muted-foreground", "text-blue-400", "text-amber-400", "text-red-400"]

export function RightPanel() {
  const { selectedTaskId, tasks } = useApp()
  const selected = tasks.find((t) => t.id === selectedTaskId) ?? null

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-sidebar text-sidebar-foreground">
      {selected ? <TaskDetail task={selected} /> : <Agenda />}
    </aside>
  )
}

function overdueLabel(dueDate: string): string | null {
  const d = diffInDays(today(), fromKey(dueDate))
  if (d > 0) return `${d} ${d === 1 ? "Day" : "Days"} Overdue`
  return null
}

function Agenda() {
  const { tasks, lists, selection, addTask, selectTask } = useApp()
  const [draft, setDraft] = useState("")
  const todayKey = toKey(today())
  const in7 = toKey(addDays(today(), 7))

  const inboxId = useMemo(() => lists.find((l) => l.isInbox)?.id ?? null, [lists])

  const heading =
    selection.kind === "today"
      ? "Today"
      : selection.kind === "upcoming"
        ? "Next 7 Days"
        : selection.kind === "list"
          ? (lists.find((l) => l.id === selection.listId)?.name ?? "List")
          : "All Tasks"

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.completed) return false
        if (selection.kind === "today") return t.dueDate === todayKey || (t.dueDate != null && t.dueDate < todayKey)
        if (selection.kind === "upcoming") return t.dueDate != null && t.dueDate >= todayKey && t.dueDate <= in7
        if (selection.kind === "list") return t.listId === selection.listId
        return true
      })
      .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
  }, [tasks, selection, todayKey, in7])

  // Group by list for display.
  const groups = useMemo(() => {
    const map = new Map<number | null, Task[]>()
    for (const t of filtered) {
      const key = t.listId ?? null
      const arr = map.get(key) ?? []
      arr.push(t)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [filtered])

  const targetListId = selection.kind === "list" ? selection.listId : inboxId
  const targetDate = selection.kind === "today" ? todayKey : null

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <span className="text-sm text-muted-foreground tabular-nums">{filtered.length}</span>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === "Enter" && draft.trim()) {
                addTask({ title: draft.trim(), listId: targetListId, dueDate: targetDate })
                setDraft("")
              }
            }}
            placeholder={`Add task${targetDate ? ' to "Today"' : ""}`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {groups.length === 0 && <div className="px-1 py-8 text-center text-sm text-muted-foreground">No tasks</div>}
        {groups.map(([listId, items]) => {
          const list = lists.find((l) => l.id === listId)
          const color = getColor(list?.color)
          return (
            <div key={String(listId)} className="mb-4">
              <div className="mb-1 flex items-center gap-2 px-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", color.dot)} />
                <span className="text-sm font-medium">{list?.name ?? "No List"}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
              </div>
              <div className="flex flex-col">
                {items.map((t) => (
                  <AgendaRow key={t.id} task={t} colorDot={color.dot} onOpen={() => selectTask(t.id)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function AgendaRow({ task, colorDot, onOpen }: { task: Task; colorDot: string; onOpen: () => void }) {
  const { toggleComplete } = useApp()
  const overdue = task.dueDate ? overdueLabel(task.dueDate) : null

  return (
    <div className="group flex items-start gap-2 rounded-md px-1 py-1.5 hover:bg-sidebar-accent/60">
      <button
        type="button"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        onClick={() => toggleComplete(task.id, !task.completed)}
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border border-muted-foreground/50 hover:border-foreground"
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="text-sm leading-snug text-pretty">{task.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs">
          {task.dueTime && <span className="text-muted-foreground tabular-nums">{task.dueTime}</span>}
          {overdue && <span className="text-destructive">{overdue}</span>}
        </div>
      </button>
    </div>
  )
}

function TaskDetail({ task }: { task: Task }) {
  const { lists, editTask, removeTask, toggleComplete, selectTask } = useApp()
  const list = lists.find((l) => l.id === task.listId)

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={() => toggleComplete(task.id, !task.completed)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-[5px] border border-muted-foreground/50",
              task.completed && "bg-primary text-primary-foreground border-primary",
            )}
          >
            {task.completed && <Check className="h-3 w-3" />}
          </span>
          {task.completed ? "Completed" : "Mark complete"}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Delete task"
            onClick={() => removeTask(task.id)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={() => selectTask(null)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <textarea
          value={task.title}
          onChange={(e) => editTask(task.id, { title: e.target.value })}
          rows={2}
          className="mb-3 w-full resize-none rounded-md bg-transparent text-base font-medium leading-snug outline-none"
        />

        <div className="space-y-2">
          {/* List */}
          <Popover
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-2 rounded-md border border-border px-2.5 py-2 text-sm hover:bg-accent"
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", getColor(list?.color).dot)} />
                <span className="flex-1 text-left">{list?.name ?? "No List"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          >
            {({ close }) => (
              <div className="w-56">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      editTask(task.id, { listId: l.id })
                      close()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", getColor(l.color).dot)} />
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </Popover>

          {/* Date + time */}
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-md border border-border px-2.5 py-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={task.dueDate ?? ""}
                onChange={(e) => editTask(task.id, { dueDate: e.target.value || null })}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2 text-sm">
              <input
                type="time"
                value={task.dueTime ?? ""}
                onChange={(e) => editTask(task.id, { dueTime: e.target.value || null })}
                className="bg-transparent outline-none tabular-nums"
              />
            </label>
          </div>

          {/* Priority */}
          <Popover
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-2 rounded-md border border-border px-2.5 py-2 text-sm hover:bg-accent"
              >
                <Flag className={cn("h-4 w-4", PRIORITY_COLORS[task.priority])} />
                <span className="flex-1 text-left">{PRIORITY_LABELS[task.priority]} priority</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          >
            {({ close }) => (
              <div className="w-48">
                {PRIORITY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      editTask(task.id, { priority: i })
                      close()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <Flag className={cn("h-4 w-4", PRIORITY_COLORS[i])} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </Popover>

          {/* Notes */}
          <textarea
            value={task.notes ?? ""}
            onChange={(e) => editTask(task.id, { notes: e.target.value || null })}
            placeholder="Notes"
            rows={6}
            className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>
    </>
  )
}
