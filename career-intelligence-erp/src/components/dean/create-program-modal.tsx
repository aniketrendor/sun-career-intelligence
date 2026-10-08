'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Save, Building2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createProgram } from '@/lib/actions/counselor.actions'

interface CreateProgramModalProps {
  institutionId?: string
}

export function CreateProgramModal({ institutionId }: CreateProgramModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (institutionId) {
      fd.append('institution_id', institutionId)
    } else {
      // Default institution fallback UUID
      fd.append('institution_id', 'a0000000-0000-0000-0000-000000000001')
    }

    startTransition(async () => {
      const res = await createProgram({ success: false }, fd)
      if (res.success) {
        toast.success('Program created successfully!')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to create program.')
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
          <Plus className="w-4 h-4" /> Create New Program
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#2C2621] text-base">Create Academic Program</h3>
                <p className="text-xs text-[#7A7067]">Add a degree or certificate program</p>
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
                  Program Name *
                </label>
                <Input
                  name="name"
                  required
                  placeholder="e.g. B.Tech Computer Science (AI & ML)"
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Program Code *
                  </label>
                  <Input
                    name="code"
                    required
                    placeholder="BTECH-CSAI"
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
                    Duration (Years) *
                  </label>
                  <Input
                    type="number"
                    name="duration_years"
                    required
                    defaultValue={4}
                    min={1}
                    max={6}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Total Semesters *
                  </label>
                  <Input
                    type="number"
                    name="total_semesters"
                    required
                    defaultValue={8}
                    min={1}
                    max={12}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Description
                </label>
                <Textarea
                  name="description"
                  placeholder="Program objectives, curriculum overview..."
                  rows={2}
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
                  {isPending ? 'Creating...' : 'Create Program'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
