"use server"

import { db } from "@/lib/db"
import { tasks, lists } from "@/lib/db/schema"
import { and, asc, eq, gte, lte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getLists() {
  return db.select().from(lists).orderBy(asc(lists.position))
}

export async function getTasks() {
  return db.select().from(tasks).orderBy(asc(tasks.position))
}

export async function getTasksInRange(start: string, end: string) {
  return db
    .select()
    .from(tasks)
    .where(and(gte(tasks.dueDate, start), lte(tasks.dueDate, end)))
    .orderBy(asc(tasks.dueTime))
}

export async function createTask(input: {
  title: string
  listId?: number | null
  dueDate?: string | null
  dueTime?: string | null
  notes?: string | null
  priority?: number
}) {
  const [row] = await db
    .insert(tasks)
    .values({
      title: input.title,
      listId: input.listId ?? null,
      dueDate: input.dueDate ?? null,
      dueTime: input.dueTime ?? null,
      notes: input.notes ?? null,
      priority: input.priority ?? 0,
    })
    .returning()
  revalidatePath("/")
  return row
}

export async function updateTask(
  id: number,
  patch: Partial<{
    title: string
    listId: number | null
    dueDate: string | null
    dueTime: string | null
    notes: string | null
    priority: number
    completed: boolean
  }>,
) {
  const [row] = await db
    .update(tasks)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning()
  revalidatePath("/")
  return row
}

export async function toggleTask(id: number, completed: boolean) {
  await db.update(tasks).set({ completed, updatedAt: new Date() }).where(eq(tasks.id, id))
  revalidatePath("/")
}

export async function moveTaskToDate(id: number, dueDate: string | null) {
  await db.update(tasks).set({ dueDate, updatedAt: new Date() }).where(eq(tasks.id, id))
  revalidatePath("/")
}

export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id))
  revalidatePath("/")
}

export async function createList(input: { name: string; color?: string; icon?: string | null }) {
  const existing = await db.select().from(lists)
  const [row] = await db
    .insert(lists)
    .values({
      name: input.name,
      color: input.color ?? "blue",
      icon: input.icon ?? null,
      position: existing.length,
    })
    .returning()
  revalidatePath("/")
  return row
}

export async function deleteList(id: number) {
  await db.update(tasks).set({ listId: null }).where(eq(tasks.listId, id))
  await db.delete(lists).where(eq(lists.id, id))
  revalidatePath("/")
}
