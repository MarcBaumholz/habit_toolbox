import dynamic from 'next/dynamic'

const Client = dynamic(() => import('./Client'), { ssr: false })

type Props = { params: Promise<{ id: string }> }
export default async function HabitDetail({ params }: Props) {
  const p = await params
  return <Client habitId={Number(p.id)} />
}
