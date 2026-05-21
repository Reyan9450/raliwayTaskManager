export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-3 skeleton rounded-full w-3/4" />
          <div className="h-2 skeleton rounded-full w-1/2" />
        </div>
      </div>
      <div className="h-8 skeleton rounded-lg w-1/3" />
      <div className="h-2 skeleton rounded-full w-full" />
    </div>
  )
}

export function SkeletonTaskCard() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="h-3 skeleton rounded-full w-4/5" />
      <div className="h-2 skeleton rounded-full w-3/5" />
      <div className="flex gap-2">
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-12 skeleton rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-8 h-8 rounded-full skeleton shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 skeleton rounded-full w-2/3" />
        <div className="h-2 skeleton rounded-full w-1/3" />
      </div>
      <div className="h-5 w-16 skeleton rounded-full" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 skeleton rounded-lg w-48" />
          <div className="h-3 skeleton rounded-full w-32" />
        </div>
        <div className="h-9 w-28 skeleton rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 h-64 skeleton" />
        <div className="glass rounded-2xl p-6 h-64 skeleton" />
      </div>
    </div>
  )
}
