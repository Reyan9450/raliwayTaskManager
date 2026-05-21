import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects } from '../api/projects'
import { getTasks } from '../api/tasks'
import { getUsers, type UserSummary } from '../api/users'
import type { Project, Task } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PremiumStatCard } from '../components/ui/PremiumStatCard'
import { GlassPanel } from '../components/ui/GlassPanel'
import { Avatar } from '../components/ui/Avatar'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { TaskDonutChart, WeeklyProgressChart } from '../components/dashboard/ProductivityChart'
import { ProjectProgressCard } from '../components/dashboard/ProjectProgressCard'
import { ActivityFeed } from '../components/shared/ActivityFeed'
import { PageSkeleton } from '../components/ui/SkeletonLoader'
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants'

export function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({})
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [fetchedProjects, fetchedUsers] = await Promise.all([getProjects(), getUsers()])
        setProjects(fetchedProjects)
        setUsers(fetchedUsers)
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
  const doneTasks = allTasks.filter((t) => t.status === 'Done')
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress')
  const overdueTasks = allTasks.filter((t) => t.isOverdue)
  const completionRate = allTasks.length === 0 ? 0 : Math.round((doneTasks.length / allTasks.length) * 100)

  if (loading) return <PageSkeleton />

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Admin Header ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-start justify-between gap-4">
        <div>
          {/* Purple admin badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Admin Console</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">
            Command{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Full workspace control · {projects.length} projects · {users.length} members · {allTasks.length} tasks
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Completion ring */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(124,58,237,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#7c3aed" strokeWidth="3"
                  strokeDasharray={`${completionRate * 0.942} 94.2`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-violet-400">
                {completionRate}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Overall Progress</p>
              <p className="text-xs text-slate-500">{doneTasks.length} of {allTasks.length} done</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Admin Stat Cards (5 cards, purple theme) ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumStatCard label="Total Tasks" value={allTasks.length}
          gradient="from-violet-500 to-purple-600" glowColor="rgba(124,58,237,0.25)"
          icon={<TaskIcon />} subtitle="Across all projects" />
        <PremiumStatCard label="In Progress" value={inProgressTasks.length}
          gradient="from-indigo-500 to-blue-600" glowColor="rgba(99,102,241,0.25)"
          icon={<ClockIcon />} />
        <PremiumStatCard label="Completed" value={doneTasks.length}
          gradient="from-green-500 to-emerald-600" glowColor="rgba(34,197,94,0.25)"
          icon={<CheckIcon />}
          trend={completionRate > 0 ? { value: completionRate, label: 'completion rate' } : undefined} />
        <PremiumStatCard label="Overdue" value={overdueTasks.length}
          gradient={overdueTasks.length > 0 ? 'from-red-500 to-rose-600' : 'from-slate-600 to-slate-700'}
          glowColor="rgba(239,68,68,0.2)" icon={<AlertIcon />} />
        <PremiumStatCard label="Projects" value={projects.length}
          gradient="from-pink-500 to-rose-600" glowColor="rgba(236,72,153,0.25)"
          icon={<FolderIcon />} subtitle={`${users.length} team members`} />
      </motion.div>

      {/* ── Charts ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5 h-full" style={{ borderColor: 'rgba(124,58,237,0.12)' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
              <h2 className="text-sm font-bold text-slate-200">Task Distribution</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 ml-3.5">All projects combined</p>
            <TaskDonutChart tasks={allTasks} />
          </GlassPanel>
        </motion.div>
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <GlassPanel className="p-5 h-full" style={{ borderColor: 'rgba(124,58,237,0.12)' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-blue-600" />
              <h2 className="text-sm font-bold text-slate-200">Weekly Activity</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 ml-3.5">Team output this week</p>
            <WeeklyProgressChart tasks={allTasks} />
          </GlassPanel>
        </motion.div>
      </motion.div>

      {/* ── Team Performance Table ── */}
      {users.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <GlassPanel className="overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)' } as React.CSSProperties}>
            {/* Header with purple accent */}
            <div className="px-5 py-4 border-b border-violet-500/10 bg-gradient-to-r from-violet-500/8 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <span className="text-violet-400 text-sm">👥</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Team Performance</h2>
                  <p className="text-xs text-slate-500">{users.length} members · Admin view only</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span className="text-xs font-semibold text-violet-400">Live</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Member', 'Role', 'Total', 'Todo', 'In Progress', 'Done', 'Overdue', 'Progress'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const mt = allTasks.filter((t) => t.assignedTo._id === u._id)
                    const todo = mt.filter((t) => t.status === 'Todo').length
                    const inProg = mt.filter((t) => t.status === 'In Progress').length
                    const done = mt.filter((t) => t.status === 'Done').length
                    const overdue = mt.filter((t) => t.isOverdue).length
                    const pct = mt.length === 0 ? 0 : Math.round((done / mt.length) * 100)
                    return (
                      <tr key={u._id} className="border-b border-white/3 hover:bg-violet-500/5 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} size="sm" />
                            <div>
                              <p className="text-xs font-bold text-slate-200">{u.name}</p>
                              <p className="text-xs text-slate-600 truncate max-w-[120px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.role === 'Admin'
                              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-black text-slate-200">{mt.length}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">{todo}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{inProg}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">{done}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {overdue > 0
                            ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{overdue}</span>
                            : <span className="text-slate-700 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <motion.div
                                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-xs font-bold text-violet-400 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* ── Projects + Activity ── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5" style={{ borderColor: 'rgba(124,58,237,0.12)' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-200">All Projects</h2>
                  <p className="text-xs text-slate-500">{projects.length} active</p>
                </div>
              </div>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm">No projects yet — create one from the sidebar</p>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                {projects.map((p) => (
                  <ProjectProgressCard key={p._id} project={p} tasks={tasksByProject[p._id] ?? []} />
                ))}
              </motion.div>
            )}
          </GlassPanel>
        </motion.div>

        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5" style={{ borderColor: 'rgba(124,58,237,0.12)' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-pink-500 to-rose-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-200">Team Activity</h2>
                <p className="text-xs text-slate-500">Latest across all projects</p>
              </div>
            </div>
            <ActivityFeed tasks={allTasks} projects={projects} limit={7} />
          </GlassPanel>
        </motion.div>
      </motion.div>

      {/* ── Overdue Alert (admin sees all) ── */}
      {overdueTasks.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <div className="glass rounded-2xl p-5 border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.04)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400">⚠</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-red-400">
                  {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''} — Team-wide
                </h2>
                <p className="text-xs text-slate-600">Requires admin attention</p>
              </div>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map((task) => {
                const proj = projects.find((p) => p._id === task.projectId)
                return (
                  <div key={task._id}
                    className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-2.5 border border-red-500/10 hover:bg-red-500/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={task.assignedTo.name} size="xs" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.assignedTo.name} · {proj?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-red-400 font-semibold">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {proj && (
                        <Link to={`/projects/${proj._id}`}
                          className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── All Tasks Table ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <GlassPanel className="overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)' } as React.CSSProperties}>
          <div className="px-5 py-4 border-b border-violet-500/10 bg-gradient-to-r from-violet-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-violet-500 to-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-white">All Tasks — Full View</h2>
                <p className="text-xs text-slate-500">{allTasks.length} tasks across all projects · Admin only</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Task', 'Assignee', 'Project', 'Status', 'Due', 'Priority'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTasks.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600 text-sm">No tasks yet</td></tr>
                ) : (
                  allTasks.slice(0, 20).map((task) => {
                    const proj = projects.find((p) => p._id === task.projectId)
                    return (
                      <tr key={task._id} className="border-b border-white/3 hover:bg-violet-500/5 transition-colors">
                        <td className="px-5 py-3 max-w-[200px]">
                          <div className="flex items-center gap-2">
                            {task.isOverdue && <span className="text-red-400 text-xs shrink-0">⚠</span>}
                            <span className="text-sm font-semibold text-slate-200 truncate">{task.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><Avatar name={task.assignedTo.name} size="xs" showName /></td>
                        <td className="px-5 py-3">
                          {proj
                            ? <Link to={`/projects/${proj._id}`} className="text-xs text-violet-400 hover:text-violet-300 font-semibold">{proj.title}</Link>
                            : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={task.status} /></td>
                        <td className={`px-5 py-3 text-xs font-semibold ${task.isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-5 py-3"><PriorityBadge level={task.priorityLevel} /></td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            {allTasks.length > 20 && (
              <p className="text-xs text-slate-600 text-center py-3">Showing 20 of {allTasks.length} tasks</p>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  )
}

function TaskIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> }
function ClockIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function CheckIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function AlertIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> }
function FolderIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg> }
