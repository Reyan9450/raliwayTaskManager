import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GradientButton } from '../components/ui/GradientButton'
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants'

type RoleTab = 'Admin' | 'Member'

const ROLE_PRESETS: Record<RoleTab, { email: string; password: string }> = {
  Admin:  { email: 'admin@example.com',  password: 'Admin1234!'  },
  Member: { email: 'member@example.com', password: 'Member1234!' },
}

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<RoleTab>('Admin')
  const [email, setEmail] = useState(ROLE_PRESETS.Admin.email)
  const [password, setPassword] = useState(ROLE_PRESETS.Admin.password)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  function switchTab(tab: RoleTab) {
    setActiveTab(tab)
    setEmail(ROLE_PRESETS[tab].email)
    setPassword(ROLE_PRESETS[tab].password)
    setErrors({})
  }

  function validate(): boolean {
    const next: { email?: string; password?: string } = {}
    if (!email.trim()) next.email = 'Email is required'
    if (!password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Login failed. Please try again.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #080818 0%, #0f0a28 50%, #080818 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Taskify</span>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={staggerItem}
          className="glass-strong rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}
        >
          {/* Role tabs */}
          <div className="flex border-b border-white/8">
            {(['Admin', 'Member'] as RoleTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-7">
            <motion.div variants={fadeInUp} className="mb-6">
              <h1 className="text-xl font-black text-white">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sign in as <span className="text-violet-400 font-semibold">{activeTab}</span>
              </p>
            </motion.div>

            {/* Demo hint */}
            <div className="mb-5 px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/15">
              <p className="text-xs text-slate-400">
                <span className="text-violet-400 font-semibold">Demo credentials pre-filled.</span>
                {' '}Change them to log in as a different user.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all
                    ${errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all
                    ${errors.password ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <GradientButton
                type="submit"
                disabled={loading}
                fullWidth
                size="lg"
                className="mt-2"
              >
                {loading ? 'Signing in…' : `Sign in as ${activeTab}`}
              </GradientButton>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Register
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p variants={staggerItem} className="text-center text-xs text-slate-700 mt-6">
          Premium Task Management Platform
        </motion.p>
      </motion.div>
    </div>
  )
}
