'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Save, GraduationCap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClass } from '@/lib/actions/counselor.actions'

interface CreateClassModalProps {
  programs: Array<{ id: string; name: string; code: string; academic_year: string }>
}

export function CreateClassModal({ programs }: CreateClassModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await createClass({ success: false }, fd)
      if (res.success) {
        toast.success('Class created successfully!')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to create class.')
      }
    })
  }

  return (
    <div>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-9 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Class / Cohort
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#2C2621] text-base">Add New Class / Cohort</h3>
                <p className="text-xs text-[#7A7067]">Create a class section under an existing program</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1 rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Select Program *
                </label>
                <select
                  name="program_id"
                  required
                  className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) - {p.academic_year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Class Name *
                </label>
                <Input
                  name="name"
                  required
                  placeholder="e.g. BTECH-CSAI Sem 1 Div A"
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Class Code *
                  </label>
                  <Input
                    name="code"
                    required
                    placeholder="CSAI1A"
                    className="uppercase bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs font-mono rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Academic Year *
                  </label>
                  <Input
                    name="academic_year"
                    required
                    defaultValue="2026-27"
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Semester *
                  </label>
                  <Input
                    type="number"
                    name="semester"
                    required
                    defaultValue={1}
                    min={1}
                    max={12}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Student Capacity *
                  </label>
                  <Input
                    type="number"
                    name="student_capacity"
                    required
                    defaultValue={60}
                    min={1}
                    max={500}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Faculty Coordinator / Class Incharge
                </label>
                <Input
                  name="faculty_coordinator"
                  placeholder="Prof. Rajesh Sharma"
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] rounded-xl text-xs"
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
                  {isPending ? 'Saving...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
