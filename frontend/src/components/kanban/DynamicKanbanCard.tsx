import React from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { PriorityBadge, OverdueBadge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { PRIORITY_CONFIG } from '../../theme/colors'

interface DynamicKanbanCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function DynamicKanbanCard({ task, onEdit, onDelete }: DynamicKanbanCardProps) {
  const { user } = useAuth()
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task._id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const priorityCfg = PRIORITY_CONFIG[task.priorityLevel]
  const showActions = user?.role !== 'Member' && (onEdit || onDelete)

  const daysUntilDue = Math.ceil(
    (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.15 }}
        className={`
          relative glass rounded-2xl p-4 cursor-grab active:cursor-grabbing
          group overflow-hidden
          ${task.isOverdue ? 'border border-red-500/30' : 'border border-white/5'}
        `}
        style={{
          boxShadow: task.isOverdue
            ? '0 4px 20px rgba(239,68,68,0.15), 0 0 0 1px rgba(239,68,68,0.2)'
            : `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        {/* Priority accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-70"
          style={{ background: priorityCfg.color }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, ${priorityCfg.bg} 0%, transparent 70%)` }}
        />

        <div className="relative">
          {/* Title */}
          <p className="text-sm font-semibold text-slate-100 leading-snug mb-3 pr-2">
            {task.title}
          </p>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <PriorityBadge level={task.priorityLevel} />
            {task.isOverdue && <OverdueBadge />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <Avatar name={task.assignedTo.name} size="xs" showName />

            <div className="flex items-center gap-2">
              {/* Due date */}
              <span className={`text-xs font-medium ${
                task.isOverdue
                  ? 'text-red-400'
                  : daysUntilDue <= 2
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}>
                {task.isOverdue
                  ? `${Math.abs(daysUntilDue)}d late`
                  : daysUntilDue === 0
                  ? 'Today'
                  : daysUntilDue === 1
                  ? 'Tomorrow'
                  : new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                }
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {showActions && (
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                  className="flex-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg py-1.5 transition-all"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(task._id) }}
                  className="flex-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg py-1.5 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
