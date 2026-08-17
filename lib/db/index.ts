import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

const needsSsl =
  process.env.DB_SSL === "true" ||
  (connectionString ? /supabase\.co/i.test(connectionString) : false) ||
  process.env.NODE_ENV === "production"

export const pool = new Pool({
  connectionString,
  ssl: needsSsl && connectionString ? { rejectUnauthorized: false } : undefined,
})

export const db = drizzle(pool, { schema })
