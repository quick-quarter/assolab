import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ href = '/', size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const content = (
    <span className={`font-extrabold tracking-tight ${sizes[size]} ${className}`}>
      <span className="text-primary-500">Asso</span>
      <span className="text-gray-900">Lab</span>
    </span>
  )

  if (!href) return content
  return <Link href={href}>{content}</Link>
}
