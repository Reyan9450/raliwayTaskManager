import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects } from '../api/projects'
import { getTasks } from '../api/tasks'
import type { Project, Task } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GlassPanel } from '../components/ui/GlassPanel'
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { PageSkeleton } from '../components/ui/SkeletonLoader'
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants'

export function MemberDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const fetchedProjects = await getProjects()
        setProjects(fetchedProjects)
        const entries = await Promise.all(
          fetchedProjects.map(async (p) => {
            try { return [p._id, await getTasks(p._id)] as [string, Task[]] }
            catch { return [p._id, []] as [string, Task[]] }
          })
        )
        setTasksByProject(Object.fromEntries(entries))
      } catch { showToast('Failed to load dashboard', 'error') }
      finally { setLoading(false) }
    }
    load()
  }, [showToast])

  const allTasks = Object.values(tasksByProject).flat()
  const myTasks = allTasks.filter((t) => t.assignedTo._id === user?.id)
  const myDone = myTasks.filter((t) => t.status === 'Done')
  const myInProgress = myTasks.filter((t) => t.status === 'In Progress')
  const myTodo = myTasks.filter((t) => t.status === 'Todo')
  const myOverdue = myTasks.filter((t) => t.isOverdue)
  const myCompletion = myTasks.length === 0 ? 0 : Math.round((myDone.length / myTasks.length) * 100)

  // Tasks due in next 3 days
  const dueSoon = myTasks.filter((t) => {
    if (t.status === 'Done') return false
    const days = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000)
    return days >= 0 && days <= 3
  })

  // High priority tasks
  const highPriority = myTasks.filter((t) => t.priorityLevel === 'High' && t.status !== 'Done')

  if (loading) return <PageSkeleton />

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">

      {/* ── Member Header ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-start justify-between gap-4">
        <div>
          {/* Blue member badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Member Portal</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">
            My{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Workspace
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hey <span className="text-blue-400 font-semibold">{user?.name}</span> — here's your personal task overview
          </p>
        </div>

        {/* Personal progress ring */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${myCompletion * 0.942} 94.2`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-400">
              {myCompletion}%
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">My Progress</p>
            <p className="text-xs text-slate-500">{myDone.length} of {myTasks.length} done</p>
          </div>
        </div>
      </motion.div>

      {/* ── Member Stat Cards (4 cards, blue theme, MY tasks only) ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Tasks */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <div className="relative glass rounded-2xl p-5 overflow-hidden border border-blue-500/15 group"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{ background: 'radial-gradient(ellipse at top left, rgba(59,130,246,0.15) 0%, transparent 60%)' }} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">My Tasks</p>
                <p className="text-3xl font-black text-white">{myTasks.length}</p>
                <p className="text-xs text-blue-400 mt-1">assigned to me</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* In Progress */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <div className="relative glass rounded-2xl p-5 overflow-hidden border border-indigo-500/15 group"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-2xl" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{ background: 'radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">In Progress</p>
                <p className="text-3xl font-black text-white">{myInProgress.length}</p>
                <p className="text-xs text-indigo-400 mt-1">active right now</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Completed */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <div className="relative glass rounded-2xl p-5 overflow-hidden border border-green-500/15 group"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-2xl" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{ background: 'radial-gradient(ellipse at top left, rgba(34,197,94,0.15) 0%, transparent 60%)' }} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-3xl font-black text-white">{myDone.length}</p>
                <p className="text-xs text-green-400 mt-1">{myCompletion}% completion rate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overdue */}
        <motion.div variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <div className={`relative glass rounded-2xl p-5 overflow-hidden group ${
            myOverdue.length > 0 ? 'border border-red-500/25' : 'border border-slate-500/10'
          }`} style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
            <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
              myOverdue.length > 0 ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-slate-600 to-slate-700'
            }`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overdue</p>
                <p className={`text-3xl font-black ${myOverdue.length > 0 ? 'text-red-400' : 'text-white'}`}>
                  {myOverdue.length}
                </p>
                <p className={`text-xs mt-1 ${myOverdue.length > 0 ? 'text-red-500' : 'text-slate-600'}`}>
                  {myOverdue.length > 0 ? 'needs attention!' : 'all on track ✓'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                myOverdue.length > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'
              }`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── My Progress Bar ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <GlassPanel className="p-5 border border-blue-500/12">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              <span className="text-sm font-bold text-slate-200">My Overall Progress</span>
            </div>
            <span className="text-sm font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {myCompletion}%
            </span>
          </div>
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${myCompletion}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-slate-500">{myTodo.length} todo</span>
            <span className="text-xs text-indigo-400">{myInProgress.length} in progress</span>
            <span className="text-xs text-green-400">{myDone.length} done</span>
            {myOverdue.length > 0 && <span className="text-xs text-red-400">{myOverdue.length} overdue</span>}
          </div>
        </GlassPanel>
      </motion.div>

      {/* ── Due Soon + High Priority ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Due Soon */}
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5 border border-amber-500/12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 text-sm">⏰</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-200">Due Soon</h2>
                <p className="text-xs text-slate-500">Next 3 days · {dueSoon.length} tasks</p>
              </div>
            </div>
            {dueSoon.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm font-medium">Nothing due soon!</p>
                <p className="text-xs mt-1">You're all caught up</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dueSoon.map((task) => {
                  const proj = projects.find((p) => p._id === task.projectId)
                  const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
                  return (
                    <div key={task._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${daysLeft === 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500">{proj?.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-bold ${daysLeft === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                        </p>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassPanel>
        </motion.div>

        {/* High Priority */}
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5 border border-red-500/12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-sm">🔥</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-200">High Priority</h2>
                <p className="text-xs text-slate-500">Needs your focus · {highPriority.length} tasks</p>
              </div>
            </div>
            {highPriority.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-medium">No high priority tasks</p>
                <p className="text-xs mt-1">Great work keeping up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {highPriority.slice(0, 5).map((task) => {
                  const proj = projects.find((p) => p._id === task.projectId)
                  return (
                    <div key={task._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15 hover:bg-red-500/10 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500">{proj?.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={task.status} />
                        {task.isOverdue && <OverdueBadge />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </GlassPanel>
        </motion.div>
      </motion.div>

      {/* ── My Projects ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <GlassPanel className="p-5 border border-blue-500/12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-200">My Projects</h2>
              <p className="text-xs text-slate-500">Projects you're a member of</p>
            </div>
          </div>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm">You haven't been added to any projects yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((p) => {
                const pt = tasksByProject[p._id] ?? []
                const myPt = pt.filter((t) => t.assignedTo._id === user?.id)
                const myPtDone = myPt.filter((t) => t.status === 'Done').length
                const pct = myPt.length === 0 ? 0 : Math.round((myPtDone / myPt.length) * 100)
                return (
                  <Link key={p._id} to={`/projects/${p._id}`}
                    className="block p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 hover:border-blue-500/25 transition-all group">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                        {p.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">{myPt.length} my tasks</span>
                      <span className="text-xs font-bold text-blue-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-blue-500 mt-2 group-hover:text-blue-400 transition-colors">
                      Open workspace →
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </GlassPanel>
      </motion.div>

      {/* ── My Tasks Table ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <GlassPanel className="overflow-hidden border border-blue-500/12">
          <div className="px-5 py-4 border-b border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              <div>
                <h2 className="text-sm font-bold text-white">My Tasks</h2>
                <p className="text-xs text-slate-500">{myTasks.length} tasks assigned to you · Personal view</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-600">
                        <div className="text-4xl">✨</div>
                        <p className="text-sm font-medium">No tasks assigned to you yet</p>
                        <p className="text-xs">Ask your admin to assign tasks</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myTasks.map((task) => {
                    const proj = projects.find((p) => p._id === task.projectId)
                    const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
                    return (
                      <tr key={task._id} className="border-b border-white/3 hover:bg-blue-500/5 transition-colors">
                        <td className="px-5 py-3 max-w-[220px]">
                          <div className="flex items-center gap-2">
                            {task.isOverdue && <span className="text-red-400 text-xs shrink-0">⚠</span>}
                            <span className="text-sm font-semibold text-slate-200 truncate">{task.title}</span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-600 mt-0.5 truncate">{task.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {proj
                            ? <Link to={`/projects/${proj._id}`} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">{proj.title}</Link>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={task.status} /></td>
                        <td className="px-5 py-3"><PriorityBadge level={task.priorityLevel} /></td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-xs font-semibold ${
                              task.isOverdue ? 'text-red-400' :
                              daysLeft <= 1 ? 'text-amber-400' : 'text-slate-500'
                            }`}>
                              {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </span>
                            {!task.isOverdue && daysLeft <= 3 && daysLeft >= 0 && (
                              <span className="text-xs text-amber-500">
                                {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  )
}
