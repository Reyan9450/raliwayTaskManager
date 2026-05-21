import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Task, Project, CreateTaskData, UpdateTaskData } from '../../types'
import { useTaskContext } from '../../context/TaskContext'
import { useToast } from '../../context/ToastContext'
import { getUsers, type UserSummary } from '../../api/users'
import { AnimatedModal } from '../ui/AnimatedModal'
import { GradientButton } from '../ui/GradientButton'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../theme/colors'

interface TaskModalProps {
  projectId: string
  project: Project
  task?: Task | null
  onClose: () => void
}

interface FieldErrors {
  title?: string
  assignedTo?: string
  dueDate?: string
}

const STATUS_OPTIONS: Task['status'][] = ['Todo', 'In Progress', 'Done']

export function TaskModal({ projectId, project, task, onClose }: TaskModalProps) {
  const { addTask, updateTask } = useTaskContext()
  const { showToast } = useToast()
  const isEdit = task != null

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo._id ?? '')
  const [status, setStatus] = useState<Task['status']>(task?.status ?? 'Todo')
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<UserSummary[]>([])

  useEffect(() => {
    const ids = [project.admin, ...project.members]
    getUsers()
      .then((all) => setMembers(all.filter((u) => ids.includes(u._id))))
      .catch(() => {})
  }, [project])

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setAssignedTo(task?.assignedTo._id ?? '')
    setStatus(task?.status ?? 'Todo')
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 10) : '')
    setErrors({})
  }, [task])

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!title.trim()) next.title = 'Title is required'
    if (!assignedTo) next.assignedTo = 'Please select an assignee'
    if (!dueDate) next.dueDate = 'Due date is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (isEdit && task) {
        const data: UpdateTaskData = {
          title: title.trim(),
          description: description.trim() || undefined,
          assignedTo, status,
          dueDate: new Date(dueDate).toISOString(),
        }
        await updateTask(task._id, projectId, data)
        showToast('Task updated successfully', 'success')
      } else {
        const data: CreateTaskData = {
          title: title.trim(),
          description: description.trim() || undefined,
          projectId, assignedTo, status,
          dueDate: new Date(dueDate).toISOString(),
        }
        await addTask(data)
        showToast('Task created successfully', 'success')
      }
      onClose()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (isEdit ? 'Failed to update task' : 'Failed to create task')
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const assignableIds = [project.admin, ...project.members]

  return (
    <AnimatedModal isOpen onClose={onClose} maxWidth="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
            isEdit
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-violet-500/20 text-violet-400'
          }`}>
            {isEdit ? '✏️' : '✨'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500">{project.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
              ${errors.title ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:border-white/20'}`}
          />
          {errors.title && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-400"
            >
              {errors.title}
            </motion.p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add more details…"
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
          />
        </div>

        {/* Assignee + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Assign To <span className="text-red-400">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer
                ${errors.assignedTo ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
            >
              <option value="" className="bg-dark-800">Select member…</option>
              {members.length > 0
                ? members.map((m) => (
                    <option key={m._id} value={m._id} className="bg-dark-800">
                      {m.name}
                    </option>
                  ))
                : assignableIds.map((id) => (
                    <option key={id} value={id} className="bg-dark-800">{id}</option>
                  ))
              }
            </select>
            {errors.assignedTo && (
              <p className="mt-1 text-xs text-red-400">{errors.assignedTo}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-sm text-white
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-dark-800">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status visual indicator */}
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => {
            const cfg = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  status === s
                    ? `${cfg.badge} scale-[1.02]`
                    : 'bg-white/3 border-white/5 text-slate-600 hover:bg-white/8'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Due Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all
              ${errors.dueDate ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
          />
          {errors.dueDate && (
            <p className="mt-1 text-xs text-red-400">{errors.dueDate}</p>
          )}
        </div>

        {/* Priority preview */}
        {task && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
            <span className="text-xs text-slate-500">Priority:</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[task.priorityLevel].badge}`}>
              {task.priorityLevel}
            </span>
            <span className="text-xs text-slate-600 ml-auto">Auto-calculated by system</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <GradientButton
            type="button"
            onClick={onClose}
            variant="ghost"
            fullWidth
          >
            Cancel
          </GradientButton>
          <GradientButton
            type="submit"
            disabled={loading}
            variant="primary"
            fullWidth
          >
            {loading
              ? (isEdit ? 'Saving…' : 'Creating…')
              : (isEdit ? 'Save Changes' : 'Create Task')
            }
          </GradientButton>
        </div>
      </form>
    </AnimatedModal>
  )
}
