import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
}

interface Command {
  id: string
  label: string
  description?: string
  icon: string
  action: () => void
  category: string
}

export function CommandPalette({ isOpen, onClose, projects }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View your analytics and overview',
      icon: '⚡',
      action: () => { navigate('/dashboard'); onClose() },
      category: 'Navigation',
    },
    ...projects.map((p) => ({
      id: p._id,
      label: p.title,
      description: 'Open project workspace',
      icon: '📁',
      action: () => { navigate(`/projects/${p._id}`); onClose() },
      category: 'Projects',
    })),
  ]

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { setSelected((s) => Math.min(s + 1, filtered.length - 1)); e.preventDefault() }
      if (e.key === 'ArrowUp')   { setSelected((s) => Math.max(s - 1, 0)); e.preventDefault() }
      if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action() }
    },
    [isOpen, filtered, selected, onClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!isOpen) { setQuery(''); setSelected(0) }
  }, [isOpen])

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: 'rgba(4,4,14,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-xl glass-strong rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                placeholder="Search commands, projects…"
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs text-slate-500 bg-white/5 border border-white/10">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No results for "{query}"
                </div>
              ) : (
                Object.entries(grouped).map(([category, cmds]) => (
                  <div key={category}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {category}
                    </div>
                    {cmds.map((cmd) => {
                      const globalIdx = filtered.indexOf(cmd)
                      return (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={cmd.action}
                          onMouseEnter={() => setSelected(globalIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selected === globalIdx
                              ? 'bg-violet-500/20 text-white'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-base">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-slate-500 truncate">{cmd.description}</p>
                            )}
                          </div>
                          {selected === globalIdx && (
                            <kbd className="text-xs text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                              ↵
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs text-slate-600">
              <span><kbd className="bg-white/5 border border-white/10 px-1 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="bg-white/5 border border-white/10 px-1 rounded">↵</kbd> select</span>
              <span><kbd className="bg-white/5 border border-white/10 px-1 rounded">esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
