import {
  DIMENSIONS,
  DOMAINS,
  PROGRAMS,
  STAGE1,
  STAGE2_ACTIVITIES,
  SECTORS,
  SECTOR_CONTEXTS,
  DISCOVERY_CASES,
  OPT_OUT_ID,
  CareerDomain,
  SandipMasterProgram,
  Stage1Question
} from '@/lib/data/su-career-data'

export interface StudentContextProfile {
  name?: string
  pathway: 'UG' | 'PG'
  situation?: string
  stream?: string
  previousField?: string
  priorProgramme?: string
  highestQualification?: string
}

export interface DimensionProfileResult {
  scores: Record<string, number>
  evidence: Record<string, number>
  answered: number
  substantive: number
  raw: Record<string, number>
  possible: Record<string, number>
}

export interface ScoredDomain extends CareerDomain {
  stage1Fit: number
  stage2Exposures: number
  stage2Selections: number
  stage2Rate: number | null
  stage2Relative: number
  finalScore: number
  confidence: string
}

export interface Stage2Option {
  id: string
  domainId: string
  text: string
  source?: 'shortlist' | 'alternative' | 'discovery'
  optOut?: boolean
  profile?: Record<string, number>
}

export interface Stage2Question {
  id: string
  sector: string
  caseType: string
  ugCase: string
  pgCase: string
  prompt: string
  variant: number
  responseLimit: number
  options: Stage2Option[]
}

export interface ProgramEligibilityResult {
  code: 'match' | 'review' | 'mismatch' | 'future'
  label: string
  reason: string
}

export interface MatchedProgram extends SandipMasterProgram {
  fit: number
  eligibility: ProgramEligibilityResult
  domains: string[]
}

/**
 * Counts substantive answers (excluding opt-out or empty)
 */
export function countSubstantive(answers: Record<string, string[]>): number {
  return Object.values(answers).filter(
    (a) => Array.isArray(a) && a.length > 0 && !a.includes(OPT_OUT_ID)
  ).length
}

/**
 * Computes Stage 1 20-dimensional profile
 */
export function computeDimensionProfile(
  answers: Record<string, string[]>,
  questions: Stage1Question[] = STAGE1
): DimensionProfileResult {
  const raw: Record<string, number> = Object.fromEntries(DIMENSIONS.map((d) => [d.id, 0]))
  const possible: Record<string, number> = Object.fromEntries(DIMENSIONS.map((d) => [d.id, 0]))
  const evidence: Record<string, number> = Object.fromEntries(DIMENSIONS.map((d) => [d.id, 0]))

  let answered = 0
  let substantive = 0

  for (const q of questions) {
    if (!Object.prototype.hasOwnProperty.call(answers, q.id)) continue
    answered++
    const ids = answers[q.id] || []
    if (!ids.length || ids.includes(OPT_OUT_ID)) continue
    substantive++

    const selected = q.options.filter((o) => ids.includes(o.id))
    for (const dim of DIMENSIONS) {
      const allWeights = q.options.map((o) => Number(o.dims?.[dim.id] || 0))
      const max = Math.max(0, ...allWeights)
      if (max <= 0) continue
      possible[dim.id] += max

      const seen = Math.max(0, ...selected.map((o) => Number(o.dims?.[dim.id] || 0)))
      raw[dim.id] += seen
      if (seen > 0) evidence[dim.id]++
    }
  }

  const scores: Record<string, number> = {}
  for (const d of DIMENSIONS) {
    scores[d.id] = possible[d.id] ? Math.round((100 * raw[d.id]) / possible[d.id]) : 0
  }

  return { scores, evidence, answered, substantive, raw, possible }
}

/**
 * Computes cosine similarity between 20-D student score vector and a domain profile vector
 */
export function cosineScores(
  student: Record<string, number>,
  profile: Record<string, number>
): number {
  let dot = 0
  let a = 0
  let b = 0

  for (const d of DIMENSIONS) {
    const x = (Number(student[d.id]) || 0) / 100
    const y = (Number(profile[d.id]) || 0) / 5
    dot += x * y
    a += x * x
    b += y * y
  }

  if (a <= 0 || b <= 0) return 0
  return Math.round((100 * dot) / (Math.sqrt(a) * Math.sqrt(b)))
}

/**
 * Scores and ranks all 79 domains using Stage 1 dimension scores
 */
export function scoreAllDomains(dimScores: Record<string, number>): ScoredDomain[] {
  return DOMAINS.map((d) => {
    const s1Fit = cosineScores(dimScores, d.profile)
    return {
      ...d,
      stage1Fit: s1Fit,
      stage2Exposures: 0,
      stage2Selections: 0,
      stage2Rate: null,
      stage2Relative: 0,
      finalScore: s1Fit,
      confidence: 'Not tested in Stage 2'
    }
  }).sort((a, b) => b.stage1Fit - a.stage1Fit || a.name.localeCompare(b.name))
}

/**
 * Evaluates whether a domain contains at least one program that is eligible or under review
 * for the given student profile according to the Mermaid eligibility matrix.
 */
export function isDomainEligible(
  d: CareerDomain,
  profile: StudentContextProfile
): boolean {
  if (!d.programIds || d.programIds.length === 0) return true
  const programs = d.programIds
    .map((pid) => PROGRAMS.find((p) => p.id === pid))
    .filter(Boolean) as SandipMasterProgram[]

  const allowedLevelPrograms = programs.filter((p) =>
    programmeLevelAllowed(p, profile.pathway, profile.highestQualification)
  )

  if (allowedLevelPrograms.length === 0) return false

  return allowedLevelPrograms.some((p) => {
    const res = getProgramEligibility(p, profile)
    return res.code === 'match' || res.code === 'review'
  })
}

/**
 * Selects initial balanced 12 candidates for Stage 2 (max 3 per sector, min 1 per sector).
 * When student profile is provided, prioritizes domains whose attached programs match the student's eligibility.
 */
export function chooseCandidates(
  ranked: ScoredDomain[],
  profile?: StudentContextProfile
): string[] {
  const out: string[] = []
  const counts: Record<string, number> = {}

  function add(d: ScoredDomain | undefined) {
    if (!d || out.includes(d.id)) return
    const c = counts[d.sector] || 0
    if (c >= 3) return
    out.push(d.id)
    counts[d.sector] = c + 1
  }

  // Filter into eligible vs non-eligible domains based on the master Mermaid eligibility rules
  const eligible = profile ? ranked.filter((d) => isDomainEligible(d, profile)) : ranked
  const restricted = profile ? ranked.filter((d) => !isDomainEligible(d, profile)) : []

  // 1. Pick top overall eligible domains up to 8
  for (const d of eligible) {
    if (out.length >= 8) break
    add(d)
  }

  // 2. Guarantee representation across all 6 sectors (preferring eligible within that sector)
  for (const sector of SECTORS) {
    if (!out.some((id) => DOMAINS.find((d) => d.id === id)?.sector === sector)) {
      const bestEligible = eligible.find((d) => d.sector === sector)
      if (bestEligible) {
        add(bestEligible)
      } else {
        add(ranked.find((d) => d.sector === sector))
      }
    }
  }

  // 3. Fill up to 12 from eligible domains
  for (const d of eligible) {
    if (out.length >= 12) break
    add(d)
  }

  // 4. If fewer than 12 eligible domains exist, fill remaining with top restricted domains
  if (out.length < 12) {
    for (const d of restricted) {
      if (out.length >= 12) break
      add(d)
    }
  }

  // 5. Fallback safety
  if (out.length < 12) {
    for (const d of ranked) {
      if (out.length >= 12) break
      if (!out.includes(d.id)) out.push(d.id)
    }
  }

  return out.slice(0, 12)
}

/**
 * Retrieves the specific task text for a domain in a given variant index (0, 1, 2)
 */
export function stage2TaskText(domainId: string, variant: number): string {
  const list = STAGE2_ACTIVITIES[domainId] || []
  return list[variant] || list[0] || 'Try a short project related to this field.'
}

/**
 * Assembles the dynamic 20 Stage 2 cases (18 sector-based + 2 cross-disciplinary discovery)
 */
export function buildStage2Items(
  candidateIds: string[],
  s1Domains: ScoredDomain[]
): Stage2Question[] {
  const stage1Map = Object.fromEntries(s1Domains.map((d) => [d.id, d]))
  const selected = candidateIds.map((id) => DOMAINS.find((d) => d.id === id)).filter(Boolean) as CareerDomain[]
  const bySector: Record<string, CareerDomain[]> = Object.fromEntries(
    SECTORS.map((s) => [s, selected.filter((d) => d.sector === s)])
  )
  const sectorOrder = SECTORS.filter((s) => DOMAINS.some((d) => d.sector === s))

  const items: Stage2Question[] = []
  const shownCounts: Record<string, number> = {}
  const seenDiscovery = new Set<string>()
  let num = 1

  for (let variant = 0; variant < 3; variant++) {
    for (const sector of sectorOrder) {
      const cands = [...(bySector[sector] || [])].sort(
        (a, b) => (stage1Map[b.id]?.stage1Fit || 0) - (stage1Map[a.id]?.stage1Fit || 0)
      )
      const all = [...DOMAINS.filter((d) => d.sector === sector)]
      const opts = [...cands]
      const need = Math.max(0, Math.min(6, all.length) - opts.length)
      const alternatives = all.filter((d) => !opts.some((x) => x.id === d.id))
      alternatives.sort((a, b) => {
        const ca = shownCounts[a.id] || 0
        const cb = shownCounts[b.id] || 0
        return (
          ca - cb ||
          (stage1Map[b.id]?.stage1Fit || 0) - (stage1Map[a.id]?.stage1Fit || 0) ||
          a.name.localeCompare(b.name)
        )
      })

      for (const d of alternatives) {
        if (opts.length >= cands.length + need) break
        opts.push(d)
      }

      const ctx = (SECTOR_CONTEXTS[sector] || [])[variant] || {
        ug: 'A team is comparing several project tasks across this field.',
        pg: 'A team is comparing specialist work packages across this field.',
        prompt: 'Which tasks would you choose to explore?',
        caseType: 'Career task sampler'
      }

      const options: Stage2Option[] = opts.map((d) => ({
        id: d.id,
        domainId: d.id,
        text: stage2TaskText(d.id, variant),
        source: candidateIds.includes(d.id) ? 'shortlist' : 'alternative',
        profile: d.profile
      }))

      options.push({
        id: OPT_OUT_ID,
        domainId: OPT_OUT_ID,
        text: 'None of these activities interest me right now.',
        optOut: true
      })

      for (const d of opts) shownCounts[d.id] = (shownCounts[d.id] || 0) + 1

      items.push({
        id: `S2Q${String(num++).padStart(3, '0')}`,
        sector,
        caseType: ctx.caseType,
        ugCase: ctx.ug,
        pgCase: ctx.pg,
        prompt: ctx.prompt,
        variant,
        responseLimit: 3,
        options
      })
    }
  }

  // 2 Discovery cases deliberately present 6 alternative domains spanning across the 6 sectors
  const candidateSet = new Set(candidateIds)
  const alreadyShown = new Set(Object.keys(shownCounts))
  const remaining = DOMAINS.filter((d) => !candidateSet.has(d.id))
  const fit = (d: CareerDomain) => stage1Map[d.id]?.stage1Fit || 0

  for (let k = 0; k < 2; k++) {
    const pool: CareerDomain[] = []
    const available = remaining.filter((d) => !seenDiscovery.has(d.id))
    const sorted = [...available].sort((a, b) => {
      const aShown = alreadyShown.has(a.id) ? 1 : 0
      const bShown = alreadyShown.has(b.id) ? 1 : 0
      return aShown - bShown || fit(b) - fit(a) || a.name.localeCompare(b.name)
    })

    for (const sec of sectorOrder) {
      const d = sorted.find((x) => x.sector === sec && !pool.some((y) => y.id === x.id))
      if (d && pool.length < 6) {
        pool.push(d)
      }
    }

    for (const d of sorted) {
      if (pool.length >= 6) break
      if (!pool.some((x) => x.id === d.id)) pool.push(d)
    }

    pool.forEach((d) => seenDiscovery.add(d.id))
    const ctx = DISCOVERY_CASES[k]
    const actVariant = k + 1

    const options: Stage2Option[] = pool.map((d) => ({
      id: d.id,
      domainId: d.id,
      text: stage2TaskText(d.id, actVariant),
      source: 'discovery',
      profile: d.profile
    }))

    options.push({
      id: OPT_OUT_ID,
      domainId: OPT_OUT_ID,
      text: 'None of these activities interest me right now.',
      optOut: true
    })

    items.push({
      id: `S2Q${String(num++).padStart(3, '0')}`,
      sector: 'Cross-disciplinary discovery',
      caseType: ctx.caseType,
      ugCase: ctx.ug,
      pgCase: ctx.pg,
      prompt: ctx.prompt,
      variant: actVariant,
      responseLimit: 3,
      options
    })
  }

  return items
}

/**
 * Computes final scores using Bayesian-smoothed Stage 2 selection rates blended with Stage 1 profile
 */
export function computeFinalDomainScores(
  s1Domains: ScoredDomain[],
  s2Items: Stage2Question[],
  s2Answers: Record<string, string[]>
): ScoredDomain[] {
  const counts: Record<string, number> = {}
  const selected: Record<string, number> = {}

  for (const q of s2Items) {
    const ans = s2Answers[q.id] || []
    if (!ans.length || ans.includes(OPT_OUT_ID)) continue
    for (const o of q.options) {
      if (!o.optOut) counts[o.domainId] = (counts[o.domainId] || 0) + 1
    }
    for (const id of ans) {
      if (id !== OPT_OUT_ID) selected[id] = (selected[id] || 0) + 1
    }
  }

  return s1Domains
    .map((d) => {
      const exposure = counts[d.id] || 0
      const picks = selected[d.id] || 0
      // Neutral prior: 50% of displayed opportunities.
      const priorExposure = 3
      const priorPicks = 1.5
      const preference = exposure
        ? Math.round((100 * (picks + priorPicks)) / (exposure + priorExposure))
        : 50
      const weight =
        exposure >= 3 ? 0.4 : exposure === 2 ? 0.28 : exposure === 1 ? 0.16 : 0
      const final =
        weight > 0
          ? (1 - weight) * (d.stage1Fit || 0) + weight * preference
          : d.stage1Fit || 0
      const confidence =
        exposure >= 3
          ? 'Repeated Stage 2 exposure'
          : exposure === 2
          ? 'Two Stage 2 exposures'
          : exposure === 1
          ? 'Single Stage 2 exposure'
          : 'Stage 1 profile only'

      return {
        ...d,
        stage2Exposures: exposure,
        stage2Selections: picks,
        stage2Rate: exposure ? Math.round((picks / exposure) * 100) : null,
        stage2Relative: preference,
        finalScore: Math.round(final),
        confidence
      }
    })
    .sort(
      (a, b) =>
        b.finalScore - a.finalScore ||
        b.stage1Fit - a.stage1Fit ||
        a.name.localeCompare(b.name)
    )
}

// =========================================================================
// SANDIP UNIVERSITY 114 PROGRAMS ELIGIBILITY MATRIX (Source: Master Mermaid)
// =========================================================================

export type UGEligibilityCategory = 
  | 'PCM'
  | 'PCB_PCM'
  | 'SCIENCE'
  | 'SCIENCE_MATH'
  | 'SCIENCE_CHEM'
  | 'SCIENCE_PHY'
  | 'ANY'

export type PGEligibilityCategory =
  | 'RELEVANT_ENG'
  | 'RELEVANT_ENG_SCI'
  | 'CIVIL_ARCH'
  | 'RELEVANT_DEGREE'
  | 'ANY_GRAD_MATH'
  | 'ANY_GRAD'
  | 'B_PHARM'
  | 'LAW_DEGREE'
  | 'RELEVANT_SCI'
  | 'GRADUATION'

export type PhDEligibilityCategory =
  | 'RELEVANT_MASTER'

export interface ProgramEligibilityRule {
  programId: string
  level: 'UG' | 'PG' | 'PhD' | 'Diploma'
  category: UGEligibilityCategory | PGEligibilityCategory | PhDEligibilityCategory
  ruleLabel: string
  ruleDesc: string
}

export const PROGRAM_ELIGIBILITY_RULES: Record<string, ProgramEligibilityRule> = {
  // --- UG: PCM ---
  'SUN-001': { programId: 'SUN-001', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-002': { programId: 'SUN-002', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-003': { programId: 'SUN-003', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-004': { programId: 'SUN-004', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-005': { programId: 'SUN-005', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-006': { programId: 'SUN-006', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-009': { programId: 'SUN-009', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-020': { programId: 'SUN-020', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-021': { programId: 'SUN-021', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-022': { programId: 'SUN-022', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-023': { programId: 'SUN-023', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-024': { programId: 'SUN-024', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-025': { programId: 'SUN-025', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-026': { programId: 'SUN-026', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-027': { programId: 'SUN-027', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-028': { programId: 'SUN-028', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-029': { programId: 'SUN-029', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },

  // --- UG: PCB / PCM ---
  'SUN-007': { programId: 'SUN-007', level: 'UG', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },
  'SUN-008': { programId: 'SUN-008', level: 'UG', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },
  'SUN-065': { programId: 'SUN-065', level: 'Diploma', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },
  'SUN-066': { programId: 'SUN-066', level: 'UG', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },

  // --- UG: Science ---
  'SUN-078': { programId: 'SUN-078', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-079': { programId: 'SUN-079', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-080': { programId: 'SUN-080', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-081': { programId: 'SUN-081', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-085': { programId: 'SUN-085', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },

  // --- UG: Science + Mathematics ---
  'SUN-030': { programId: 'SUN-030', level: 'UG', category: 'SCIENCE_MATH', ruleLabel: 'Science + Mathematics', ruleDesc: '12th Science with Mathematics' },
  'SUN-082': { programId: 'SUN-082', level: 'UG', category: 'SCIENCE_MATH', ruleLabel: 'Science + Mathematics', ruleDesc: '12th Science with Mathematics' },

  // --- UG: Science + Chemistry ---
  'SUN-083': { programId: 'SUN-083', level: 'UG', category: 'SCIENCE_CHEM', ruleLabel: 'Science + Chemistry', ruleDesc: '12th Science with Chemistry' },

  // --- UG: Science + Physics & Mathematics ---
  'SUN-084': { programId: 'SUN-084', level: 'UG', category: 'SCIENCE_PHY', ruleLabel: 'Science + Physics & Mathematics', ruleDesc: '12th Science with Physics & Mathematics' },

  // --- UG: Any 12th Stream ---
  'SUN-031': { programId: 'SUN-031', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-036': { programId: 'SUN-036', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-037': { programId: 'SUN-037', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-038': { programId: 'SUN-038', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-039': { programId: 'SUN-039', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-040': { programId: 'SUN-040', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-041': { programId: 'SUN-041', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-042': { programId: 'SUN-042', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-043': { programId: 'SUN-043', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-044': { programId: 'SUN-044', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-045': { programId: 'SUN-045', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-046': { programId: 'SUN-046', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-047': { programId: 'SUN-047', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-048': { programId: 'SUN-048', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-049': { programId: 'SUN-049', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-050': { programId: 'SUN-050', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-051': { programId: 'SUN-051', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-071': { programId: 'SUN-071', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-072': { programId: 'SUN-072', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-073': { programId: 'SUN-073', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-092': { programId: 'SUN-092', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-093': { programId: 'SUN-093', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-094': { programId: 'SUN-094', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-095': { programId: 'SUN-095', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-096': { programId: 'SUN-096', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-097': { programId: 'SUN-097', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-098': { programId: 'SUN-098', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-099': { programId: 'SUN-099', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-100': { programId: 'SUN-100', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },

  // --- PG: Relevant Engineering ---
  'SUN-010': { programId: 'SUN-010', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-011': { programId: 'SUN-011', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-012': { programId: 'SUN-012', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-013': { programId: 'SUN-013', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-014': { programId: 'SUN-014', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-015': { programId: 'SUN-015', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-018': { programId: 'SUN-018', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },

  // --- PG: Relevant Engineering / Science ---
  'SUN-016': { programId: 'SUN-016', level: 'PG', category: 'RELEVANT_ENG_SCI', ruleLabel: 'Relevant Engineering / Science', ruleDesc: 'B.Tech or B.Sc in Environmental / Allied Science' },

  // --- PG: Civil / Architecture ---
  'SUN-017': { programId: 'SUN-017', level: 'PG', category: 'CIVIL_ARCH', ruleLabel: 'Civil / Architecture', ruleDesc: 'B.E. / B.Tech in Civil Engineering or B.Arch' },

  // --- PG: Relevant Degree ---
  'SUN-019': { programId: 'SUN-019', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'Bachelor degree in Planning, Architecture, or Civil' },
  'SUN-032': { programId: 'SUN-032', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'B.E. / B.Tech in CSE / IT / MCA / M.Sc CS' },
  'SUN-033': { programId: 'SUN-033', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'B.E. / B.Tech in CSE / IT / MCA / M.Sc CS' },
  'SUN-034': { programId: 'SUN-034', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'B.E. / B.Tech in CSE / IT / MCA / M.Sc CS' },

  // --- PG: Any Graduation, preferably Mathematics ---
  'SUN-035': { programId: 'SUN-035', level: 'PG', category: 'ANY_GRAD_MATH', ruleLabel: 'Any Graduation, preferably Mathematics', ruleDesc: 'Any graduation with Mathematics / Statistics / CS' },

  // --- PG: Any Graduation ---
  'SUN-052': { programId: 'SUN-052', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-053': { programId: 'SUN-053', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-054': { programId: 'SUN-054', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-055': { programId: 'SUN-055', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-056': { programId: 'SUN-056', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-057': { programId: 'SUN-057', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-058': { programId: 'SUN-058', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-059': { programId: 'SUN-059', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-060': { programId: 'SUN-060', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-061': { programId: 'SUN-061', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-062': { programId: 'SUN-062', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-063': { programId: 'SUN-063', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-064': { programId: 'SUN-064', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },

  // --- PG: B.Pharm ---
  'SUN-067': { programId: 'SUN-067', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },
  'SUN-068': { programId: 'SUN-068', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },
  'SUN-069': { programId: 'SUN-069', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },
  'SUN-070': { programId: 'SUN-070', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },

  // --- PG: Law Degree ---
  'SUN-074': { programId: 'SUN-074', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },
  'SUN-075': { programId: 'SUN-075', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },
  'SUN-076': { programId: 'SUN-076', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },
  'SUN-077': { programId: 'SUN-077', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },

  // --- PG: Relevant Science Degree ---
  'SUN-086': { programId: 'SUN-086', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Chemistry' },
  'SUN-087': { programId: 'SUN-087', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Physics' },
  'SUN-088': { programId: 'SUN-088', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Microbiology / Life Science' },
  'SUN-089': { programId: 'SUN-089', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc in Life Science / Biological Sciences' },
  'SUN-090': { programId: 'SUN-090', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Mathematics' },
  'SUN-091': { programId: 'SUN-091', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc in Forensic Science / Physical / Biological Sciences' },

  // --- PG: Graduation ---
  'SUN-101': { programId: 'SUN-101', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree in Design, Science, or Arts' },
  'SUN-102': { programId: 'SUN-102', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-103': { programId: 'SUN-103', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-104': { programId: 'SUN-104', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-105': { programId: 'SUN-105', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },

  // --- Doctoral: Relevant Master's Degree ---
  'SUN-106': { programId: 'SUN-106', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.E. / M.Tech / MCA in relevant discipline' },
  'SUN-107': { programId: 'SUN-107', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Pharm in relevant specialization' },
  'SUN-108': { programId: 'SUN-108', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'MBA / PGDM in Management' },
  'SUN-109': { programId: 'SUN-109', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Com or Master degree in Finance / Commerce' },
  'SUN-110': { programId: 'SUN-110', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'LL.M. in Law' },
  'SUN-111': { programId: 'SUN-111', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Sc in relevant scientific discipline' },
  'SUN-112': { programId: 'SUN-112', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.A. in English / Linguistics' },
  'SUN-113': { programId: 'SUN-113', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Sc / M.Des / Master in Fashion Design' },
  'SUN-114': { programId: 'SUN-114', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Sc / Master in Cosmetology or related field' },
}

/**
 * Deterministically checks program eligibility according to the master Sandip University Mermaid flow.
 */
export function getProgramEligibility(
  progOrId: SandipMasterProgram | string,
  profile: StudentContextProfile
): ProgramEligibilityResult {
  const p = typeof progOrId === 'string' ? PROGRAMS.find((x) => x.id === progOrId) : progOrId
  if (!p) {
    return { code: 'review', label: 'Under Review', reason: 'Programme details not found in catalogue.' }
  }
  const rule = PROGRAM_ELIGIBILITY_RULES[p.id]
  const field = (profile.previousField || profile.priorProgramme || 'Other').toLowerCase()

  // 1. Doctoral Check
  if (p.level === 'PhD') {
    if (profile.highestQualification !== "Master's degree") {
      return {
        code: 'future',
        label: 'Future pathway',
        reason: 'This is a doctoral programme requiring a relevant Master’s degree.'
      }
    }
    const cat = rule?.category
    if (cat === 'RELEVANT_MASTER') {
      const progName = p.name.toLowerCase()
      if (progName.includes('engineering') && (field.includes('eng') || field.includes('tech') || field.includes('comp'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Engineering.' }
      }
      if (progName.includes('pharmacy') && field.includes('pharm')) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Pharmacy.' }
      }
      if (progName.includes('management') && (field.includes('manag') || field.includes('mba') || field.includes('business'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Management.' }
      }
      if (progName.includes('commerce') && (field.includes('com') || field.includes('fin') || field.includes('account'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Commerce.' }
      }
      if (progName.includes('law') && (field.includes('law') || field.includes('llm'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Law.' }
      }
      if (progName.includes('science') && field.includes('sci')) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Sciences.' }
      }
      if (progName.includes('english') && (field.includes('eng') || field.includes('art') || field.includes('human'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral English.' }
      }
      if (progName.includes('fashion') && (field.includes('fash') || field.includes('design') || field.includes('art'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Fashion.' }
      }
      if (progName.includes('beauty') && (field.includes('beauty') || field.includes('cosmet') || field.includes('sci'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Cosmetology.' }
      }
      return {
        code: 'review',
        label: 'Subject Review Needed',
        reason: 'Master’s degree subject match needs confirmation by research admissions committee.'
      }
    }
  }

  // 2. Undergraduate / Diploma Entry
  if (profile.pathway === 'UG') {
    const stream = (profile.stream || 'ALL').toUpperCase()
    const cat = (rule?.category as UGEligibilityCategory) || 'ANY'

    // "ANY" Stream Programs (BBA, B.Com, BCA, Law, Design)
    if (cat === 'ANY') {
      return {
        code: 'match',
        label: 'Open to All 12th Streams',
        reason: 'Admissions open to all recognized 12th streams (Commerce, Arts, Science, etc.).'
      }
    }

    // Student has unspecified or general stream
    if (stream === 'ALL' || stream === 'OTHER') {
      if (cat === 'PCM') {
        return {
          code: 'review',
          label: 'Requires PCM Stream',
          reason: 'Program requires 12th Physics, Chemistry & Mathematics. Confirm 12th subjects.'
        }
      }
      if (cat === 'PCB_PCM' || cat === 'SCIENCE' || cat === 'SCIENCE_CHEM') {
        return {
          code: 'review',
          label: 'Requires Science Stream',
          reason: 'Program requires 12th Science (PCB/PCM). Confirm 12th subjects.'
        }
      }
      if (cat === 'SCIENCE_MATH' || cat === 'SCIENCE_PHY') {
        return {
          code: 'review',
          label: 'Requires Science + Maths',
          reason: 'Program requires 12th Science with Mathematics. Confirm 12th subjects.'
        }
      }
    }

    // PCM Requirements
    if (cat === 'PCM') {
      if (['PCM', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (PCM)',
          reason: 'Eligible with 12th Physics, Chemistry & Mathematics.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Stream Incompatible',
        reason: 'Requires 12th PCM background (Physics, Chemistry & Mathematics).'
      }
    }

    // PCB / PCM Requirements (Biotech, Biomedical, D.Pharm, B.Pharm)
    if (cat === 'PCB_PCM') {
      if (['PCM', 'PCB', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (PCB/PCM)',
          reason: 'Eligible with 12th Science (PCB or PCM).'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Science (PCB/PCM)',
        reason: 'Requires 12th Science background with Physics, Chemistry and Biology/Maths.'
      }
    }

    // Science General Requirements (Wine Tech, Nanoscience, Microbiology, Forensics)
    if (cat === 'SCIENCE') {
      if (['PCM', 'PCB', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Science)',
          reason: 'Eligible with 12th Science background.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires 12th Science',
        reason: 'Requires 12th Science stream background.'
      }
    }

    // Science + Mathematics (B.Sc CS, B.Sc Computational Math & Data Science)
    if (cat === 'SCIENCE_MATH') {
      if (['PCM', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Science + Math)',
          reason: 'Eligible with 12th Science including Mathematics.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Science + Mathematics',
        reason: 'Requires 12th Science with Mathematics as a compulsory subject.'
      }
    }

    // Science + Chemistry (B.Sc Chemistry)
    if (cat === 'SCIENCE_CHEM') {
      if (['PCM', 'PCB', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Science + Chemistry)',
          reason: 'Eligible with 12th Science including Chemistry.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Science + Chemistry',
        reason: 'Requires 12th Science with Chemistry.'
      }
    }

    // Science + Physics & Mathematics (B.Sc Physics)
    if (cat === 'SCIENCE_PHY') {
      if (['PCM', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Physics & Math)',
          reason: 'Eligible with 12th Science including Physics & Mathematics.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Physics & Mathematics',
        reason: 'Requires 12th Science with Physics and Mathematics.'
      }
    }
  }

  // 3. Postgraduate Entry (PG)
  const cat = (rule?.category as PGEligibilityCategory) || 'ANY_GRAD'

  // Any Graduation (All New Age & MBA 4.0 programs)
  if (cat === 'ANY_GRAD') {
    return {
      code: 'match',
      label: 'Open to Any Graduation',
      reason: 'Open to all recognized Bachelor degrees (B.Tech, BBA, B.Com, B.Sc, B.A, etc.).'
    }
  }

  // Graduation (Design PG: M.Sc Fashion, M.Sc Beauty, M.Des UX, Visual Comm, Game Design)
  if (cat === 'GRADUATION') {
    return {
      code: 'match',
      label: 'Eligible Degree',
      reason: 'Open to graduates from recognized universities with an aptitude for design & creative practice.'
    }
  }

  // Any Graduation, preferably Mathematics (MCA)
  if (cat === 'ANY_GRAD_MATH') {
    if (field.includes('computer') || field.includes('it') || field.includes('science') || field.includes('math') || field.includes('eng') || field.includes('bca')) {
      return {
        code: 'match',
        label: 'Degree Aligned (MCA)',
        reason: 'Prior degree in Computer Science, IT, Engineering, or Science with Mathematics.'
      }
    }
    return {
      code: 'review',
      label: 'Verify Mathematics Prerequisite',
      reason: 'MCA requires Mathematics / Statistics / Computer Science at 10+2 or Bachelor level.'
    }
  }

  // Relevant Engineering (M.Tech programs)
  if (cat === 'RELEVANT_ENG') {
    if (field.includes('engineering') || field.includes('tech') || field.includes('b.tech') || field.includes('computer')) {
      return {
        code: 'match',
        label: 'Engineering Degree Aligned',
        reason: 'Prior degree in B.E. / B.Tech engineering matches entry requirements.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Engineering Degree',
      reason: 'Requires relevant B.E. / B.Tech degree in the engineering branch.'
    }
  }

  // Relevant Engineering / Science (M.Tech Environmental)
  if (cat === 'RELEVANT_ENG_SCI') {
    if (field.includes('engineering') || field.includes('science') || field.includes('env') || field.includes('tech')) {
      return {
        code: 'match',
        label: 'Degree Aligned',
        reason: 'B.Tech or B.Sc in Environmental / Allied Science is recognized.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Engineering or Science',
      reason: 'Requires B.E. / B.Tech or B.Sc in Environmental / Allied Science.'
    }
  }

  // Civil / Architecture (M.Tech Valuation)
  if (cat === 'CIVIL_ARCH') {
    if (field.includes('civil') || field.includes('arch') || field.includes('construction') || field.includes('building')) {
      return {
        code: 'match',
        label: 'Degree Aligned (Civil / Architecture)',
        reason: 'B.E. / B.Tech in Civil Engineering or B.Arch matches requirement.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Civil or Architecture',
      reason: 'Requires B.E./B.Tech in Civil Engineering or B.Arch.'
    }
  }

  // Relevant Degree (M.Planning, M.Tech CSE Cloud / AIML / RPA)
  if (cat === 'RELEVANT_DEGREE') {
    const progName = p.name.toLowerCase()
    if (progName.includes('planning')) {
      if (field.includes('planning') || field.includes('arch') || field.includes('civil') || field.includes('geog')) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Bachelor degree in Planning, Architecture, or Civil.' }
      }
      return { code: 'review', label: 'Check Degree Match', reason: 'Requires relevant degree in Planning, Architecture, or Civil Engineering.' }
    }
    // M.Tech CSE
    if (field.includes('computer') || field.includes('cse') || field.includes('it') || field.includes('mca') || field.includes('engineering')) {
      return { code: 'match', label: 'Degree Aligned (CSE / IT)', reason: 'B.E./B.Tech in CSE/IT or MCA/M.Sc CS matches criteria.' }
    }
    return { code: 'mismatch', label: 'Requires Computer / IT Degree', reason: 'Requires B.E./B.Tech in CSE/IT or equivalent degree.' }
  }

  // B.Pharm (M.Pharm)
  if (cat === 'B_PHARM') {
    if (field.includes('pharm')) {
      return {
        code: 'match',
        label: 'Degree Aligned (B.Pharm)',
        reason: 'Bachelor of Pharmacy (B.Pharm) satisfies PCI eligibility.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires B.Pharm',
      reason: 'Admission requires a Bachelor of Pharmacy (B.Pharm) degree.'
    }
  }

  // Law Degree (LL.M.)
  if (cat === 'LAW_DEGREE') {
    if (field.includes('law') || field.includes('llb')) {
      return {
        code: 'match',
        label: 'Degree Aligned (Law)',
        reason: 'LL.B. degree satisfies Bar Council of India entry criteria.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Law Degree',
      reason: 'Admission requires an LL.B. or 5-year Integrated Law degree.'
    }
  }

  // Relevant Science Degree (M.Sc)
  if (cat === 'RELEVANT_SCI') {
    if (field.includes('science') || field.includes('bsc') || field.includes('chem') || field.includes('phy') || field.includes('bio') || field.includes('math') || field.includes('forensic')) {
      return {
        code: 'match',
        label: 'Science Degree Aligned',
        reason: 'Bachelor of Science (B.Sc) in corresponding discipline matches criteria.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Relevant B.Sc',
      reason: 'Admission requires a Bachelor of Science (B.Sc) in the relevant subject.'
    }
  }

  return {
    code: 'review',
    label: 'Admissions Review',
    reason: `Confirm program entry note: ${p.streamSource || 'Specific degree requirements'}`
  }
}

/**
 * Computes average dimension profile vector for a program's attached domains
 */
export function programmeVector(p: SandipMasterProgram): Record<string, number> {
  const ds = (p.domainIds || [])
    .map((id) => DOMAINS.find((d) => d.id === id))
    .filter(Boolean) as CareerDomain[]
  const vec: Record<string, number> = {}

  for (const d of DIMENSIONS) {
    const vals = ds.map((x) => x.profile[d.id] || 0)
    vec[d.id] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }

  return vec
}

/**
 * Calculates Programme Fit Index blending domain fit (82%) with dimension vector fit (18%)
 */
export function programmeFit(
  p: SandipMasterProgram,
  finalDomains: ScoredDomain[],
  s1Dimensions: DimensionProfileResult
): number {
  const domainMap = Object.fromEntries(finalDomains.map((d) => [d.id, d]))
  const scored = (p.domainIds || [])
    .map((id) => domainMap[id])
    .filter(Boolean)
    .map((d) => d.finalScore ?? d.stage1Fit ?? 0)
    .sort((a, b) => b - a)

  // Primary domain fit is weighted 75%, secondary domain weighted 25%
  // This ensures single-domain programs (like B.Des, BBA, Law, Pharmacy) aren't mathematically penalized
  const domFit = scored.length
    ? 0.75 * scored[0] + 0.25 * (scored.length > 1 ? scored[1] : scored[0])
    : 0

  const dim = s1Dimensions?.scores
    ? cosineScores(s1Dimensions.scores, programmeVector(p))
    : 0

  return Math.round(0.82 * domFit + 0.18 * dim)
}

/**
 * Determines whether a programme matches the student's study level
 */
export function programmeLevelAllowed(
  p: SandipMasterProgram,
  pathway: 'UG' | 'PG',
  highestQualification?: string
): boolean {
  if (pathway === 'UG') return ['UG', 'Diploma'].includes(p.level)
  if (highestQualification === "Master's degree") return p.level === 'PhD'
  return p.level === 'PG'
}

/**
 * Retrieves all matched Sandip University programmes sorted by relative fit
 */
export function getProgramMatches(
  finalDomains: ScoredDomain[],
  s1Dimensions: DimensionProfileResult,
  profile: StudentContextProfile
): MatchedProgram[] {
  return PROGRAMS.filter((p) =>
    programmeLevelAllowed(p, profile.pathway, profile.highestQualification)
  )
    .map((p) => ({
      ...p,
      fit: programmeFit(p, finalDomains, s1Dimensions),
      eligibility: getProgramEligibility(p, profile),
      domains: (p.domainIds || [])
        .map((id) => DOMAINS.find((d) => d.id === id)?.name)
        .filter(Boolean) as string[]
    }))
    .sort((a, b) => b.fit - a.fit || a.name.localeCompare(b.name))
}

/**
 * Selects balanced, diverse recommended programmes preventing any single school from crowding out others
 */
export function selectDiverseRecommendedPrograms(
  matches: MatchedProgram[],
  maxPerSchool = 2,
  totalLimit = 6
): MatchedProgram[] {
  // First consider 'match' programs
  const eligible = matches.filter((m) => m.eligibility.code === 'match')
  const review = matches.filter((m) => m.eligibility.code === 'review')
  const pool = [...eligible, ...review]

  const selected: MatchedProgram[] = []
  const schoolCounts: Record<string, number> = {}

  for (const p of pool) {
    if (selected.length >= totalLimit) break
    const c = schoolCounts[p.school] || 0
    if (c < maxPerSchool) {
      selected.push(p)
      schoolCounts[p.school] = c + 1
    }
  }

  // If slots remain, fill with next best from pool
  if (selected.length < totalLimit) {
    for (const p of pool) {
      if (selected.length >= totalLimit) break
      if (!selected.some((s) => s.id === p.id)) {
        selected.push(p)
      }
    }
  }

  return selected
}
