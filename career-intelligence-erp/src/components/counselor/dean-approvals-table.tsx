'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  CheckCircle2, XCircle, ShieldCheck, Clock, Building,
  Mail, Phone, AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { approveDeanHod, rejectDeanHod } from '@/lib/actions/counselor.actions'

interface DeanApprovalsTableProps {
  pendingUsers: any[]
}

export function DeanApprovalsTable({ pendingUsers }: DeanApprovalsTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = (userId: string) => {
    setProcessingId(userId)
    startTransition(async () => {
      const res = await approveDeanHod(userId)
      if (res.success) {
        toast.success('Dean/HOD account approved successfully!')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to approve account.')
      }
      setProcessingId(null)
    })
  }

  const handleReject = (userId: string) => {
    const reason = prompt('Please enter the reason for rejection:')
    if (!reason) return

    setProcessingId(userId)
    startTransition(async () => {
      const res = await rejectDeanHod(userId, reason)
      if (res.success) {
        toast.success('Dean/HOD request rejected.')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to reject account.')
      }
      setProcessingId(null)
    })
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">All Clear!</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          There are no pending Dean or HOD approval requests awaiting review at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => {
        const profile = user.dean_hod_profile || {}
        const isCurrentProcessing = processingId === user.id && isPending

        return (
          <Card key={user.id} className="border-slate-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base border border-amber-200 shrink-0">
                  {user.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'DH'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{user.full_name}</h4>
                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                      Pending Approval
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {profile.designation || 'Academic Leadership'} · {profile.department_name || profile.school || 'Department'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> Registered {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(user.id)}
                  disabled={isCurrentProcessing}
                  className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(user.id)}
                  disabled={isCurrentProcessing}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCurrentProcessing ? 'Approving...' : 'Approve & Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
