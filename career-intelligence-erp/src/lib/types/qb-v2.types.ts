/**
 * Master Question Bank V2 & Audit Framework Type Definitions
 * Sandip University Career Intelligence System
 */

export type AssessmentLevelV2 = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'DIFF'

export type QuestionTypeV2 =
  | 'Single-select'
  | 'Multi-select'
  | 'Ranking'
  | 'Scenario'
  | 'Discriminator'

export type AuditDecision = 'KEEP' | 'REVISE' | 'REPLACE' | 'ESCALATE' | 'PENDING'

export type PilotValidationStatus = 'VALIDATED' | 'FLAGGED' | 'INSUFFICIENT_DATA' | 'PENDING'

export interface QBOptionV2 {
  id: string
  key: string // 'A' | 'B' | 'C' | 'D' | 'E'
  rawText: string
  displayText: string
  signals: string[]
  targetProgramIds: string[]
  targetDomainCodes: string[]
  targetProgramFamilyCodes: string[]
  targetCourseCodes: string[]
  isNeutral: boolean
  traitWeights?: Record<string, number>
}

export interface QBAuditRecord {
  questionId: string
  level?: string
  questionType?: string
  contentClarity?: number // 0-10
  careerRelevance?: number // 0-10
  discrimination?: number // 0-15
  optionQuality?: number // 0-10
  singleConcept?: number // 0-10
  biasFairness?: number // 0-10
  ageAccessibility?: number // 0-5
  psychometricSignal?: number // 0-10
  technicalCompleteness?: number // 0-5
  evidenceTraceability?: number // 0-5
  totalScore?: number // 0-100
  hardFail?: string | null
  decision: AuditDecision
  reviewerNotes?: string | null
  suggestedRevision?: string | null
  overlapCheck: string
  pilotResult: PilotValidationStatus | string
}

export interface QBQuestionV2 {
  id: string
  level: AssessmentLevelV2
  questionType: QuestionTypeV2
  questionText: string
  target: string
  targetProgramIds: string[]
  coverageNote?: string
  sourceSheet?: string
  weight: number
  calibrationStatus: string
  ownUnitSignal?: string | null
  overlapGroup?: string | null
  options: QBOptionV2[]
  audit: QBAuditRecord
  minSelections?: number
  maxSelections?: number
}

export interface QBDifferentiator {
  id: string
  overlapGroup: string
  questionType: string
  questionText: string
  twinUnits: string[]
  purpose: string
  options: QBOptionV2[]
}

export interface QBOverlapCluster {
  overlapGroup: string
  programIds: string[]
  whyItOverlaps: string
  recommendedAction: string
  status: string
}

export interface V2ResponseRecord {
  questionId: string
  level?: AssessmentLevelV2
  questionType?: QuestionTypeV2
  selectedOptionId?: string // for single-select
  selectedOptionIds?: string[] // for multi-select
  rankings?: string[] // for ranking questions
  responseTimeMs?: number
}

export interface ProgramEvidenceScore {
  programId: string // e.g. 'SUN-020'
  school: string
  courseDegree: string
  specialization: string
  name: string
  level: 'UG' | 'PG' | 'PhD' | 'Diploma'
  evidenceCount: number
  rawEvidenceScore: number
  traitAlignmentScore: number
  finalCompositeScore: number // 0 - 100
  rank: number
  eligibilityStatus: 'ELIGIBLE' | 'CONDITIONAL' | 'INELIGIBLE' | 'UNKNOWN'
  eligibilityReason?: string
  differentiatorEvidence?: string[]
}

export interface V2RoutingState {
  currentLevel: AssessmentLevelV2
  askedQuestionIds: string[]
  targetDomainScores: Record<string, number>
  topCandidateProgramIds: string[]
  activeDifferentiatorId?: string
  isComplete: boolean
  totalAnswered: number
  maxQuestionsBudget: number
}

export interface V2AssessmentResult {
  version: string
  scoringPolicyVersion: string
  featureFlagEnabled: boolean
  isShadowMode: boolean
  traitScores: Record<string, {
    code: string
    name: string
    rawScore: number
    normalizedScore: number
  }>
  topDomains: {
    code: string
    name: string
    score: number
  }[]
  primaryProgram: ProgramEvidenceScore
  alternativePrograms: ProgramEvidenceScore[]
  confidence: {
    overallScore: number
    label: 'HIGH' | 'MODERATE' | 'EXPLORATORY'
    recommendationGap: number
    signalStrength: number
    consistencyScore: number
    uncertaintyRemaining: boolean
  }
  riasecProfile?: {
    primaryCode: string
    primaryName: string
    secondaryCode: string
    secondaryName: string
    fullCode: string
    scores: Record<string, number>
  }
  cognitivePillars?: {
    analytical: number
    systemsThinking: number
    creativity: number
    strategicBusiness: number
    socialHumanity: number
    scientificRigor: number
  }
  careerArchetype?: {
    title: string
    summary: string
    strengths: string[]
    recommendedEnvironment: string
  }
  routingHistory: {
    level: AssessmentLevelV2
    questionId: string
    selectedOptionIds: string[]
  }[]
}
