import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Project, Task } from '../../types'
import { staggerItem } from '../../animations/variants'

interface ProjectProgressCardProps {
  project: Project
  tasks: Task[]
}

export function ProjectProgressCard({ project, tasks }: ProjectProgressCardProps) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'Done').length
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  const gradientColor =
    pct >= 80 ? 'from-green-500 to-emerald-500' :
    pct >= 50 ? 'from-indigo-500 to-violet-500' :
    pct >= 20 ? 'from-amber-500 to-orange-500' :
                'from-slate-500 to-slate-600'

  return (
    <motion.div variants={staggerItem}>
      <Link
        to={`/projects/${project._id}`}
        className="block p-4 rounded-xl hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientColor} shrink-0`} />
            <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
              {project.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-slate-500">{done}/{total}</span>
            <span className={`text-xs font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
              {pct}%
            </span>
          </div>
        </div>

        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradientColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>

        <div className="flex items-center gap-3 mt-2">
          {inProgress > 0 && (
            <span className="text-xs text-indigo-400">{inProgress} in progress</span>
          )}
          {total === 0 && (
            <span className="text-xs text-slate-600">No tasks yet</span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
