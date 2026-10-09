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
 * Normalizes academic level to 'UG' or 'PG'
 */
export function normalizeAcademicLevel(profile: StudentProfileContext): 'UG' | 'PG' {
  const lvl = (profile.academicLevel || profile.level || '').toString().toUpperCase().trim()
  if (lvl.includes('PG') || lvl.includes('MASTER') || lvl.includes('MBA') || lvl.includes('M.') || lvl.includes('POST')) {
    return 'PG'
  }
  return 'UG'
}

/**
 * Filter catalog programs by student eligibility rules (strict UG vs PG isolation)
 */
export function getEligiblePrograms(profile: StudentProfileContext): SandipProgram[] {
  const targetLevel = normalizeAcademicLevel(profile)

  return SANDIP_MASTER_PROGRAMS.filter((p) => {
    // 1. Level match (strict UG vs PG)
    if (p.level !== targetLevel) {
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
 * Checks whether a question is strictly compatible with the student's academic level (UG vs PG)
 */
export function isQuestionCompatibleWithLevel(q: QBQuestionV2, track: 'UG' | 'PG'): boolean {
  if (q.level === 'L1') {
    // L1 questions are universal broad career exploration
    return true
  }

  if (q.level === 'L2' || q.level === 'L3') {
    if (track === 'UG') {
      // Must NOT be PG or PhD
      if (
        q.id.includes('-PG-') ||
        q.id.startsWith('PHD-') ||
        q.target.includes('SUN-032 to SUN-035') ||
        q.target.includes('SUN-010 to SUN-019') ||
        q.target.includes('SUN-052 to SUN-064') ||
        q.target.includes('SUN-101 to SUN-105') ||
        q.target.includes('SUN-074 to SUN-077') ||
        q.target.includes('SUN-086 to SUN-091') ||
        q.target.includes('SUN-067 to SUN-070') ||
        q.target.includes('SUN-106 to SUN-114')
      ) {
        return false
      }
      return true
    } else {
      // PG track: Must NOT be UG-specific
      if (
        q.id.includes('-UG-') ||
        q.id.startsWith('CSE-L2-') ||
        q.id.startsWith('CSE-L3-') ||
        q.target.includes('SUN-001 to SUN-009') ||
        q.target.includes('SUN-036 to SUN-051') ||
        q.target.includes('SUN-092 to SUN-100') ||
        q.target.includes('SUN-071 to SUN-073') ||
        q.target.includes('SUN-078 to SUN-085') ||
        q.target.includes('SUN-065 to SUN-066')
      ) {
        return false
      }
      return true
    }
  }

  // For L4, L5, DIFF questions:
  if (q.id.startsWith('SUN-')) {
    const pid = q.id.split('-').slice(0, 2).join('-')
    const prog = SANDIP_MASTER_PROGRAMS.find((p) => p.program_id === pid)
    if (prog) {
      return prog.level === track
    }
  }

  if (q.targetProgramIds && q.targetProgramIds.length > 0) {
    return q.targetProgramIds.some((pid) => {
      const prog = SANDIP_MASTER_PROGRAMS.find((p) => p.program_id === pid)
      return prog ? prog.level === track : true
    })
  }

  return true
}

/**
 * Determines the canonical domain code for any question in the bank
 */
export function getQuestionDomainCode(q: QBQuestionV2 | QBDifferentiator): string {
  if (q.id.startsWith('COM-') || (q as any).target?.includes('SUN-036') || (q as any).target?.includes('SUN-052')) return 'BUS'
  if (q.id.startsWith('DES-') || (q as any).target?.includes('SUN-092') || (q as any).target?.includes('SUN-101')) return 'DESIGN'
  if (q.id.startsWith('LAW-') || (q as any).target?.includes('SUN-071') || (q as any).target?.includes('SUN-074')) return 'LAW'
  if (q.id.startsWith('SCI-') || (q as any).target?.includes('SUN-078') || (q as any).target?.includes('SUN-086')) return 'SCI'
  if (q.id.startsWith('PHA-') || (q as any).target?.includes('SUN-065') || (q as any).target?.includes('SUN-067')) return 'HEALTH'
  if (q.id.startsWith('ENG-') || (q as any).target?.includes('SUN-001') || (q as any).target?.includes('SUN-010')) return 'ENG'
  if (q.id.startsWith('CSE-') || (q as any).target?.includes('SUN-020') || (q as any).target?.includes('SUN-032')) return 'TECH'

  if (q.id.startsWith('SUN-')) {
    const pid = q.id.split('-').slice(0, 2).join('-')
    const prog = SANDIP_MASTER_PROGRAMS.find((p) => p.program_id === pid)
    if (prog) {
      if (prog.school.includes('Commerce') || prog.school.includes('Management')) return 'BUS'
      if (prog.school.includes('Design')) return 'DESIGN'
      if (prog.school.includes('Law')) return 'LAW'
      if (prog.school.includes('Science')) return 'SCI'
      if (prog.school.includes('Pharmaceutical')) return 'HEALTH'
      if (prog.school.includes('Engineering')) return 'ENG'
      if (prog.school.includes('Computer Science')) return 'TECH'
    }
  }

  for (const opt of q.options) {
    if (opt.targetDomainCodes && opt.targetDomainCodes.length > 0) {
      return opt.targetDomainCodes[0]
    }
  }

  return 'BUS'
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
  const targetLevel = normalizeAcademicLevel(profile)

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
    const q = getQuestionById(resp.questionId) || MASTER_QB_V2.differentiators.find((d) => d.id === resp.questionId)
    if (!q) return

    const qDomain = getQuestionDomainCode(q)
    const qWeight = (q as any).weight || 1.0

    // 1. Handle Ranking responses
    if (resp.rankings && Array.isArray(resp.rankings) && resp.rankings.length > 0) {
      const rankWeights = [1.0, 0.7, 0.45, 0.2, 0.1]
      resp.rankings.forEach((optId, rIdx) => {
        const weight = (rankWeights[rIdx] || 0.1) * qWeight
        const opt = q.options.find((o) => o.id === optId || o.key === optId)
        if (!opt) return

        const dCodes = opt.targetDomainCodes.length > 0 ? opt.targetDomainCodes : [qDomain]
        dCodes.forEach((d) => {
          domainScores[d] = (domainScores[d] || 0) + (14 * weight)
        })

        opt.targetProgramIds.forEach((pid) => {
          if (programEvidenceScores[pid] !== undefined) {
            programEvidenceScores[pid] += 20 * weight
          }
        })
      })
      return
    }

    // 2. Handle Single-select and Multi-select responses
    const selectedOptionIds = resp.selectedOptionIds || (resp.selectedOptionId ? [resp.selectedOptionId] : [])
    if (selectedOptionIds.length === 0) return

    // Normalization factor for multi-select to avoid score inflation
    const multFactor = selectedOptionIds.length > 1 ? 1 / Math.sqrt(selectedOptionIds.length) : 1.0

    selectedOptionIds.forEach((optId) => {
      const opt = q.options.find((o) => o.id === optId || o.key === optId)
      if (!opt) return

      const dCodes = opt.targetDomainCodes.length > 0 ? opt.targetDomainCodes : [qDomain]
      dCodes.forEach((d) => {
        domainScores[d] = (domainScores[d] || 0) + (10 * qWeight * multFactor)
      })

      opt.targetProgramIds.forEach((pid) => {
        if (programEvidenceScores[pid] !== undefined) {
          programEvidenceScores[pid] += 15 * qWeight * multFactor
        }
      })
    })
  })

  // Filter strictly eligible programs matching candidate track
  const eligiblePids = new Set(getEligiblePrograms(profile).map((p) => p.program_id))

  // Rank domains strictly by accumulated evidence
  const topDomains = Object.entries(domainScores)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d)

  // Rank eligible programs strictly by evidence points
  const topPrograms = Object.entries(programEvidenceScores)
    .filter(([pid]) => eligiblePids.has(pid))
    .sort((a, b) => b[1] - a[1])
    .map(([pid]) => pid)

  // Ensure default candidate list has programs of the right track if no responses yet
  if (topPrograms.length === 0) {
    const defaultList = SANDIP_MASTER_PROGRAMS
      .filter((p) => p.level === targetLevel)
      .map((p) => p.program_id)
    return { domainScores, programEvidenceScores, topDomains, topPrograms: defaultList }
  }

  return { domainScores, programEvidenceScores, topDomains, topPrograms }
}

// Fixed balanced Level 1 battery covering all 7+ dimensions
const L1_BALANCED_SEQUENCE = ['L1-01', 'L1-02', 'L1-03', 'L1-04', 'L1-05', 'L1-10']

/**
 * Determine the next question to present in the L1 -> L2 -> L3 -> L4 -> L5 hierarchy.
 * All questions from Level 2 to Level 5 depend dynamically on past responses and accumulated evidence.
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
  const track = normalizeAcademicLevel(params.profile)
  const askedIds = new Set(params.responses.map((r) => r.questionId))
  const answeredCount = params.responses.length

  // Check total budget (30 questions)
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
    const q = getQuestionById(r.questionId) || MASTER_QB_V2.differentiators.find((d) => d.id === r.questionId)
    if (q) {
      const lvl = (q as any).level || 'DIFF'
      countsByLevel[lvl as AssessmentLevelV2] = (countsByLevel[lvl as AssessmentLevelV2] || 0) + 1
    }
  })

  // Evaluate current evidence from all past responses
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

  // 1. Level 1: Broad Domain Exploration (6 Balanced Dimensions)
  if (targetLevel === 'L1') {
    for (const qId of L1_BALANCED_SEQUENCE) {
      if (!askedIds.has(qId)) {
        const q = getQuestionById(qId)
        if (q) {
          return {
            nextQuestion: q,
            currentLevel: 'L1',
            isComplete: false,
            remainingBudget: config.maxQuestionsBudget - answeredCount,
            topCandidates: topPrograms.slice(0, 5),
          }
        }
      }
    }

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

  // 2. Level 2: Program Family Routing (Dynamically depends on candidate's top domains from past responses)
  if (targetLevel === 'L2') {
    const levelPool = getQuestionsByLevel('L2')
      .filter((q) => isQuestionCompatibleWithLevel(q, track))
      .filter((q) => !askedIds.has(q.id))

    // Dynamically query questions for top domains in order of evidence
    for (const d of topDomains) {
      const match = levelPool.find((q) => getQuestionDomainCode(q) === d)
      if (match) {
        return {
          nextQuestion: match,
          currentLevel: 'L2',
          isComplete: false,
          remainingBudget: config.maxQuestionsBudget - answeredCount,
          topCandidates: topPrograms.slice(0, 5),
        }
      }
    }

    if (levelPool.length > 0) {
      return {
        nextQuestion: levelPool[0],
        currentLevel: 'L2',
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  // 3. Level 3: Course & Degree Architecture (Dynamically depends on top degrees for candidate's top domains)
  if (targetLevel === 'L3') {
    const levelPool = getQuestionsByLevel('L3')
      .filter((q) => isQuestionCompatibleWithLevel(q, track))
      .filter((q) => !askedIds.has(q.id))

    for (const d of topDomains) {
      const match = levelPool.find((q) => getQuestionDomainCode(q) === d)
      if (match) {
        return {
          nextQuestion: match,
          currentLevel: 'L3',
          isComplete: false,
          remainingBudget: config.maxQuestionsBudget - answeredCount,
          topCandidates: topPrograms.slice(0, 5),
        }
      }
    }

    if (levelPool.length > 0) {
      return {
        nextQuestion: levelPool[0],
        currentLevel: 'L3',
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  // 4. Level 4: Specialization Focus (Dynamically depends on candidate's top ranked programs)
  if (targetLevel === 'L4') {
    const levelPool = getQuestionsByLevel('L4')
      .filter((q) => isQuestionCompatibleWithLevel(q, track))
      .filter((q) => !askedIds.has(q.id))

    for (const candidatePid of topPrograms.slice(0, 5)) {
      const candidateQuestions = levelPool.filter(
        (q) =>
          q.id.startsWith(`${candidatePid}-`) ||
          q.targetProgramIds.includes(candidatePid) ||
          q.options.some((opt) => opt.targetProgramIds.includes(candidatePid))
      )
      if (candidateQuestions.length > 0) {
        return {
          nextQuestion: candidateQuestions[0],
          currentLevel: 'L4',
          isComplete: false,
          remainingBudget: config.maxQuestionsBudget - answeredCount,
          topCandidates: topPrograms.slice(0, 5),
        }
      }
    }

    if (levelPool.length > 0) {
      return {
        nextQuestion: levelPool[0],
        currentLevel: 'L4',
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  // 5. Level 5: Deep Specialization & Final Fit (Dynamically depends on candidate's top programs)
  if (targetLevel === 'L5') {
    const levelPool = getQuestionsByLevel('L5')
      .filter((q) => isQuestionCompatibleWithLevel(q, track))
      .filter((q) => !askedIds.has(q.id))

    for (const candidatePid of topPrograms.slice(0, 5)) {
      const candidateQuestions = levelPool.filter(
        (q) =>
          q.id.startsWith(`${candidatePid}-`) ||
          q.targetProgramIds.includes(candidatePid) ||
          q.options.some((opt) => opt.targetProgramIds.includes(candidatePid))
      )
      if (candidateQuestions.length > 0) {
        return {
          nextQuestion: candidateQuestions[0],
          currentLevel: 'L5',
          isComplete: false,
          remainingBudget: config.maxQuestionsBudget - answeredCount,
          topCandidates: topPrograms.slice(0, 5),
        }
      }
    }

    if (levelPool.length > 0) {
      return {
        nextQuestion: levelPool[0],
        currentLevel: 'L5',
        isComplete: false,
        remainingBudget: config.maxQuestionsBudget - answeredCount,
        topCandidates: topPrograms.slice(0, 5),
      }
    }
  }

  // 6. DIFF: Tie-Breakers between close candidate programs
  if (targetLevel === 'DIFF') {
    const diffs = getDifferentiatorsForPrograms(topPrograms.slice(0, 4))
      .filter((d) => !askedIds.has(d.id))

    if (diffs.length > 0) {
      const d = diffs[0]
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

  // Safe fallback to any unasked level-compatible question
  const fallback = MASTER_QB_V2.questions.find(
    (q) => isQuestionCompatibleWithLevel(q, track) && !askedIds.has(q.id)
  )

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
