'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserCheck, Users, Save, X, Sparkles, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assignStudentToCounselor, bulkAssignClassToCounselor } from '@/lib/actions/dean.actions'

interface AssignCounselorModalProps {
  students?: Array<{ id: string; name: string; email: string; programName?: string }>
  classes?: Array<{ id: string; name: string; code: string; studentCount?: number }>
  counselors: Array<{ id: string; name: string; email: string; activeCaseload?: number }>
  defaultStudentId?: string
  defaultClassId?: string
}

export function AssignCounselorModal({
  students = [],
  classes = [],
  counselors,
  defaultStudentId,
  defaultClassId,
}: AssignCounselorModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'individual' | 'batch'>(defaultClassId ? 'batch' : 'individual')
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || students[0]?.id || '')
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId || classes[0]?.id || '')
  const [selectedCounselorId, setSelectedCounselorId] = useState(counselors[0]?.id || '')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCounselorId) {
      toast.error('Please select a career mentor.')
      return
    }

    startTransition(async () => {
      if (mode === 'individual') {
        if (!selectedStudentId) {
          toast.error('Please select a student.')
          return
        }
        const res = await assignStudentToCounselor(selectedStudentId, selectedCounselorId, notes)
        if (res.success) {
          toast.success('Student assigned to mentor successfully!')
          setIsOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to assign mentor.')
        }
      } else {
        if (!selectedClassId) {
          toast.error('Please select a class.')
          return
        }
        const res = await bulkAssignClassToCounselor(selectedClassId, selectedCounselorId)
        if (res.success) {
          toast.success(`Batch assigned ${(res.data as any)?.count || 'all'} students to mentor!`)
          setIsOpen(false)
          router.refresh()
        } else {
          toast.error(res.error || 'Failed to bulk assign class.')
        }
      }
    })
  }

  return (
    <div>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-9 px-4 bg-[#77734B] hover:bg-[#625E3D] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#77734B]/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5" /> Allocate Mentors
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#2C2621] text-base">Assign Career Mentor</h3>
                <p className="text-xs text-[#7A7067]">Allocate mentorship caseloads as Dean / Admin</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1 rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="p-6 space-y-4">
              {/* Mode Switcher */}
              <div className="bg-[#FAF6F0] border border-[#DFD7CB] p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('individual')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'individual'
                      ? 'bg-[#A36B40] text-white shadow-xs'
                      : 'text-[#7A7067] hover:text-[#2C2621]'
                  }`}
                >
                  Individual Student
                </button>
                <button
                  type="button"
                  onClick={() => setMode('batch')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'batch'
                      ? 'bg-[#A36B40] text-white shadow-xs'
                      : 'text-[#7A7067] hover:text-[#2C2621]'
                  }`}
                >
                  Entire Class Cohort
                </button>
              </div>

              {/* Target Selection */}
              {mode === 'individual' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email}) {s.programName ? `· ${s.programName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Select Class / Cohort *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    required
                    className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) {c.studentCount !== undefined ? `· ${c.studentCount} Students` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Counselor Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Assign To Career Mentor *
                </label>
                <select
                  value={selectedCounselorId}
                  onChange={(e) => setSelectedCounselorId(e.target.value)}
                  required
                  className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                >
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) {c.activeCaseload !== undefined ? `· ${c.activeCaseload} Active Students` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="gap-1.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isPending ? 'Assigning...' : 'Confirm Allocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
