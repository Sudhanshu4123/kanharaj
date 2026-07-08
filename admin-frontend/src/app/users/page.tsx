"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, CheckCircle2, AlertCircle, Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchAdminUsers, updateUserRoleAPI, type AdminUser } from "@/lib/admin-data"

export default function UsersPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    async function loadUsers() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) {
        router.push("/login")
        return
      }
      setToken(adminToken)

      try {
        const data = await fetchAdminUsers(adminToken)
        setUsers(data)
      } catch (err) {
        console.error("Failed to load users", err)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [router])

  // Handle Role Change for Users
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) return
    try {
      await updateUserRoleAPI(userId, newRole, token)
      // Update state instantly
      setUsers(users.map(u => String(u.id) === String(userId) ? { ...u, role: newRole as any } : u))
      setMsg(`User role updated to ${newRole} successfully.`)
    } catch (err: any) {
      setMsg(err.message || 'Failed to update user role')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Members...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
          >
            {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase tracking-wider">
            <Users className="text-[#dfa127]" />
            Registered Members
          </h2>
          <p className="text-slate-450 text-xs font-semibold italic mt-1">Manage user roles and system privileges across the platform.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-[#0a2540] text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#dfa127]/25 shadow-sm">
          Total: {users.length} Users
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="px-8 py-5">User Info</th>
                <th className="px-6 py-5">Contact Details</th>
                <th className="px-6 py-5 text-center">Subscription Plan</th>
                <th className="px-6 py-5 text-center">Access Role</th>
                <th className="px-8 py-5 text-center">Change Role Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-450 font-bold uppercase tracking-wider text-xs opacity-40">No Registered Users Found</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-sm group-hover:bg-[#dfa127] group-hover:text-[#0a2540] transition-colors">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <h4 className="text-xs font-black text-slate-700 truncate leading-none mb-1">{u.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs font-semibold text-slate-600">{u.email}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{u.phone || 'No Phone Registered'}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${u.subscriptionPlan === 'SUPER' || u.subscriptionPlan === 'PRO'
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : u.subscriptionPlan === 'GOLD'
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        {u.subscriptionPlan || 'FREE / NONE'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${u.role?.toUpperCase() === 'ADMIN'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : u.role?.toUpperCase() === 'SELLER'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        {u.role || 'USER'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <select
                        value={u.role?.toUpperCase() || 'USER'}
                        onChange={(e) => handleRoleChange(String(u.id), e.target.value)}
                        className="mx-auto w-32 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 outline-none bg-slate-55 hover:bg-white transition-all cursor-pointer focus:border-[#dfa127]"
                      >
                        <option value="USER">User (Buyer)</option>
                        <option value="SELLER">Seller (Builder)</option>
                        <option value="ADMIN">Admin Panel</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
