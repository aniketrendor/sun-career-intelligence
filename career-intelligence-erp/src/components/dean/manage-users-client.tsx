'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Users, UserCheck, Shield, GraduationCap, Plus, Search,
  Filter, MoreHorizontal, Mail, Phone, Calendar, CheckCircle2,
  XCircle, AlertCircle, RefreshCw, Edit3, Trash2, ShieldCheck,
  Award, Sparkles, ChevronDown, UserX, Settings2, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  updateUserRole,
  updateUserStatus,
  createManagedUser,
  deleteManagedUser,
  updateUserDetails
} from '@/lib/actions/dean.actions'

export interface ManagedUser {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  phone?: string | null
  avatar_url?: string | null
  role: 'STUDENT' | 'MENTOR' | 'ADMIN' | 'COUNSELOR' | 'DEAN_HOD'
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE'
  created_at: string
  student_profile?: { prn?: string | null; current_program?: string | null } | null
  counselor_profile?: { employee_id?: string | null; designation?: string | null } | null
  dean_profile?: { employee_id?: string | null; designation?: string | null } | null
}

interface ManageUsersClientProps {
  initialUsers: ManagedUser[]
  currentUserId: string
}

export function ManageUsersClient({ initialUsers, currentUserId }: ManageUsersClientProps) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [isPending, startTransition] = useTransition()

  // New User Form State
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'STUDENT' | 'MENTOR' | 'ADMIN'>('STUDENT')
  const [newPhone, setNewPhone] = useState('')
  const [newPrnOrId, setNewPrnOrId] = useState('')
  const [newDesignation, setNewDesignation] = useState('')

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editPrnOrId, setEditPrnOrId] = useState('')
  const [editDesignation, setEditDesignation] = useState('')

  // Open Edit Modal
  const openEditModal = (user: ManagedUser) => {
    setEditingUser(user)
    setEditFullName(user.full_name || '')
    setEditEmail(user.email || '')
    setEditPhone(user.phone || '')
    const prnOrId = user.student_profile?.prn || user.counselor_profile?.employee_id || user.dean_profile?.employee_id || ''
    const designation = user.counselor_profile?.designation || user.dean_profile?.designation || ''
    setEditPrnOrId(prnOrId)
    setEditDesignation(designation)
  }

  // Statistics
  const stats = useMemo(() => {
    const total = users.length
    const students = users.filter(u => u.role === 'STUDENT').length
    const mentors = users.filter(u => u.role === 'MENTOR' || u.role === 'COUNSELOR').length
    const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'DEAN_HOD').length
    const active = users.filter(u => u.status === 'ACTIVE').length
    const pending = users.filter(u => u.status === 'PENDING').length
    return { total, students, mentors, admins, active, pending }
  }, [users])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.student_profile?.prn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.counselor_profile?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.dean_profile?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesRole = true
      if (selectedRoleFilter === 'STUDENT') matchesRole = user.role === 'STUDENT'
      else if (selectedRoleFilter === 'MENTOR') matchesRole = user.role === 'MENTOR' || user.role === 'COUNSELOR'
      else if (selectedRoleFilter === 'ADMIN') matchesRole = user.role === 'ADMIN' || user.role === 'DEAN_HOD'

      let matchesStatus = true
      if (selectedStatusFilter !== 'ALL') {
        matchesStatus = user.status === selectedStatusFilter
      }

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter])

  // Normalize Display Role
  const getNormalizedRole = (role: string): 'STUDENT' | 'MENTOR' | 'ADMIN' => {
    if (role === 'COUNSELOR' || role === 'MENTOR') return 'MENTOR'
    if (role === 'DEAN_HOD' || role === 'ADMIN') return 'ADMIN'
    return 'STUDENT'
  }

  // Handle Role Change
  const handleRoleChange = (userId: string, targetRole: 'STUDENT' | 'MENTOR' | 'ADMIN') => {
    startTransition(async () => {
      const res = await updateUserRole(userId, targetRole)
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u))
        toast.success(`Role updated to ${targetRole} successfully!`)
      } else {
        toast.error(res.error || 'Failed to update role')
      }
    })
  }

  // Handle Status Change
  const handleStatusChange = (userId: string, targetStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    startTransition(async () => {
      const res = await updateUserStatus(userId, targetStatus)
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: targetStatus } : u))
        toast.success(`User status updated to ${targetStatus}`)
      } else {
        toast.error(res.error || 'Failed to update status')
      }
    })
  }

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFullName.trim() || !newEmail.trim()) {
      toast.error('Full Name and Email are required.')
      return
    }

    startTransition(async () => {
      const res = await createManagedUser({
        fullName: newFullName,
        email: newEmail,
        role: newRole,
        phone: newPhone,
        prnOrId: newPrnOrId,
        designation: newDesignation,
      })

      if (res.success && res.data) {
        toast.success(`${newRole} account created successfully!`)
        const createdUser: ManagedUser = {
          id: res.data.id,
          auth_user_id: 'pending',
          full_name: newFullName.trim(),
          email: newEmail.toLowerCase().trim(),
          phone: newPhone.trim() || null,
          avatar_url: null,
          role: newRole,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          student_profile: newRole === 'STUDENT' ? { prn: newPrnOrId } : null,
          counselor_profile: newRole === 'MENTOR' ? { employee_id: newPrnOrId, designation: newDesignation } : null,
          dean_profile: newRole === 'ADMIN' ? { employee_id: newPrnOrId, designation: newDesignation } : null,
        }
        setUsers(prev => [createdUser, ...prev])
        setIsAddUserModalOpen(false)
        // Reset form
        setNewFullName('')
        setNewEmail('')
        setNewRole('STUDENT')
        setNewPhone('')
        setNewPrnOrId('')
        setNewDesignation('')
      } else {
        toast.error(res.error || 'Failed to create user')
      }
    })
  }

  // Handle Save Edit User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    startTransition(async () => {
      const res = await updateUserDetails({
        userId: editingUser.id,
        fullName: editFullName,
        email: editEmail,
        phone: editPhone,
        prnOrId: editPrnOrId,
        designation: editDesignation,
      })

      if (res.success) {
        toast.success('User updated successfully!')
        setUsers(prev => prev.map(u => {
          if (u.id !== editingUser.id) return u
          return {
            ...u,
            full_name: editFullName.trim(),
            email: editEmail.trim(),
            phone: editPhone.trim() || null,
            student_profile: u.role === 'STUDENT' ? { ...u.student_profile, prn: editPrnOrId } : u.student_profile,
            counselor_profile: (u.role === 'MENTOR' || u.role === 'COUNSELOR') ? { ...u.counselor_profile, employee_id: editPrnOrId, designation: editDesignation } : u.counselor_profile,
            dean_profile: (u.role === 'ADMIN' || u.role === 'DEAN_HOD') ? { ...u.dean_profile, employee_id: editPrnOrId, designation: editDesignation } : u.dean_profile,
          }
        }))
        setEditingUser(null)
      } else {
        toast.error(res.error || 'Failed to update user')
      }
    })
  }

  // Handle Delete User
  const handleDeleteUser = (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove user "${userName}"?`)) return

    startTransition(async () => {
      const res = await deleteManagedUser(userId)
      if (res.success) {
        toast.success('User deactivated successfully')
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'INACTIVE' } : u))
      } else {
        toast.error(res.error || 'Failed to delete user')
      }
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Institutional Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C2621] flex items-center gap-2">
            User Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Manage Students, Mentors, and Administrators with role assignments, status control, and account profiles.
          </p>
        </div>

        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          className="h-9 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-extrabold text-[#2C2621] mt-0.5">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center border border-[#DFD7CB]">
              <Users className="w-5 h-5 text-[#2C2621]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A36B40] uppercase tracking-wider">Students</p>
              <p className="text-2xl font-extrabold text-[#A36B40] mt-0.5">{stats.students}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F7EFEA] flex items-center justify-center border border-[#A36B40]/30">
              <GraduationCap className="w-5 h-5 text-[#A36B40]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#77734B] uppercase tracking-wider">Mentors</p>
              <p className="text-2xl font-extrabold text-[#77734B] mt-0.5">{stats.mentors}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F1F1EB] flex items-center justify-center border border-[#77734B]/30">
              <Award className="w-5 h-5 text-[#77734B]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Admins</p>
              <p className="text-2xl font-extrabold text-purple-700 mt-0.5">{stats.admins}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF6F0] rounded-xl border border-[#DFD7CB] w-full md:w-auto overflow-x-auto">
            {[
              { key: 'ALL', label: 'All Roles', count: stats.total },
              { key: 'STUDENT', label: 'Students', count: stats.students },
              { key: 'MENTOR', label: 'Mentors', count: stats.mentors },
              { key: 'ADMIN', label: 'Admins', count: stats.admins },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedRoleFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === tab.key
                    ? 'bg-[#A36B40] text-white shadow-xs'
                    : 'text-[#7A7067] hover:text-[#2C2621] hover:bg-[#F1E8DC]'
                }`}
              >
                {tab.label}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7067]" />
              <Input
                placeholder="Search name, email, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#FAF6F0] border-[#DFD7CB] text-xs text-[#2C2621] placeholder:text-[#7A7067] rounded-xl focus:border-[#A36B40]"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="bg-[#FAF6F0] border border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#A36B40] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF6F0] border-b border-[#DFD7CB] text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role Assignment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Identifier / Title</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFD7CB]/60 text-[#2C2621]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7A7067]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#A36B40]" />
                    <p className="font-bold text-[#2C2621]">No users match the criteria.</p>
                    <p className="text-xs text-[#7A7067] mt-0.5">Try adjusting your search query or role filter.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const normalizedRole = getNormalizedRole(user.role)
                  const isCurrentUser = user.id === currentUserId

                  return (
                    <tr key={user.id} className="hover:bg-[#FAF6F0]/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            normalizedRole === 'STUDENT' ? 'bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/30' :
                            normalizedRole === 'MENTOR' ? 'bg-[#F1F1EB] text-[#77734B] border border-[#77734B]/30' :
                            'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-[#2C2621] text-xs flex items-center gap-1.5">
                              {user.full_name || 'Unnamed User'}
                              {isCurrentUser && (
                                <span className="text-[10px] bg-[#FAF6F0] px-1.5 py-0.5 rounded text-[#7A7067] font-mono border border-[#DFD7CB]">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#7A7067]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          disabled={isPending || isCurrentUser}
                          value={normalizedRole}
                          onChange={e => handleRoleChange(user.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all ${
                            normalizedRole === 'STUDENT'
                              ? 'bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30 focus:border-[#A36B40]'
                              : normalizedRole === 'MENTOR'
                              ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 focus:border-[#77734B]'
                              : 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-400'
                          }`}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="MENTOR">Mentor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          disabled={isPending || isCurrentUser}
                          value={user.status}
                          onChange={e => handleStatusChange(user.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer transition-all ${
                            user.status === 'ACTIVE'
                              ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30'
                              : user.status === 'PENDING'
                              ? 'bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="PENDING">Pending</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </td>

                      {/* Identifier Info */}
                      <td className="py-3.5 px-4 text-xs text-[#7A7067]">
                        {user.student_profile?.prn && (
                          <span className="font-mono bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#DFD7CB] text-[#2C2621]">
                            PRN: {user.student_profile.prn}
                          </span>
                        )}
                        {user.counselor_profile?.designation && (
                          <span className="text-[#2C2621] font-medium block">
                            {user.counselor_profile.designation}
                          </span>
                        )}
                        {user.dean_profile?.designation && (
                          <span className="text-[#2C2621] font-medium block">
                            {user.dean_profile.designation}
                          </span>
                        )}
                        {!user.student_profile?.prn && !user.counselor_profile?.designation && !user.dean_profile?.designation && (
                          <span className="text-[#7A7067]">—</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-[#7A7067]">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Redesigned Actions Column */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Approve for Pending */}
                          {user.status === 'PENDING' && (
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              className="h-7 px-2.5 bg-[#77734B] hover:bg-[#625E3D] text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                          )}

                          {/* Edit User Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user)}
                            className="h-7 px-2.5 border-[#DFD7CB] bg-[#FAF6F0] hover:bg-[#F1E8DC] text-[#2C2621] hover:text-[#A36B40] text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            title="Edit User Details"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#A36B40]" />
                            <span>Edit</span>
                          </Button>

                          {/* Status Toggle / Deactivate */}
                          {!isCurrentUser && (
                            user.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                                className="h-7 px-2 border-[#DFD7CB] bg-white hover:bg-rose-50 hover:border-rose-200 text-[#7A7067] hover:text-rose-600 text-xs rounded-lg transition-all cursor-pointer"
                                title="Deactivate user"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                className="h-7 px-2 border-[#77734B]/30 bg-[#F1F1EB] text-[#77734B] hover:bg-[#77734B] hover:text-white text-xs rounded-lg transition-all cursor-pointer"
                                title="Reactivate user"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#2C2621] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#A36B40]" />
                  Edit User Details
                </h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Update profile information, identification code, or designation.
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Full Name *</Label>
                  <Input
                    required
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Email Address *</Label>
                  <Input
                    required
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Phone Number</Label>
                  <Input
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">
                    {editingUser.role === 'STUDENT' ? 'Student PRN' : 'Employee / Staff ID'}
                  </Label>
                  <Input
                    value={editPrnOrId}
                    onChange={e => setEditPrnOrId(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs font-mono rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              {editingUser.role !== 'STUDENT' && (
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Designation / Department</Label>
                  <Input
                    value={editDesignation}
                    onChange={e => setEditDesignation(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDeleteUser(editingUser.id, editingUser.full_name)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Deactivate User
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingUser(null)}
                    className="text-[#7A7067] hover:text-[#2C2621] text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 cursor-pointer"
                  >
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#2C2621] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#A36B40]" />
                  Provision New User
                </h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Create a direct Student, Mentor, or Administrator account.
                </p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selection */}
              <div>
                <Label className="text-xs font-bold text-[#2C2621]">Account Role *</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { role: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'border-[#A36B40] bg-[#F7EFEA] text-[#A36B40]' },
                    { role: 'MENTOR', label: 'Mentor', icon: Award, color: 'border-[#77734B] bg-[#F1F1EB] text-[#77734B]' },
                    { role: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: 'border-purple-500 bg-purple-50 text-purple-700' },
                  ].map(item => {
                    const Icon = item.icon
                    const isSelected = newRole === item.role
                    return (
                      <button
                        type="button"
                        key={item.role}
                        onClick={() => setNewRole(item.role as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? item.color + ' ring-2 ring-offset-1 ring-[#A36B40]'
                            : 'border-[#DFD7CB] bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Full Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Ananya Kulkarni"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Email Address *</Label>
                  <Input
                    required
                    type="email"
                    placeholder="mentor@sandipuniversity.edu.in"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              {/* Phone & ID/PRN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Phone Number (Optional)</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">
                    {newRole === 'STUDENT' ? 'Student PRN / Roll No' : 'Employee ID / Staff Code'}
                  </Label>
                  <Input
                    placeholder={newRole === 'STUDENT' ? 'PRN-2026-8910' : 'EMP-MTR-102'}
                    value={newPrnOrId}
                    onChange={e => setNewPrnOrId(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs font-mono rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              {/* Designation for Mentor/Admin */}
              {newRole !== 'STUDENT' && (
                <div>
                  <Label className="text-xs font-bold text-[#2C2621]">Designation / Department</Label>
                  <Input
                    placeholder={newRole === 'MENTOR' ? 'Assistant Professor & Career Mentor' : 'Assistant Dean / Administrator'}
                    value={newDesignation}
                    onChange={e => setNewDesignation(e.target.value)}
                    className="mt-1 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-[#7A7067] hover:text-[#2C2621] cursor-pointer rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 cursor-pointer"
                >
                  {isPending ? 'Provisioning...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
