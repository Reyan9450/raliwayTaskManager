import type { Task } from '../../types'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../theme/colors'

export function PriorityBadge({ level }: { level: Task['priorityLevel'] }) {
  const cfg = PRIORITY_CONFIG[level]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: Task['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function RoleBadge({ role }: { role: 'Admin' | 'Member' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
      role === 'Admin'
        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    }`}>
      {role}
    </span>
  )
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      Overdue
    </span>
  )
}
