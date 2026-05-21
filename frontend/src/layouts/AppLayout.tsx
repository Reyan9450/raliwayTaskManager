import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FloatingSidebar } from '../components/shared/FloatingSidebar'
import { CommandPalette } from '../components/shared/CommandPalette'
import { getProjects } from '../api/projects'
import type { Project } from '../types'
import { useAuth } from '../context/AuthContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen((v) => !v)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Admin = purple ambient, Member = blue ambient
  const ambientOrbs = isAdmin ? (
    <>
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-6"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
    </>
  ) : (
    <>
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-6"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
    </>
  )

  return (
    <div className="flex min-h-screen" style={{ background: '#080818' }}>
      {/* Role-tinted ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {ambientOrbs}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <FloatingSidebar
          isOpen={true}
          onClose={() => {}}
          onCommandPalette={() => setCommandOpen(true)}
          projects={projects}
          onProjectsChange={setProjects}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <FloatingSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCommandPalette={() => { setCommandOpen(true); setSidebarOpen(false) }}
          projects={projects}
          onProjectsChange={setProjects}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 px-4 py-3 border-b lg:hidden"
          style={{
            background: 'rgba(8,8,24,0.95)',
            backdropFilter: 'blur(20px)',
            borderColor: isAdmin ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.15)',
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isAdmin
                ? 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400'
                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              isAdmin
                ? 'bg-gradient-to-br from-violet-600 to-purple-600'
                : 'bg-gradient-to-br from-blue-600 to-cyan-600'
            }`}>
              <span className="text-white font-black text-xs">T</span>
            </div>
            <span className="font-bold text-white text-sm">Taskify</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
              isAdmin
                ? 'bg-violet-500/20 text-violet-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {user?.role}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </header>

        <motion.main
          key="main"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto relative"
        >
          {children}
        </motion.main>
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        projects={projects}
      />
    </div>
  )
}
