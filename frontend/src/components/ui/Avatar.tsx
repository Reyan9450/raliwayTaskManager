import { getAvatarColor } from '../../theme/colors'

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
}

export function Avatar({ name, size = 'sm', showName = false, className = '' }: AvatarProps) {
  const gradient = getAvatarColor(name)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white/10`}
      >
        {initials}
      </div>
      {showName && <span className="text-sm text-slate-300 font-medium">{name}</span>}
    </div>
  )
}

interface AvatarGroupProps {
  names: string[]
  max?: number
  size?: 'xs' | 'sm'
}

export function AvatarGroup({ names, max = 3, size = 'xs' }: AvatarGroupProps) {
  const visible = names.slice(0, max)
  const extra = names.length - max

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((name, i) => (
        <div key={i} className="ring-2 ring-dark-900 rounded-full">
          <Avatar name={name} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div className={`${size === 'xs' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs'} rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-400 font-medium ring-2 ring-dark-900`}>
          +{extra}
        </div>
      )}
    </div>
  )
}
