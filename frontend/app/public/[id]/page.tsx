type Props = { params: { id: string } }
export default function PublicProfile({ params }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Public Profile: {params.id}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded border">Public Habits</div>
        <div className="p-4 bg-white rounded border">Shared Learnings</div>
      </div>
    </div>
  )
}
