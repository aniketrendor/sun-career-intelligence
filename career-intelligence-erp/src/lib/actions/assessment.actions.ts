'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TraitScore, DomainScore } from '@/lib/types'

import {
  processAssessmentResponses,
  runRecommendationEngine,
  generateCareerIntelligenceReport,
  CAREER_DIMENSIONS,
  type StudentAnswer,
  type StudentProfileContext,
  type DimensionScore,
} from '@/lib/engines'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ─── START ASSESSMENT ATTEMPT ────────────────────────────────────────────────

export async function startAssessmentAttempt(versionId?: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') {
    return { success: false, error: 'Only students can take assessments.' }
  }

  // Ensure a valid UUID target version exists in database
  let targetVersionId: string | null = null

  if (versionId && versionId.length >= 32 && versionId.includes('-')) {
    targetVersionId = versionId
  }

  if (!targetVersionId) {
    // 1. Fetch latest version from DB
    const { data: latestVer } = await adminClient
      .from('assessment_versions')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestVer?.id) {
      targetVersionId = latestVer.id
    } else {
      // 2. Auto-create default template and version
      let { data: tmpl } = await adminClient.from('assessment_templates').select('id').limit(1).maybeSingle()
      if (!tmpl) {
        const { data: newTmpl } = await adminClient.from('assessment_templates').insert({
          title: 'Career Alignment Assessment',
          description: 'Official Sandip University psychometric and career intelligence diagnostic',
        }).select().single()
        tmpl = newTmpl
      }
      if (tmpl) {
        const { data: newVer } = await adminClient.from('assessment_versions').insert({
          template_id: tmpl.id,
          version_number: 1,
          status: 'ACTIVE',
          is_resumable: true,
          time_limit_minutes: 45,
        }).select().single()
        if (newVer) targetVersionId = newVer.id
      }
    }
  }

  if (!targetVersionId) {
    return { success: false, error: 'Unable to initialize assessment version record.' }
  }

  // Check for existing attempt
  const { data: existingAttempt } = await adminClient
    .from('assessment_attempts')
    .select('id, status')
    .eq('student_id', profile.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingAttempt) {
    if (existingAttempt.status === 'COMPLETED') {
      return { success: false, error: 'You have already completed this assessment.' }
    }
    if (existingAttempt.status === 'IN_PROGRESS') {
      return { success: true, data: { attempt_id: existingAttempt.id, resumed: true } }
    }
  }

  const { data: attempt, error } = await adminClient
    .from('assessment_attempts')
    .insert({
      student_id: profile.id,
      version_id: targetVersionId,
      status: 'IN_PROGRESS',
    })
    .select()
    .single()

  if (error || !attempt) {
    return { success: false, error: error?.message || 'Failed to start assessment.' }
  }

  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'ASSESSMENT_STARTED',
    entity_type: 'assessment_attempts',
    entity_id: attempt.id,
  })

  return { success: true, data: { attempt_id: attempt.id, resumed: false } }
}

// ─── SAVE RESPONSE ───────────────────────────────────────────────────────────

export async function saveAssessmentResponse(
  attemptId: string,
  questionId: string,
  responseValue: number | null,
  responseText?: string
): Promise<ActionResult> {
  const adminClient = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await adminClient
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return { success: false, error: 'Profile not found.' }

  // Verify attempt belongs to this student and is not locked
  const { data: attempt } = await adminClient
    .from('assessment_attempts')
    .select('id, status, is_locked')
    .eq('id', attemptId)
    .eq('student_id', profile.id)
    .single()

  if (!attempt) return { success: false, error: 'Assessment attempt not found.' }
  if (attempt.is_locked) return { success: false, error: 'This assessment has been submitted and locked.' }
  if (attempt.status === 'COMPLETED') return { success: false, error: 'Assessment is already completed.' }

  const { error } = await adminClient
    .from('assessment_responses')
    .upsert({
      attempt_id: attemptId,
      question_id: questionId,
      response_value: responseValue,
      response_text: responseText,
      responded_at: new Date().toISOString(),
    }, { onConflict: 'attempt_id,question_id' })

  if (error) return { success: false, error: error.message || 'Failed to save response.' }

  // Update last_saved_at
  await adminClient
    .from('assessment_attempts')
    .update({ last_saved_at: new Date().toISOString() })
    .eq('id', attemptId)

  return { success: true }
}

// ─── SUBMIT ASSESSMENT & RUN 3-TIER INTELLIGENCE ENGINES ────────────────────

export async function submitAndScoreAssessment(
  attemptId: string,
  currentResponses?: Record<string, { letter: string; value: number }>
): Promise<ActionResult> {
  const adminClient = await createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await adminClient
    .from('users')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) return { success: false, error: 'Profile not found.' }

  // Verify ownership
  const { data: attempt } = await adminClient
    .from('assessment_attempts')
    .select('id, status, version_id, is_locked')
    .eq('id', attemptId)
    .eq('student_id', profile.id)
    .single()

  if (!attempt) return { success: false, error: 'Attempt not found.' }
  if (attempt.status === 'COMPLETED' && attempt.is_locked) {
    return { success: true }
  }

  // 0. If current client responses are passed, ensure all of them are persisted
  if (currentResponses && Object.keys(currentResponses).length > 0) {
    const responsesToUpsert = Object.entries(currentResponses).map(([qId, val]) => ({
      attempt_id: attemptId,
      question_id: qId,
      response_value: val.value,
      response_text: val.letter,
      responded_at: new Date().toISOString(),
    }))

    await adminClient
      .from('assessment_responses')
      .upsert(responsesToUpsert, { onConflict: 'attempt_id,question_id' })
  }

  // 1. Get all responses for this attempt
  const { data: responses } = await adminClient
    .from('assessment_responses')
    .select('question_id, response_value, response_text')
    .eq('attempt_id', attemptId)

  if (!responses || responses.length === 0) {
    return { success: false, error: 'No responses found for this attempt.' }
  }

  // Lock and mark completed
  await adminClient.from('assessment_attempts').update({
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
    is_locked: true,
  }).eq('id', attemptId)

  // 2. Fetch student profile and determine track (UG vs PG)
  const { data: studentProf } = await adminClient
    .from('student_profiles')
    .select('current_program')
    .eq('user_id', profile.id)
    .maybeSingle()

  const hasPgQuestions = responses.some(r => r.question_id?.startsWith('PG_'))
  const hasUgQuestions = responses.some(r => r.question_id?.startsWith('UG_'))
  const isProfilePG = studentProf?.current_program?.toUpperCase().includes('M.') ||
                      studentProf?.current_program?.toUpperCase().includes('MBA') ||
                      studentProf?.current_program?.toUpperCase().includes('MASTER')
  const detectedTrack: 'UG' | 'PG' = hasPgQuestions ? 'PG' : (hasUgQuestions ? 'UG' : (isProfilePG ? 'PG' : 'UG'))
  const isPG = detectedTrack === 'PG'

  // 4. Fetch all active DB traits
  const { data: dbTraits } = await adminClient
    .from('traits')
    .select('id, name, category')

  // ─── ENGINE 1: Assessment Engine (V3 Multi-Dimension Scoring) ───
  const formattedResponses: StudentAnswer[] = responses.map(r => {
    return {
      question_id: r.question_id,
      rating_value: r.response_value || 3,
      option_id: r.response_text || undefined,
    }
  })

  const studentContext: StudentProfileContext = {
    fullName: profile.full_name || 'Student',
    academicLevel: detectedTrack,
    stream: studentProf?.current_program || undefined,
  }

  const processedAssessment = processAssessmentResponses(formattedResponses, studentContext)

  // Persist trait scores to DB
  if (dbTraits && dbTraits.length > 0) {
    const traitScoresToInsert: Array<{
      attempt_id: string
      student_id: string
      trait_id: string
      raw_score: number
      normalized_score: number
    }> = []

    dbTraits.forEach((trait) => {
      // Find matching score from processed assessment
      const matched = processedAssessment.dimension_scores.find(
        (s: DimensionScore) => s.name.toLowerCase().includes(trait.name.toLowerCase()) || trait.name.toLowerCase().includes(s.name.toLowerCase())
      ) || processedAssessment.dimension_scores[0]

      const scoreVal = matched ? matched.normalized_score : 65

      traitScoresToInsert.push({
        attempt_id: attemptId,
        student_id: profile.id,
        trait_id: trait.id,
        raw_score: matched ? Math.round(matched.raw_score) : 30,
        normalized_score: scoreVal,
      })
    })

    if (traitScoresToInsert.length > 0) {
      await adminClient.from('trait_scores').insert(traitScoresToInsert)
    }
  }

  // ─── ENGINE 2: Domain Scoring ───
  const { data: dbDomains } = await adminClient
    .from('career_domains')
    .select('id, name')

  if (dbDomains && dbDomains.length > 0) {
    const domainScoresToInsert: DomainScore[] = dbDomains.map((dbD, idx) => {
      const matchedDomain = processedAssessment.dimension_scores.find(
        (d: DimensionScore) => d.name.toLowerCase().includes(dbD.name.toLowerCase()) || dbD.name.toLowerCase().includes(d.name.toLowerCase())
      )
      const score = matchedDomain ? matchedDomain.normalized_score : (75 - idx * 5)
      const label =
        score >= 80 ? 'Strong alignment' :
        score >= 65 ? 'Moderate alignment' :
        score >= 50 ? 'Emerging alignment' : 'Explore further'

      return {
        attempt_id: attemptId,
        student_id: profile.id,
        domain_id: dbD.id,
        raw_score: score * 10,
        normalized_score: score,
        alignment_label: label,
        rank: idx + 1,
        calculated_at: new Date().toISOString(),
      } as DomainScore
    })

    if (domainScoresToInsert.length > 0) {
      domainScoresToInsert.sort((a, b) => b.normalized_score - a.normalized_score)
      domainScoresToInsert.forEach((ds, i) => { ds.rank = i + 1 })
      await adminClient.from('domain_scores').insert(domainScoresToInsert)
    }
  }

  // 6. Save or update Career Profile
  const topDomainName = processedAssessment.top_dimensions[0]?.name
  const matchedPrimary = dbDomains?.find(d => d.name.toLowerCase().includes(topDomainName?.toLowerCase() || '') || topDomainName?.toLowerCase().includes(d.name.toLowerCase()))
  const primaryDbDomain = matchedPrimary?.id || dbDomains?.[0]?.id

  const secondDomainName = processedAssessment.top_dimensions[1]?.name
  const matchedSecondary = dbDomains?.find(d => d.name.toLowerCase().includes(secondDomainName?.toLowerCase() || '') || secondDomainName?.toLowerCase().includes(d.name.toLowerCase()))
  const secondaryDbDomain = matchedSecondary?.id || dbDomains?.[1]?.id

  const primaryCourse = processedAssessment.primary_course || processedAssessment.recommended_courses[0]

  await adminClient.from('career_profiles').upsert({
    student_id: profile.id,
    attempt_id: attemptId,
    profile_label: primaryCourse ? `${primaryCourse.course} in ${primaryCourse.specialization}` : 'Career Diagnostic Profile',
    profile_description: primaryCourse?.reasons_for_match?.[0] || 'Career match evaluated across 12 university dimensions.',
    primary_domain_id: primaryDbDomain,
    secondary_domain_id: secondaryDbDomain,
    top_traits: processedAssessment.top_dimensions.map((t: DimensionScore) => t.name),
    generated_at: new Date().toISOString(),
  }, { onConflict: 'student_id' })

  // 7. Auto-generate skill gaps for top role in primary domain
  await generateSkillGaps(profile.id, attemptId, primaryDbDomain, adminClient)

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'ASSESSMENT_COMPLETED',
    entity_type: 'assessment_attempts',
    entity_id: attemptId,
  })

  // Notify counselors
  const { data: counselors } = await adminClient
    .from('users').select('id').eq('role', 'COUNSELOR').eq('status', 'ACTIVE')
  if (counselors) {
    const { data: studentUser } = await adminClient.from('users').select('full_name').eq('id', profile.id).single()
    await adminClient.from('notifications').insert(
      counselors.map(c => ({
        user_id: c.id,
        type: 'ASSESSMENT_COMPLETION' as const,
        title: 'Assessment Completed',
        message: `${studentUser?.full_name} has completed their career assessment.`,
        metadata: { student_id: profile.id, attempt_id: attemptId }
      }))
    )
  }

  revalidatePath('/student/assessment')
  revalidatePath('/student/career-profile')
  return { success: true }
}

function generateProfileLabel(topTraitIds: string[], primaryDomainName: string): string {
  // Simple label generation based on domain
  const labels: Record<string, string[]> = {
    'Data Analytics': ['Analytical Business Problem Solver', 'Data-Driven Strategist', 'Insight Discovery Specialist'],
    'Finance': ['Quantitative Financial Analyst', 'Strategic Finance Professional', 'Value-Focused Analyst'],
    'Marketing': ['Creative Brand Builder', 'Consumer Psychology Expert', 'Strategic Marketing Thinker'],
    'Strategy & Consulting': ['Strategic Business Advisor', 'Complex Problem Solver', 'Business Transformation Specialist'],
    'Human Resources': ['People-Centric Talent Developer', 'Organizational Culture Builder', 'Human Capital Strategist'],
    'Technology': ['Technology Solutions Architect', 'Digital Innovation Driver', 'Systems Thinking Engineer'],
    'Product Management': ['User-Centric Product Thinker', 'Strategic Product Leader', 'Innovation Catalyst'],
    'Operations': ['Process Excellence Specialist', 'Operational Efficiency Driver', 'Systems Optimizer'],
    'Entrepreneurship': ['Opportunity-Driven Innovator', 'Entrepreneurial Problem Solver', 'Venture Builder'],
  }

  const domainLabels = labels[primaryDomainName]
  if (domainLabels) {
    return domainLabels[Math.floor(Math.random() * domainLabels.length)]
  }
  return 'Business Intelligence Professional'
}

async function generateSkillGaps(
  studentId: string,
  attemptId: string,
  primaryDomainId: string | undefined,
  adminClient: Awaited<ReturnType<typeof createAdminClient>>
) {
  if (!primaryDomainId) return

  // Get top role in primary domain
  const { data: roles } = await adminClient
    .from('career_roles')
    .select('id')
    .eq('domain_id', primaryDomainId)
    .eq('is_active', true)
    .limit(1)

  if (!roles || roles.length === 0) return

  const roleId = roles[0].id

  // Get role skills
  const { data: roleSkills } = await adminClient
    .from('role_skills')
    .select('skill_id, required_level')
    .eq('role_id', roleId)

  if (!roleSkills || roleSkills.length === 0) return

  // Get student's current skill levels
  const { data: studentSkills } = await adminClient
    .from('student_skills')
    .select('skill_id, current_level')
    .eq('student_id', studentId)

  const studentSkillMap = new Map(studentSkills?.map(s => [s.skill_id, s.current_level]) || [])

  const gapInserts = roleSkills.map(rs => ({
    student_id: studentId,
    attempt_id: attemptId,
    role_id: roleId,
    skill_id: rs.skill_id,
    current_level: studentSkillMap.get(rs.skill_id) || 0,
    target_level: rs.required_level,
  }))

  if (gapInserts.length > 0) {
    await adminClient.from('skill_gap_results').upsert(gapInserts, {
      onConflict: 'student_id,role_id,skill_id'
    })
  }

  // Generate learning roadmap
  const { data: existingRoadmap } = await adminClient
    .from('learning_roadmaps')
    .select('id')
    .eq('student_id', studentId)
    .eq('role_id', roleId)
    .single()

  if (!existingRoadmap) {
    const { data: role } = await adminClient.from('career_roles').select('name').eq('id', roleId).single()
    const { data: roadmap } = await adminClient.from('learning_roadmaps').insert({
      student_id: studentId,
      role_id: roleId,
      attempt_id: attemptId,
      title: `Roadmap to ${role?.name}`,
    }).select().single()

    if (roadmap) {
      // Create phased roadmap items for gaps
      const gaps = gapInserts.filter(g => g.target_level > g.current_level)
      const items = gaps.map((gap, idx) => ({
        roadmap_id: roadmap.id,
        skill_id: gap.skill_id,
        title: `Develop skill to Level ${gap.target_level}`,
        phase: Math.floor(idx / 2) + 1,
        priority: idx + 1,
        estimated_days: (gap.target_level - gap.current_level) * 14,
        status: 'NOT_STARTED' as const,
      }))
      if (items.length > 0) {
        await adminClient.from('roadmap_items').insert(items)
      }
    }
  }
}

// ─── GET ASSESSMENT DATA ─────────────────────────────────────────────────────

export async function getActiveAssessmentVersion() {
  const adminClient = await createAdminClient()

  // 1. Simple select on assessment_versions
  let { data: version } = await adminClient
    .from('assessment_versions')
    .select('id, template_id, version_number, status, is_resumable, time_limit_minutes')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!version) {
    // 2. Fetch or create a template
    let { data: tmpl } = await adminClient
      .from('assessment_templates')
      .select('id, title, description')
      .limit(1)
      .maybeSingle()

    if (!tmpl) {
      const { data: createdTmpl } = await adminClient
        .from('assessment_templates')
        .insert({
          title: 'Career Alignment Assessment',
          description: 'Official Sandip University psychometric and career intelligence diagnostic',
        })
        .select()
        .maybeSingle()
      tmpl = createdTmpl
    }

    if (tmpl) {
      const { data: createdVer } = await adminClient
        .from('assessment_versions')
        .insert({
          template_id: tmpl.id,
          version_number: 1,
          status: 'ACTIVE',
          is_resumable: true,
          time_limit_minutes: 45,
        })
        .select()
        .maybeSingle()
      version = createdVer
    }
  }

  // Safe fallback to database UUID
  const fallbackVersionId = '20000000-0000-0000-0000-000000000001'
  const finalVersion = version || {
    id: fallbackVersionId,
    version_number: 1,
    status: 'ACTIVE',
    is_resumable: true,
    time_limit_minutes: 45,
  }

  return {
    id: finalVersion.id,
    version_number: finalVersion.version_number || 1,
    status: finalVersion.status || 'ACTIVE',
    is_resumable: true,
    time_limit_minutes: 45,
    template: {
      title: 'Career Alignment Assessment',
      description: 'Official Sandip University psychometric and career intelligence diagnostic',
    },
    sections: [],
  } as any
}

export async function getStudentAssessmentResults(studentId?: string) {
  const supabase = await createClient()
  
  let userId = studentId
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase.from('users').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return null
    userId = profile.id
  }

  const [attempt, traitScores, domainScores, careerProfile, skillGaps, roadmap] = await Promise.all([
    supabase.from('assessment_attempts').select('*').eq('student_id', userId).eq('status', 'COMPLETED').order('completed_at', { ascending: false }).limit(1).single(),
    supabase.from('trait_scores').select('*, trait:traits(name, description, category)').eq('student_id', userId).order('normalized_score', { ascending: false }),
    supabase.from('domain_scores').select('*, domain:career_domains(name, description, icon)').eq('student_id', userId).order('rank'),
    supabase.from('career_profiles').select('*, primary_domain:career_domains!primary_domain_id(name, description), secondary_domain:career_domains!secondary_domain_id(name, description)').eq('student_id', userId).single(),
    supabase.from('skill_gap_results').select('*, skill:skills(name, category), role:career_roles(name, domain:career_domains(name))').eq('student_id', userId),
    supabase.from('learning_roadmaps').select('*, role:career_roles(name), items:roadmap_items(*, skill:skills(name))').eq('student_id', userId).eq('is_active', true).single(),
  ])

  return {
    attempt: attempt.data,
    traitScores: traitScores.data || [],
    domainScores: domainScores.data || [],
    careerProfile: careerProfile.data,
    skillGaps: skillGaps.data || [],
    roadmap: roadmap.data,
  }
}
