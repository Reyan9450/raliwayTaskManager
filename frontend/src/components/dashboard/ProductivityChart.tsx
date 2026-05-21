import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { Task } from '../../types'

interface ProductivityChartProps {
  tasks: Task[]
}

const COLORS = {
  Todo:         '#94a3b8',
  'In Progress': '#6366f1',
  Done:          '#22c55e',
}

export function TaskDonutChart({ tasks }: ProductivityChartProps) {
  const counts = tasks.reduce<Record<string, number>>(
    (acc, t) => { acc[t.status] = (acc[t.status] ?? 0) + 1; return acc },
    { Todo: 0, 'In Progress': 0, Done: 0 }
  )

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm">No tasks yet</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 text-sm">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-slate-400">{payload[0].value} tasks</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name as keyof typeof COLORS] ?? '#6b7280'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface WeeklyChartProps {
  tasks: Task[]
}

export function WeeklyProgressChart({ tasks }: WeeklyChartProps) {
  // Build last 7 days data
  const days: { day: string; completed: number; created: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const dateStr = d.toISOString().slice(0, 10)

    const created = tasks.filter((t) => t.createdAt.slice(0, 10) === dateStr).length
    const completed = tasks.filter(
      (t) => t.status === 'Done' && t.dueDate.slice(0, 10) === dateStr
    ).length

    days.push({ day: label, completed, created })
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 text-xs space-y-1">
          <p className="text-slate-400 font-medium">{label}</p>
          {payload.map((p) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={days} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="created"
          name="Created"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#gradCreated)"
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#gradCompleted)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
