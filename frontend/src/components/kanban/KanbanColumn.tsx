import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task } from '../../types'
import { DynamicKanbanCard } from './DynamicKanbanCard'
import { STATUS_CONFIG } from '../../theme/colors'
import { staggerContainer, staggerItem } from '../../animations/variants'

type ColumnStatus = 'Todo' | 'In Progress' | 'Done'

interface KanbanColumnProps {
  status: ColumnStatus
  tasks: Task[]
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onAddTask?: () => void
  isAdmin?: boolean
}

const COLUMN_ICONS: Record<ColumnStatus, string> = {
  Todo:         '○',
  'In Progress': '◑',
  Done:          '●',
}

export function KanbanColumn({
  status, tasks, onEditTask, onDeleteTask, onAddTask, isAdmin,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const cfg = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col min-w-[300px] max-w-[320px] flex-shrink-0">
      {/* Column header */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${cfg.column.header} border border-white/5 border-b-0`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base" style={{ color: cfg.column.accent }}>
            {COLUMN_ICONS[status]}
          </span>
          <span className="text-sm font-semibold text-slate-200">{status}</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${cfg.column.glow}`,
              color: cfg.column.accent,
              border: `1px solid ${cfg.border}`,
            }}
          >
            {tasks.length}
          </span>
        </div>

        {isAdmin && onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all text-sm"
            title="Add task"
          >
            +
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-b-2xl p-3 flex flex-col gap-2.5 min-h-[400px]
          border border-white/5 border-t-0 transition-all duration-200
          ${isOver
            ? 'bg-violet-500/8 border-violet-500/30 shadow-[inset_0_0_20px_rgba(124,58,237,0.08)]'
            : 'bg-white/[0.02]'
          }
        `}
        style={{
          boxShadow: isOver
            ? `inset 0 0 30px ${cfg.column.glow}`
            : undefined,
        }}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2.5"
          >
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div key={task._id} variants={staggerItem} layout>
                  <DynamicKanbanCard
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`
              flex flex-col items-center justify-center flex-1 min-h-[200px]
              rounded-xl border-2 border-dashed transition-all duration-200
              ${isOver
                ? 'border-violet-500/40 bg-violet-500/5'
                : 'border-white/5'
              }
            `}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 opacity-30"
              style={{ background: cfg.column.glow }}
            >
              {COLUMN_ICONS[status]}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {isOver ? 'Drop here' : 'No tasks'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
