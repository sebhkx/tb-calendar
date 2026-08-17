import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq } from "drizzle-orm"
import * as schema from "../lib/db/schema"

function poolConfig() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL is required")

  const needsSsl =
    process.env.DB_SSL === "true" ||
    /supabase\.co/i.test(connectionString) ||
    process.env.NODE_ENV === "production"

  return {
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  }
}

function relativeDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

async function main() {
  const pool = new Pool(poolConfig())
  const db = drizzle(pool, { schema })

  const [existingInbox] = await db
    .select()
    .from(schema.lists)
    .where(eq(schema.lists.isInbox, true))
    .limit(1)

  if (existingInbox) {
    console.log("Seed skipped: inbox list already exists.")
    await pool.end()
    return
  }

  const [inbox, work, personal] = await db
    .insert(schema.lists)
    .values([
      { name: "Inbox", color: "blue", position: 0, isInbox: true },
      { name: "Work", color: "purple", position: 1, isInbox: false },
      { name: "Personal", color: "green", position: 2, isInbox: false },
    ])
    .returning()

  await db.insert(schema.tasks).values([
    {
      listId: inbox.id,
      title: "Review calendar views",
      dueDate: relativeDate(0),
      dueTime: "09:00",
      priority: 1,
      position: 0,
    },
    {
      listId: work.id,
      title: "Plan weekly time blocks",
      dueDate: relativeDate(1),
      dueTime: "10:30",
      priority: 2,
      position: 0,
    },
    {
      listId: personal.id,
      title: "Grocery run",
      dueDate: relativeDate(2),
      dueTime: "17:00",
      priority: 0,
      position: 0,
    },
    {
      listId: inbox.id,
      title: "Backlog item without a date",
      notes: "Unscheduled tasks stay in the inbox.",
      priority: 0,
      position: 1,
    },
  ])

  console.log("Seed complete: 3 lists, 4 tasks.")
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
