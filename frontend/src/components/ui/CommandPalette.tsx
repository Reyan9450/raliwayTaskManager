import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'

interface CommandPaletteProps {
  open: boolean
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

export function CommandPalette({ open, onClose, projects }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

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
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action() }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, filtered, selected, onClose])

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl glass-strong rounded-2xl border border-white/10 shadow-panel overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, projects..."
                className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] text-slate-500 text-xs font-mono">
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
                    <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {category}
                    </div>
                    {cmds.map((cmd) => {
                      const globalIdx = filtered.indexOf(cmd)
                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={cmd.action}
                          whileHover={{ x: 2 }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            globalIdx === selected
                              ? 'bg-violet-500/15 text-white'
                              : 'text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className="text-lg w-6 text-center shrink-0">{cmd.icon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-slate-500 truncate">{cmd.description}</p>
                            )}
                          </div>
                          {globalIdx === selected && (
                            <kbd className="ml-auto shrink-0 px-2 py-0.5 rounded bg-white/[0.08] text-slate-400 text-xs font-mono">
                              ↵
                            </kbd>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-slate-600">
              <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> select</span>
              <span className="flex items-center gap-1"><kbd className="font-mono">ESC</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
