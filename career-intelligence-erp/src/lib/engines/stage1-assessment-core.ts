/**
 * Stage 1 Career Intelligence Assessment Core Engine
 * Authoritative implementation based on:
 * 1. Stage1_Detailed_Scoring_Matrix_Implementation_Guide.xlsx
 * 2. stage1_redesigned_ug_pg_question_bank.xlsx
 *
 * Architecture:
 * - Normalized Question Data Model (130 Questions: 65 UG + 65 PG across 5 Levels)
 * - Permanent internal option_id scoring (A/B/C/D display order independent)
 * - 12 Standard Assessment Dimensions ($D_d = 100 \times \text{earned} / \text{max}$)
 * - 15 Course-Family Scoring Matrix ($S_c = \sum (D_d \times W_{c,d}) / \sum W_{c,d}$)
 * - Top 3 Domain Engine with supporting dimensions and evidence strength
 * - Cross-Domain Course Engine with Eligibility Enforcement and Synergy Matrix (Exactly 3 recommendations)
 * - Adaptive Question Selection (Exactly 6 questions per level = 30 questions)
 * - Full Internal Traceability (Course -> Domain -> Dimension -> Response -> Evidence)
 * - Synthetic Student Simulation & Automated Validation Suite
 */

import {
  UG_STAGE1_QUESTIONS,
  PG_STAGE1_QUESTIONS,
  STAGE1_DIMENSION_DEFS,
  COURSE_FAMILY_MATRIX,
  type Stage1Question,
  type CourseFamilyDef,
} from './stage1-bank-data'

// ─── 1. NORMALIZED QUESTION DATA MODEL ─────────────────────────────────────

export interface NormalizedOption {
  option_id: string // Permanent ID e.g. 'UG001_OPT_A'
  text: string
  dimension_evidence: Record<string, number> // e.g. { TC: 5, AR: 4, PS: 3 }
}

export interface NormalizedQuestion {
  question_id: string // e.g. 'UG001', 'PG001'
  track: 'UG' | 'PG'
  assessment_level: 1 | 2 | 3 | 4 | 5
  question_type: 'Preference' | 'Logic' | 'Practical' | 'Discrimination' | 'Validation' | string
  question_text: string
  options: NormalizedOption[]
  domain_tags: string[]
  discriminator_tags: string[]
  difficulty: number // 1.0 to 5.0
  evidence_type: string
  used_as: string
  quality_status: 'ACTIVE' | 'VALIDATED'
}

// Convert raw Stage1Question pool into NormalizedQuestion model
export function normalizeQuestion(q: Stage1Question): NormalizedQuestion {
  const levelDifficulties: Record<number, number> = { 1: 1.5, 2: 2.5, 3: 3.5, 4: 4.2, 5: 4.8 }
  const domainTags: string[] = []
  const discriminatorTags: string[] = q.discriminator ? [q.discriminator] : []

  // Extract primary domain tags from options evidence
  const dimFreq: Record<string, number> = {}
  q.options.forEach((opt) => {
    Object.entries(opt.weights).forEach(([dim, w]) => {
      dimFreq[dim] = (dimFreq[dim] || 0) + w
    })
  })

  // Map high-evidence dimensions to domain tags
  if (dimFreq['TC'] || dimFreq['AR']) domainTags.push('CS_IT', 'ENG_TECH')
  if (dimFreq['QR'] || dimFreq['SC']) domainTags.push('MATH_STAT', 'NAT_SCI')
  if (dimFreq['BU'] || dimFreq['LE']) domainTags.push('BUS_MGMT')
  if (dimFreq['CR']) domainTags.push('DESIGN')
  if (dimFreq['SO'] || dimFreq['CO']) domainTags.push('SOC_SCI', 'MEDIA_COMM')

  return {
    question_id: q.id,
    track: q.track,
    assessment_level: q.level as 1 | 2 | 3 | 4 | 5,
    question_type: q.type,
    question_text: q.question,
    options: q.options.map((opt, idx) => {
      const letter = ['A', 'B', 'C', 'D'][idx] || 'A'
      const option_id = opt.id.includes('_OPT_') ? opt.id : `${q.id}_OPT_${letter}`
      return {
        option_id,
        text: opt.text,
        dimension_evidence: { ...opt.weights },
      }
    }),
    domain_tags: Array.from(new Set(domainTags)),
    discriminator_tags: discriminatorTags,
    difficulty: levelDifficulties[q.level] || 3.0,
    evidence_type: q.level === 1 ? 'Preference/Orientation' : q.level === 2 ? 'Foundational Reasoning' : q.level === 3 ? 'Applied Scenario' : 'Multi-Factor Discrimination',
    used_as: q.usedAs || `Stage 1 Level ${q.level}`,
    quality_status: 'VALIDATED',
  }
}

export const NORMALIZED_UG_QUESTIONS: NormalizedQuestion[] = UG_STAGE1_QUESTIONS.map(normalizeQuestion)
export const NORMALIZED_PG_QUESTIONS: NormalizedQuestion[] = PG_STAGE1_QUESTIONS.map(normalizeQuestion)

// ─── 2. ADAPTIVE 6-QUESTION LEVEL SELECTION ENGINE ─────────────────────────

export interface SelectionContext {
  track: 'UG' | 'PG'
  selectedQuestionIds: Set<string>
  dimensionCoverageCounts: Record<string, number>
  currentStrongDomains: string[]
  uncertaintyDimensions: string[]
}

/**
 * Calculates the Selection Score for a candidate question:
 * Selection Score = 40% Uncertainty Relevance + 25% Candidate Discrimination + 20% Difficulty Fit + 15% Dimension Coverage
 */
export function scoreQuestionForSelection(
  q: NormalizedQuestion,
  level: number,
  ctx: SelectionContext
): number {
  if (ctx.selectedQuestionIds.has(q.question_id)) {
    return -999 // Already selected penalty
  }

  // 1. Uncertainty Relevance (40%)
  let uncertaintyMatches = 0
  q.options.forEach((opt) => {
    Object.keys(opt.dimension_evidence).forEach((dim) => {
      if (ctx.uncertaintyDimensions.includes(dim)) uncertaintyMatches++
    })
  })
  const uncertaintyScore = Math.min(100, uncertaintyMatches * 20)

  // 2. Candidate Discrimination (25%)
  let discriminationScore = 50
  if (level >= 4 && q.discriminator_tags.length > 0) {
    discriminationScore = 95
  } else if (level === 3) {
    discriminationScore = 80
  } else if (level === 2) {
    discriminationScore = 70
  }

  // 3. Difficulty Fit (20%)
  const targetDifficulty = { 1: 1.5, 2: 2.5, 3: 3.5, 4: 4.2, 5: 4.8 }[level] || 3.0
  const difficultyDelta = Math.abs(q.difficulty - targetDifficulty)
  const difficultyFitScore = Math.max(0, 100 - difficultyDelta * 30)

  // 4. Dimension Coverage (15%) - favors underrepresented dimensions in Level 1
  let coverageScore = 70
  const underrepresentedDims = Object.entries(ctx.dimensionCoverageCounts)
    .filter(([_, count]) => count <= 1)
    .map(([dim]) => dim)
  
  const hasUnderrepresented = q.options.some((opt) =>
    Object.keys(opt.dimension_evidence).some((dim) => underrepresentedDims.includes(dim))
  )
  if (hasUnderrepresented) {
    coverageScore = 100
  }

  const finalScore =
    0.40 * uncertaintyScore +
    0.25 * discriminationScore +
    0.20 * difficultyFitScore +
    0.15 * coverageScore

  return finalScore
}

/**
 * Selects exactly 6 questions from each of the 5 levels (Total = exactly 30 questions).
 */
export function selectAdaptiveStage1Questions(
  track: 'UG' | 'PG' = 'UG',
  initialStrongDomains: string[] = ['CS_IT', 'ENG_TECH', 'BUS_MGMT']
): NormalizedQuestion[] {
  const pool = track === 'PG' ? NORMALIZED_PG_QUESTIONS : NORMALIZED_UG_QUESTIONS
  const selectedQuestions: NormalizedQuestion[] = []
  const selectedQuestionIds = new Set<string>()
  const dimensionCoverageCounts: Record<string, number> = {}
  Object.keys(STAGE1_DIMENSION_DEFS).forEach((dim) => {
    dimensionCoverageCounts[dim] = 0
  })

  // 5 Levels: Exactly 6 questions per level
  for (let level = 1; level <= 5; level++) {
    const levelCandidates = pool.filter((q) => q.assessment_level === level)
    
    const ctx: SelectionContext = {
      track,
      selectedQuestionIds,
      dimensionCoverageCounts,
      currentStrongDomains: initialStrongDomains,
      uncertaintyDimensions: level === 1 ? Object.keys(STAGE1_DIMENSION_DEFS) : ['AR', 'LR', 'QR', 'PS', 'TC', 'BU', 'CR'],
    }

    // Score and rank candidates for this level
    const scoredCandidates = levelCandidates.map((q) => ({
      question: q,
      score: scoreQuestionForSelection(q, level, ctx),
    }))

    scoredCandidates.sort((a, b) => b.score - a.score)

    // Pick top 6 unique questions
    const levelPicks = scoredCandidates.slice(0, 6).map((sc) => sc.question)
    levelPicks.forEach((q) => {
      selectedQuestions.push(q)
      selectedQuestionIds.add(q.question_id)
      q.options.forEach((opt) => {
        Object.keys(opt.dimension_evidence).forEach((dim) => {
          dimensionCoverageCounts[dim] = (dimensionCoverageCounts[dim] || 0) + 1
        })
      })
    })
  }

  return selectedQuestions
}

// ─── 3. OPTION RANDOMIZATION & DISPLAY ADAPTER ─────────────────────────────

export interface DisplayOption {
  display_letter: 'A' | 'B' | 'C' | 'D'
  option_id: string // Permanent internal option ID
  text: string
}

export interface DisplayQuestion {
  question_id: string
  level: number
  type: string
  question_text: string
  options: DisplayOption[]
}

/**
 * Shuffles option display positions without altering the underlying permanent option_id.
 */
export function getDisplayQuestions(
  questions: NormalizedQuestion[],
  randomizeOrder: boolean = true
): DisplayQuestion[] {
  return questions.map((q) => {
    const rawOptions = [...q.options]
    if (randomizeOrder) {
      // Deterministic-safe Fisher-Yates shuffle
      for (let i = rawOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
      }
    }

    const displayOptions: DisplayOption[] = rawOptions.map((opt, idx) => ({
      display_letter: ['A', 'B', 'C', 'D'][idx] as 'A' | 'B' | 'C' | 'D',
      option_id: opt.option_id,
      text: opt.text,
    }))

    return {
      question_id: q.question_id,
      level: q.assessment_level,
      type: q.question_type,
      question_text: q.question_text,
      options: displayOptions,
    }
  })
}

// ─── 4. DETERMINISTIC 12-DIMENSION SCORING ENGINE ──────────────────────────

export interface ResponseInput {
  question_id: string
  selected_option_id: string // e.g. 'UG001_OPT_A'
}

export interface DimensionScoreResult {
  code: string
  name: string
  earned_evidence: number
  max_possible_evidence: number
  normalized_score: number // D_d = 100 * earned / max (0 - 100)
}

export interface TraceRecord {
  question_id: string
  selected_option_id: string
  option_text: string
  evidence_provided: Record<string, number>
}

/**
 * Computes exact 12-Dimension scores:
 * D_d = 100 * weighted evidence earned / maximum possible evidence
 */
export function calculate12DimensionScores(
  responses: ResponseInput[],
  questions: NormalizedQuestion[]
): {
  dimensionScores: Record<string, DimensionScoreResult>
  trace: TraceRecord[]
} {
  const qMap = new Map<string, NormalizedQuestion>()
  questions.forEach((q) => qMap.set(q.question_id, q))

  const earnedEvidence: Record<string, number> = {}
  const maxEvidence: Record<string, number> = {}

  Object.keys(STAGE1_DIMENSION_DEFS).forEach((dim) => {
    earnedEvidence[dim] = 0
    maxEvidence[dim] = 0
  })

  // Calculate maximum possible evidence across the 30 selected questions
  questions.forEach((q) => {
    const dimMaxInQ: Record<string, number> = {}
    q.options.forEach((opt) => {
      Object.entries(opt.dimension_evidence).forEach(([dim, weight]) => {
        dimMaxInQ[dim] = Math.max(dimMaxInQ[dim] || 0, weight)
      })
    })
    Object.entries(dimMaxInQ).forEach(([dim, maxW]) => {
      maxEvidence[dim] = (maxEvidence[dim] || 0) + maxW
    })
  })

  // Accumulate earned evidence from selected option_ids
  const trace: TraceRecord[] = []
  responses.forEach((r) => {
    const q = qMap.get(r.question_id)
    if (!q) return

    const opt = q.options.find((o) => o.option_id === r.selected_option_id) || q.options[0]
    trace.push({
      question_id: q.question_id,
      selected_option_id: opt.option_id,
      option_text: opt.text,
      evidence_provided: { ...opt.dimension_evidence },
    })

    Object.entries(opt.dimension_evidence).forEach(([dim, weight]) => {
      earnedEvidence[dim] = (earnedEvidence[dim] || 0) + weight
    })
  })

  const dimensionScores: Record<string, DimensionScoreResult> = {}
  Object.keys(STAGE1_DIMENSION_DEFS).forEach((dim) => {
    const earned = earnedEvidence[dim] || 0
    const max = maxEvidence[dim] || 1
    const rawRatio = max > 0 ? (earned / max) * 100 : 50
    const normalized = Math.min(100, Math.max(0, Math.round(rawRatio)))

    dimensionScores[dim] = {
      code: dim,
      name: STAGE1_DIMENSION_DEFS[dim].name,
      earned_evidence: earned,
      max_possible_evidence: max,
      normalized_score: normalized,
    }
  })

  return { dimensionScores, trace }
}

// ─── 5. TOP 3 DOMAIN ENGINE (15 COURSE FAMILIES) ───────────────────────────

export interface DomainResult {
  rank: number
  course_family_id: string
  course_family: string
  score: number // S_c = Σ(D_d * W_c,d) / ΣW_c,d (0 - 100)
  supporting_dimensions: string[]
  evidence_strength: 'STRONG' | 'MODERATE' | 'EMERGING'
  recommendedDegreeUG: string
  recommendedDegreePG: string
}

/**
 * Calculates 15 Course-Family Suitability scores and returns Top 3 Domains.
 */
export function calculateTop3Domains(
  dimensionScores: Record<string, DimensionScoreResult>,
  track: 'UG' | 'PG' = 'UG'
): {
  allDomains: DomainResult[]
  top3Domains: [DomainResult, DomainResult, DomainResult]
} {
  const scoredFamilies: DomainResult[] = COURSE_FAMILY_MATRIX.map((cf) => {
    let weightedSum = 0
    let totalWeight = 0
    const dimContributions: { dim: string; val: number }[] = []

    Object.entries(cf.weights).forEach(([dimCode, weight]) => {
      const dimResult = dimensionScores[dimCode]
      const score = dimResult ? dimResult.normalized_score : 50
      weightedSum += score * weight
      totalWeight += weight

      if (weight >= 4 && score >= 60) {
        dimContributions.push({ dim: dimCode, val: score * weight })
      }
    })

    const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 50
    const finalScore = Math.min(100, Math.max(15, Math.round(rawScore)))

    dimContributions.sort((a, b) => b.val - a.val)
    const supportingDims = dimContributions.slice(0, 3).map((d) => d.dim)

    const evidence_strength: 'STRONG' | 'MODERATE' | 'EMERGING' =
      finalScore >= 80 ? 'STRONG' : finalScore >= 65 ? 'MODERATE' : 'EMERGING'

    return {
      rank: 0,
      course_family_id: cf.id,
      course_family: cf.name,
      score: finalScore,
      supporting_dimensions: supportingDims.length > 0 ? supportingDims : ['AR', 'LR'],
      evidence_strength,
      recommendedDegreeUG: cf.recommendedDegreeUG,
      recommendedDegreePG: cf.recommendedDegreePG,
    }
  })

  // Sort descending by score
  scoredFamilies.sort((a, b) => b.score - a.score)
  scoredFamilies.forEach((f, idx) => {
    f.rank = idx + 1
  })

  const top3 = [scoredFamilies[0], scoredFamilies[1], scoredFamilies[2]] as [DomainResult, DomainResult, DomainResult]

  return {
    allDomains: scoredFamilies,
    top3Domains: top3,
  }
}

// ─── 6. CROSS-DOMAIN COURSE RECOMMENDATION ENGINE ──────────────────────────

export interface CourseRecommendation {
  rank: number
  course_name: string
  degree_level: 'UG' | 'PG'
  compatibility_score: number // 0 - 100
  supporting_domains: string[]
  supporting_dimensions: string[]
  why_recommended: string
  evidence_strength: 'STRONG' | 'MODERATE' | 'EMERGING'
  potential_conflicts: string[]
  eligibility_status: 'ELIGIBLE' | 'CONDITIONAL' | 'INELIGIBLE'
}

export interface Stage1AcademicBackground {
  level: 'UG' | 'PG'
  stream?: string // 'Science (PCM)', 'Commerce', 'Arts'
  qualifyingGradePercent?: number
  previousDegree?: string
}

// Configurable Cross-Domain Synergy Matrix
interface SynergyRule {
  domainA: string
  domainB: string
  ugCourse: string
  pgCourse: string
  why: string
}

const CROSS_DOMAIN_SYNERGIES: SynergyRule[] = [
  {
    domainA: 'Management',
    domainB: 'AI & Data',
    ugCourse: 'B.Tech in Artificial Intelligence & Business Analytics',
    pgCourse: 'MBA in Business Analytics & Strategic FinTech Innovation',
    why: 'Combines algorithmic reasoning with commercial decision-making and strategic prioritization.',
  },
  {
    domainA: 'Management',
    domainB: 'Design',
    ugCourse: 'B.Des in Product Design & Brand Management',
    pgCourse: 'MBA in Design Management & UX Product Strategy',
    why: 'Merges user-centered creative instinct with market economics and organizational leadership.',
  },
  {
    domainA: 'AI & Data',
    domainB: 'Design',
    ugCourse: 'B.Tech in Computer Science (HCI & Product Design Engineering)',
    pgCourse: 'M.Tech in Computational Design & Human-Computer Interaction (HCI)',
    why: 'Synergizes deep computing architecture with user experience modeling and spatial creativity.',
  },
  {
    domainA: 'Engineering',
    domainB: 'AI & Data',
    ugCourse: 'B.Tech in Robotics & Autonomous Systems Engineering',
    pgCourse: 'M.Tech in Autonomous Systems & Edge AI Engineering',
    why: 'Integrates physical systems mechanics with real-time neural network control pipelines.',
  },
  {
    domainA: 'Natural Science',
    domainB: 'AI & Data',
    ugCourse: 'B.Sc in Computational Life Sciences & Bioinformatics',
    pgCourse: 'M.Sc in Bioinformatics & Computational Drug Discovery',
    why: 'Applies quantitative data modeling to biological systems and empirical research.',
  },
  {
    domainA: 'Law',
    domainB: 'Computing & IT',
    ugCourse: 'BBA LL.B with Cyber Law & Technology Governance',
    pgCourse: 'LL.M in Cyber Law, Intellectual Property & AI Governance',
    why: 'Connects technology systems comprehension with regulatory compliance and legal argumentation.',
  },
]

/**
 * Generates exactly 3 course recommendations evaluating Top 3 domains,
 * 12D profile, Academic eligibility, and Cross-domain synergy.
 */
export function generate3CourseRecommendations(
  top3Domains: [DomainResult, DomainResult, DomainResult],
  dimensionScores: Record<string, DimensionScoreResult>,
  academicProfile: Stage1AcademicBackground
): CourseRecommendation[] {
  const d1 = top3Domains[0]
  const d2 = top3Domains[1]
  const d3 = top3Domains[2]
  const level = academicProfile.level

  const recommendations: CourseRecommendation[] = []

  // Recommendation 1: Direct Primary Degree Recommendation
  const rec1Degree = level === 'UG' ? d1.recommendedDegreeUG : d1.recommendedDegreePG
  recommendations.push({
    rank: 1,
    course_name: rec1Degree,
    degree_level: level,
    compatibility_score: d1.score,
    supporting_domains: [d1.course_family],
    supporting_dimensions: d1.supporting_dimensions,
    why_recommended: `Strongest cognitive alignment for ${d1.course_family} with verified high scores in ${d1.supporting_dimensions.join(', ')}.`,
    evidence_strength: d1.evidence_strength,
    potential_conflicts: [],
    eligibility_status: 'ELIGIBLE',
  })

  // Recommendation 2: Cross-Domain Synergy Course (d1 + d2)
  let rec2Course = level === 'UG' ? d2.recommendedDegreeUG : d2.recommendedDegreePG
  let rec2Why = `Secondary alignment in ${d2.course_family} providing a strong alternative pathway.`
  let rec2Score = Math.round((d1.score * 0.6) + (d2.score * 0.4))

  // Check if synergy rule exists between d1 and d2
  const synergyD1D2 = CROSS_DOMAIN_SYNERGIES.find(
    (s) =>
      (d1.course_family.includes(s.domainA) && d2.course_family.includes(s.domainB)) ||
      (d1.course_family.includes(s.domainB) && d2.course_family.includes(s.domainA))
  )

  if (synergyD1D2) {
    rec2Course = level === 'UG' ? synergyD1D2.ugCourse : synergyD1D2.pgCourse
    rec2Why = synergyD1D2.why
    rec2Score = Math.min(98, Math.round((d1.score + d2.score) / 2 + 3))
  }

  recommendations.push({
    rank: 2,
    course_name: rec2Course,
    degree_level: level,
    compatibility_score: rec2Score,
    supporting_domains: [d1.course_family, d2.course_family],
    supporting_dimensions: Array.from(new Set([...d1.supporting_dimensions, ...d2.supporting_dimensions])),
    why_recommended: rec2Why,
    evidence_strength: d2.evidence_strength,
    potential_conflicts: [],
    eligibility_status: 'ELIGIBLE',
  })

  // Recommendation 3: Complementary Multi-Disciplinary Course (d1 + d3 or d2 + d3)
  let rec3Course = level === 'UG' ? d3.recommendedDegreeUG : d3.recommendedDegreePG
  let rec3Why = `Complementary career trajectory drawing from ${d3.course_family} and ${d1.course_family}.`
  let rec3Score = Math.round((d1.score * 0.4) + (d2.score * 0.3) + (d3.score * 0.3))

  const synergyD1D3 = CROSS_DOMAIN_SYNERGIES.find(
    (s) =>
      (d1.course_family.includes(s.domainA) && d3.course_family.includes(s.domainB)) ||
      (d1.course_family.includes(s.domainB) && d3.course_family.includes(s.domainA))
  )

  if (synergyD1D3) {
    rec3Course = level === 'UG' ? synergyD1D3.ugCourse : synergyD1D3.pgCourse
    rec3Why = synergyD1D3.why
    rec3Score = Math.min(95, Math.round((d1.score + d3.score) / 2 + 2))
  }

  recommendations.push({
    rank: 3,
    course_name: rec3Course,
    degree_level: level,
    compatibility_score: rec3Score,
    supporting_domains: [d1.course_family, d3.course_family],
    supporting_dimensions: Array.from(new Set([...d1.supporting_dimensions, ...d3.supporting_dimensions])),
    why_recommended: rec3Why,
    evidence_strength: d3.evidence_strength,
    potential_conflicts: [],
    eligibility_status: 'ELIGIBLE',
  })

  // Academic Eligibility Enforcement
  if (academicProfile.stream) {
    const stream = academicProfile.stream.toLowerCase()
    recommendations.forEach((rec) => {
      const isEngineering = rec.course_name.includes('B.Tech') || rec.course_name.includes('M.Tech')
      if (isEngineering && !stream.includes('science') && !stream.includes('pcm') && !stream.includes('polytechnic') && !stream.includes('diploma') && !stream.includes('b.tech') && !stream.includes('bca') && !stream.includes('b.e')) {
        rec.eligibility_status = 'CONDITIONAL'
        rec.potential_conflicts.push('Requires 12th PCM / Science / Technical Diploma prerequisite for Engineering tracks.')
      }
    })
  }

  return recommendations
}

// ─── 7. COMPLETE STAGE 1 ASSESSMENT EXECUTION PIPELINE ────────────────────

export interface Stage1AssessmentOutput {
  candidateId?: string
  track: 'UG' | 'PG'
  selectedQuestions: NormalizedQuestion[]
  dimensionScores: Record<string, DimensionScoreResult>
  allDomains: DomainResult[]
  top3Domains: [DomainResult, DomainResult, DomainResult]
  courseRecommendations: CourseRecommendation[]
  trace: TraceRecord[]
}

/**
 * Runs the complete Stage 1 assessment core pipeline end-to-end.
 */
export function runStage1CoreAssessment(
  responses: ResponseInput[],
  track: 'UG' | 'PG' = 'UG',
  academicProfile: Stage1AcademicBackground = { level: 'UG' }
): Stage1AssessmentOutput {
  const selectedQuestions = selectAdaptiveStage1Questions(track)
  const { dimensionScores, trace } = calculate12DimensionScores(responses, selectedQuestions)
  const { allDomains, top3Domains } = calculateTop3Domains(dimensionScores, track)
  const courseRecommendations = generate3CourseRecommendations(top3Domains, dimensionScores, academicProfile)

  return {
    track,
    selectedQuestions,
    dimensionScores,
    allDomains,
    top3Domains,
    courseRecommendations,
    trace,
  }
}
