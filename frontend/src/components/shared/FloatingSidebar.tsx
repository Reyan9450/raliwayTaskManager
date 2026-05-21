import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { createProject } from '../../api/projects'
import type { Project } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Avatar } from '../ui/Avatar'
import { RoleBadge } from '../ui/Badge'
import { GradientButton } from '../ui/GradientButton'

interface FloatingSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCommandPalette: () => void
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
}

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
]

export function FloatingSidebar({
  isOpen, onClose, onCommandPalette, projects, onProjectsChange,
}: FloatingSidebarProps) {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const isAdmin = user?.role === 'Admin'

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const project = await createProject({ title: newTitle.trim() })
      onProjectsChange([...projects, project])
      setNewTitle('')
      setShowCreateForm(false)
      showToast('Project created', 'success')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to create project'
      showToast(message, 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 w-[260px] flex flex-col lg:relative lg:translate-x-0 lg:flex"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,46,0.98) 0%, rgba(8,8,24,0.98) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-white/5">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">Taskify</span>
              <p className="text-xs text-slate-600 -mt-0.5">Workspace</p>
            </div>
          </Link>
        </div>

        {/* Search / Command */}
        <div className="px-3 py-3 border-b border-white/5">
          <button
            type="button"
            onClick={onCommandPalette}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 text-slate-500 hover:text-slate-400 transition-all text-sm group"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left text-xs">Search…</span>
            <kbd className="text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-600 group-hover:text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white border border-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={active ? 'text-violet-400' : ''}>{item.icon}</span>
                {item.label}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"
                  />
                )}
              </Link>
            )
          })}

          {/* Projects section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Projects
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="w-5 h-5 rounded-md bg-white/5 hover:bg-violet-500/20 flex items-center justify-center text-slate-500 hover:text-violet-400 transition-all text-xs"
                >
                  +
                </button>
              )}
            </div>

            <AnimatePresence>
              {isAdmin && showCreateForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateProject}
                  className="px-1 mb-2 overflow-hidden"
                >
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Project name…"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 mb-2"
                  />
                  <div className="flex gap-1.5">
                    <GradientButton
                      type="submit"
                      disabled={creating || !newTitle.trim()}
                      size="sm"
                      fullWidth
                    >
                      {creating ? '…' : 'Create'}
                    </GradientButton>
                    <GradientButton
                      type="button"
                      onClick={() => { setShowCreateForm(false); setNewTitle('') }}
                      variant="ghost"
                      size="sm"
                      fullWidth
                    >
                      Cancel
                    </GradientButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {projects.map((p) => {
                const active = location.pathname === `/projects/${p._id}`
                return (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all truncate ${
                      active
                        ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white border border-violet-500/15'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-violet-400' : 'bg-slate-600'}`} />
                    <span className="truncate text-xs font-medium">{p.title}</span>
                  </Link>
                )
              })}

              {projects.length === 0 && !showCreateForm && (
                <p className="px-3 text-xs text-slate-700 py-2">
                  {isAdmin ? 'Create your first project' : 'No projects yet'}
                </p>
              )}
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
            <Avatar name={user?.name ?? 'U'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <RoleBadge role={user?.role ?? 'Member'} />
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
