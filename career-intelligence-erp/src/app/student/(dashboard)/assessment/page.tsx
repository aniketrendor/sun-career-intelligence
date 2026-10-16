import { createClient, createAdminClient } from '@/lib/supabase/server'
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
      .select('id, full_name, email')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!userRec) return

    const admin = await createAdminClient()

    try {
      // 1. Ensure or retrieve active assessment version
      const { data: version } = await admin
        .from('assessment_versions')
        .select('id')
        .limit(1)
        .maybeSingle()
      const versionId = version?.id || '20000000-0000-0000-0000-000000000001'

      // 2. Insert or update assessment_attempts
      const { data: attemptRecord, error: attemptErr } = await admin
        .from('assessment_attempts')
        .upsert({
          student_id: userRec.id,
          version_id: versionId,
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          last_saved_at: new Date().toISOString(),
          time_spent_seconds: 1200,
          is_locked: true,
        }, { onConflict: 'student_id,version_id' })
        .select('id')
        .single()

      if (attemptErr) {
        console.error('Error recording attempt:', attemptErr)
      }

      const attemptId = attemptRecord?.id

      // 3. Resolve top domains into career_domains table
      const { data: dbDomains } = await admin
        .from('career_domains')
        .select('id, name')

      const domainMap = new Map<string, string>()
      if (dbDomains) {
        for (const d of dbDomains) {
          domainMap.set(d.name.toLowerCase().trim(), d.id)
        }
      }

      const topDomains: Array<{ id: string; name: string; score: number }> = attemptData.topDomains || []
      const primaryDomainName = topDomains[0]?.name || ''
      const secondaryDomainName = topDomains[1]?.name || ''

      const primaryDomainId = primaryDomainName ? domainMap.get(primaryDomainName.toLowerCase().trim()) : null
      const secondaryDomainId = secondaryDomainName ? domainMap.get(secondaryDomainName.toLowerCase().trim()) : null

      const profileLabel = primaryDomainName
        ? `${primaryDomainName} Specialist${secondaryDomainName ? ` & ${secondaryDomainName} Strategist` : ''}`
        : 'Interdisciplinary Career Strategist'

      const profileDescription = `High aptitude and cognitive-behavioral resonance with ${primaryDomainName || 'emerging industry domains'}${secondaryDomainName ? `, combined with strong capabilities in ${secondaryDomainName}` : ''}.`

      // 4. Upsert into career_profiles
      const { error: cpErr } = await admin
        .from('career_profiles')
        .upsert({
          student_id: userRec.id,
          attempt_id: attemptId || null,
          profile_label: profileLabel,
          profile_description: profileDescription,
          primary_domain_id: primaryDomainId || null,
          secondary_domain_id: secondaryDomainId || null,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id' })

      if (cpErr) {
        console.error('Error upserting career_profile:', cpErr)
      }

      // 5. Upsert domain scores (top 5 to 10)
      if (attemptId && topDomains.length > 0) {
        const scoresToInsert: any[] = []
        topDomains.slice(0, 10).forEach((td, idx) => {
          const dId = domainMap.get(td.name.toLowerCase().trim())
          if (dId) {
            const normScore = Math.min(100, Math.max(0, Math.round(Number(td.score || 0))))
            scoresToInsert.push({
              attempt_id: attemptId,
              student_id: userRec.id,
              domain_id: dId,
              raw_score: td.score || normScore,
              normalized_score: normScore,
              alignment_label: normScore >= 75 ? 'Strong alignment' : normScore >= 50 ? 'Moderate alignment' : 'Developing interest',
              rank: idx + 1,
              calculated_at: new Date().toISOString()
            })
          }
        })

        if (scoresToInsert.length > 0) {
          const { error: dsErr } = await admin
            .from('domain_scores')
            .upsert(scoresToInsert, { onConflict: 'attempt_id,domain_id' })

          if (dsErr) {
            console.error('Error upserting domain_scores:', dsErr)
          }
        }
      }

      // 6. Update student_profiles interests and career_goals
      await admin
        .from('student_profiles')
        .update({
          interests: topDomains.slice(0, 5).map(d => d.name),
          career_goals: `Specialization pathway in ${primaryDomainName || 'Chosen Domain'}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userRec.id)

      console.log('Successfully saved full career assessment attempt & profiles for student:', userRec.id)
    } catch (e) {
      console.error('Unexpected error saving assessment attempt:', e)
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
