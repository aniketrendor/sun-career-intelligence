/**
 * Report & Explanation Engine (Engine 3 of 3)
 * Generates deterministic, explainable evidence points, student-facing intelligence summary,
 * alternative pathways breakdown, and mentor advisory briefing.
 */

import type { ProcessedAssessment } from './assessment-engine'
import type { FinalRecommendationOutput } from './recommendation-engine'

export interface EvidencePoint {
  dimensionCode: string
  dimensionName: string
  score: number
  signalStatement: string
  impact: 'STRONG_POSITIVE' | 'MODERATE_POSITIVE' | 'BALANCING_FACTOR'
}

export interface MentorReviewBrief {
  studentStatus: 'PENDING_REVIEW' | 'REVIEWED' | 'DISCUSSED'
  topStrengths: string[]
  discussionPrompts: string[]
  contradictionFlags: string[]
  recommendedAction: string
}

export interface CareerIntelligenceReport {
  studentName?: string
  assessmentTitle: string
  generatedAt: string
  profileSummary: {
    primaryArchetype: string
    topTraits: Array<{ code: string; name: string; score: number }>
    radarProfile: Array<{ dimension: string; score: number; fullMark: number }>
  }
  recommendations: {
    primaryPathway: {
      courseName: string
      courseCode: string
      domainName: string
      compatibilityScore: number
      eligibilityStatus: string
      eligibilityNotes: string
      specializations: Array<{ name: string; score: number; description: string }>
    }
    alternativePathways: Array<{
      courseName: string
      courseCode: string
      compatibilityScore: number
      domainName: string
    }>
  }
  evidence: {
    headline: string
    keyReasons: string[]
    evidencePoints: EvidencePoint[]
  }
  confidenceDiagnostics: {
    confidenceLevel: 'HIGH' | 'MODERATE' | 'EXPLORATORY'
    confidenceScore: number
    certaintyType: string
    consistencyScore: number
    signalStrength: number
    recommendationGap: number
    gapExplanation: string
  }
  mentorBrief: MentorReviewBrief
}

/**
 * Builds the complete structured Career Intelligence Report
 */
export function generateCareerIntelligenceReport(
  assessment: ProcessedAssessment,
  recommendation: FinalRecommendationOutput,
  studentName: string = 'Student'
): CareerIntelligenceReport {
  const { sortedTraitScores, qualityMetrics } = assessment
  const { primaryPathway, alternativePathways, primaryDomain, confidence } = recommendation

  // Top 4 Traits
  const top4 = sortedTraitScores.slice(0, 4)

  // 1. Generate Evidence Reasons
  const keyReasons: string[] = []
  const evidencePoints: EvidencePoint[] = []

  top4.forEach((trait) => {
    let statement = ''
    if (trait.code === 'ANA') {
      statement = 'Demonstrated strong preference for logical reasoning, problem breakdown, and structured data analysis.'
    } else if (trait.code === 'NUM') {
      statement = 'Showed high comfort with quantitative modeling, computational numbers, and analytical deduction.'
    } else if (trait.code === 'BUS') {
      statement = 'Exhibited commercial curiosity, organizational problem solving, and entrepreneurial interest.'
    } else if (trait.code === 'TECH') {
      statement = 'Showed strong orientation toward software systems, cloud tools, and computing architectures.'
    } else if (trait.code === 'COM') {
      statement = 'High expressive ability with preference for articulate presentations, storytelling, and persuasion.'
    } else if (trait.code === 'CRE') {
      statement = 'High ideation capacity with passion for aesthetic design, user experiences, and visual innovation.'
    } else if (trait.code === 'SOC') {
      statement = 'Deep empathy orientation with interest in behavioral motivation, team dynamics, and mentorship.'
    } else if (trait.code === 'RES') {
      statement = 'Strong research drive with passion for literature synthesis and independent investigative inquiry.'
    } else if (trait.code === 'SCI') {
      statement = 'Empirical mindset with strong focus on scientific hypothesis testing and evidence.'
    } else {
      statement = `Showed consistent positive engagement across ${trait.name.toLowerCase()} evaluations.`
    }

    keyReasons.push(statement)
    evidencePoints.push({
      dimensionCode: trait.code,
      dimensionName: trait.name,
      score: trait.normalizedScore,
      signalStatement: statement,
      impact: trait.normalizedScore >= 75 ? 'STRONG_POSITIVE' : 'MODERATE_POSITIVE',
    })
  })

  // Add Consistency signal reason
  if (qualityMetrics.consistencyScore >= 80) {
    keyReasons.push('Responses demonstrated high internal consistency across cross-validation questions.')
  }

  // 2. Profile Archetype Label
  const trait1 = top4[0]?.name.split(' ')[0] || ''
  const trait2 = top4[1]?.name.split(' ')[0] || ''
  const distinctTraits = [trait1, trait2].filter(
    (t, idx, arr) => t && arr.indexOf(t) === idx && !primaryDomain.name.toLowerCase().includes(t.toLowerCase())
  )
  const traitPrefix = distinctTraits.length > 0 ? distinctTraits.join(' & ') + ' · ' : ''
  const primaryArchetype = `${traitPrefix}${primaryDomain.name} Strategist`

  // 3. Radar profile data for visual charts
  const radarProfile = sortedTraitScores.slice(0, 8).map((t) => ({
    dimension: t.name,
    score: t.normalizedScore,
    fullMark: 100,
  }))

  // 4. Recommendation Gap Analysis
  let gapExplanation = ''
  if (confidence.certaintyLevel === 'HIGH_CERTAINTY') {
    gapExplanation = `Strong separation (+${confidence.recommendationGap}% lead) indicates high certainty in the ${primaryPathway.courseCode} pathway.`
  } else if (confidence.certaintyLevel === 'MODERATE_CERTAINTY') {
    gapExplanation = `Moderate separation (+${confidence.recommendationGap}%) between primary and alternative options.`
  } else {
    gapExplanation = `Multi-pathway profile: Strong synergy between ${primaryPathway.courseCode} and ${alternativePathways[0]?.courseCode || 'alternatives'}. Both provide viable entry routes.`
  }

  // 5. Mentor Briefing
  const discussionPrompts: string[] = [
    `Explore student interest between ${primaryPathway.courseCode} core track vs specializations (${primaryPathway.specializationMatches.slice(0, 2).map((s) => s.name).join(', ')}).`,
    `Review quantitative readiness and ensure math/computational prerequisites align with the career trajectory.`,
  ]

  if (qualityMetrics.contradictionsDetected.length > 0) {
    discussionPrompts.push(`Discuss contradictory signals: ${qualityMetrics.contradictionsDetected[0]}`)
  }

  const mentorBrief: MentorReviewBrief = {
    studentStatus: 'PENDING_REVIEW',
    topStrengths: top4.map((t) => `${t.name} (${t.normalizedScore}/100)`),
    discussionPrompts,
    contradictionFlags: qualityMetrics.contradictionsDetected,
    recommendedAction: `Recommend 1-on-1 counseling session to confirm ${primaryPathway.courseCode} enrollment & specialization elective.`,
  }

  return {
    studentName,
    assessmentTitle: 'Career Intelligence Diagnostic',
    generatedAt: new Date().toISOString(),
    profileSummary: {
      primaryArchetype,
      topTraits: top4.map((t) => ({ code: t.code, name: t.name, score: t.normalizedScore })),
      radarProfile,
    },
    recommendations: {
      primaryPathway: {
        courseName: primaryPathway.courseName,
        courseCode: primaryPathway.courseCode,
        domainName: primaryDomain.name,
        compatibilityScore: primaryPathway.compatibilityScore,
        eligibilityStatus: primaryPathway.eligibilityStatus,
        eligibilityNotes: primaryPathway.eligibilityNotes,
        specializations: primaryPathway.specializationMatches.map((s) => ({
          name: s.name,
          score: s.compatibilityScore,
          description: s.description,
        })),
      },
      alternativePathways: alternativePathways.map((alt) => ({
        courseName: alt.courseName,
        courseCode: alt.courseCode,
        compatibilityScore: alt.compatibilityScore,
        domainName: alt.domainCode,
      })),
    },
    evidence: {
      headline: `Why ${primaryPathway.courseCode} appears as your strongest match`,
      keyReasons,
      evidencePoints,
    },
    confidenceDiagnostics: {
      confidenceLevel: confidence.label,
      confidenceScore: confidence.overallScore,
      certaintyType: confidence.certaintyLevel.replace('_', ' '),
      consistencyScore: qualityMetrics.consistencyScore,
      signalStrength: qualityMetrics.signalStrength,
      recommendationGap: confidence.recommendationGap,
      gapExplanation,
    },
    mentorBrief,
  }
}
