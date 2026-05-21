interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeMap[size]} ${className} relative`}
    >
      <div className={`absolute inset-0 rounded-full border-2 border-white/10`} />
      <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin`} />
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full gap-3">
      <Spinner size="lg" />
      <p className="text-xs text-slate-600 animate-pulse">Loading…</p>
    </div>
  )
}
