export default function SummaryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Weekly Summary</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border">Weekly Stats</div>
        <div className="p-4 bg-white rounded border">Most Consistent Habit</div>
        <div className="p-4 bg-white rounded border">Insights from Trusted</div>
      </div>
    </div>
  )
}
