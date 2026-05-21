import { useCallback } from 'react'
import {
  DndContext, closestCenter, PointerSensor,
  KeyboardSensor, useSensor, useSensors,
  type DragEndEvent, DragOverlay, type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '../../types'
import { useTaskContext } from '../../context/TaskContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { KanbanColumn } from './KanbanColumn'
import { DynamicKanbanCard } from './DynamicKanbanCard'

type ColumnStatus = 'Todo' | 'In Progress' | 'Done'
const VALID_STATUSES: ColumnStatus[] = ['Todo', 'In Progress', 'Done']

function isValidStatus(v: unknown): v is ColumnStatus {
  return VALID_STATUSES.includes(v as ColumnStatus)
}

interface KanbanBoardProps {
  projectId: string
  onEditTask?: (task: Task) => void
  onAddTask?: () => void
}

export function KanbanBoard({ projectId, onEditTask, onAddTask }: KanbanBoardProps) {
  const { tasksByProject, updateTaskStatus, deleteTask } = useTaskContext()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const allTasks: Task[] = tasksByProject[projectId] ?? []
  const tasksByStatus = (s: ColumnStatus) => allTasks.filter((t) => t.status === s)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = allTasks.find((t) => t._id === event.active.id)
    setActiveTask(task ?? null)
  }, [allTasks])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const targetStatus = over.id

    if (!isValidStatus(targetStatus)) return

    const task = allTasks.find((t) => t._id === taskId)
    if (!task || task.status === targetStatus) return

    if (user?.role === 'Member' && task.assignedTo._id !== user.id) {
      showToast('You can only move your own tasks', 'error')
      return
    }

    try {
      await updateTaskStatus(taskId, projectId, targetStatus)
    } catch {
      showToast('Failed to update task status', 'error')
    }
  }, [allTasks, user, projectId, updateTaskStatus, showToast])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId, projectId)
      showToast('Task deleted', 'success')
    } catch {
      showToast('Failed to delete task', 'error')
    }
  }, [deleteTask, projectId, showToast])

  const isAdmin = user?.role === 'Admin'
  const editHandler = isAdmin ? onEditTask : undefined
  const deleteHandler = isAdmin ? handleDeleteTask : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-4 items-start overflow-x-auto pb-6 no-scrollbar"
        style={{ minHeight: '500px' }}
      >
        {VALID_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            onEditTask={editHandler}
            onDeleteTask={deleteHandler}
            onAddTask={onAddTask}
            isAdmin={isAdmin}
          />
        ))}
      </motion.div>

      <DragOverlay>
        {activeTask && (
          <div className="drag-active rounded-2xl">
            <DynamicKanbanCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
