import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentDomainSuggestionsView } from '@/components/student/student-domain-suggestions-view'

export const dynamic = 'force-dynamic'

export default async function StudentDomainSuggestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')

  // Fetch student profile, career profile & domain scores
  const [
    { data: studentProfile },
    { data: careerProfile },
    { data: domainScores },
    { data: completedAttempts }
  ] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('current_program, education_level, school, institution')
      .eq('user_id', profile.id)
      .maybeSingle(),
    supabase
      .from('career_profiles')
      .select('*, primary_domain:career_domains!primary_domain_id(name), secondary_domain:career_domains!secondary_domain_id(name)')
      .eq('student_id', profile.id)
      .maybeSingle(),
    supabase
      .from('domain_scores')
      .select('domain:career_domains(name), normalized_score')
      .eq('student_id', profile.id)
      .order('rank', { ascending: true })
      .limit(5),
    supabase
      .from('assessment_attempts')
      .select('id')
      .eq('student_id', profile.id)
      .eq('status', 'COMPLETED')
  ])

  // Extract top domains
  const topDomains: string[] = []
  if (careerProfile?.primary_domain?.name) {
    topDomains.push(careerProfile.primary_domain.name)
  }
  if (careerProfile?.secondary_domain?.name) {
    topDomains.push(careerProfile.secondary_domain.name)
  }
  if (domainScores && domainScores.length > 0) {
    domainScores.forEach((ds: any) => {
      const dName = Array.isArray(ds.domain) ? ds.domain[0]?.name : ds.domain?.name
      if (dName && !topDomains.includes(dName)) {
        topDomains.push(dName)
      }
    })
  }

  const defaultTrack = (studentProfile?.current_program?.toUpperCase().includes('M.') ||
                        studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                        studentProfile?.current_program?.toUpperCase().includes('MASTER') ||
                        studentProfile?.education_level?.includes('PG')) ? 'PG' : 'UG'

  const hasCompletedTest = (completedAttempts?.length || 0) > 0 || !!careerProfile

  return (
    <StudentDomainSuggestionsView
      studentName={profile.full_name || 'Student'}
      studentLevel={defaultTrack}
      topDomains={topDomains}
      studentProgram={studentProfile?.current_program || ''}
      hasCompletedTest={hasCompletedTest}
    />
  )
}
