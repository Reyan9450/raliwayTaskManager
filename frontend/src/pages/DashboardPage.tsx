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
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/ui/Badge'
import { TaskDonutChart, WeeklyProgressChart } from '../components/dashboard/ProductivityChart'
import { ProjectProgressCard } from '../components/dashboard/ProjectProgressCard'
import { ActivityFeed } from '../components/shared/ActivityFeed'
import { PageSkeleton } from '../components/ui/SkeletonLoader'
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants'

export default function DashboardPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const isAdmin = user?.role === 'Admin'

  const [projects, setProjects] = useState<Project[]>([])
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({})
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [fetchedProjects, fetchedUsers] = await Promise.all([
          getProjects(),
          isAdmin ? getUsers() : Promise.resolve([]),
        ])
        setProjects(fetchedProjects)
        setUsers(fetchedUsers)

        const entries = await Promise.all(
          fetchedProjects.map(async (p) => {
            try {
              const tasks = await getTasks(p._id)
              return [p._id, tasks] as [string, Task[]]
            } catch {
              return [p._id, []] as [string, Task[]]
            }
          })
        )
        setTasksByProject(Object.fromEntries(entries))
      } catch {
        showToast('Failed to load dashboard data', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [showToast, isAdmin])

  const allTasks = Object.values(tasksByProject).flat()
  const myTasks = allTasks.filter((t) => t.assignedTo._id === user?.id)
  const overdueTasks = allTasks.filter((t) => t.isOverdue)
  const doneTasks = allTasks.filter((t) => t.status === 'Done')
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress')
  const displayTasks = isAdmin ? allTasks : myTasks

  if (loading) return <PageSkeleton />

  const completionRate = allTasks.length === 0 ? 0 : Math.round((doneTasks.length / allTasks.length) * 100)

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-white">
            {isAdmin ? 'Command Center' : 'My Workspace'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back,{' '}
            <span className="text-gradient-purple font-semibold">{user?.name}</span>
            {' '}— {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RoleBadge role={user?.role ?? 'Member'} />
          {completionRate > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">{completionRate}% complete</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={`grid gap-4 ${isAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}
      >
        <PremiumStatCard
          label="Total Tasks"
          value={allTasks.length}
          gradient="from-violet-500 to-indigo-500"
          glowColor="rgba(124,58,237,0.2)"
          icon={<TaskIcon />}
          subtitle={`${displayTasks.length} assigned to you`}
        />
        <PremiumStatCard
          label="In Progress"
          value={inProgressTasks.length}
          gradient="from-blue-500 to-cyan-500"
          glowColor="rgba(59,130,246,0.2)"
          icon={<ClockIcon />}
        />
        <PremiumStatCard
          label="Completed"
          value={doneTasks.length}
          gradient="from-green-500 to-emerald-500"
          glowColor="rgba(34,197,94,0.2)"
          icon={<CheckIcon />}
          trend={completionRate > 0 ? { value: completionRate, label: 'completion rate' } : undefined}
        />
        <PremiumStatCard
          label="Overdue"
          value={overdueTasks.length}
          gradient={overdueTasks.length > 0 ? 'from-red-500 to-rose-500' : 'from-slate-500 to-slate-600'}
          glowColor="rgba(239,68,68,0.2)"
          icon={<AlertIcon />}
        />
        {isAdmin && (
          <PremiumStatCard
            label="Projects"
            value={projects.length}
            gradient="from-pink-500 to-rose-500"
            glowColor="rgba(236,72,153,0.2)"
            icon={<FolderIcon />}
          />
        )}
      </motion.div>

      {/* Charts row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Donut chart */}
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5 h-full">
            <h2 className="text-sm font-bold text-slate-200 mb-1">Task Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Status breakdown across all projects</p>
            <TaskDonutChart tasks={allTasks} />
          </GlassPanel>
        </motion.div>

        {/* Weekly chart */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <GlassPanel className="p-5 h-full">
            <h2 className="text-sm font-bold text-slate-200 mb-1">Weekly Activity</h2>
            <p className="text-xs text-slate-500 mb-4">Tasks created vs completed this week</p>
            <WeeklyProgressChart tasks={allTasks} />
          </GlassPanel>
        </motion.div>
      </motion.div>

      {/* Projects + Activity */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Project progress */}
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-200">Project Progress</h2>
                <p className="text-xs text-slate-500 mt-0.5">{projects.length} active projects</p>
              </div>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                {projects.map((p) => (
                  <ProjectProgressCard
                    key={p._id}
                    project={p}
                    tasks={tasksByProject[p._id] ?? []}
                  />
                ))}
              </motion.div>
            )}
          </GlassPanel>
        </motion.div>

        {/* Activity feed */}
        <motion.div variants={staggerItem}>
          <GlassPanel className="p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-200">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest task updates</p>
            </div>
            <ActivityFeed tasks={allTasks} projects={projects} limit={6} />
          </GlassPanel>
        </motion.div>
      </motion.div>

      {/* Admin: Member tracker */}
      {isAdmin && users.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-200">Team Performance</h2>
                <p className="text-xs text-slate-500 mt-0.5">{users.length} team members</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Member', 'Total', 'Todo', 'In Progress', 'Done', 'Overdue', 'Progress'].map((h) => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {h}
                      </th>
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
                      <tr key={u._id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} size="sm" />
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{u.name}</p>
                              <p className="text-xs text-slate-600">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className="text-sm font-bold text-slate-300">{mt.length}</span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">{todo}</span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{inProg}</span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">{done}</span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {overdue > 0 ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{overdue}</span>
                          ) : (
                            <span className="text-slate-700 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <motion.div
                                className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 w-8 text-right">{pct}%</span>
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

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <div className="glass rounded-2xl p-5 border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.05)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-xs">⚠</span>
              </div>
              <h2 className="text-sm font-bold text-red-400">
                {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map((task) => {
                const proj = projects.find((p) => p._id === task.projectId)
                return (
                  <div key={task._id}
                    className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-2.5 border border-red-500/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={task.assignedTo.name} size="xs" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.assignedTo.name} · {proj?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-red-400 font-medium">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      {proj && (
                        <Link to={`/projects/${proj._id}`}
                          className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
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

      {/* Tasks table */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-200">
                {isAdmin ? 'All Tasks' : 'My Tasks'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{displayTasks.length} tasks total</p>
            </div>
          </div>

          {displayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-sm font-medium">No tasks yet</p>
              <p className="text-xs mt-1">Tasks will appear here once created</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left pb-3 pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Task</th>
                    {isAdmin && <th className="text-left pb-3 pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assignee</th>}
                    <th className="text-left pb-3 pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Project</th>
                    <th className="text-left pb-3 pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left pb-3 pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Due</th>
                    <th className="text-left pb-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTasks.slice(0, 20).map((task) => {
                    const proj = projects.find((p) => p._id === task.projectId)
                    return (
                      <tr key={task._id} className="border-b border-white/3 hover:bg-white/3 transition-colors group">
                        <td className="py-3 pr-4 max-w-[200px]">
                          <div className="flex items-center gap-2">
                            {task.isOverdue && <span className="text-red-400 text-xs shrink-0">⚠</span>}
                            <span className="text-sm font-medium text-slate-200 truncate">{task.title}</span>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="py-3 pr-4">
                            <Avatar name={task.assignedTo.name} size="xs" showName />
                          </td>
                        )}
                        <td className="py-3 pr-4">
                          {proj ? (
                            <Link to={`/projects/${proj._id}`}
                              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                              {proj.title}
                            </Link>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-3 pr-4"><StatusBadge status={task.status} /></td>
                        <td className={`py-3 pr-4 text-xs font-medium ${task.isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3"><PriorityBadge level={task.priorityLevel} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {displayTasks.length > 20 && (
                <p className="text-xs text-slate-600 text-center pt-4">
                  Showing 20 of {displayTasks.length} tasks
                </p>
              )}
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  )
}

// Icons
function TaskIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
function FolderIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}
