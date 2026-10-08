'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  MessageSquare, Plus, Save, Calendar, Clock,
  CheckCircle2, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createCounselingSession } from '@/lib/actions/counselor.actions'

interface CounselingSessionModalProps {
  studentId: string
  studentName: string
}

export function CounselingSessionModal({
  studentId,
  studentName,
}: CounselingSessionModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.append('student_id', studentId)

    startTransition(async () => {
      const res = await createCounselingSession({ success: false }, fd)
      if (res.success) {
        toast.success('Counseling session logged successfully!')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to record session.')
      }
    })
  }

  return (
    <div>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-8 px-3 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-xs shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Log Advisory Session
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#2C2621] text-base">New Mentoring & Advising Session</h3>
                <p className="text-xs text-[#7A7067]">Student: {studentName}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1 rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Session Date *
                  </label>
                  <Input
                    type="date"
                    name="session_date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Follow-up Date
                  </label>
                  <Input
                    type="date"
                    name="follow_up_date"
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Discussion Summary *
                </label>
                <Textarea
                  name="discussion_summary"
                  placeholder="Key topics discussed, student career aspirations, concerns raised..."
                  rows={3}
                  required
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Recommended Action Items
                </label>
                <Textarea
                  name="recommended_actions"
                  placeholder="Next steps, certifications to complete, resume updates, mock interviews..."
                  rows={2}
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Status
                </label>
                <select
                  name="status"
                  className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                  defaultValue="OPEN"
                >
                  <option value="OPEN">Open (Requires Action)</option>
                  <option value="FOLLOW_UP">Follow-up Scheduled</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
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
                  {isPending ? 'Saving...' : 'Save Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
