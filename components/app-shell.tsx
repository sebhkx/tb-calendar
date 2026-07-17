"use client"

import type { List, Task } from "@/lib/db/schema"
import { AppProvider, useApp } from "@/components/store"
import { LeftSidebar } from "@/components/left-sidebar"
import { RightPanel } from "@/components/right-panel"
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar"
import { CalendarGrid } from "@/components/calendar/calendar-grid"

function Shell() {
  const { leftOpen, rightOpen } = useApp()
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {leftOpen && <LeftSidebar />}
      <main className="flex min-w-0 flex-1 flex-col">
        <CalendarToolbar />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CalendarGrid />
        </div>
      </main>
      {rightOpen && <RightPanel />}
    </div>
  )
}

export function AppShell({ lists, tasks }: { lists: List[]; tasks: Task[] }) {
  return (
    <AppProvider initialLists={lists} initialTasks={tasks}>
      <Shell />
    </AppProvider>
  )
}
