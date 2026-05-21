import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { createProject } from '../../api/projects'
import type { Project } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Avatar } from '../ui/Avatar'
import { GradientButton } from '../ui/GradientButton'

interface FloatingSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCommandPalette: () => void
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
}

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

  // Role-based color tokens
  const accent = isAdmin
    ? { ring: 'ring-violet-500/30', glow: 'shadow-glow-purple', from: 'from-violet-600', to: 'to-purple-600', text: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/20', activeBg: 'from-violet-600/30 to-purple-600/20', activeBorder: 'border-violet-500/20', dot: 'bg-violet-400', hoverBg: 'hover:bg-violet-500/10' }
    : { ring: 'ring-blue-500/30', glow: 'shadow-glow-blue', from: 'from-blue-600', to: 'to-cyan-600', text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20', activeBg: 'from-blue-600/30 to-cyan-600/20', activeBorder: 'border-blue-500/20', dot: 'bg-blue-400', hoverBg: 'hover:bg-blue-500/10' }

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
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create project'
      showToast(msg, 'error')
    } finally {
      setCreating(false)
    }
  }

  const sidebarBg = isAdmin
    ? 'linear-gradient(180deg, rgba(20,10,50,0.98) 0%, rgba(8,8,24,0.98) 100%)'
    : 'linear-gradient(180deg, rgba(8,20,50,0.98) 0%, rgba(8,8,24,0.98) 100%)'

  const borderColor = isAdmin ? 'rgba(124,58,237,0.12)' : 'rgba(59,130,246,0.12)'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-40 w-[260px] flex flex-col lg:relative lg:translate-x-0 lg:flex"
        style={{ background: sidebarBg, borderRight: `1px solid ${borderColor}`, backdropFilter: 'blur(20px)' }}
      >
        {/* ── Brand ── */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent.from} ${accent.to} flex items-center justify-center ${accent.glow}`}>
              <span className="text-white font-black text-sm">T</span>
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">Taskify</span>
              <p className={`text-xs -mt-0.5 font-semibold ${accent.text}`}>
                {isAdmin ? 'Admin Console' : 'Member Portal'}
              </p>
            </div>
          </Link>

          {/* Role banner */}
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl ${accent.bg} border ${accent.border}`}>
            <div className={`w-2 h-2 rounded-full ${accent.dot} animate-pulse`} />
            <span className={`text-xs font-bold ${accent.text}`}>
              {isAdmin ? '⚡ Administrator' : '👤 Team Member'}
            </span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-3 py-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <button
            type="button"
            onClick={onCommandPalette}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-500 transition-all text-sm group ${accent.hoverBg} hover:border-white/15`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left text-xs">Search…</span>
            <kbd className={`text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded ${accent.text} opacity-70`}>⌘K</kbd>
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 no-scrollbar">

          {/* Dashboard link */}
          {(() => {
            const active = location.pathname === '/dashboard'
            return (
              <Link
                to="/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? `bg-gradient-to-r ${accent.activeBg} text-white border ${accent.activeBorder}`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className={`w-4 h-4 shrink-0 ${active ? accent.text : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isAdmin ? 'Command Center' : 'My Dashboard'}
                {active && <motion.div layoutId="activeNav" className={`ml-auto w-1.5 h-1.5 rounded-full ${accent.dot}`} />}
              </Link>
            )
          })()}

          {/* Admin-only quick links */}
          {isAdmin && (
            <div className="pt-1 pb-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <div className="flex-1 h-px bg-violet-500/10" />
                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Admin Tools</span>
                <div className="flex-1 h-px bg-violet-500/10" />
              </div>
              <div className="space-y-0.5">
                {[
                  { label: 'Team Overview', icon: '👥', desc: 'Manage members' },
                  { label: 'All Projects', icon: '📊', desc: 'Full visibility' },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 cursor-default">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-slate-400">{item.label}</p>
                      <p className="text-xs text-slate-700">{item.desc}</p>
                    </div>
                    <span className="ml-auto text-xs text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-md">Dashboard</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member-only quick links */}
          {!isAdmin && (
            <div className="pt-1 pb-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <div className="flex-1 h-px bg-blue-500/10" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">My Work</span>
                <div className="flex-1 h-px bg-blue-500/10" />
              </div>
              <div className="space-y-0.5">
                {[
                  { label: 'My Tasks', icon: '✅', desc: 'Assigned to me' },
                  { label: 'Due Soon', icon: '⏰', desc: 'Upcoming deadlines' },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 cursor-default">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-slate-400">{item.label}</p>
                      <p className="text-xs text-slate-700">{item.desc}</p>
                    </div>
                    <span className="ml-auto text-xs text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-md">Dashboard</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Projects ── */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Projects</span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowCreateForm((v) => !v)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-xs transition-all ${accent.bg} ${accent.text} ${accent.hoverBg}`}
                  title="New project"
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
                    className={`w-full bg-white/5 border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${accent.ring} mb-2`}
                    style={{ borderColor: borderColor }}
                  />
                  <div className="flex gap-1.5">
                    <GradientButton type="submit" disabled={creating || !newTitle.trim()} size="sm" fullWidth>
                      {creating ? '…' : 'Create'}
                    </GradientButton>
                    <GradientButton type="button" onClick={() => { setShowCreateForm(false); setNewTitle('') }} variant="ghost" size="sm" fullWidth>
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
                        ? `bg-gradient-to-r ${accent.activeBg} text-white border ${accent.activeBorder}`
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? accent.dot : 'bg-slate-700'}`} />
                    <span className="truncate text-xs font-medium">{p.title}</span>
                    {isAdmin && (
                      <span className="ml-auto text-xs text-slate-700 shrink-0">admin</span>
                    )}
                  </Link>
                )
              })}

              {projects.length === 0 && !showCreateForm && (
                <div className={`mx-1 px-3 py-3 rounded-xl border border-dashed text-center`}
                  style={{ borderColor }}>
                  <p className="text-xs text-slate-600">
                    {isAdmin ? 'Create your first project →' : 'No projects assigned yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── User footer ── */}
        <div className="px-3 py-3" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className={`flex items-center gap-2.5 px-2 py-2.5 rounded-xl border transition-colors group cursor-default ${accent.bg} ${accent.border}`}>
            <div className="relative">
              <Avatar name={user?.name ?? 'U'} size="sm" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-900 ${isAdmin ? 'bg-violet-500' : 'bg-blue-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className={`text-xs font-semibold ${accent.text}`}>
                {isAdmin ? '⚡ Administrator' : '👤 Member'}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-600 hover:text-red-400 transition-all"
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
