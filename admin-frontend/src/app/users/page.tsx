"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, ShieldAlert, ShieldCheck, Trash2, X, CheckCircle2, AlertCircle, Loader2, Search, Mail, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchAdminUsers, updateUserRoleAPI, type AdminUser } from "@/lib/admin-data"

const ROLE_OPTIONS = ['USER', 'SELLER', 'ADMIN']

const roleConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    ADMIN: { label: 'Admin', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    SELLER: { label: 'Seller', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    USER: { label: 'User', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
}

export default function UsersPage() {
    const router = useRouter()
    const [token, setToken] = useState<string | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        async function loadUsers() {
            const adminToken = localStorage.getItem("admin_token")
            if (!adminToken) { router.push("/login"); return }
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

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!token) return
        setUpdatingId(userId)
        try {
            const updated = await updateUserRoleAPI(userId, newRole, token)
            setUsers(users.map(u => u.id === userId ? { ...u, role: updated.role } : u))
            setMsg(`Role updated to ${newRole} successfully.`)
        } catch (err: any) {
            setMsg("Failed to update role.")
        } finally {
            setUpdatingId(null)
        }
        setTimeout(() => setMsg(''), 4000)
    }

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery)
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="animate-spin text-[#0a2540]" size={36} />
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Members...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-12">

            <AnimatePresence>
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
                    >
                        {msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
                        <button onClick={() => setMsg('')} className="ml-auto"><X size={14} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#dfa127] animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Control</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Users className="text-[#dfa127]" size={24} /> Platform Members
                    </h2>
                    <p className="text-slate-500 text-xs mt-1 font-semibold italic">Manage roles and permissions for all registered users.</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                        <Search size={14} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="px-3.5 py-1.5 bg-[#0a2540] text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#dfa127]/25 shadow-sm">
                        {users.length} Members
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                <th className="px-8 py-5">Member</th>
                                <th className="px-6 py-5">Contact</th>
                                <th className="px-6 py-5 text-center">Role</th>
                                <th className="px-6 py-5 text-center">Change Role</th>
                                <th className="px-8 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-xs opacity-40">
                                        No Members Found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user, idx) => {
                                    const role = (user.role || 'USER').toUpperCase() as keyof typeof roleConfig
                                    const rc = roleConfig[role] || roleConfig['USER']

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#0a2540] text-white flex items-center justify-center text-sm font-black group-hover:bg-[#dfa127] group-hover:text-[#0a2540] transition-colors shrink-0 shadow-sm">
                                                        {user.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-700 text-sm leading-tight group-hover:text-[#0a2540] transition-colors">{user.name || 'Unknown'}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID #{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1.5">
                                                    <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-[#dfa127] transition-colors truncate max-w-[180px]">
                                                        <Mail size={10} className="shrink-0" /> {user.email}
                                                    </a>
                                                    {user.phone && (
                                                        <a href={`tel:${user.phone}`} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#dfa127] transition-colors">
                                                            <Phone size={10} className="shrink-0" /> {user.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${rc.bg} ${rc.text} ${rc.border}`}>
                                                    {role === 'ADMIN' ? <ShieldAlert size={10} /> : role === 'SELLER' ? <ShieldCheck size={10} /> : <Users size={10} />}
                                                    {rc.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {updatingId === user.id ? (
                                                    <div className="flex justify-center"><Loader2 className="animate-spin text-[#dfa127]" size={18} /></div>
                                                ) : (
                                                    <select
                                                        value={(user.role || 'USER').toUpperCase()}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-600 outline-none focus:border-[#dfa127] cursor-pointer hover:bg-slate-100 transition-colors"
                                                    >
                                                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
