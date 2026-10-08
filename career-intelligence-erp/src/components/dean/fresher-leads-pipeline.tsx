'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Sparkles, UserCheck, ShieldCheck, Phone, Mail, Award,
  Calendar, CheckCircle2, ArrowRight, X, User
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { assignMentorToFresherLead } from '@/lib/actions/key.actions'

interface FresherLeadsPipelineProps {
  leads: any[]
  mentors: Array<{ id: string; full_name: string; email: string }>
}

export function FresherLeadsPipeline({ leads, mentors }: FresherLeadsPipelineProps) {
  const router = useRouter()
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [selectedMentorId, setSelectedMentorId] = useState(mentors[0]?.id || '')
  const [isPending, startTransition] = useTransition()

  const handleAssignMentor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead || !selectedMentorId) return

    startTransition(async () => {
      const res = await assignMentorToFresherLead(selectedLead.id, selectedMentorId)
      if (res.success) {
        toast.success(`Mentor assigned to ${selectedLead.candidate_name}! Notification sent.`)
        setSelectedLead(null)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to assign mentor.')
      }
    })
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-[#7A7067] bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB] space-y-2">
        <Sparkles className="w-8 h-8 mx-auto text-[#C6A18D]" />
        <p className="font-bold text-[#2C2621] text-sm">No Fresher Assessment Leads Yet</p>
        <p className="text-xs text-[#7A7067] max-w-md mx-auto">
          When candidates take the diagnostic test using a Fresher Referral Key, their test scores, fit % and contact details will appear here for mentor allocation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="divide-y divide-[#DFD7CB] bg-white border border-[#DFD7CB] rounded-2xl overflow-hidden shadow-xs">
        {leads.map((lead) => {
          const hasMentor = !!lead.assigned_mentor_id

          return (
            <div
              key={lead.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF6F0]/50 transition-colors"
            >
              {/* Left Info: Candidate, Top Domain, Key Used */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F9F4F0] border border-[#C6A18D]/40 text-[#C6A18D] flex items-center justify-center font-bold text-xs">
                    {lead.candidate_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'CD'}
                  </div>
                  <h4 className="font-bold text-[#2C2621] text-sm">{lead.candidate_name}</h4>
                  <Badge variant="outline" className="font-mono text-[10px] text-[#A36B40] bg-[#FAF6F0] border-[#A36B40]/30">
                    {lead.referral_code}
                  </Badge>
                  <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-[10px]">
                    Fit Score: {lead.fit_score}%
                  </Badge>
                </div>

                <div className="text-xs text-[#7A7067] flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Top Match: <strong className="text-[#2C2621]">{lead.top_domain}</strong></span>
                  {lead.highest_qualification && (
                    <span className="inline-flex items-center gap-1 font-medium text-[#77734B] bg-[#F1F1EB] px-2 py-0.5 rounded-md">
                      🎓 {lead.highest_qualification}
                    </span>
                  )}
                  {lead.last_attempted_college && (
                    <span className="inline-flex items-center gap-1 font-medium text-[#2C2621]">
                      🏫 {lead.last_attempted_college}
                    </span>
                  )}
                  {lead.candidate_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#8C8276]" /> {lead.candidate_email}
                    </span>
                  )}
                  {lead.candidate_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#8C8276]" /> {lead.candidate_phone}
                    </span>
                  )}
                  <span className="text-[11px] text-[#8C8276]">
                    Tested {formatDate(lead.created_at)}
                  </span>
                </div>
              </div>

              {/* Right Action: Assigned Mentor status & Assign button */}
              <div className="flex items-center gap-3 shrink-0">
                {hasMentor ? (
                  <div className="flex items-center gap-2 bg-[#F1F1EB] px-3 py-1.5 rounded-xl border border-[#77734B]/30">
                    <UserCheck className="w-4 h-4 text-[#77734B]" />
                    <div className="text-left">
                      <span className="block text-[10px] text-[#77734B] font-bold uppercase">Mentor Assigned</span>
                      <span className="text-xs font-bold text-[#2C2621]">
                        {lead.mentor?.full_name || 'Assigned Mentor'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead)
                      setSelectedMentorId(mentors[0]?.id || '')
                    }}
                    className="h-8 px-3.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign Mentor
                  </Button>
                )}

                {hasMentor && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLead(lead)
                      setSelectedMentorId(lead.assigned_mentor_id || mentors[0]?.id || '')
                    }}
                    className="h-8 px-2.5 text-xs text-[#7A7067] hover:text-[#2C2621] border-[#DFD7CB] rounded-xl cursor-pointer"
                  >
                    Reassign
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Assign Mentor Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0]">
              <div>
                <h3 className="font-extrabold text-[#2C2621] text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#A36B40]" />
                  Assign Career Mentor to Fresher Lead
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Allocate {selectedLead.candidate_name} to a mentor for admissions counseling
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignMentor} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-[#7A7067]">Candidate</span>
                  <span className="text-[#2C2621]">{selectedLead.candidate_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7067]">Aptitude Fit</span>
                  <span className="text-[#77734B] font-bold">{selectedLead.fit_score}% ({selectedLead.top_domain})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7067]">Referral Code</span>
                  <span className="font-mono text-[#A36B40] font-bold">{selectedLead.referral_code}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Select Career Mentor *
                </label>
                {mentors.length === 0 ? (
                  <p className="text-xs text-rose-600">No active mentors available. Please register mentors first.</p>
                ) : (
                  <select
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-[#DFD7CB] bg-white px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                  >
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLead(null)}
                  className="border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || mentors.length === 0}
                  className="gap-1.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 cursor-pointer"
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
