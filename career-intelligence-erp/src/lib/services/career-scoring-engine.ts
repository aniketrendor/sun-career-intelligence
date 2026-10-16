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
 * Selects initial balanced 12 candidates for Stage 2 (max 3 per sector, min 1 per sector)
 */
export function chooseCandidates(ranked: ScoredDomain[]): string[] {
  const out: string[] = []
  const counts: Record<string, number> = {}

  function add(d: ScoredDomain | undefined) {
    if (!d || out.includes(d.id)) return
    const c = counts[d.sector] || 0
    if (c >= 3) return
    out.push(d.id)
    counts[d.sector] = c + 1
  }

  // 1. Pick top overall up to 8
  for (const d of ranked) {
    if (out.length >= 8) break
    add(d)
  }

  // 2. Guarantee representation across all 6 sectors
  for (const sector of SECTORS) {
    if (!out.some((id) => DOMAINS.find((d) => d.id === id)?.sector === sector)) {
      add(ranked.find((d) => d.sector === sector))
    }
  }

  // 3. Fill up to 12
  for (const d of ranked) {
    if (out.length >= 12) break
    add(d)
  }

  // Fallback if needed
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

/**
 * Verifies student eligibility against Sandip University source notes
 */
export function getProgramEligibility(
  p: SandipMasterProgram,
  profile: StudentContextProfile
): ProgramEligibilityResult {
  const req = (p.streamSource || '').toLowerCase().trim()

  if (p.level === 'PhD') {
    if (profile.highestQualification !== "Master's degree") {
      return {
        code: 'future',
        label: 'Future pathway',
        reason:
          'This is a doctoral programme; the supplied list says a relevant master’s degree is needed.'
      }
    }
    if (req.includes('relevant master')) {
      return {
        code: 'review',
        label: 'Check subject fit',
        reason:
          'A relevant master’s degree is indicated in the source; the exact subject fit needs review.'
      }
    }
    return {
      code: 'review',
      label: 'Review entry note',
      reason: 'Check the programme-specific doctoral requirement.'
    }
  }

  if (profile.pathway === 'UG') {
    const st = profile.stream || 'OTHER'
    if (req === 'any stream') {
      return {
        code: 'match',
        label: 'Stream appears aligned',
        reason: 'The source says “Any stream”. This is only a preliminary route indicator.'
      }
    }
    if (req === 'pcm') {
      return ['PCM', 'PCMB'].includes(st)
        ? {
            code: 'match',
            label: 'Stream appears aligned',
            reason: 'The source says PCM; check required subjects and marks.'
          }
        : {
            code: 'mismatch',
            label: 'Stream differs from source note',
            reason:
              'The source notes PCM. This is not an official rejection; confirm alternate routes with admissions.'
          }
    }
    if (req === 'pcb/pcm') {
      return ['PCM', 'PCB', 'PCMB'].includes(st)
        ? {
            code: 'match',
            label: 'Stream appears aligned',
            reason: 'The source notes PCB/PCM; confirm precise subject and marks criteria.'
          }
        : {
            code: 'mismatch',
            label: 'Stream differs from source note',
            reason: 'The source notes PCB/PCM. Ask admissions if other routes apply.'
          }
    }
    if (req === 'science') {
      return ['PCM', 'PCB', 'PCMB'].includes(st)
        ? {
            code: 'match',
            label: 'Science stream noted',
            reason: 'The source says Science; required subjects and marks still need confirmation.'
          }
        : {
            code: 'mismatch',
            label: 'Stream differs from source note',
            reason: 'The source says Science. Ask admissions whether another route applies.'
          }
    }
    if (req.includes('science + mathematics') || req.includes('science + physics')) {
      return ['PCM', 'PCMB'].includes(st)
        ? {
            code: 'review',
            label: 'Subject check needed',
            reason: `The source notes “${p.streamSource}”; the exact subjects must be checked.`
          }
        : {
            code: 'mismatch',
            label: 'Subject combination may differ',
            reason: `The source notes “${p.streamSource}”. Confirm the required subject combination.`
          }
    }
    if (req.includes('science + chemistry')) {
      return ['PCM', 'PCB', 'PCMB'].includes(st)
        ? {
            code: 'review',
            label: 'Subject check needed',
            reason: 'The source notes Science + Chemistry. Confirm the exact subject requirements.'
          }
        : {
            code: 'mismatch',
            label: 'Subject combination may differ',
            reason: 'The source notes Science + Chemistry; ask admissions about alternatives.'
          }
    }
    if (
      req.includes('graduation') ||
      req.includes('relevant engineering') ||
      req.includes('relevant degree') ||
      req.includes('b.pharm') ||
      req.includes('law degree') ||
      req.includes('master')
    ) {
      return {
        code: 'future',
        label: 'Not a direct UG route',
        reason: `The source entry note is “${p.streamSource}”. This is not a typical Class 12 entry note; confirm the intended study level.`
      }
    }
    return {
      code: 'review',
      label: 'Confirm entry route',
      reason: `The source entry note is “${p.streamSource || 'not specified'}”; check the exact subject combination and criteria.`
    }
  }

  // PG Pathway
  const field = (profile.previousField || 'Other').toLowerCase()
  if (req === 'any graduation' || req === 'graduation') {
    return {
      code: 'match',
      label: 'Degree level appears aligned',
      reason: 'The source says graduation/any graduation. Confirm programme-specific subject and marks criteria.'
    }
  }
  if (req.includes('preferably mathematics')) {
    return field.includes('science') || field.includes('computer') || field.includes('commerce')
      ? {
          code: 'review',
          label: 'Check subject fit',
          reason: 'The source prefers Mathematics; the exact prior subjects need confirmation.'
        }
      : {
          code: 'review',
          label: 'Check subject fit',
          reason: 'The source prefers Mathematics; check your transcript and ask admissions.'
        }
  }
  if (req.includes('relevant engineering/science')) {
    return field.includes('engineering') || field.includes('science') || field.includes('computer')
      ? {
          code: 'match',
          label: 'Degree area appears aligned',
          reason: 'The broad degree area appears to match the source note; confirm detailed criteria.'
        }
      : {
          code: 'mismatch',
          label: 'Degree area differs from note',
          reason: 'The source notes relevant engineering/science; ask admissions whether your degree qualifies.'
        }
  }
  if (req.includes('relevant engineering')) {
    return field.includes('engineering') || field.includes('computer')
      ? {
          code: 'match',
          label: 'Degree area appears aligned',
          reason: 'The broad degree area appears related; confirm the exact approved degree list.'
        }
      : {
          code: 'mismatch',
          label: 'Degree area differs from note',
          reason: 'The source notes relevant engineering. Confirm any alternate route with admissions.'
        }
  }
  if (req.includes('relevant science')) {
    return field.includes('science') || field.includes('pharmacy') || field.includes('health')
      ? {
          code: 'match',
          label: 'Degree area appears aligned',
          reason: 'The broad degree area appears related; confirm the exact approved degree list.'
        }
      : {
          code: 'mismatch',
          label: 'Degree area differs from note',
          reason: 'The source notes a relevant science degree. Confirm your degree directly with admissions.'
        }
  }
  if (req === 'civil/architecture') {
    return field.includes('engineering')
      ? {
          code: 'review',
          label: 'Check degree fit',
          reason: 'The source notes Civil/Architecture; confirm your degree title and subjects.'
        }
      : {
          code: 'mismatch',
          label: 'Degree area differs from note',
          reason: 'The source notes Civil/Architecture; confirm alternate routes.'
        }
  }
  if (req === 'b.pharm') {
    return field.includes('pharmacy')
      ? {
          code: 'match',
          label: 'Degree area appears aligned',
          reason: 'The source notes B.Pharm; confirm the programme’s detailed entry criteria.'
        }
      : {
          code: 'mismatch',
          label: 'Degree area differs from note',
          reason: 'The source notes B.Pharm; ask admissions if a different prior degree is accepted.'
        }
  }
  if (req === 'law degree') {
    return field.includes('law')
      ? {
          code: 'match',
          label: 'Degree area appears aligned',
          reason: 'The source notes a Law degree; confirm detailed eligibility.'
        }
      : {
          code: 'mismatch',
          label: 'Degree area differs from note',
          reason: 'The source notes a Law degree; ask admissions about your route.'
        }
  }
  if (req === 'relevant degree') {
    return {
      code: 'review',
      label: 'Manual eligibility review',
      reason: 'The source says relevant degree; relevance needs to be confirmed against programme rules.'
    }
  }
  if (req.includes('relevant master')) {
    return profile.highestQualification === "Master's degree"
      ? {
          code: 'review',
          label: 'Doctoral entry review',
          reason: 'The source requires a relevant master’s degree. Admissions must confirm the subject match.'
        }
      : {
          code: 'future',
          label: 'Future pathway',
          reason: 'The source notes a relevant master’s degree; this is not a direct bachelor-to-master’s route.'
        }
  }

  return {
    code: 'review',
    label: 'Review entry note',
    reason: `The supplied entry note is “${p.streamSource || 'not specified'}”. Confirm the exact prior-degree requirement.`
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

  const domFit = scored.length
    ? 0.65 * scored[0] + 0.35 * (scored.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scored.length))
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
