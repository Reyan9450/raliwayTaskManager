import React, { createContext, useCallback, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastContextValue {
  showToast(message: string, type: ToastType): void
}

interface Toast {
  id: string
  message: string
  type: ToastType
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const toastConfig: Record<ToastType, { icon: string; classes: string; bar: string }> = {
  success: {
    icon: '✓',
    classes: 'border-green-500/30 bg-green-500/10',
    bar: 'bg-green-500',
  },
  error: {
    icon: '✕',
    classes: 'border-red-500/30 bg-red-500/10',
    bar: 'bg-red-500',
  },
  info: {
    icon: 'i',
    classes: 'border-blue-500/30 bg-blue-500/10',
    bar: 'bg-blue-500',
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Date.now().toString()

      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const cfg = toastConfig[toast.type]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0,  scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                role="alert"
                className={`
                  pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl
                  glass border min-w-[280px] max-w-sm
                  ${cfg.classes}
                `}
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <div className={`w-6 h-6 rounded-lg ${cfg.bar} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {cfg.icon}
                </div>
                <span className="text-sm text-slate-200 flex-1">{toast.message}</span>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss"
                  className="text-slate-500 hover:text-white transition-colors text-xs shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
