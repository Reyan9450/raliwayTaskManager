import React from 'react'
import { motion } from 'framer-motion'
import { staggerItem } from '../../animations/variants'

interface PremiumStatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  gradient: string
  glowColor: string
  subtitle?: string
}

export function PremiumStatCard({
  label,
  value,
  icon,
  trend,
  gradient,
  glowColor,
  subtitle,
}: PremiumStatCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative glass rounded-2xl p-5 overflow-hidden cursor-default group"
      style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)` }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${glowColor} 0%, transparent 60%)` }}
      />

      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} rounded-t-2xl`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.value >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>

        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
