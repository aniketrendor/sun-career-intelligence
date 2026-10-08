import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare, User, Calendar, Clock, CheckCircle2,
  AlertCircle, ArrowRight, ShieldCheck, Mail, Phone, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StudentCounselorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Concurrently fetch assigned counselor and counseling session history
  const [
    { data: assignment },
    { data: sessions }
  ] = await Promise.all([
    supabase
      .from('student_counselor_assignments')
      .select(`
        id,
        assigned_at,
        status,
        notes,
        counselor:users!counselor_id(
          id,
          full_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    supabase
      .from('counseling_sessions')
      .select(`
        id,
        session_date,
        discussion_summary,
        identified_concerns,
        recommended_actions,
        follow_up_date,
        status,
        created_at,
        counselor:users!counselor_id(full_name)
      `)
      .eq('student_id', profile.id)
      .order('session_date', { ascending: false })
  ])

  const counselorUser = (assignment as any)?.counselor
  const sessionList = sessions || []

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-[#A36B40]" /> Institutional Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Counseling & Mentorship</h1>
        <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
          Connect with your assigned career advisor, review guidance notes, and track follow-up action items.
        </p>
      </div>

      {/* Counselor Profile Card */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
        <div className="h-3 w-full bg-[#A36B40]" />
        <CardContent className="p-6 md:p-8">
          {counselorUser ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-xl border border-[#DFD7CB] shadow-xs">
                  {counselorUser.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'CA'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#2C2621]">{counselorUser.full_name}</h2>
                    <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs rounded-full px-2.5 py-0.5 font-bold">
                      Assigned Advisor
                    </Badge>
                  </div>
                  <p className="text-xs text-[#7A7067]">Institutional Career & Placement Counselor</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A7067] pt-1">
                    {counselorUser.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> {counselorUser.email}
                      </span>
                    )}
                    {counselorUser.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#A36B40]" /> {counselorUser.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex gap-3">
                <a href={`mailto:${counselorUser.email || ''}`}>
                  <Button className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl h-10 px-5 shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold">
                    <Mail className="w-4 h-4" /> Request Meeting
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-[#FAF6F0] text-[#7A7067] rounded-2xl flex items-center justify-center mx-auto border border-[#DFD7CB]">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#2C2621]">No Counselor Assigned Yet</h3>
              <p className="text-xs text-[#7A7067] max-w-md mx-auto">
                Your institution will assign a dedicated counselor after you complete your initial career assessment and program enrollment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counseling Sessions & Guidance Logs */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-[#2C2621]">Advisory Sessions & Action Plans</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Official notes and recommended development items from your counseling sessions
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-3 py-1">
              {sessionList.length} Sessions Logged
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sessionList.length === 0 ? (
            <div className="text-center py-10 text-[#7A7067] space-y-2">
              <BookOpen className="w-8 h-8 text-[#DFD7CB] mx-auto" />
              <p className="text-sm font-semibold text-[#2C2621]">No counseling sessions recorded yet.</p>
              <p className="text-xs text-[#7A7067]">
                Notes from meetings with your counselor will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionList.map((session: any) => {
                const statusBadge = {
                  OPEN: 'bg-[#A36B40]/15 text-[#A36B40] border-[#A36B40]/30',
                  FOLLOW_UP: 'bg-[#C6A18D]/20 text-[#A36B40] border-[#C6A18D]/30',
                  RESOLVED: 'bg-[#77734B]/15 text-[#77734B] border-[#77734B]/30',
                }[session.status as string] || 'bg-[#FAF6F0] text-[#7A7067]'

                return (
                  <div
                    key={session.id}
                    className="p-5 rounded-2xl border border-[#DFD7CB] hover:border-[#A36B40] transition-all space-y-3 bg-[#FAF6F0]/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-[#2C2621] flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#A36B40]" />
                          Session on {formatDate(session.session_date)}
                        </span>
                        <span className="text-xs text-[#7A7067]">
                          with {(session.counselor as any)?.full_name || 'Counselor'}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs uppercase font-bold rounded-full px-2.5 py-0.5 ${statusBadge}`}>
                        {session.status}
                      </Badge>
                    </div>

                    {session.discussion_summary && (
                      <div className="text-xs text-[#2C2621] bg-white p-3.5 rounded-xl border border-[#DFD7CB]">
                        <span className="font-bold block text-[#2C2621] mb-1">Discussion Summary:</span>
                        <p className="leading-relaxed text-[#7A7067]">{session.discussion_summary}</p>
                      </div>
                    )}

                    {session.recommended_actions && (
                      <div className="text-xs text-[#2C2621] bg-[#77734B]/10 p-3.5 rounded-xl border border-[#77734B]/30">
                        <span className="font-bold block text-[#77734B] mb-1">Recommended Action Items:</span>
                        <p className="leading-relaxed">{session.recommended_actions}</p>
                      </div>
                    )}

                    {session.follow_up_date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#A36B40] pt-1 font-bold">
                        <Clock className="w-3.5 h-3.5" /> Next Follow-up Scheduled: {formatDate(session.follow_up_date)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
