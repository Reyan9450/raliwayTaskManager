import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects, deleteProject } from '../api/projects'
import type { Project, Task } from '../types'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { TaskModal } from '../components/kanban/TaskModal'
import { GlassPanel } from '../components/ui/GlassPanel'
import { GradientButton } from '../components/ui/GradientButton'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { PageSkeleton, SkeletonTaskCard } from '../components/ui/SkeletonLoader'
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants'

export default function ProjectPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { loadTasks, loading: tasksLoading, tasksByProject } = useTaskContext()
  const { showToast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingProject, setDeletingProject] = useState(false)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  const isAdmin = user?.role === 'Admin'
  const tasks = projectId ? (tasksByProject[projectId] ?? []) : []

  // Role-based color tokens
  const accent = isAdmin
    ? { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', gradient: 'from-violet-500 to-purple-500', barGradient: 'from-violet-500 to-indigo-500', hoverRow: 'hover:bg-violet-500/5', pillActive: 'bg-violet-600 text-white', dot: 'bg-violet-400' }
    : { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500 to-cyan-500', barGradient: 'from-blue-500 to-cyan-500', hoverRow: 'hover:bg-blue-500/5', pillActive: 'bg-blue-600 text-white', dot: 'bg-blue-400' }

  useEffect(() => {
    if (!projectId) return
    setProjectLoading(true)
    getProjects()
      .then((projects) => {
        const found = projects.find((p) => p._id === projectId)
        if (!found) { showToast('Project not found', 'error'); navigate('/dashboard'); return }
        setProject(found)
      })
      .catch(() => { showToast('Failed to load project', 'error'); navigate('/dashboard') })
      .finally(() => setProjectLoading(false))
  }, [projectId, navigate, showToast])

  useEffect(() => {
    if (!projectId) return
    loadTasks(projectId).catch(() => showToast('Failed to load tasks', 'error'))
  }, [projectId, loadTasks, showToast])

  async function handleDeleteProject() {
    if (!project) return
    const confirmed = window.confirm(
      `Delete "${project.title}"? This will permanently remove the project and all its tasks.`
    )
    if (!confirmed) return
    setDeletingProject(true)
    try {
      await deleteProject(project._id)
      showToast('Project deleted', 'success')
      navigate('/dashboard')
    } catch {
      showToast('Failed to delete project', 'error')
      setDeletingProject(false)
    }
  }

  if (projectLoading) return <PageSkeleton />
  if (!project) return null

  const todo = tasks.filter((t) => t.status === 'Todo').length
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length
  const done = tasks.filter((t) => t.status === 'Done').length
  const overdue = tasks.filter((t) => t.isOverdue).length
  const completionPct = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className={`text-sm font-medium transition-colors ${accent.text} hover:opacity-80`}
            >
              ← {isAdmin ? 'Command Center' : 'My Workspace'}
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-sm text-slate-400 truncate">{project.title}</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white truncate">{project.title}</h1>
            {/* Role badge on project */}
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${accent.bg} ${accent.border} border ${accent.text}`}>
              {isAdmin ? '⚡ Admin' : '👤 Member'}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-slate-500 mt-1">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-600">
              {project.members.length + 1} member{project.members.length !== 0 ? 's' : ''}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">{tasks.length} tasks</span>
            {!isAdmin && (
              <>
                <span className="text-slate-700">·</span>
                <span className={`text-xs font-semibold ${accent.text}`}>
                  {tasks.filter((t) => t.assignedTo._id === user?.id).length} assigned to me
                </span>
              </>
            )}
            {completionPct > 0 && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-green-400 font-semibold">{completionPct}% complete</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle — role-tinted */}
          <div className={`flex items-center bg-white/5 rounded-xl p-1 border ${accent.border}`}>
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'kanban' ? accent.pillActive : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'list' ? accent.pillActive : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              List
            </button>
          </div>

          {/* Admin-only controls */}
          {isAdmin && (
            <>
              <GradientButton
                onClick={() => { setEditingTask(null); setModalOpen(true) }}
                size="sm"
                icon={<span>+</span>}
              >
                New Task
              </GradientButton>
              <GradientButton
                onClick={handleDeleteProject}
                disabled={deletingProject}
                variant="danger"
                size="sm"
              >
                {deletingProject ? '…' : 'Delete Project'}
              </GradientButton>
            </>
          )}

          {/* Member read-only indicator */}
          {!isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-xs font-semibold text-blue-400">View & Move Tasks</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <GlassPanel className={`p-4 border ${accent.border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 flex-wrap">
                <StatPill label="Total" value={tasks.length} color="slate" />
                <StatPill label="Todo" value={todo} color="slate" />
                <StatPill label="In Progress" value={inProgress} color="indigo" />
                <StatPill label="Done" value={done} color="green" />
                {overdue > 0 && <StatPill label="Overdue" value={overdue} color="red" />}
                {!isAdmin && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.bg} ${accent.border} border ${accent.text}`}>
                    {tasks.filter((t) => t.assignedTo._id === user?.id).length} mine
                  </span>
                )}
              </div>
              <span className={`text-sm font-black ${accent.text}`}>{completionPct}%</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${accent.barGradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Board / List view */}
      {tasksLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonTaskCard key={i} />)}
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          projectId={project._id}
          onEditTask={isAdmin ? (task) => { setEditingTask(task); setModalOpen(true) } : undefined}
          onAddTask={isAdmin ? () => { setEditingTask(null); setModalOpen(true) } : undefined}
        />
      ) : (
        <ListView
          tasks={tasks}
          isAdmin={isAdmin}
          accentText={accent.text}
          accentHoverRow={accent.hoverRow}
          onEdit={(task) => { setEditingTask(task); setModalOpen(true) }}
        /> {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <GlassPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Task', 'Assignee', 'Status', 'Priority', 'Due Date', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <motion.tr
                  key={task._id}
                  variants={staggerItem}
                  className="border-b border-white/3 hover:bg-white/3 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {task.isOverdue && <span className="text-red-400 text-xs">⚠</span>}
                      <span className="text-sm font-medium text-slate-200 max-w-[200px] truncate">
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-600 mt-0.5 truncate max-w-[200px]">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Avatar name={task.assignedTo.name} size="xs" showName />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge level={task.priorityLevel} />
                  </td>
                  <td className={`px-5 py-3.5 text-xs font-medium ${task.isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="text-xs text-violet-400 hover:text-violet-300 font-medium opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm font-medium">No tasks yet</p>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  )
}
