/**
 * Multi-Level Scoring & Recommendation Engine (V3)
 * Sandip University Career Intelligence System (SU-CIS-2026-27-v1)
 *
 * Implements:
 * - Multi-select anti-inflation normalization (1 / sqrt(k))
 * - 12-Dimension Psychological & Vocational Signal Accumulation
 * - Course & Specialization Matching against 114 Accredited Programs
 * - Independent Academic Eligibility Verification
 * - Transparent match explanations and missing information caveats
 */

import {
  getAllDimensions,
  getAllCourses,
  getQuestionById,
  getProductionGuardrails,
  getAssessmentMetadata,
} from './data-access'
import { evaluateCourseEligibility } from './eligibility-engine'
import type {
  StudentAnswer,
  StudentProfileContext,
  AssessmentResultV3,
  DimensionScore,
  CourseRecommendation,
  AssessmentLevel,
} from '@/lib/types/assessment-v3.types'

export function processAssessmentResponses(
  answers: StudentAnswer[],
  profile: StudentProfileContext
): AssessmentResultV3 {
  const allDimensions = getAllDimensions()
  const allCourses = getAllCourses()
  const guardrails = getProductionGuardrails()
  const meta = getAssessmentMetadata()

  // 1. Accumulate raw dimension scores
  const rawDimensionMap: Record<string, { raw: number; count: number }> = {}
  allDimensions.forEach((d) => {
    rawDimensionMap[d.dimension_id] = { raw: 0, count: 0 }
  })

  // Track answers by level
  const levelProgress: Record<AssessmentLevel, { total: number; answered: number }> = {
    L1: { total: 10, answered: 0 },
    L2: { total: 8, answered: 0 },
    L3: { total: 8, answered: 0 },
    L4: { total: 8, answered: 0 },
    L5: { total: 6, answered: 0 },
  }

  // Track specialization preferences from L4 / L3
  const specializationPreferences: string[] = []

  answers.forEach((ans) => {
    const q = getQuestionById(ans.question_id)
    if (!q) return

    if (levelProgress[q.level]) {
      levelProgress[q.level].answered += 1
    }

    // A. Rating Scale (1-5 Likert)
    if (q.question_type === 'rating_scale' || typeof ans.rating_value === 'number') {
      const rating = ans.rating_value ?? 3
      const dimId = q.dimension_id
      if (dimId && rawDimensionMap[dimId]) {
        // Likert 1 to 5 maps to (rating - 1) * 2.5 (0 to 10 points)
        const score = (rating - 1) * 2.5
        rawDimensionMap[dimId].raw += score
        rawDimensionMap[dimId].count += 1
      }
      return
    }

    // B. Multi-Select and Single-Select Options
    const selectedOptionIds = ans.option_ids || (ans.option_id ? [ans.option_id] : [])
    if (selectedOptionIds.length === 0) return

    // Anti-inflation normalization factor: 1 / sqrt(k)
    const k = selectedOptionIds.length
    const normFactor = k > 1 ? 1 / Math.sqrt(k) : 1.0

    selectedOptionIds.forEach((optId) => {
      const opt = q.options.find((o) => o.option_id === optId)
      if (!opt) return

      if (opt.mapping_or_feedback && q.level === 'L4') {
        specializationPreferences.push(opt.option_label)
      }

      const targetDim = opt.dimension_id || q.dimension_id
      if (targetDim && rawDimensionMap[targetDim]) {
        const baseScore = opt.score_value || 5
        rawDimensionMap[targetDim].raw += baseScore * normFactor
        rawDimensionMap[targetDim].count += 1
      }
    })
  })

  // 2. Normalize 12 Dimension Scores to 0-100 scale
  let maxRaw = 0
  Object.values(rawDimensionMap).forEach((v) => {
    if (v.raw > maxRaw) maxRaw = v.raw
  })

  const dimensionScores: DimensionScore[] = allDimensions.map((d) => {
    const data = rawDimensionMap[d.dimension_id] || { raw: 0, count: 0 }
    let normalized = 0
    if (maxRaw > 0 && data.raw > 0) {
      normalized = Math.min(98, Math.max(25, Math.round((data.raw / maxRaw) * 100)))
    }

    const confidence: 'HIGH' | 'MODERATE' | 'EXPLORATORY' = 
      data.count >= 3 ? 'HIGH' : data.count >= 1 ? 'MODERATE' : 'EXPLORATORY'

    return {
      dimension_id: d.dimension_id,
      name: d.name,
      definition: d.definition,
      raw_score: Math.round(data.raw * 10) / 10,
      normalized_score: normalized,
      confidence_level: confidence,
      signals_count: data.count,
    }
  })

  // Sort dimensions by score
  dimensionScores.sort((a, b) => b.normalized_score - a.normalized_score)
  const topDimensions = maxRaw > 0 ? dimensionScores.filter(d => d.signals_count > 0).slice(0, 4) : []

  const topDimensionScoreMap = new Map<string, number>()
  dimensionScores.forEach((d) => topDimensionScoreMap.set(d.dimension_id, d.normalized_score))

  // 3. Match Courses from Sandip University Master Catalog
  const targetLevel = profile.academicLevel || 'UG'
  const candidateCourses = allCourses.filter((c) => c.level === targetLevel)

  const recommendedCourses: CourseRecommendation[] = maxRaw === 0 ? [] : candidateCourses.map((course) => {
    // A. Compute Domain Match Score
    const courseDims = course.domain_ids || []
    let totalDimScore = 0
    let matchedDimsCount = 0
    const matchedDimensions: { dimension_id: string; name: string; score: number }[] = []

    courseDims.forEach((dimId) => {
      const dimScore = topDimensionScoreMap.get(dimId) || 50
      const dimDef = allDimensions.find((d) => d.dimension_id === dimId)
      totalDimScore += dimScore
      matchedDimsCount += 1
      matchedDimensions.push({
        dimension_id: dimId,
        name: dimDef?.name || dimId,
        score: dimScore,
      })
    })

    const averageDimScore = matchedDimsCount > 0 ? totalDimScore / matchedDimsCount : 50
    const finalMatchScore = Math.min(98, Math.max(35, Math.round(averageDimScore)))

    // B. Match Tier
    let matchTier: 'EXCELLENT_FIT' | 'STRONG_FIT' | 'MODERATE_FIT' | 'EXPLORATORY' = 'MODERATE_FIT'
    if (finalMatchScore >= 85) matchTier = 'EXCELLENT_FIT'
    else if (finalMatchScore >= 72) matchTier = 'STRONG_FIT'
    else if (finalMatchScore >= 55) matchTier = 'MODERATE_FIT'
    else matchTier = 'EXPLORATORY'

    // C. Evaluate Independent Academic Eligibility
    const eligibility = evaluateCourseEligibility(course, profile)

    // D. Generate Transparent Explanations
    const reasons: string[] = []
    if (matchedDimensions.length > 0) {
      const topMatched = [...matchedDimensions].sort((a, b) => b.score - a.score)[0]
      reasons.push(`Strong alignment with your high aptitude in ${topMatched.name} (${topMatched.score}% score).`)
    }
    if (course.career_domains) {
      reasons.push(`Direct career pathways into ${course.career_domains}.`)
    }
    if (eligibility.is_prerequisite_met) {
      reasons.push(eligibility.reason)
    }

    // E. Suggested Next Steps
    const nextSteps: string[] = [
      `Review detailed syllabus and curriculum for ${course.course} ${course.specialization}.`,
      `Consult Sandip University faculty advisor for specialization tracks.`,
      `Submit 12th standard mark sheet / academic credentials for official eligibility clearance.`,
    ]

    return {
      program_id: course.program_id,
      school: course.school,
      course: course.course,
      specialization: course.specialization,
      level: course.level,
      match_score: finalMatchScore,
      match_tier: matchTier,
      matched_dimensions: matchedDimensions,
      reasons_for_match: reasons,
      suggested_specializations: [course.specialization],
      eligibility: {
        status: eligibility.status,
        reason: eligibility.reason,
        required_stream: eligibility.required_stream,
        is_prerequisite_met: eligibility.is_prerequisite_met,
      },
      missing_information: eligibility.status === 'CONDITIONAL_REVIEW' 
        ? ['Pending official verification of 12th board subject mark sheet.'] 
        : undefined,
      suggested_next_steps: nextSteps,
    }
  })

  // Sort: Verified Eligible first, then by match score
  recommendedCourses.sort((a, b) => {
    if (a.eligibility.status === 'VERIFIED_ELIGIBLE' && b.eligibility.status !== 'VERIFIED_ELIGIBLE') return -1
    if (b.eligibility.status === 'VERIFIED_ELIGIBLE' && a.eligibility.status !== 'VERIFIED_ELIGIBLE') return 1
    return b.match_score - a.match_score
  })

  const primaryCourse = recommendedCourses[0] || null
  const alternativeCourses = recommendedCourses.slice(1, 6)

  const totalAnswered = answers.length

  return {
    schema_version: meta.schema_version,
    assessment_version: meta.assessment_version,
    completed_at: new Date().toISOString(),
    profile,
    dimension_scores: dimensionScores,
    top_dimensions: topDimensions,
    recommended_courses: recommendedCourses,
    primary_course: primaryCourse,
    alternative_courses: alternativeCourses,
    level_progress: levelProgress,
    guardrails_notice: guardrails,
    validation_audit: {
      total_questions: 40,
      total_answered: totalAnswered,
      is_complete: totalAnswered >= 30,
      has_unverified_data_warnings: recommendedCourses.some((c) => c.eligibility.status === 'CONDITIONAL_REVIEW'),
    },
  }
}

export const CAREER_DIMENSIONS = getAllDimensions()

export function runRecommendationEngine(
  traitScores?: any,
  qualityMetrics?: any,
  context?: { level?: string; previousDegree?: string }
) {
  const level = (context?.level === 'PG' ? 'PG' : 'UG') as 'UG' | 'PG'
  const mockAnswers: StudentAnswer[] = []
  const result = processAssessmentResponses(mockAnswers, { academicLevel: level })
  
  return {
    domainScores: result.dimension_scores.map((d) => ({
      name: d.name,
      code: d.dimension_id,
      compatibilityScore: d.normalized_score,
      alignmentLabel: d.normalized_score >= 80 ? 'Strong Alignment' : 'Moderate Alignment',
    })),
    topCareers: result.recommended_courses.map((c) => ({
      title: `${c.course} in ${c.specialization}`,
      matchScore: c.match_score,
      category: c.school,
      level: c.level,
    })),
  }
}

export function generateCareerIntelligenceReport(
  processedAssessment?: any,
  recommendationOutput?: any,
  candidateProfile?: any
) {
  return {
    id: `RPT-${Date.now()}`,
    candidateName: candidateProfile?.fullName || 'Student',
    domainScores: recommendationOutput?.domainScores || [],
    topCareers: recommendationOutput?.topCareers || [],
  }
}

