import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../animations/variants'
import type { Task, Project } from '../../types'
import { StatusBadge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'

interface ActivityFeedProps {
  tasks: Task[]
  projects: Project[]
  limit?: number
}

export function ActivityFeed({ tasks, projects, limit = 8 }: ActivityFeedProps) {
  const recent = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
          📋
        </div>
        <p className="text-sm font-medium">No activity yet</p>
        <p className="text-xs mt-1">Tasks will appear here as they're created</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-1"
    >
      {recent.map((task) => {
        const project = projects.find((p) => p._id === task.projectId)
        const timeAgo = getTimeAgo(task.createdAt)

        return (
          <motion.div
            key={task._id}
            variants={staggerItem}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <Avatar name={task.assignedTo.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 leading-snug">
                <span className="font-medium text-white">{task.assignedTo.name}</span>
                {' '}was assigned{' '}
                <span className="font-medium text-violet-400 truncate">{task.title}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                {project && (
                  <span className="text-xs text-slate-500 truncate">{project.title}</span>
                )}
                <span className="text-slate-600">·</span>
                <StatusBadge status={task.status} />
              </div>
            </div>
            <span className="text-xs text-slate-600 shrink-0 group-hover:text-slate-500 transition-colors">
              {timeAgo}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
