-- Portable seed data for tb-calendar (plain Postgres / Supabase)
-- Run after schema exists: psql "$DATABASE_URL" -f db/seed.sql

INSERT INTO lists (name, color, icon, position, is_inbox)
SELECT 'Inbox', 'blue', NULL, 0, true
WHERE NOT EXISTS (SELECT 1 FROM lists WHERE is_inbox = true);

INSERT INTO lists (name, color, icon, position, is_inbox)
SELECT 'Work', 'purple', NULL, 1, false
WHERE NOT EXISTS (SELECT 1 FROM lists WHERE name = 'Work');

INSERT INTO lists (name, color, icon, position, is_inbox)
SELECT 'Personal', 'green', NULL, 2, false
WHERE NOT EXISTS (SELECT 1 FROM lists WHERE name = 'Personal');

INSERT INTO tasks (list_id, title, notes, completed, due_date, due_time, priority, position)
SELECT l.id, 'Review calendar views', NULL, false, CURRENT_DATE, '09:00', 1, 0
FROM lists l
WHERE l.is_inbox = true
  AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Review calendar views');

INSERT INTO tasks (list_id, title, notes, completed, due_date, due_time, priority, position)
SELECT l.id, 'Plan weekly time blocks', NULL, false, CURRENT_DATE + 1, '10:30', 2, 0
FROM lists l
WHERE l.name = 'Work'
  AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Plan weekly time blocks');

INSERT INTO tasks (list_id, title, notes, completed, due_date, due_time, priority, position)
SELECT l.id, 'Grocery run', NULL, false, CURRENT_DATE + 2, '17:00', 0, 0
FROM lists l
WHERE l.name = 'Personal'
  AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Grocery run');

INSERT INTO tasks (list_id, title, notes, completed, due_date, due_time, priority, position)
SELECT l.id, 'Backlog item without a date', 'Unscheduled tasks stay in the inbox.', false, NULL, NULL, 0, 1
FROM lists l
WHERE l.is_inbox = true
  AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Backlog item without a date');
