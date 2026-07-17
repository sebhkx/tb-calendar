"use client"

import type { Task } from "@/lib/db/schema"
import { getColor } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { useApp } from "@/components/store"
import { Check } from "lucide-react"

export function TaskChip({ task, listColorId }: { task: Task; listColorId: string | null }) {
  const { selectedTaskId, selectTask, toggleComplete } = useApp()
  const color = getColor(listColorId)
  const selected = selectedTaskId === task.id

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", String(task.id))
        e.dataTransfer.effectAllowed = "move"
      }}
      onClick={() => selectTask(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          selectTask(task.id)
        }
      }}
      className={cn(
        "group flex w-full items-start gap-1.5 rounded-md px-1.5 py-1 text-left text-xs leading-snug transition-colors cursor-pointer",
        color.chip,
        selected && "ring-1 ring-primary",
        task.completed && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        onClick={(e) => {
          e.stopPropagation()
          toggleComplete(task.id, !task.completed)
        }}
        className={cn(
          "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border border-current/40",
          task.completed && "bg-current/30",
        )}
      >
        {task.completed && <Check className="h-2.5 w-2.5" />}
      </button>
      {/* Title wraps to show every word instead of truncating */}
      <span className={cn("min-w-0 flex-1 whitespace-normal break-words", task.completed && "line-through")}>
        {task.title}
      </span>
      {task.dueTime && <span className="shrink-0 tabular-nums opacity-70">{task.dueTime}</span>}
    </div>
  )
}
