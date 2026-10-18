import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EvaluationsClient, AdviseeEvaluationData } from './evaluations-client'

export const dynamic = 'force-dynamic'

export default async function MentorEvaluationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    redirect('/login')
  }

  // 1. Fetch mentor's assigned advisees
  const { data: assignments } = await supabase
    .from('student_counselor_assignments')
    .select(`
      id,
      assigned_at,
      notes,
      student:users!student_id(
        id,
        full_name,
        email,
        student_profile:student_profiles(
          prn,
          current_program,
          current_semester,
          school
        )
      )
    `)
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  const adviseesList = (assignments || []).map((a: any) => ({
    assignment: {
      id: a.id,
      assigned_at: a.assigned_at,
      notes: a.notes
    },
    student: a.student
  })).filter(a => Boolean(a.student))

  const adviseeIds = adviseesList.map(a => a.student.id)

  let attemptsMap: Record<string, any> = {}
  let careerProfilesMap: Record<string, any> = {}
  let domainScoresMap: Record<string, any[]> = {}
  let traitScoresMap: Record<string, any[]> = {}

  if (adviseeIds.length > 0) {
    const [
      { data: attempts },
      { data: careerProfiles },
      { data: domainScores },
      { data: traitScores }
    ] = await Promise.all([
      supabase
        .from('assessment_attempts')
        .select('id, student_id, status, completed_at')
        .in('student_id', adviseeIds)
        .order('completed_at', { ascending: false }),
      supabase
        .from('career_profiles')
        .select(`
          id,
          student_id,
          profile_label,
          profile_description,
          primary_domain:career_domains!primary_domain_id(name),
          secondary_domain:career_domains!secondary_domain_id(name)
        `)
        .in('student_id', adviseeIds),
      supabase
        .from('domain_scores')
        .select(`
          student_id,
          raw_score,
          normalized_score,
          alignment_label,
          rank,
          domain:career_domains!domain_id(name)
        `)
        .in('student_id', adviseeIds)
        .order('rank', { ascending: true }),
      supabase
        .from('trait_scores')
        .select(`
          student_id,
          normalized_score,
          trait:traits!trait_id(name, category)
        `)
        .in('student_id', adviseeIds)
        .order('normalized_score', { ascending: false })
    ])

    attempts?.forEach((att: any) => {
      if (!attemptsMap[att.student_id]) {
        attemptsMap[att.student_id] = att
      }
    })

    careerProfiles?.forEach((cp: any) => {
      careerProfilesMap[cp.student_id] = cp
    })

    domainScores?.forEach((ds: any) => {
      if (!domainScoresMap[ds.student_id]) domainScoresMap[ds.student_id] = []
      domainScoresMap[ds.student_id].push({
        name: ds.domain?.name || 'Specialization',
        score: Math.round(Number(ds.normalized_score) || 0),
        rank: ds.rank || 1,
        alignment: ds.alignment_label || 'High Resonance'
      })
    })

    traitScores?.forEach((ts: any) => {
      if (!traitScoresMap[ts.student_id]) traitScoresMap[ts.student_id] = []
      traitScoresMap[ts.student_id].push({
        name: ts.trait?.name || 'Cognitive Trait',
        category: ts.trait?.category || 'COGNITIVE',
        score: Math.round(Number(ts.normalized_score) || 0)
      })
    })
  }

  // Combine into structured evaluation records
  const evaluations: AdviseeEvaluationData[] = adviseesList.map(a => {
    const studentId = a.student.id
    const attempt = attemptsMap[studentId] || null
    const careerProfile = careerProfilesMap[studentId] || null
    const topDomains = domainScoresMap[studentId] || []
    const topTraits = traitScoresMap[studentId] || []

    return {
      student: a.student,
      assignment: a.assignment,
      attempt: attempt ? {
        id: attempt.id,
        status: attempt.status,
        completed_at: attempt.completed_at
      } : null,
      careerProfile: careerProfile ? {
        profile_label: careerProfile.profile_label,
        profile_description: careerProfile.profile_description,
        primary_domain: careerProfile.primary_domain,
        secondary_domain: careerProfile.secondary_domain,
      } : null,
      topDomains,
      topTraits: topTraits.slice(0, 6)
    }
  })

  return (
    <div className="max-w-7xl mx-auto py-2">
      <EvaluationsClient evaluations={evaluations} />
    </div>
  )
}
