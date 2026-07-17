"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useTransition, useCallback } from "react"
import type { List, Task } from "@/lib/db/schema"
import { DEFAULT_VIEW, type ViewConfig } from "@/lib/view"
import { today } from "@/lib/date"
import * as actions from "@/app/actions/tasks"

export type Selection =
  | { kind: "all" }
  | { kind: "today" }
  | { kind: "upcoming" }
  | { kind: "list"; listId: number }

interface AppState {
  lists: List[]
  tasks: Task[]
  config: ViewConfig
  anchorKey: string
  anchor: Date
  selection: Selection
  selectedTaskId: number | null
  leftOpen: boolean
  rightOpen: boolean
  pending: boolean

  setConfig: (c: ViewConfig | ((p: ViewConfig) => ViewConfig)) => void
  setAnchor: (d: Date) => void
  setSelection: (s: Selection) => void
  selectTask: (id: number | null) => void
  setLeftOpen: (v: boolean) => void
  setRightOpen: (v: boolean) => void

  addTask: (input: {
    title: string
    listId?: number | null
    dueDate?: string | null
    dueTime?: string | null
  }) => void
  editTask: (id: number, patch: Partial<Task>) => void
  toggleComplete: (id: number, completed: boolean) => void
  moveTask: (id: number, dueDate: string | null) => void
  removeTask: (id: number) => void
  addList: (name: string, color: string) => void
  removeList: (id: number) => void
}

const Ctx = createContext<AppState | null>(null)

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error("useApp must be used within AppProvider")
  return v
}

let tempId = -1

export function AppProvider({
  initialLists,
  initialTasks,
  children,
}: {
  initialLists: List[]
  initialTasks: Task[]
  children: React.ReactNode
}) {
  const [lists, setLists] = useState<List[]>(initialLists)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [config, setConfig] = useState<ViewConfig>(DEFAULT_VIEW)
  const [anchor, setAnchorState] = useState<Date>(() => today())
  const [selection, setSelection] = useState<Selection>({ kind: "all" })
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [pending, startTransition] = useTransition()

  const setAnchor = useCallback((d: Date) => setAnchorState(d), [])

  const addTask = useCallback<AppState["addTask"]>((input) => {
    const optimistic: Task = {
      id: tempId--,
      listId: input.listId ?? null,
      title: input.title,
      notes: null,
      completed: false,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? null,
      priority: 0,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks((prev) => [...prev, optimistic])
    startTransition(async () => {
      const row = await actions.createTask(input)
      if (row) setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? row : t)))
    })
  }, [])

  const editTask = useCallback<AppState["editTask"]>((id, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    startTransition(async () => {
      await actions.updateTask(id, patch as any)
    })
  }, [])

  const toggleComplete = useCallback<AppState["toggleComplete"]>((id, completed) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)))
    startTransition(async () => {
      await actions.toggleTask(id, completed)
    })
  }, [])

  const moveTask = useCallback<AppState["moveTask"]>((id, dueDate) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueDate } : t)))
    startTransition(async () => {
      await actions.moveTaskToDate(id, dueDate)
    })
  }, [])

  const removeTask = useCallback<AppState["removeTask"]>((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedTaskId((cur) => (cur === id ? null : cur))
    startTransition(async () => {
      await actions.deleteTask(id)
    })
  }, [])

  const addList = useCallback<AppState["addList"]>((name, color) => {
    const optimistic: List = {
      id: tempId--,
      name,
      color,
      icon: null,
      position: 99,
      isInbox: false,
      createdAt: new Date(),
    }
    setLists((prev) => [...prev, optimistic])
    startTransition(async () => {
      const row = await actions.createList({ name, color })
      if (row) setLists((prev) => prev.map((l) => (l.id === optimistic.id ? row : l)))
    })
  }, [])

  const removeList = useCallback<AppState["removeList"]>((id) => {
    setLists((prev) => prev.filter((l) => l.id !== id))
    setTasks((prev) => prev.map((t) => (t.listId === id ? { ...t, listId: null } : t)))
    startTransition(async () => {
      await actions.deleteList(id)
    })
  }, [])

  const value = useMemo<AppState>(
    () => ({
      lists,
      tasks,
      config,
      anchor,
      anchorKey: anchor.toISOString(),
      selection,
      selectedTaskId,
      leftOpen,
      rightOpen,
      pending,
      setConfig,
      setAnchor,
      setSelection,
      selectTask: setSelectedTaskId,
      setLeftOpen,
      setRightOpen,
      addTask,
      editTask,
      toggleComplete,
      moveTask,
      removeTask,
      addList,
      removeList,
    }),
    [
      lists,
      tasks,
      config,
      anchor,
      selection,
      selectedTaskId,
      leftOpen,
      rightOpen,
      pending,
      setAnchor,
      addTask,
      editTask,
      toggleComplete,
      moveTask,
      removeTask,
      addList,
      removeList,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
