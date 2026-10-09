/**
 * Master Scoring & Evidence Accumulator Engine V2
 * Sandip University Career Intelligence System
 */

import {
  getQuestionById,
  MASTER_QB_V2,
} from './v2-qb-loader'
import {
  SANDIP_MASTER_PROGRAMS,
  type SandipProgram,
} from '@/lib/services/sandip-catalog'
import {
  STAGE1_DIMENSION_DEFS,
} from './stage1-bank-data'
import type {
  V2ResponseRecord,
  V2AssessmentResult,
  ProgramEvidenceScore,
} from '@/lib/types/qb-v2.types'
import type { StudentProfileContext } from './v2-hierarchical-router'

// Domain mapping to 12 Core Cognitive & Behavioral Traits
const DOMAIN_TO_TRAITS: Record<string, Record<string, number>> = {
  TECH: { TC: 30, LR: 25, PS: 25, AR: 20 },
  ENG: { AR: 30, PS: 25, TC: 25, QR: 20 },
  BUS: { BU: 35, LE: 25, CO: 20, SO: 20 },
  DESIGN: { CR: 40, CO: 25, TC: 20, PS: 15 },
  SCI: { SC: 35, RE: 30, AR: 20, QR: 15 },
  LAW: { LR: 35, CO: 30, SO: 20, AR: 15 },
  HEALTH: { SC: 30, SO: 30, PS: 20, RE: 20 },
  SOCIAL: { SO: 35, CO: 30, LE: 20, CR: 15 },
}

/**
 * Score V2 responses and produce multi-layer career intelligence recommendations
 */
export function processV2Assessment(
  responses: V2ResponseRecord[],
  profile: StudentProfileContext,
  options?: {
    isShadowMode?: boolean
    featureFlagEnabled?: boolean
  }
): V2AssessmentResult {
  // ─── 1. Trait Accumulator (12 Dimensions) ──────────────────────────────────
  const traitAccumulator: Record<string, { raw: number; count: number }> = {}
  Object.keys(STAGE1_DIMENSION_DEFS).forEach((code) => {
    traitAccumulator[code] = { raw: 0, count: 0 }
  })

  // ─── 2. Direct Program Evidence Accumulator ────────────────────────────────
  const programEvidenceMap: Record<string, {
    rawEvidence: number
    evidenceCount: number
    differentiatorVotes: string[]
  }> = {}

  SANDIP_MASTER_PROGRAMS.forEach((p) => {
    programEvidenceMap[p.program_id] = {
      rawEvidence: 0,
      evidenceCount: 0,
      differentiatorVotes: [],
    }
  })

  // ─── 3. Domain Signal Accumulator ──────────────────────────────────────────
  const domainScoreMap: Record<string, number> = {
    TECH: 0,
    ENG: 0,
    BUS: 0,
    DESIGN: 0,
    SCI: 0,
    LAW: 0,
    HEALTH: 0,
    SOCIAL: 0,
  }

  const routingHistory: {
    level: any
    questionId: string
    selectedOptionIds: string[]
  }[] = []

  // Process each response
  responses.forEach((resp) => {
    const q = getQuestionById(resp.questionId) || MASTER_QB_V2.differentiators.find((d) => d.id === resp.questionId)
    if (!q) return

    // Extract selected option IDs (support both single-select and multi-select)
    let selectedIds: string[] = []
    if (resp.selectedOptionIds && Array.isArray(resp.selectedOptionIds) && resp.selectedOptionIds.length > 0) {
      selectedIds = resp.selectedOptionIds
    } else if (resp.selectedOptionId) {
      selectedIds = [resp.selectedOptionId]
    }

    if (selectedIds.length === 0) return

    routingHistory.push({
      level: (q as any).level || 'DIFF',
      questionId: q.id,
      selectedOptionIds: selectedIds,
    })

    // Anti-inflation weighting for multi-select responses
    const optionWeightFactor = selectedIds.length > 1 ? 1 / Math.sqrt(selectedIds.length) : 1.0

    selectedIds.forEach((optId) => {
      const opt = q.options.find((o) => o.id === optId || o.key === optId)
      if (!opt) return

      // A. Accumulate Domain Signals
      opt.targetDomainCodes.forEach((d) => {
        domainScoreMap[d] = (domainScoreMap[d] || 0) + (10 * optionWeightFactor)

        // Cross-populate 12 cognitive/behavioral traits from domain alignment
        const traitWeights = DOMAIN_TO_TRAITS[d]
        if (traitWeights) {
          Object.entries(traitWeights).forEach(([tCode, weight]) => {
            if (traitAccumulator[tCode]) {
              traitAccumulator[tCode].raw += weight * optionWeightFactor
              traitAccumulator[tCode].count += 1
            }
          })
        }
      })

      // B. Accumulate Direct Program Evidence
      opt.targetProgramIds.forEach((pid) => {
        if (programEvidenceMap[pid]) {
          const boost = q.id.startsWith('DIFF') ? 25 : 15
          programEvidenceMap[pid].rawEvidence += boost * optionWeightFactor
          programEvidenceMap[pid].evidenceCount += 1
          if (q.id.startsWith('DIFF')) {
            programEvidenceMap[pid].differentiatorVotes.push(q.id)
          }
        }
      })
    })
  })

  // ─── 4. Normalize 12 Cognitive Trait Scores (0 to 100) ──────────────────────
  const traitScores: Record<string, {
    code: string
    name: string
    rawScore: number
    normalizedScore: number
  }> = {}

  let maxTraitRaw = 0
  Object.values(traitAccumulator).forEach((t) => {
    if (t.raw > maxTraitRaw) maxTraitRaw = t.raw
  })

  Object.entries(traitAccumulator).forEach(([code, data]) => {
    const norm = maxTraitRaw > 0 ? Math.min(100, Math.max(30, Math.round((data.raw / maxTraitRaw) * 100))) : 50
    traitScores[code] = {
      code,
      name: STAGE1_DIMENSION_DEFS[code]?.name || code,
      rawScore: Math.round(data.raw),
      normalizedScore: norm,
    }
  })

  // ─── 5. Rank Career Domains ────────────────────────────────────────────────
  const topDomains = Object.entries(domainScoreMap)
    .sort((a, b) => b[1] - a[1])
    .map(([code, score]) => ({
      code,
      name: getDomainDisplayName(code),
      score: Math.min(100, Math.round(score * 2.5)),
    }))

  // ─── 6. Score & Rank All 114 Sandip University Programs ─────────────────────
  let maxProgEvidence = 0
  Object.values(programEvidenceMap).forEach((p) => {
    if (p.rawEvidence > maxProgEvidence) maxProgEvidence = p.rawEvidence
  })

  const scoredPrograms: ProgramEvidenceScore[] = SANDIP_MASTER_PROGRAMS.map((prog) => {
    const evidenceData = programEvidenceMap[prog.program_id] || { rawEvidence: 0, evidenceCount: 0, differentiatorVotes: [] }
    const directEvidenceScore = maxProgEvidence > 0 ? (evidenceData.rawEvidence / maxProgEvidence) * 100 : 30

    // Compute trait alignment score for this program's domain
    let traitAlignmentSum = 0
    let traitCount = 0
    prog.career_domains.forEach((d) => {
      const dCode = mapDomainNameToCode(d)
      const traitWeights = DOMAIN_TO_TRAITS[dCode]
      if (traitWeights) {
        Object.keys(traitWeights).forEach((tCode) => {
          traitAlignmentSum += traitScores[tCode]?.normalizedScore || 50
          traitCount += 1
        })
      }
    })

    const traitAlignmentScore = traitCount > 0 ? Math.round(traitAlignmentSum / traitCount) : 50

    // Composite Score: 60% Direct Evidence + 40% Cognitive Trait Alignment
    const compositeScore = Math.round(
      0.6 * directEvidenceScore + 0.4 * traitAlignmentScore
    )

    // Academic Eligibility Evaluation
    let eligibilityStatus: 'ELIGIBLE' | 'CONDITIONAL' | 'INELIGIBLE' | 'UNKNOWN' = 'ELIGIBLE'
    let eligibilityReason = 'Meets standard Sandip University prerequisites.'

    if (prog.level !== profile.academicLevel) {
      eligibilityStatus = 'INELIGIBLE'
      eligibilityReason = `Program degree level (${prog.level}) does not match student target (${profile.academicLevel}).`
    } else if (profile.stream && prog.suitable_stream && prog.suitable_stream !== 'Any') {
      const streamLower = profile.stream.toLowerCase()
      const reqLower = prog.suitable_stream.toLowerCase()

      if (reqLower.includes('pcm') && !streamLower.includes('pcm') && !streamLower.includes('science')) {
        eligibilityStatus = 'CONDITIONAL'
        eligibilityReason = `Requires Mathematics/Physics (PCM) 12th stream prerequisite.`
      } else if (reqLower.includes('pcb') && !streamLower.includes('pcb') && !streamLower.includes('science')) {
        eligibilityStatus = 'CONDITIONAL'
        eligibilityReason = `Requires Biology/Life Sciences (PCB) 12th stream prerequisite.`
      }
    }

    return {
      programId: prog.program_id,
      school: prog.school,
      courseDegree: prog.course_degree,
      specialization: prog.specialization,
      name: prog.name,
      level: prog.level,
      evidenceCount: evidenceData.evidenceCount,
      rawEvidenceScore: Math.round(directEvidenceScore),
      traitAlignmentScore,
      finalCompositeScore: Math.min(98, Math.max(25, compositeScore)),
      rank: 0,
      eligibilityStatus,
      eligibilityReason,
      differentiatorEvidence: evidenceData.differentiatorVotes,
    }
  })

  // Sort eligible programs first, then by composite score
  scoredPrograms.sort((a, b) => {
    if (a.eligibilityStatus === 'ELIGIBLE' && b.eligibilityStatus !== 'ELIGIBLE') return -1
    if (b.eligibilityStatus === 'ELIGIBLE' && a.eligibilityStatus !== 'ELIGIBLE') return 1
    return b.finalCompositeScore - a.finalCompositeScore
  })

  // Assign 1-indexed ranks
  scoredPrograms.forEach((p, idx) => {
    p.rank = idx + 1
  })

  const primaryProgram = scoredPrograms[0]
  const alternativePrograms = scoredPrograms.slice(1, 6)

  // ─── 7. Confidence & Recommendation Gap ─────────────────────────────────────
  const rank1Score = primaryProgram?.finalCompositeScore || 0
  const rank2Score = alternativePrograms[0]?.finalCompositeScore || 0
  const recommendationGap = Math.max(0, rank1Score - rank2Score)

  const overallConfidence = Math.min(
    96,
    Math.round(40 + (recommendationGap * 2.5) + (responses.length >= 20 ? 25 : 10))
  )

  const confidenceLabel =
    overallConfidence >= 80 ? 'HIGH' : overallConfidence >= 60 ? 'MODERATE' : 'EXPLORATORY'

  return {
    version: MASTER_QB_V2.version,
    scoringPolicyVersion: '2.0.0-hierarchical',
    featureFlagEnabled: options?.featureFlagEnabled ?? true,
    isShadowMode: options?.isShadowMode ?? false,
    traitScores,
    topDomains,
    primaryProgram,
    alternativePrograms,
    confidence: {
      overallScore: overallConfidence,
      label: confidenceLabel,
      recommendationGap,
      signalStrength: Math.min(100, responses.length * 4),
      consistencyScore: 92,
      uncertaintyRemaining: recommendationGap < 5,
    },
    routingHistory,
  }
}

function getDomainDisplayName(code: string): string {
  const map: Record<string, string> = {
    TECH: 'Technology & Computing',
    ENG: 'Engineering & Architecture',
    BUS: 'Management & Commerce',
    DESIGN: 'Design & Visual Arts',
    SCI: 'Pure & Applied Sciences',
    LAW: 'Law & Governance',
    HEALTH: 'Pharmaceutical & Health Sciences',
    SOCIAL: 'Social Sciences & Humanities',
  }
  return map[code] || code
}

function mapDomainNameToCode(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('tech') || lower.includes('comput') || lower.includes('software')) return 'TECH'
  if (lower.includes('eng') || lower.includes('aero') || lower.includes('civil') || lower.includes('mech')) return 'ENG'
  if (lower.includes('bus') || lower.includes('manag') || lower.includes('comm') || lower.includes('fin')) return 'BUS'
  if (lower.includes('des') || lower.includes('anim') || lower.includes('fashion') || lower.includes('interior')) return 'DESIGN'
  if (lower.includes('law') || lower.includes('legal') || lower.includes('crimin')) return 'LAW'
  if (lower.includes('pharm') || lower.includes('health') || lower.includes('medic')) return 'HEALTH'
  if (lower.includes('sci') || lower.includes('micro') || lower.includes('chem') || lower.includes('phys')) return 'SCI'
  return 'TECH'
}
