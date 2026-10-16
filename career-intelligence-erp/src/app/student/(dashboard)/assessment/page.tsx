import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TwoStageAssessmentView } from '@/components/student/assessment/two-stage-assessment-view'

export const dynamic = 'force-dynamic'

export default async function StudentAssessmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('current_program, institution, school, academic_year, education_level, status')
    .eq('user_id', profile.id)
    .maybeSingle()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('program:programs(name, code)')
    .eq('student_id', profile.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const currentProg = studentProfile?.current_program || (enrollment?.program as any)?.name || ''
  const isPG = (studentProfile?.education_level || '').toLowerCase().includes('postgraduate') ||
               currentProg.toUpperCase().includes('M.') ||
               currentProg.toUpperCase().includes('MBA') ||
               currentProg.toUpperCase().includes('MASTER')

  const initialPreviousField = studentProfile?.school || ''
  const initialHighestQual = isPG ? "Bachelor's degree" : "Class 12"

  async function saveAttemptAction(attemptData: any) {
    'use server'
    const sb = await createClient()
    const { data: { user: authUser } } = await sb.auth.getUser()
    if (!authUser) return

    const { data: userRec } = await sb
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!userRec) return

    try {
      // Upsert into student assessment attempts
      await sb.from('assessment_attempts').insert({
        student_id: userRec.id,
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        time_spent_seconds: 1200
      })
    } catch (e) {
      console.warn('Could not save attempt in Supabase table:', e)
    }
  }

  return (
    <TwoStageAssessmentView
      initialStudentName={profile.full_name || ''}
      initialPathway={isPG ? 'PG' : 'UG'}
      initialProgram={currentProg}
      initialPreviousField={initialPreviousField}
      initialHighestQualification={initialHighestQual}
      onSaveAttempt={saveAttemptAction}
    />
  )
}
