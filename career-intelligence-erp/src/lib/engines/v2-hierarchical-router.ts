/**
 * Hierarchical Adaptive Router (L1 -> L2 -> L3 -> L4 -> L5)
 * Sandip University Career Intelligence Assessment Engine V2
 */

import {
  MASTER_QB_V2,
  getQuestionById,
  getQuestionsByLevel,
  getQuestionsForProgram,
  getDifferentiatorsForPrograms,
} from './v2-qb-loader'
import { SANDIP_MASTER_PROGRAMS, type SandipProgram } from '@/lib/services/sandip-catalog'
import type {
  QBQuestionV2,
  QBDifferentiator,
  AssessmentLevelV2,
  V2ResponseRecord,
  V2RoutingState,
} from '@/lib/types/qb-v2.types'

export interface RouterConfig {
  maxQuestionsBudget: number // default: 25 - 30
  levelBudgets: {
    L1: number // default: 5
    L2: number // default: 5
    L3: number // default: 5
    L4: number // default: 8
    L5: number // default: 5
    DIFF: number // default: 2
  }
  scoreThresholdForDifferentiation: number // Delta score <= 10 points between top candidates triggers DIFF
  allowExploration: boolean
}

export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  maxQuestionsBudget: 30,
  levelBudgets: {
    L1: 6,
    L2: 6,
    L3: 6,
    L4: 6,
    L5: 6,
    DIFF: 2,
  },
  scoreThresholdForDifferentiation: 12,
  allowExploration: true,
}

export interface StudentProfileContext {
  academicLevel?: 'UG' | 'PG' | string
  level?: 'UG' | 'PG' | string
  stream?: string // e.g. 'Science (PCM)', 'Commerce', 'Arts'
  qualifyingPercentage?: number
  interests?: string[]
}

/**
 * Filter catalog programs by student eligibility rules
 */
export function getEligiblePrograms(profile: StudentProfileContext): SandipProgram[] {
  return SANDIP_MASTER_PROGRAMS.filter((p) => {
    // 1. Level match
    if (p.level !== profile.academicLevel) {
      return false
    }

    // 2. Stream match (if stream is provided)
    if (profile.stream && p.suitable_stream && p.suitable_stream !== 'Any') {
      const streamLower = profile.stream.toLowerCase()
      const reqLower = p.suitable_stream.toLowerCase()

      // If program requires PCM/Science and student is Commerce/Arts without math
      if (reqLower.includes('pcm') && !streamLower.includes('pcm') && !streamLower.includes('science')) {
        return false
      }
      if (reqLower.includes('pcb') && !streamLower.includes('pcb') && !streamLower.includes('science')) {
        return false
      }
    }

    return true
  })
}

/**
 * Analyze responses and accumulate domain signals and candidate program scores
 */
export function evaluateEvidenceFromResponses(
  responses: V2ResponseRecord[],
  profile: StudentProfileContext
): {
  domainScores: Record<string, number>
  programEvidenceScores: Record<string, number>
  topDomains: string[]
  topPrograms: string[]
} {
  const domainScores: Record<string, number> = {
    TECH: 0,
    ENG: 0,
    BUS: 0,
    DESIGN: 0,
    SCI: 0,
    LAW: 0,
    HEALTH: 0,
    SOCIAL: 0,
  }

  const programEvidenceScores: Record<string, number> = {}
  SANDIP_MASTER_PROGRAMS.forEach((p) => {
    programEvidenceScores[p.program_id] = 0
  })

  responses.forEach((resp) => {
    const q = getQuestionById(resp.questionId)
    if (!q) return

    // Collect selected options
    const selectedOptionIds = resp.selectedOptionIds || (resp.selectedOptionId ? [resp.selectedOptionId] : [])
    if (selectedOptionIds.length === 0) return

    // Normalization factor for multi-select to avoid score inflation
    const multFactor = selectedOptionIds.length > 1 ? 1 / Math.sqrt(selectedOptionIds.length) : 1.0

    selectedOptionIds.forEach((optId) => {
      const opt = q.options.find((o) => o.id === optId || o.key === optId)
      if (!opt) return

      // Add domain signals
      opt.targetDomainCodes.forEach((d) => {
        domainScores[d] = (domainScores[d] || 0) + (10 * q.weight * multFactor)
      })

      // Add program signals
      opt.targetProgramIds.forEach((pid) => {
        if (programEvidenceScores[pid] !== undefined) {
          programEvidenceScores[pid] += 15 * q.weight * multFactor
        }
      })
    })
  })

  // Filter eligible programs
  const eligiblePids = new Set(getEligiblePrograms(profile).map((p) => p.program_id))

  // Rank domains
  const topDomains = Object.entries(domainScores)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d)

  // Rank eligible programs
  const topPrograms = Object.entries(programEvidenceScores)
    .filter(([pid]) => eligiblePids.has(pid))
    .sort((a, b) => b[1] - a[1])
    .map(([pid]) => pid)

  return { domainScores, programEvidenceScores, topDomains, topPrograms }
}

/**
 * Determine the next question to present in the L1 -> L2 -> L3 -> L4 -> L5 hierarchy
 */
export function selectNextHierarchicalQuestion(params: {
  responses: V2ResponseRecord[]
  profile: StudentProfileContext
  config?: Partial<RouterConfig>
}): {
  nextQuestion: QBQuestionV2 | null
  currentLevel: AssessmentLevelV2
  isComplete: boolean
  remainingBudget: number
  topCandidates: string[]
} {
  const config = { ...DEFAULT_ROUTER_CONFIG, ...(params.config || {}) }
  const askedIds = new Set(params.responses.map((r) => r.questionId))
  const answeredCount = params.responses.length

  // Check total budget
  if (answeredCount >= config.maxQuestionsBudget) {
    const evalResult = evaluateEvidenceFromResponses(params.responses, params.profile)
    return {
      nextQuestion: null,
      currentLevel: 'L5',
      isComplete: true,
      remainingBudget: 0,
      topCandidates: evalResult.topPrograms.slice(0, 5),
    }
  }

  // Count answered questions by level
  const countsByLevel: Record<AssessmentLevelV2, number> = {
    L1: 0,
    L2: 0,
    L3: 0,
    L4: 0,
    L5: 0,
    DIFF: 0,
  }

  params.responses.forEach((r) => {
    const q = getQuestionById(r.questionId)
    if (q) {
      countsByLevel[q.level] = (countsByLevel[q.level] || 0) + 1
    }
  })

  // Evaluate current evidence
  const { topDomains, topPrograms, programEvidenceScores } = evaluateEvidenceFromResponses(
    params.responses,
    params.profile
  )

  // ─── Determine Target Assessment Level ─────────────────────────────────────
  let targetLevel: AssessmentLevelV2 = 'L1'

  if (countsByLevel.L1 < config.levelBudgets.L1) {
    targetLevel = 'L1'
  } else if (countsByLevel.L2 < config.levelBudgets.L2) {
    targetLevel = 'L2'
  } else if (countsByLevel.L3 < config.levelBudgets.L3) {
    targetLevel = 'L3'
  } else if (countsByLevel.L4 < config.levelBudgets.L4) {
    targetLevel = 'L4'
  } else {
    // Check Level 5 total allocation (exactly 6 questions for Level 5, including any DIFF tie-breakers)
    const level5Total = (countsByLevel.L5 || 0) + (countsByLevel.DIFF || 0)
    if (level5Total >= config.levelBudgets.L5) {
      // Completed all 5 levels (6 questions each = 30 total)
      return {
        nextQuestion: null,
        currentLevel: 'L5',
        isComplete: true,
        remainingBudget: 0,
        topCandidates: topPrograms.slice(0, 5),
      }
    }

    const top1 = topPrograms[0]
    const top2 = topPrograms[1]
    const score1 = programEvidenceScores[top1] || 0
    const score2 = programEvidenceScores[top2] || 0
    const diffNeeded = top1 && top2 && Math.abs(score1 - score2) <= config.scoreThresholdForDifferentiation

    if (diffNeeded && countsByLevel.DIFF < config.levelBudgets.DIFF) {
      targetLevel = 'DIFF'
    } else {
      targetLevel = 'L5'
    }
  }

  // ─── Select Best Question for Target Level ─────────────────────────────────

  if (targetLevel === 'L1') {
    const pool = getQuestionsByLevel('L1').filter((q) => !askedIds.has(q.id))
    if (pool.length > 0) {
      return {
        nextQuestion: pool[0],
        currentLevel: 'L1',
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  if (targetLevel === 'L2' || targetLevel === 'L3') {
    const levelPool = getQuestionsByLevel(targetLevel).filter((q) => !askedIds.has(q.id))

    // Prioritize questions aligned with top domains
    const primaryDomain = topDomains[0] || 'TECH'
    const domainFiltered = levelPool.filter((q) =>
      q.options.some((opt) => opt.targetDomainCodes.includes(primaryDomain))
    )

    const selectedQ = domainFiltered[0] || levelPool[0]
    if (selectedQ) {
      return {
        nextQuestion: selectedQ,
        currentLevel: targetLevel,
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  if (targetLevel === 'L4' || targetLevel === 'L5') {
    const levelPool = getQuestionsByLevel(targetLevel).filter((q) => !askedIds.has(q.id))

    // Find questions targeting top candidate programs
    for (const candidatePid of topPrograms.slice(0, 4)) {
      const candidateQuestions = levelPool.filter((q) =>
        q.targetProgramIds.includes(candidatePid) ||
        q.options.some((opt) => opt.targetProgramIds.includes(candidatePid))
      )
      if (candidateQuestions.length > 0) {
        return {
          nextQuestion: candidateQuestions[0],
          currentLevel: targetLevel,
          isComplete: false,
          remainingBudget: config.maxQuestionsBudget - answeredCount,
          topCandidates: topPrograms.slice(0, 5),
        }
      }
    }

    // Fallback in pool
    if (levelPool.length > 0) {
      return {
        nextQuestion: levelPool[0],
        currentLevel: targetLevel,
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  if (targetLevel === 'DIFF') {
    const diffs = getDifferentiatorsForPrograms(topPrograms.slice(0, 4)).filter(
      (d) => !askedIds.has(d.id)
    )

    if (diffs.length > 0) {
      const d = diffs[0]
      // Convert differentiator into QBQuestionV2 compatible structure
      const diffQ: QBQuestionV2 = {
        id: d.id,
        level: 'DIFF',
        questionType: 'Discriminator',
        questionText: d.questionText,
        target: d.twinUnits.join('|'),
        targetProgramIds: d.twinUnits,
        weight: 1.5,
        calibrationStatus: 'Pending pilot data',
        overlapGroup: d.overlapGroup,
        options: d.options,
        audit: {
          questionId: d.id,
          decision: 'KEEP',
          pilotResult: 'PENDING',
          overlapCheck: 'VERIFIED',
        },
      }

      return {
        nextQuestion: diffQ,
        currentLevel: 'DIFF',
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  // Fallback to any unasked question
  const fallback = MASTER_QB_V2.questions.find((q) => !askedIds.has(q.id))
  if (fallback) {
    return {
      nextQuestion: fallback,
      currentLevel: fallback.level,
      isComplete: false,
      remainingBudget: config.maxQuestionsBudget - answeredCount,
      topCandidates: topPrograms.slice(0, 5),
    }
  }

  return {
    nextQuestion: null,
    currentLevel: 'L5',
    isComplete: true,
    remainingBudget: 0,
    topCandidates: topPrograms.slice(0, 5),
  }
}
