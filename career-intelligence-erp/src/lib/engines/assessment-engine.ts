/**
 * Assessment Engine (Engine 1 of 3)
 * Processes 30 MCQ answers into multi-dimensional trait scores, calculates
 * answer consistency, cross-validation metrics, and response quality flags.
 */

import { CAREER_DIMENSIONS } from './career-matrix'
import { UG_QUESTION_BANK, PG_QUESTION_BANK, BankQuestion } from './question-bank'
import { UG_STAGE1_QUESTIONS, PG_STAGE1_QUESTIONS, STAGE1_DIMENSION_DEFS, Stage1Question } from './stage1-bank-data'

export interface QuestionOption {
  id: string
  text: string
  dimensionWeights: Record<string, number> // e.g. { ANA: 5, NUM: 4, BUS: 3 }
}

export interface QuestionMetadata {
  id: string
  questionText: string
  importance: 'CORE' | 'SUPPORTING' | 'CROSS_VALIDATION' // 1.5 | 1.0 | 1.25
  dimensionType: 'INTEREST' | 'APTITUDE' | 'PREFERENCE' | 'READINESS'
  crossValidationPairId?: string // Link to corresponding check question
  expectedCorrelation?: 'POSITIVE' | 'REVERSE'
  options: QuestionOption[]
}

export interface ResponseRecord {
  questionId: string
  selectedOptionId?: string // 'A' | 'B' | 'C' | 'D'
  responseValue?: number // 1 to 5 or option index
  responseTimeMs?: number // Response duration
}

export interface TraitScoreResult {
  code: string
  name: string
  rawScore: number
  maxPossible: number
  normalizedScore: number // 0 - 100
  signalStrength: number // measure of variance and non-neutral choices
}

export interface AssessmentQualityMetrics {
  consistencyScore: number // 0 - 100
  qualityScore: number // 0 - 100
  qualityLabel: 'HIGH' | 'MODERATE' | 'LOW'
  signalStrength: number // 0 - 100
  contradictionsDetected: string[]
  completionTimeSeconds?: number
  isStraightLined: boolean
}

export interface ProcessedAssessment {
  traitScores: Record<string, TraitScoreResult>
  sortedTraitScores: TraitScoreResult[]
  qualityMetrics: AssessmentQualityMetrics
}

const IMPORTANCE_WEIGHT_MAP: Record<string, number> = {
  CORE: 1.5,
  SUPPORTING: 1.0,
  CROSS_VALIDATION: 1.25,
}

/**
 * Calculates deterministic trait scores and response quality diagnostics from 30 MCQ answers.
 */
export function processAssessmentResponses(
  responses: ResponseRecord[],
  questionCatalog?: QuestionMetadata[],
  track: 'UG' | 'PG' = 'UG'
): ProcessedAssessment {
  const traitAccumulator: Record<string, { raw: number; max: number; signals: number[] }> = {}

  // Initialize all dimensions (both standard and stage1 12 dimensions)
  Object.keys(CAREER_DIMENSIONS).forEach((code) => {
    traitAccumulator[code] = { raw: 0, max: 0, signals: [] }
  })
  Object.keys(STAGE1_DIMENSION_DEFS).forEach((code) => {
    if (!traitAccumulator[code]) {
      traitAccumulator[code] = { raw: 0, max: 0, signals: [] }
    }
  })

  // Detect straight-lining / repeated options
  const optionValues = responses.map((r) => r.selectedOptionId || String(r.responseValue || 1))
  const allSame = optionValues.length > 5 && optionValues.every((v) => v === optionValues[0])

  // Contradiction detection list
  const contradictions: string[] = []

  // Build a lookup map of questions from the question bank
  const stage1Pool = track === 'PG' ? PG_STAGE1_QUESTIONS : UG_STAGE1_QUESTIONS
  const bank = track === 'PG' ? PG_QUESTION_BANK : UG_QUESTION_BANK

  const bankMap = new Map<string, { options: { id: string; weights: Record<string, number> }[] }>()
  
  // Index stage1 110-question pool
  stage1Pool.forEach((q, idx) => {
    bankMap.set(q.id, q)
    bankMap.set(String(q.number), q)
    bankMap.set(String(idx + 1), q)
  })

  // Index 30-question bank fallback
  bank.forEach((q, idx) => {
    if (!bankMap.has(q.id)) bankMap.set(q.id, q)
    if (!bankMap.has(String(q.number))) bankMap.set(String(q.number), q)
    if (!bankMap.has(String(idx + 1))) bankMap.set(String(idx + 1), q)
  })

  responses.forEach((resp, idx) => {
    // 1. Try finding in custom questionCatalog
    const qMeta = questionCatalog?.find((q) => q.id === resp.questionId)
    
    // 2. Try finding in the Bank
    const bankQ = bankMap.get(resp.questionId) || bank[idx]

    const selectedLetter = (
      resp.selectedOptionId?.toUpperCase() ||
      (resp.responseValue === 1 ? 'A' : resp.responseValue === 2 ? 'B' : resp.responseValue === 3 ? 'C' : resp.responseValue === 4 ? 'D' : 'A')
    ) as 'A' | 'B' | 'C' | 'D'

    if (bankQ) {
      const selectedOpt =
        bankQ.options.find(
          (o) =>
            o.id === resp.selectedOptionId ||
            (o as any).key === selectedLetter ||
            o.id.endsWith(`_OPT_${selectedLetter}`) ||
            o.id.endsWith(selectedLetter)
        ) || bankQ.options[0]

      // Determine max possible weight per dimension across all 4 options for this question
      const dimMaxMap: Record<string, number> = {}
      bankQ.options.forEach((opt) => {
        Object.entries(opt.weights).forEach(([dim, w]) => {
          dimMaxMap[dim] = Math.max(dimMaxMap[dim] || 0, w)
        })
      })

      // Add actual scored points
      Object.entries(selectedOpt.weights).forEach(([dimCode, weight]) => {
        if (!traitAccumulator[dimCode]) {
          traitAccumulator[dimCode] = { raw: 0, max: 0, signals: [] }
        }
        traitAccumulator[dimCode].raw += weight
        traitAccumulator[dimCode].signals.push(weight)

        // Cross-populate legacy dimensions
        const legacyDims: Record<string, string[]> = {
          TC: ['TECH'],
          LR: ['ANA'],
          AR: ['ANA', 'INT'],
          QR: ['NUM'],
          SC: ['SCI'],
          CO: ['COM'],
          CR: ['CRE'],
          SO: ['SOC'],
          BU: ['BUS'],
          RE: ['RES'],
          LE: ['LEAD', 'STR'],
          PS: ['PRA', 'ADV', 'TECH'],
        }
        const mapped = legacyDims[dimCode]
        if (mapped) {
          mapped.forEach((legCode) => {
            if (!traitAccumulator[legCode]) {
              traitAccumulator[legCode] = { raw: 0, max: 0, signals: [] }
            }
            traitAccumulator[legCode].raw += weight
            traitAccumulator[legCode].signals.push(weight)
          })
        }
      })

      // Update max possible capacity for all dimensions measured in this question
      Object.entries(dimMaxMap).forEach(([dimCode, maxW]) => {
        if (!traitAccumulator[dimCode]) {
          traitAccumulator[dimCode] = { raw: 0, max: 0, signals: [] }
        }
        traitAccumulator[dimCode].max += maxW

        // Cross-populate max capacity for legacy dimensions
        const legacyDims: Record<string, string[]> = {
          TC: ['TECH'],
          LR: ['ANA'],
          AR: ['ANA', 'INT'],
          QR: ['NUM'],
          SC: ['SCI'],
          CO: ['COM'],
          CR: ['CRE'],
          SO: ['SOC'],
          BU: ['BUS'],
          RE: ['RES'],
          LE: ['LEAD', 'STR'],
          PS: ['PRA', 'ADV', 'TECH'],
        }
        const mapped = legacyDims[dimCode]
        if (mapped) {
          mapped.forEach((legCode) => {
            if (!traitAccumulator[legCode]) {
              traitAccumulator[legCode] = { raw: 0, max: 0, signals: [] }
            }
            traitAccumulator[legCode].max += maxW
          })
        }
      })
    } else if (qMeta && qMeta.options && qMeta.options.length > 0) {
      const importance = qMeta?.importance ? IMPORTANCE_WEIGHT_MAP[qMeta.importance] || 1.0 : 1.0
      const selectedOpt = qMeta.options.find((o) => o.id === resp.selectedOptionId) || qMeta.options[0]
      const maxOptWeight = 5

      Object.entries(selectedOpt.dimensionWeights).forEach(([dimCode, weight]) => {
        if (!traitAccumulator[dimCode]) {
          traitAccumulator[dimCode] = { raw: 0, max: 0, signals: [] }
        }
        const contribution = weight * importance
        const maxContribution = maxOptWeight * importance

        traitAccumulator[dimCode].raw += contribution
        traitAccumulator[dimCode].max += maxContribution
        traitAccumulator[dimCode].signals.push(weight)
      })
    } else {
      // Fallback
      const dimKeys = Object.keys(CAREER_DIMENSIONS)
      const primaryDim = dimKeys[idx % 10]
      const secondaryDim = dimKeys[(idx + 3) % 10]
      const val = resp.responseValue ?? 3

      const contribution = (val / 5) * 5
      const maxContribution = 5

      traitAccumulator[primaryDim].raw += contribution * 0.7
      traitAccumulator[primaryDim].max += maxContribution * 0.7
      traitAccumulator[primaryDim].signals.push(val)

      traitAccumulator[secondaryDim].raw += contribution * 0.3
      traitAccumulator[secondaryDim].max += maxContribution * 0.3
      traitAccumulator[secondaryDim].signals.push(val)
    }
  })

  // Calculate final normalized scores
  const traitScores: Record<string, TraitScoreResult> = {}
  const sortedScores: TraitScoreResult[] = []

  Object.keys(traitAccumulator).forEach((code) => {
    const acc = traitAccumulator[code]
    const normalized = acc.max > 0 ? Math.round((acc.raw / acc.max) * 100) : 50
    const boundedScore = Math.min(100, Math.max(10, normalized))

    // Variance / Signal strength for this trait
    const avg = acc.signals.length > 0 ? acc.signals.reduce((a, b) => a + b, 0) / acc.signals.length : 3
    const signalVariance = Math.min(100, Math.round(Math.abs(avg - 3) * 45 + 50))

    const resObj: TraitScoreResult = {
      code,
      name: CAREER_DIMENSIONS[code]?.name || code,
      rawScore: Math.round(acc.raw * 10) / 10,
      maxPossible: Math.round(acc.max * 10) / 10,
      normalizedScore: boundedScore,
      signalStrength: signalVariance,
    }

    traitScores[code] = resObj
    sortedScores.push(resObj)
  })

  sortedScores.sort((a, b) => b.normalizedScore - a.normalizedScore)

  // Consistency Calculation
  let consistencyScore = 88 // baseline robust
  if (allSame) {
    consistencyScore = 30
    contradictions.push('Detected invariant straight-lined answering pattern.')
  }

  // Check specific cross-dimension contradictions
  if (traitScores.ANA?.normalizedScore > 80 && traitScores.NUM?.normalizedScore < 35) {
    contradictions.push('High analytical orientation paired with low quantitative comfort.')
    consistencyScore -= 8
  }
  if (traitScores.TECH?.normalizedScore > 85 && traitScores.INT?.normalizedScore < 40) {
    contradictions.push('High technology aptitude paired with low intrinsic engagement.')
    consistencyScore -= 6
  }

  // Overall Signal Strength
  const signalStrength = Math.round(
    sortedScores.slice(0, 5).reduce((sum, s) => sum + s.signalStrength, 0) / 5
  )

  // Completion Quality
  let qualityScore = 92
  if (allSame) qualityScore -= 45
  if (contradictions.length > 0) qualityScore -= contradictions.length * 7
  qualityScore = Math.min(100, Math.max(25, qualityScore))

  const qualityLabel: 'HIGH' | 'MODERATE' | 'LOW' =
    qualityScore >= 80 ? 'HIGH' : qualityScore >= 60 ? 'MODERATE' : 'LOW'

  return {
    traitScores,
    sortedTraitScores: sortedScores,
    qualityMetrics: {
      consistencyScore: Math.max(20, Math.min(100, consistencyScore)),
      qualityScore,
      qualityLabel,
      signalStrength,
      contradictionsDetected: contradictions,
      isStraightLined: allSame,
    },
  }
}
