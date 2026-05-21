export const PRIORITY_CONFIG = {
  High: {
    label: 'High',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    glow: '0 0 12px rgba(239,68,68,0.3)',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
    dot: 'bg-red-500',
  },
  Medium: {
    label: 'Medium',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    glow: '0 0 12px rgba(245,158,11,0.3)',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-500',
  },
  Low: {
    label: 'Low',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
    glow: '0 0 12px rgba(34,197,94,0.3)',
    badge: 'bg-green-500/20 text-green-400 border border-green-500/30',
    dot: 'bg-green-500',
  },
} as const

export const STATUS_CONFIG = {
  Todo: {
    label: 'Todo',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.2)',
    badge: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    dot: 'bg-slate-400',
    column: {
      header: 'from-slate-500/20 to-slate-600/10',
      accent: '#94a3b8',
      glow: 'rgba(148,163,184,0.15)',
    },
  },
  'In Progress': {
    label: 'In Progress',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.2)',
    badge: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    dot: 'bg-indigo-400',
    column: {
      header: 'from-indigo-500/20 to-indigo-600/10',
      accent: '#6366f1',
      glow: 'rgba(99,102,241,0.15)',
    },
  },
  Done: {
    label: 'Done',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    badge: 'bg-green-500/20 text-green-400 border border-green-500/30',
    dot: 'bg-green-400',
    column: {
      header: 'from-green-500/20 to-green-600/10',
      accent: '#22c55e',
      glow: 'rgba(34,197,94,0.15)',
    },
  },
} as const

export const AVATAR_COLORS = [
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-violet-500 to-purple-500',
]

export function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}
