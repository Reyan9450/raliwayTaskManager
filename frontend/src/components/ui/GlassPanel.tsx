import React from 'react'
import { motion } from 'framer-motion'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'blue' | 'pink' | 'none'
  onClick?: () => void
  as?: 'div' | 'section' | 'article'
  style?: React.CSSProperties
}

const glowMap = {
  purple: 'hover:shadow-glow-purple',
  blue:   'hover:shadow-glow-blue',
  pink:   'hover:shadow-glow-pink',
  none:   '',
}

export function GlassPanel({
  children,
  className = '',
  hover = false,
  glow = 'none',
  onClick,
  style,
}: GlassPanelProps) {
  return (
    <motion.div
      onClick={onClick}
      style={style}
      className={`
        glass rounded-2xl
        ${hover ? 'cursor-pointer transition-all duration-300 hover:bg-white/[0.09]' : ''}
        ${glow !== 'none' ? glowMap[glow] : ''}
        ${className}
      `}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
