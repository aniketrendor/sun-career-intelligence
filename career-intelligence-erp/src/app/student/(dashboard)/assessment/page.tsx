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
    .select('current_program, institution, school, academic_year, education_level, status, stream_department')
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
               (studentProfile?.education_level || '').toLowerCase().includes('pg') ||
               currentProg.toUpperCase().includes('M.') ||
               currentProg.toUpperCase().includes('MBA') ||
               currentProg.toUpperCase().includes('MCA') ||
               currentProg.toUpperCase().includes('MASTER') ||
               currentProg.toUpperCase().includes('PHD')

  // Auto-detect student's academic background / stream from their school, department, and program
  const schoolStr = `${studentProfile?.school || ''} ${studentProfile?.stream_department || ''}`.toLowerCase()
  const progStr = currentProg.toLowerCase()
  let detectedStream: 'PCM' | 'PCB' | 'PCMB' | 'COM' | 'ARTS' | 'ALL' = 'ALL'
  let detectedField = studentProfile?.school || ''

  if (schoolStr.includes('commerce') || schoolStr.includes('management') || schoolStr.includes('business') ||
      progStr.includes('bba') || progStr.includes('mba') || progStr.includes('com') || progStr.includes('finance')) {
    detectedStream = 'COM'
    if (!detectedField) detectedField = 'Business / Management'
  } else if (schoolStr.includes('pharm') || schoolStr.includes('health') || progStr.includes('pharm')) {
    detectedStream = 'PCB'
    if (!detectedField) detectedField = 'Pharmacy / Health'
  } else if (schoolStr.includes('law') || progStr.includes('llb') || progStr.includes('llm') || progStr.includes('law')) {
    detectedStream = 'ARTS'
    if (!detectedField) detectedField = 'Law'
  } else if (schoolStr.includes('design') || progStr.includes('b.des') || progStr.includes('fashion') || progStr.includes('interior')) {
    detectedStream = 'ARTS'
    if (!detectedField) detectedField = 'Design / Media'
  } else if (schoolStr.includes('science') || progStr.includes('b.sc') || progStr.includes('m.sc')) {
    detectedStream = schoolStr.includes('bio') || schoolStr.includes('micro') ? 'PCB' : 'PCM'
    if (!detectedField) detectedField = 'Science'
  } else if (schoolStr.includes('engineering') || schoolStr.includes('tech') || progStr.includes('b.tech') || progStr.includes('m.tech') || progStr.includes('computer')) {
    detectedStream = 'PCM'
    if (!detectedField) detectedField = 'Engineering & Technology'
  }

  const initialPreviousField = detectedField || (isPG ? 'General / Multi-Disciplinary' : '')
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
      initialStream={detectedStream}
      initialProgram={currentProg}
      initialPreviousField={initialPreviousField}
      initialHighestQualification={initialHighestQual}
      onSaveAttempt={saveAttemptAction}
    />
  )
}
