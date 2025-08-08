import GroupClient from './Client'
type Props = { params: Promise<{ id: string }> }
export default async function Page({ params }: Props) {
  const p = await params
  const id = Number(p.id)
  return <GroupClient groupId={id} />
}
