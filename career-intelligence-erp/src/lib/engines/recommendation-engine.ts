/**
 * Recommendation Engine (Engine 2 of 3)
 * Maps Trait Scores -> Domain Compatibility -> Course Compatibility -> Specializations.
 * Evaluates Eligibility, Multi-Signal Confidence, and Recommendation Gap.
 */

import {
  DOMAIN_PROFILES,
  COURSE_COMPATIBILITY_MATRIX,
  type CourseCompatibilityDef,
} from './career-matrix'
import type { TraitScoreResult, AssessmentQualityMetrics } from './assessment-engine'
import {
  calculateStage1Suitability,
  type CourseSuitabilityResult,
  COURSE_FAMILY_MATRIX,
} from './stage1-bank-data'

export interface DomainScoreResult {
  id: string
  code: string
  name: string
  description: string
  compatibilityScore: number // 0 - 100
  rank: number
  alignmentLabel: string
}

export interface SpecializationMatch {
  id: string
  code: string
  name: string
  description: string
  compatibilityScore: number
}

export interface CourseCompatibilityResult {
  courseId: string
  courseCode: string
  courseName: string
  level: 'UG' | 'PG'
  domainCode: string
  rawScore: number
  compatibilityScore: number // 0 - 100
  rank: number
  eligibilityStatus: 'ELIGIBLE' | 'CONDITIONAL' | 'INELIGIBLE'
  eligibilityNotes: string
  specializationMatches: SpecializationMatch[]
}

export interface RecommendationConfidence {
  overallScore: number // 0 - 100
  label: 'HIGH' | 'MODERATE' | 'EXPLORATORY'
  consistencyComponent: number
  signalStrengthComponent: number
  qualityComponent: number
  completenessComponent: number
  recommendationGap: number // Delta between 1st and 2nd rank
  certaintyLevel: 'HIGH_CERTAINTY' | 'MODERATE_CERTAINTY' | 'MULTI_PATHWAY'
}

export interface FinalRecommendationOutput {
  domainScores: DomainScoreResult[]
  primaryDomain: DomainScoreResult
  secondaryDomain: DomainScoreResult
  tertiaryDomain: DomainScoreResult
  courseFamilySuitability?: CourseSuitabilityResult[]
  courseRankings: CourseCompatibilityResult[]
  primaryPathway: CourseCompatibilityResult
  alternativePathways: CourseCompatibilityResult[]
  confidence: RecommendationConfidence
}

export interface StudentAcademicBackground {
  level?: 'UG' | 'PG'
  stream?: string // e.g. 'Science (PCM)', 'Commerce', 'Arts'
  qualifyingGradePercent?: number
  previousDegree?: string // For PG e.g. 'B.Sc Statistics'
}

/**
 * Executes the complete Recommendation Pipeline
 */
export function runRecommendationEngine(
  traitScores: Record<string, TraitScoreResult>,
  qualityMetrics: AssessmentQualityMetrics,
  academicProfile?: StudentAcademicBackground
): FinalRecommendationOutput {
  const level = academicProfile?.level || 'UG'

  // 1. Calculate 15 Course Family Suitability Scores using the exact Implementation Guide formula:
  // S_c = Σ(D_d × W_c,d) / Σ(W_c,d)
  const rawDimScores: Record<string, number> = {}
  Object.entries(traitScores).forEach(([k, v]) => {
    rawDimScores[k] = v.normalizedScore
  })
  const courseFamilySuitability = calculateStage1Suitability(rawDimScores, level)

  // Map 15 course family suitability scores into DomainScoreResult list
  const domainScores: DomainScoreResult[] = courseFamilySuitability.map((cf) => ({
    id: cf.id,
    code: cf.id.toUpperCase().replace('CF_', ''),
    name: cf.name,
    description: cf.description,
    compatibilityScore: cf.suitabilityScore,
    rank: cf.rank,
    alignmentLabel: cf.alignmentLabel,
  }))

  // 2. Filter courses matching level (UG or PG)
  const candidateCourses = COURSE_COMPATIBILITY_MATRIX.filter((c) => c.level === level)

  // 3. Calculate Course Compatibility Scores
  const courseRankings: CourseCompatibilityResult[] = candidateCourses.map((course) => {
    let weightedSum = 0
    let totalWeight = 0

    Object.entries(course.dimensionWeights).forEach(([dimCode, weight]) => {
      const trait = traitScores[dimCode]
      const score = trait ? trait.normalizedScore : 50
      weightedSum += score * weight
      totalWeight += weight
    })

    const compScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50
    const boundedComp = Math.min(100, Math.max(15, compScore))

    // Check Eligibility
    let eligibilityStatus: 'ELIGIBLE' | 'CONDITIONAL' | 'INELIGIBLE' = 'ELIGIBLE'
    let eligibilityNotes = 'Eligible for Sandip University admission.'

    if (academicProfile?.stream && course.eligibilityRules.streamRequired) {
      const match = course.eligibilityRules.streamRequired.some((req) =>
        academicProfile.stream?.toLowerCase().includes(req.toLowerCase())
      )
      if (!match) {
        eligibilityStatus = 'CONDITIONAL'
        eligibilityNotes = `Prerequisite stream (${course.eligibilityRules.streamRequired.join(', ')}) required for direct enrollment.`
      }
    }

    if (
      academicProfile?.qualifyingGradePercent &&
      course.eligibilityRules.minGradePercent &&
      academicProfile.qualifyingGradePercent < course.eligibilityRules.minGradePercent
    ) {
      eligibilityStatus = 'CONDITIONAL'
      eligibilityNotes = `Minimum aggregate requirement is ${course.eligibilityRules.minGradePercent}%.`
    }

    // Calculate Specializations within this course
    const specializationMatches: SpecializationMatch[] = (course.specializations || []).map((spec) => {
      let specWeightSum = 0
      let specTotalWeight = 0

      Object.entries(spec.weights).forEach(([dimCode, weight]) => {
        const trait = traitScores[dimCode]
        const score = trait ? trait.normalizedScore : 50
        specWeightSum += score * weight
        specTotalWeight += weight
      })

      const specScore = specTotalWeight > 0 ? Math.round(specWeightSum / specTotalWeight) : 50
      return {
        id: spec.id,
        code: spec.code,
        name: spec.name,
        description: spec.description,
        compatibilityScore: Math.min(100, Math.max(20, specScore)),
      }
    })

    specializationMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    return {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      level: course.level,
      domainCode: course.domainCode,
      rawScore: weightedSum,
      compatibilityScore: boundedComp,
      rank: 0,
      eligibilityStatus,
      eligibilityNotes,
      specializationMatches,
    }
  })

  courseRankings.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  courseRankings.forEach((c, idx) => {
    c.rank = idx + 1
  })

  // 4. Recommendation Gap & Certainty
  const topScore = courseRankings[0]?.compatibilityScore || 80
  const secondScore = courseRankings[1]?.compatibilityScore || 70
  const gap = Math.max(0, topScore - secondScore)

  const certaintyLevel: 'HIGH_CERTAINTY' | 'MODERATE_CERTAINTY' | 'MULTI_PATHWAY' =
    gap >= 8 ? 'HIGH_CERTAINTY' : gap >= 4 ? 'MODERATE_CERTAINTY' : 'MULTI_PATHWAY'

  // 5. Confidence Calculation Formula:
  // 40% Answer Consistency + 30% Signal Strength + 20% Quality + 10% Completeness
  const consistencyPart = qualityMetrics.consistencyScore * 0.40
  const signalPart = qualityMetrics.signalStrength * 0.30
  const qualityPart = qualityMetrics.qualityScore * 0.20
  const completenessPart = 100 * 0.10 // 30 of 30 answers completed

  const overallConfidence = Math.round(consistencyPart + signalPart + qualityPart + completenessPart)
  const confidenceLabel: 'HIGH' | 'MODERATE' | 'EXPLORATORY' =
    overallConfidence >= 80 ? 'HIGH' : overallConfidence >= 65 ? 'MODERATE' : 'EXPLORATORY'

  const confidence: RecommendationConfidence = {
    overallScore: Math.min(100, Math.max(30, overallConfidence)),
    label: confidenceLabel,
    consistencyComponent: Math.round(consistencyPart),
    signalStrengthComponent: Math.round(signalPart),
    qualityComponent: Math.round(qualityPart),
    completenessComponent: Math.round(completenessPart),
    recommendationGap: gap,
    certaintyLevel,
  }

  return {
    domainScores,
    primaryDomain: domainScores[0],
    secondaryDomain: domainScores[1],
    tertiaryDomain: domainScores[2],
    courseRankings,
    primaryPathway: courseRankings[0],
    alternativePathways: courseRankings.slice(1, 3),
    confidence,
  }
}
