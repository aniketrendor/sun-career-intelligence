import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Student360Client } from './student-360-client'

export const dynamic = 'force-dynamic'

export default async function Student360Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    redirect('/login')
  }

  // Fetch student user & profile
  const { data: student } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      phone,
      created_at,
      student_profile:student_profiles(
        prn,
        current_program,
        current_semester,
        academic_year,
        school
      ),
      enrollments:enrollments(
        academic_year,
        status,
        program:programs(name, code, academic_year),
        class:classes(name, semester)
      )
    `)
    .eq('id', studentId)
    .single()

  if (!student) notFound()

  // Concurrently fetch assignment notes, assessment attempts, scores, and counseling sessions
  const [
    { data: assignment },
    { data: attempts },
    { data: traitScores },
    { data: domainScores },
    { data: careerProfile },
    { data: sessions },
  ] = await Promise.all([
    supabase
      .from('student_counselor_assignments')
      .select('notes, assigned_at')
      .eq('student_id', studentId)
      .eq('counselor_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    supabase
      .from('assessment_attempts')
      .select('id, status, completed_at')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false }),
    supabase
      .from('trait_scores')
      .select('id, normalized_score, trait:traits(name, category)')
      .eq('student_id', studentId)
      .order('normalized_score', { ascending: false }),
    supabase
      .from('domain_scores')
      .select('id, rank, normalized_score, raw_score, alignment_label, domain:career_domains(name, description)')
      .eq('student_id', studentId)
      .order('rank', { ascending: true }),
    supabase
      .from('career_profiles')
      .select(`
        id,
        profile_label,
        profile_description,
        primary_domain:career_domains!primary_domain_id(name),
        secondary_domain:career_domains!secondary_domain_id(name)
      `)
      .eq('student_id', studentId)
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
        counselor:users!counselor_id(full_name)
      `)
      .eq('student_id', studentId)
      .order('session_date', { ascending: false }),
  ])

  const completedAttempt = attempts?.find((a: any) => a.status === 'COMPLETED') || null

  const studentProfileData = Array.isArray(student.student_profile)
    ? student.student_profile[0]
    : student.student_profile

  const formattedSessions = (sessions || []).map((s: any) => ({
    ...s,
    counselor: Array.isArray(s.counselor) ? s.counselor[0] : s.counselor
  }))

  const formattedDomainScores = (domainScores || []).map((d: any) => ({
    ...d,
    domain: Array.isArray(d.domain) ? d.domain[0] : d.domain
  }))

  const formattedTraitScores = (traitScores || []).map((t: any) => ({
    ...t,
    trait: Array.isArray(t.trait) ? t.trait[0] : t.trait
  }))

  const formattedEnrollments = (student.enrollments || []).map((e: any) => ({
    ...e,
    program: Array.isArray(e.program) ? e.program[0] : e.program,
    class: Array.isArray(e.class) ? e.class[0] : e.class
  }))

  const formattedCareerProfile = careerProfile ? {
    ...careerProfile,
    primary_domain: Array.isArray((careerProfile as any).primary_domain)
      ? (careerProfile as any).primary_domain[0]
      : (careerProfile as any).primary_domain,
    secondary_domain: Array.isArray((careerProfile as any).secondary_domain)
      ? (careerProfile as any).secondary_domain[0]
      : (careerProfile as any).secondary_domain
  } : null

  return (
    <div className="py-2">
      <Student360Client
        student={{
          ...student,
          student_profile: studentProfileData,
          enrollments: formattedEnrollments
        }}
        assignmentNotes={assignment?.notes || null}
        completedAttempt={completedAttempt}
        domainScores={formattedDomainScores}
        traitScores={formattedTraitScores}
        careerProfile={formattedCareerProfile}
        sessions={formattedSessions}
      />
    </div>
  )
}
