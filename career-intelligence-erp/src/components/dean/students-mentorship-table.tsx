'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  GraduationCap, ShieldCheck, Search, Mail, Phone, Calendar,
  UserCheck, Clock, CheckCircle2, UserX, AlertCircle, X,
  Building2, ArrowRight, Award, Sparkles, Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { assignStudentToCounselor } from '@/lib/actions/dean.actions'

interface MentorUser {
  id: string
  full_name: string
  email: string
  phone?: string | null
  counselor_profiles?: {
    designation?: string | null
    employee_id?: string | null
  } | null
}

interface StudentRecord {
  id: string
  full_name: string
  email: string
  phone?: string | null
  status: string
  created_at: string
  student_profiles?: {
    prn?: string | null
    current_program?: string | null
    current_semester?: number | null
  } | null
  enrollments?: Array<{
    id: string
    status: string
    program?: { id: string; name: string; code: string } | null
    class?: { id: string; name: string; semester: number } | null
  }> | null
  assignments?: Array<{
    id: string
    status: string
    assigned_at: string
    notes?: string | null
    counselor?: {
      id: string
      full_name: string
      email: string
      phone?: string | null
      counselor_profiles?: {
        designation?: string | null
        employee_id?: string | null
      } | null
    } | null
  }> | null
}

interface StudentsMentorshipTableProps {
  students: StudentRecord[]
  mentors: MentorUser[]
  programs: Array<{ id: string; name: string; code: string }>
}

type MentorshipFilter = 'ALL' | 'ASSIGNED' | 'UNASSIGNED'

export function StudentsMentorshipTable({
  students,
  mentors,
  programs,
}: StudentsMentorshipTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MentorshipFilter>('ALL')
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL')

  // Modal state for manual admin mentor assignment
  const [assigningStudent, setAssigningStudent] = useState<StudentRecord | null>(null)
  const [selectedMentorId, setSelectedMentorId] = useState<string>('')
  const [assignmentNotes, setAssignmentNotes] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  // Calculate student counts
  const totalStudents = students.length
  const assignedCount = students.filter(
    (s) => s.assignments && s.assignments.some((a) => a.status === 'ACTIVE' && a.counselor)
  ).length
  const unassignedCount = totalStudents - assignedCount

  // Filter students based on search, status filter, and program
  const filteredStudents = students.filter((s) => {
    // 1. Search Query (Name, PRN, Email)
    const q = searchQuery.toLowerCase().trim()
    const prn = s.student_profiles?.prn?.toLowerCase() || ''
    const name = s.full_name?.toLowerCase() || ''
    const email = s.email?.toLowerCase() || ''

    if (q && !name.includes(q) && !prn.includes(q) && !email.includes(q)) {
      return false
    }

    // 2. Mentorship Status
    const isAssigned = s.assignments && s.assignments.some((a) => a.status === 'ACTIVE' && a.counselor)
    if (statusFilter === 'ASSIGNED' && !isAssigned) return false
    if (statusFilter === 'UNASSIGNED' && isAssigned) return false

    // 3. Program
    if (selectedProgram !== 'ALL') {
      const studentProg =
        s.enrollments?.[0]?.program?.name || s.student_profiles?.current_program || ''
      if (!studentProg.toLowerCase().includes(selectedProgram.toLowerCase())) {
        return false
      }
    }

    return true
  })

  const openAssignModal = (student: StudentRecord) => {
    const activeAssign = student.assignments?.find((a) => a.status === 'ACTIVE' && a.counselor)
    setAssigningStudent(student)
    setSelectedMentorId(activeAssign?.counselor?.id || mentors[0]?.id || '')
    setAssignmentNotes(activeAssign?.notes || '')
  }

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningStudent || !selectedMentorId) {
      toast.error('Please select a faculty mentor.')
      return
    }

    startTransition(async () => {
      const res = await assignStudentToCounselor(
        assigningStudent.id,
        selectedMentorId,
        assignmentNotes || 'Admin allocation'
      )
      if (res.success) {
        toast.success(`Assigned mentor to ${assigningStudent.full_name}!`)
        setAssigningStudent(null)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to assign mentor.')
      }
    })
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'ALL'
                  ? 'bg-[#2C2621] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              All Students ({totalStudents})
            </button>

            <button
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'ASSIGNED'
                  ? 'bg-[#77734B] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Mentor Assigned ({assignedCount})
            </button>

            <button
              onClick={() => setStatusFilter('UNASSIGNED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'UNASSIGNED'
                  ? 'bg-[#A36B40] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Selection ({unassignedCount})
            </button>
          </div>

          {/* Program Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7A7067] shrink-0 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Program:
            </span>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="h-9 px-3 bg-[#FAF6F0] border border-[#DFD7CB] rounded-xl text-xs font-semibold text-[#2C2621] focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
            >
              <option value="ALL">All Degree Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, PRN roll number, or institutional email..."
            className="pl-10 h-11 bg-[#FAF6F0] border-[#DFD7CB] text-xs font-medium text-[#2C2621] rounded-2xl focus-visible:ring-[#A36B40] placeholder:text-[#8C8276]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7067] hover:text-[#2C2621] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Roster Directory List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#DFD7CB] rounded-3xl space-y-3">
          <GraduationCap className="w-12 h-12 mx-auto text-[#A36B40]/40" />
          <div className="space-y-1">
            <h3 className="font-bold text-[#2C2621] text-base">No students found</h3>
            <p className="text-xs text-[#7A7067]">
              {searchQuery
                ? `No student matching "${searchQuery}". Try clearing filters.`
                : 'No students match the selected filter category.'}
            </p>
          </div>
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery('')}
              size="sm"
              variant="outline"
              className="text-xs rounded-xl border-[#DFD7CB] text-[#7A7067]"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredStudents.map((student) => {
            const activeAssignment =
              student.assignments?.find((a) => a.status === 'ACTIVE' && a.counselor) ||
              student.assignments?.[0]
            const mentor = activeAssignment?.counselor
            const isAssigned = !!mentor

            const programName =
              student.enrollments?.[0]?.program?.name ||
              student.student_profiles?.current_program ||
              'General Academic Cohort'

            const semester =
              student.enrollments?.[0]?.class?.semester ||
              student.student_profiles?.current_semester

            const prn = student.student_profiles?.prn

            const initials =
              student.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'ST'

            return (
              <div
                key={student.id}
                className="bg-white border border-[#DFD7CB] hover:border-[#A36B40]/50 rounded-3xl p-5 sm:p-6 shadow-xs transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 relative overflow-hidden"
              >
                {/* 1. Student Identity Column */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] font-black text-base flex items-center justify-center shrink-0 shadow-2xs">
                    {initials}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-[#2C2621] text-base tracking-tight truncate">
                        {student.full_name}
                      </h3>

                      {prn ? (
                        <span className="font-mono text-[11px] font-bold text-[#A36B40] bg-[#F7EFEA] px-2 py-0.5 rounded-md border border-[#A36B40]/30">
                          PRN: {prn}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8C8276] bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                          PRN Pending
                        </span>
                      )}

                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        {student.status}
                      </Badge>
                    </div>

                    <div className="text-xs font-semibold text-[#7A7067] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[#2C2621] font-bold">{programName}</span>
                      {semester && (
                        <span className="text-[#77734B] bg-[#F1F1EB] px-2 py-0.5 rounded-md text-[11px] font-bold">
                          Semester {semester}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7A7067] pt-1">
                      {student.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> {student.email}
                        </span>
                      )}
                      {student.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#77734B]" /> {student.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-[#8C8276]">
                        <Calendar className="w-3.5 h-3.5" /> Enrolled {formatDate(student.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Assigned Faculty Mentor Card */}
                <div className="xl:w-96 shrink-0">
                  {isAssigned ? (
                    <div className="p-4 rounded-2xl bg-[#F1F1EB]/70 border border-[#77734B]/30 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EBECE1] border border-[#77734B]/40 text-[#77734B] flex items-center justify-center font-bold text-xs shrink-0">
                            <ShieldCheck className="w-5 h-5 text-[#77734B]" />
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#77734B] block">
                              Assigned Faculty Mentor
                            </span>
                            <h4 className="font-extrabold text-[#2C2621] text-sm">
                              {mentor.full_name}
                            </h4>
                          </div>
                        </div>

                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                          Active Caseload
                        </Badge>
                      </div>

                      <div className="text-[11px] text-[#7A7067] space-y-0.5 border-t border-[#DFD7CB]/60 pt-2">
                        <p className="font-medium text-[#2C2621]">
                          {mentor.counselor_profiles?.designation || 'Career & Admissions Mentor'}
                        </p>
                        <p className="flex items-center gap-1 text-[#7A7067]">
                          <Mail className="w-3 h-3 text-[#A36B40]" /> {mentor.email}
                        </p>
                        {activeAssignment?.assigned_at && (
                          <p className="text-[10px] text-[#8C8276]">
                            Assigned on {formatDate(activeAssignment.assigned_at)}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModal(student)}
                          className="h-8 px-3 text-xs font-semibold rounded-xl border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#FAF6F0] cursor-pointer"
                        >
                          Change Mentor
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-dashed border-[#DFD7CB] flex flex-col justify-between gap-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-[#2C2621]">
                              Pending Mentor Selection
                            </h4>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          </div>
                          <p className="text-[11px] text-[#7A7067] leading-tight mt-0.5">
                            Student chooses a mentor based on faculty expertise through available slots in the student portal.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#DFD7CB]/60">
                        <span className="text-[10px] text-[#8C8276]">
                          Admin override available
                        </span>
                        <Button
                          size="sm"
                          onClick={() => openAssignModal(student)}
                          className="h-8 px-3 text-xs font-bold rounded-xl bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-xs gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Assign Mentor
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Manual Admin Mentor Assignment Modal */}
      {assigningStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/30 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#2C2621] text-base">
                    Assign Faculty Mentor
                  </h3>
                  <p className="text-xs text-[#7A7067]">
                    Student: <strong className="text-[#2C2621]">{assigningStudent.full_name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningStudent(null)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="p-6 space-y-4">
              <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#DFD7CB] text-xs space-y-1">
                <span className="text-[#8C8276] text-[10px] uppercase font-bold tracking-wider block">
                  Student Degree & Academic Program
                </span>
                <p className="font-bold text-[#2C2621]">
                  {assigningStudent.enrollments?.[0]?.program?.name ||
                    assigningStudent.student_profiles?.current_program ||
                    'General Program'}
                </p>
                {assigningStudent.student_profiles?.prn && (
                  <p className="text-[#7A7067] font-mono text-[11px]">
                    PRN: {assigningStudent.student_profiles.prn}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Select Faculty Mentor *
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] font-semibold shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.counselor_profiles?.designation || 'Faculty Mentor'}) · {m.email}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#7A7067]">
                  Mentor will guide the student throughout their academic and career development roadmap.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Advisory Caseload Notes (Optional)
                </label>
                <Input
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="e.g. Assigned by Dean for AI Specialization Guidance"
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAssigningStudent(null)}
                  className="border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="gap-1.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-xl shadow-md shadow-[#A36B40]/25 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  {isPending ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
