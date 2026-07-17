import { getLists, getTasks } from "@/app/actions/tasks"
import { AppShell } from "@/components/app-shell"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [lists, tasks] = await Promise.all([getLists(), getTasks()])
  return <AppShell lists={lists} tasks={tasks} />
}
