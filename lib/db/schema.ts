import { pgTable, serial, text, integer, boolean, timestamp, date } from "drizzle-orm/pg-core"

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("blue"),
  icon: text("icon"),
  position: integer("position").notNull().default(0),
  isInbox: boolean("is_inbox").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  listId: integer("list_id"),
  title: text("title").notNull(),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  dueDate: date("due_date"),
  dueTime: text("due_time"),
  priority: integer("priority").notNull().default(0),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type List = typeof lists.$inferSelect
export type Task = typeof tasks.$inferSelect
