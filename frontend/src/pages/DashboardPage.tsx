import { useAuth } from '../context/AuthContext'
import { AdminDashboard } from './AdminDashboard'
import { MemberDashboard } from './MemberDashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  return user?.role === 'Admin' ? <AdminDashboard /> : <MemberDashboard />
}
