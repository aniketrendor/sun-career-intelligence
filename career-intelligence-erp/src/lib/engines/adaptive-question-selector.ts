/**
 * Adaptive Question Selector Engine
 * Dynamically selects assessment questions (1 to 30) across 5 levels based on
 * the student's cumulative psychometric context (preferences, reasoning, and vocational attitude).
 *
 * Modeled after context-driven evaluation: each subsequent question is conditioned on
 * the candidate's previous response history and emerging dimension weights.
 */

import {
  UG_STAGE1_QUESTIONS,
  PG_STAGE1_QUESTIONS,
  Stage1Question,
  OptionWeightItem,
  STAGE1_DIMENSION_DEFS,
  COURSE_FAMILY_MATRIX,
} from './stage1-bank-data'

export interface AnswerHistoryItem {
  question: Stage1Question
  selectedOptionId: string
}

export interface StudentPsychometricContext {
  traits: Record<string, number>
  totalWeight: number
  topTraits: { code: string; name: string; score: number }[]
  topDomains: { id: string; name: string; score: number }[]
  primaryLeaning: string
  answeredCount: number
}

/**
 * Deterministic PRNG array shuffle
 */
export function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let m = result.length
  let t: T
  let i: number
  let s = seed

  while (m) {
    s = (s * 9301 + 49297) % 233280
    i = Math.floor((s / 233280) * m--)
    t = result[m]
    result[m] = result[i]
    result[i] = t
  }
  return result
}

/**
 * Computes running student psychometric context from answered questions
 */
export function computeStudentContext(
  history: AnswerHistoryItem[]
): StudentPsychometricContext {
  const traits: Record<string, number> = {}
  Object.keys(STAGE1_DIMENSION_DEFS).forEach((code) => {
    traits[code] = 0
  })

  let totalWeight = 0

  history.forEach((item) => {
    if (!item.question || !item.selectedOptionId) return
    const opt = item.question.options.find((o) => o.id === item.selectedOptionId)
    if (!opt || !opt.weights) return

    Object.entries(opt.weights).forEach(([dim, w]) => {
      traits[dim] = (traits[dim] || 0) + (w || 0)
      totalWeight += w || 0
    })
  })

  // Rank traits descending
  const topTraits = Object.entries(traits)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([code, score]) => ({
      code,
      name: STAGE1_DIMENSION_DEFS[code]?.name || code,
      score,
    }))

  // Rank Course Families based on current traits
  const topDomains = COURSE_FAMILY_MATRIX.map((cf) => {
    let score = 0
    let totalCfWeight = 0
    Object.entries(cf.weights).forEach(([dim, cfWeight]) => {
      score += (traits[dim] || 0) * cfWeight
      totalCfWeight += cfWeight
    })
    const normalized = totalCfWeight > 0 ? Math.round((score / (totalWeight > 0 ? totalWeight * 5 : 1)) * 100) : 0
    return {
      id: cf.id,
      name: cf.name,
      score: normalized,
    }
  }).sort((a, b) => b.score - a.score)

  // Determine primary leaning label
  let primaryLeaning = 'Exploratory & Multi-disciplinary'
  if (topTraits.length > 0) {
    const topCodes = topTraits.slice(0, 3).map((t) => t.code)
    if (topCodes.some((c) => c === 'TC' || c === 'AR')) {
      primaryLeaning = 'Technology, Systems & Analytical Computing'
    } else if (topCodes.some((c) => c === 'SO' || c === 'CO')) {
      primaryLeaning = 'Human Dynamics, Leadership & Communication'
    } else if (topCodes.some((c) => c === 'BU' || c === 'LE')) {
      primaryLeaning = 'Strategic Enterprise, Management & Innovation'
    } else if (topCodes.some((c) => c === 'CR')) {
      primaryLeaning = 'Creative Architecture, Design & Applied Media'
    } else if (topCodes.some((c) => c === 'QR' || c === 'SC')) {
      primaryLeaning = 'Quantitative Science & Mathematical Modeling'
    }
  }

  return {
    traits,
    totalWeight,
    topTraits,
    topDomains,
    primaryLeaning,
    answeredCount: history.length,
  }
}

/**
 * Dynamically selects the next question based on the student's past answers.
 */
export function selectNextAdaptiveQuestion({
  track = 'UG',
  targetIndex,
  history,
  askedQuestionIds,
  seed = 2026,
}: {
  track: 'UG' | 'PG'
  targetIndex: number
  history: AnswerHistoryItem[]
  askedQuestionIds: string[]
  seed?: number
}): Stage1Question {
  const bank = track === 'PG' ? PG_STAGE1_QUESTIONS : UG_STAGE1_QUESTIONS
  const targetLevel = Math.min(5, Math.max(1, Math.floor(targetIndex / 6) + 1))
  const stepInLevel = targetIndex % 6 // 0 to 5

  // Filter pool for the target level excluding already asked questions
  const availablePool = bank.filter(
    (q) => q.level === targetLevel && !askedQuestionIds.includes(q.id)
  )

  // Fallback if level pool is depleted
  const candidatePool =
    availablePool.length > 0
      ? availablePool
      : bank.filter((q) => !askedQuestionIds.includes(q.id))

  if (candidatePool.length === 0) {
    // Total fallback
    const fallbackQ = bank[targetIndex % bank.length]
    return formatQuestionWithOptions(fallbackQ, seed + targetIndex * 17)
  }

  // Question 1 (targetIndex === 0): Select initial broad orientation anchor
  if (targetIndex === 0) {
    const anchor = candidatePool.find((q) => q.id === (track === 'PG' ? 'PG001' : 'UG001')) || candidatePool[0]
    return formatQuestionWithOptions(anchor, seed + targetIndex * 17)
  }

  // Compute student context up to this point
  const context = computeStudentContext(history)
  const topDimCodes = new Set(context.topTraits.slice(0, 4).map((t) => t.code))

  // Find immediately preceding question dimensions to encourage smooth variety
  const lastQ = history[history.length - 1]?.question
  const lastQDims = new Set<string>()
  if (lastQ) {
    lastQ.options.forEach((opt) => {
      Object.keys(opt.weights || {}).forEach((d) => lastQDims.add(d))
    })
  }

  // Score candidate questions for adaptive fit & information gain
  let bestCandidate = candidatePool[0]
  let bestScore = -Infinity

  candidatePool.forEach((candidate, cIdx) => {
    let score = 0

    // Extract all dimensions evaluated in this candidate
    const candidateDims = new Set<string>()
    candidate.options.forEach((opt) => {
      Object.entries(opt.weights || {}).forEach(([dim, w]) => {
        candidateDims.add(dim)
        // Trait resonance score: candidate options match student's emerging traits
        const studentDimWeight = context.traits[dim] || 0
        score += studentDimWeight * (w || 1)
      })
    })

    // Level-specific pacing strategy
    if (stepInLevel <= 1) {
      // Step 0-1: Calibration & broad discrimination
      if (candidate.discriminator === 'broad' || candidate.type === 'Preference') {
        score += 35
      }
    } else if (stepInLevel <= 3) {
      // Step 2-3: Deep probe into emerging top dimensions
      let topOverlap = 0
      candidateDims.forEach((d) => {
        if (topDimCodes.has(d)) topOverlap++
      })
      score += topOverlap * 20
    } else {
      // Step 4-5: Differentiation & cognitive boundary validation
      if (
        candidate.discriminator &&
        candidate.discriminator !== 'broad'
      ) {
        score += 30
      }
      if (candidate.type === 'Logic' || candidate.type === 'Quantitative' || candidate.type === 'Problem solving') {
        score += 25
      }
    }

    // Variety bonus: penalize asking identical narrow dimension set back-to-back
    let overlapWithLast = 0
    candidateDims.forEach((d) => {
      if (lastQDims.has(d)) overlapWithLast++
    })
    if (overlapWithLast > 3) {
      score -= 15
    }

    // Tie-breaker deterministic pseudo-random jitter
    const jitter = ((seed + cIdx * 37 + targetIndex * 53) % 100) / 100
    const finalScore = score + jitter

    if (finalScore > bestScore) {
      bestScore = finalScore
      bestCandidate = candidate
    }
  })

  return formatQuestionWithOptions(bestCandidate, seed + targetIndex * 17)
}

/**
 * Shuffles option order deterministically and standardizes keys A, B, C, D
 */
function formatQuestionWithOptions(q: Stage1Question, seed: number): Stage1Question {
  const shuffledOptions = deterministicShuffle(q.options, seed)
  return {
    ...q,
    options: shuffledOptions.map((opt, idx) => ({
      ...opt,
      key: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
    })),
  }
}
