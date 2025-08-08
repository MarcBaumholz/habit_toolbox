export function Avatar({ src, alt, size = 28 }: { src?: string; alt?: string; size?: number }) {
  return (
    <img
      src={src || 'https://avatars.githubusercontent.com/u/1?v=4'}
      alt={alt || 'Avatar'}
      width={size}
      height={size}
      className="inline-block rounded-full object-cover"
    />
  )
}
