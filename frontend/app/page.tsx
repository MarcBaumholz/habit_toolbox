import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import TextareaSuggest from './TextareaSuggest'
export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button>Create Habit</Button>
      </div>
      <section className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="font-medium mb-2">Find Your Habit Tool</div>
          <TextareaSuggest />
        </Card>
        <Card>
          <div className="font-medium mb-2">My Habits</div>
          <div className="text-sm text-neutral-500">Summary of your top habits</div>
          <div className="pt-2"><a href="/habits" className="underline text-sm">Go to habits →</a></div>
        </Card>
        <Card>
          <div className="font-medium mb-2">My Groups</div>
          <div className="text-sm text-neutral-500">Summary of your top groups</div>
        </Card>
      </section>
    </div>
  )
}
