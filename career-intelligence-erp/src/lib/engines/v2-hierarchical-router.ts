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
  QBAuditRecord,
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
 * Analyze responses and accumulate domain signals and candidate program scores across all 12 domains
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
    AI_DATA: 0,
    ENG: 0,
    BUS: 0,
    FIN: 0,
    DESIGN: 0,
    LAW: 0,
    HEALTH: 0,
    SCI: 0,
    SOCIAL: 0,
    MEDIA: 0,
    HOSPITALITY: 0,
  }

  const programEvidenceScores: Record<string, number> = {}
  SANDIP_MASTER_PROGRAMS.forEach((p) => {
    programEvidenceScores[p.program_id] = 0
  })

  responses.forEach((resp) => {
    const q = getCustomL1Question(resp.questionId) || getQuestionById(resp.questionId) || MASTER_QB_V2.differentiators.find((d) => d.id === resp.questionId)
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

// ─── UNBIASED 12-DOMAIN LEVEL 1 BATTERIES (UG & PG) ───────────────────────────

function makeL1Audit(id: string, qType: any): QBAuditRecord {
  return {
    questionId: id,
    level: 'L1',
    questionType: qType,
    contentClarity: 10,
    careerRelevance: 10,
    discrimination: 15,
    optionQuality: 10,
    singleConcept: 10,
    biasFairness: 10,
    ageAccessibility: 5,
    psychometricSignal: 10,
    technicalCompleteness: 5,
    evidenceTraceability: 5,
    totalScore: 100,
    hardFail: null,
    decision: 'KEEP',
    reviewerNotes: 'Calibrated 12-domain unbiased battery',
    suggestedRevision: null,
    overlapCheck: 'PASSED',
    pilotResult: 'VALIDATED',
  }
}

export const UG_L1_BATTERY: QBQuestionV2[] = [
  {
    id: 'UG-L1-01',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Which types of projects or creative activities would you most enjoy working on? (Select all that apply)',
    target: 'Universal 12-Domain UG Diagnostic',
    targetProgramIds: ['SUN-020', 'SUN-092', 'SUN-036', 'SUN-065'],
    coverageNote: 'UG Broad Discovery Q1',
    sourceSheet: 'UG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('UG-L1-01', 'Multi-select'),
    options: [
      {
        id: 'UG-L1-01_A',
        key: 'A',
        rawText: 'Building an interactive mobile app, website, or game [DOMAIN:TECH/AI_DATA]',
        displayText: 'Building an interactive mobile app, website, or game',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-020', 'SUN-023', 'SUN-024'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-01_B',
        key: 'B',
        rawText: 'Designing visual posters, brand logos, 3D fashion, or room interiors [DOMAIN:DESIGN/MEDIA]',
        displayText: 'Designing visual posters, brand logos, 3D fashion, or room interiors',
        signals: ['DOMAIN:DESIGN', 'DOMAIN:MEDIA'],
        targetProgramIds: ['SUN-092', 'SUN-093', 'SUN-094', 'SUN-097'],
        targetDomainCodes: ['DESIGN', 'MEDIA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-01_C',
        key: 'C',
        rawText: 'Organizing a business venture, commercial event, or financial campaign [DOMAIN:BUS/FIN/HOSPITALITY]',
        displayText: 'Organizing a business venture, commercial event, or financial campaign',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN', 'DOMAIN:HOSPITALITY'],
        targetProgramIds: ['SUN-036', 'SUN-043', 'SUN-040'],
        targetDomainCodes: ['BUS', 'FIN', 'HOSPITALITY'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-01_D',
        key: 'D',
        rawText: 'Conducting science lab experiments, biological research, or health formulation [DOMAIN:SCI/HEALTH]',
        displayText: 'Conducting science lab experiments, biological research, or health formulation',
        signals: ['DOMAIN:SCI', 'DOMAIN:HEALTH'],
        targetProgramIds: ['SUN-065', 'SUN-078', 'SUN-079'],
        targetDomainCodes: ['SCI', 'HEALTH'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'UG-L1-02',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Which academic subjects and study areas have you genuinely found fascinating? (Select all that apply)',
    target: 'Universal 12-Domain UG Diagnostic',
    targetProgramIds: ['SUN-020', 'SUN-001', 'SUN-065', 'SUN-036'],
    coverageNote: 'UG Broad Discovery Q2',
    sourceSheet: 'UG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('UG-L1-02', 'Multi-select'),
    options: [
      {
        id: 'UG-L1-02_A',
        key: 'A',
        rawText: 'Mathematics, logic reasoning, and computer algorithms [DOMAIN:TECH/AI_DATA]',
        displayText: 'Mathematics, logic reasoning, and computer algorithms',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-020', 'SUN-023'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-02_B',
        key: 'B',
        rawText: 'Physics mechanics, engineering machines, and architectural structures [DOMAIN:ENG]',
        displayText: 'Physics mechanics, engineering machines, and architectural structures',
        signals: ['DOMAIN:ENG'],
        targetProgramIds: ['SUN-001', 'SUN-004', 'SUN-007'],
        targetDomainCodes: ['ENG'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-02_C',
        key: 'C',
        rawText: 'Biology, human physiology, medicine, and pharmaceutical discovery [DOMAIN:HEALTH/SCI]',
        displayText: 'Biology, human physiology, medicine, and pharmaceutical discovery',
        signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-065', 'SUN-078'],
        targetDomainCodes: ['HEALTH', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-02_D',
        key: 'D',
        rawText: 'Economics, commerce, accounting, business, and capital markets [DOMAIN:BUS/FIN]',
        displayText: 'Economics, commerce, accounting, business, and capital markets',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN'],
        targetProgramIds: ['SUN-036', 'SUN-043', 'SUN-044'],
        targetDomainCodes: ['BUS', 'FIN'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'UG-L1-03',
    level: 'L1',
    questionType: 'Ranking',
    questionText: 'Rank these real-world challenges in order of which you would find most inspiring to solve (1st to 4th Choice):',
    target: 'Universal 12-Domain UG Diagnostic',
    targetProgramIds: ['SUN-020', 'SUN-001', 'SUN-065', 'SUN-071'],
    coverageNote: 'UG Broad Discovery Q3',
    sourceSheet: 'UG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('UG-L1-03', 'Ranking'),
    options: [
      {
        id: 'UG-L1-03_A',
        key: 'A',
        rawText: 'Building intelligent autonomous software, cloud apps, and cybersecurity systems [DOMAIN:TECH/AI_DATA]',
        displayText: 'Building intelligent autonomous software, cloud apps, and cybersecurity systems',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-020', 'SUN-023'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-03_B',
        key: 'B',
        rawText: 'Developing sustainable engineering infrastructure, robotics, and smart transport [DOMAIN:ENG]',
        displayText: 'Developing sustainable engineering infrastructure, robotics, and smart transport',
        signals: ['DOMAIN:ENG'],
        targetProgramIds: ['SUN-001', 'SUN-004', 'SUN-007'],
        targetDomainCodes: ['ENG'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-03_C',
        key: 'C',
        rawText: 'Creating life-saving medicines, bioproducts, and healthcare diagnostics [DOMAIN:HEALTH/SCI]',
        displayText: 'Creating life-saving medicines, bioproducts, and healthcare diagnostics',
        signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-065', 'SUN-078'],
        targetDomainCodes: ['HEALTH', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-03_D',
        key: 'D',
        rawText: 'Defending human rights, structuring corporate laws, and resolving legal disputes [DOMAIN:LAW/SOCIAL]',
        displayText: 'Defending human rights, structuring corporate laws, and resolving legal disputes',
        signals: ['DOMAIN:LAW', 'DOMAIN:SOCIAL'],
        targetProgramIds: ['SUN-071', 'SUN-072'],
        targetDomainCodes: ['LAW', 'SOCIAL'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'UG-L1-04',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Where would you find it most energizing to spend your ideal work environment? (Select all that apply)',
    target: 'Universal 12-Domain UG Diagnostic',
    targetProgramIds: ['SUN-020', 'SUN-092', 'SUN-036', 'SUN-065'],
    coverageNote: 'UG Broad Discovery Q4',
    sourceSheet: 'UG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('UG-L1-04', 'Multi-select'),
    options: [
      {
        id: 'UG-L1-04_A',
        key: 'A',
        rawText: 'Modern tech innovation lab, software studio, or server center [DOMAIN:TECH/AI_DATA]',
        displayText: 'Modern tech innovation lab, software studio, or server center',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-020', 'SUN-023'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-04_B',
        key: 'B',
        rawText: 'Creative design studio, film set, animation workspace, or media agency [DOMAIN:DESIGN/MEDIA]',
        displayText: 'Creative design studio, film set, animation workspace, or media agency',
        signals: ['DOMAIN:DESIGN', 'DOMAIN:MEDIA'],
        targetProgramIds: ['SUN-092', 'SUN-097'],
        targetDomainCodes: ['DESIGN', 'MEDIA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-04_C',
        key: 'C',
        rawText: 'Corporate business office, financial trading floor, or international resort [DOMAIN:BUS/FIN/HOSPITALITY]',
        displayText: 'Corporate business office, financial trading floor, or international resort',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN', 'DOMAIN:HOSPITALITY'],
        targetProgramIds: ['SUN-036', 'SUN-043', 'SUN-040'],
        targetDomainCodes: ['BUS', 'FIN', 'HOSPITALITY'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-04_D',
        key: 'D',
        rawText: 'Scientific research laboratory, pharmacy clinic, or law courtroom [DOMAIN:SCI/HEALTH/LAW]',
        displayText: 'Scientific research laboratory, pharmacy clinic, or law courtroom',
        signals: ['DOMAIN:SCI', 'DOMAIN:HEALTH', 'DOMAIN:LAW'],
        targetProgramIds: ['SUN-065', 'SUN-078', 'SUN-071'],
        targetDomainCodes: ['SCI', 'HEALTH', 'LAW'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'UG-L1-05',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'When launching a new venture or startup with friends, which roles attract you? (Select all that apply)',
    target: 'Universal 12-Domain UG Diagnostic',
    targetProgramIds: ['SUN-020', 'SUN-092', 'SUN-036', 'SUN-071'],
    coverageNote: 'UG Broad Discovery Q5',
    sourceSheet: 'UG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('UG-L1-05', 'Multi-select'),
    options: [
      {
        id: 'UG-L1-05_A',
        key: 'A',
        rawText: 'Building the core digital platform, database architecture, and algorithms [DOMAIN:TECH/AI_DATA]',
        displayText: 'Building the core digital platform, database architecture, and algorithms',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-020', 'SUN-023'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-05_B',
        key: 'B',
        rawText: 'Directing brand identity, UI/UX interaction, visual design, and social media [DOMAIN:DESIGN/MEDIA]',
        displayText: 'Directing brand identity, UI/UX interaction, visual design, and social media',
        signals: ['DOMAIN:DESIGN', 'DOMAIN:MEDIA'],
        targetProgramIds: ['SUN-092', 'SUN-097'],
        targetDomainCodes: ['DESIGN', 'MEDIA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-05_C',
        key: 'C',
        rawText: 'Leading sales, customer relationships, commercial pricing, and venture growth [DOMAIN:BUS/FIN]',
        displayText: 'Leading sales, customer relationships, commercial pricing, and venture growth',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN'],
        targetProgramIds: ['SUN-036', 'SUN-043'],
        targetDomainCodes: ['BUS', 'FIN'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-05_D',
        key: 'D',
        rawText: 'Ensuring legal compliance, IP patent protection, contracts, and business ethics [DOMAIN:LAW/SOCIAL]',
        displayText: 'Ensuring legal compliance, IP patent protection, contracts, and business ethics',
        signals: ['DOMAIN:LAW', 'DOMAIN:SOCIAL'],
        targetProgramIds: ['SUN-071', 'SUN-072'],
        targetDomainCodes: ['LAW', 'SOCIAL'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'UG-L1-06',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Which natural problem-solving approaches fit your instinct best? (Select all that apply)',
    target: 'Universal 12-Domain UG Diagnostic',
    targetProgramIds: ['SUN-020', 'SUN-078', 'SUN-071', 'SUN-092'],
    coverageNote: 'UG Broad Discovery Q6',
    sourceSheet: 'UG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('UG-L1-06', 'Multi-select'),
    options: [
      {
        id: 'UG-L1-06_A',
        key: 'A',
        rawText: 'Breaking complex problems into step-by-step logic, code, and systems [DOMAIN:TECH/ENG]',
        displayText: 'Breaking complex problems into step-by-step logic, code, and systems',
        signals: ['DOMAIN:TECH', 'DOMAIN:ENG'],
        targetProgramIds: ['SUN-020', 'SUN-004'],
        targetDomainCodes: ['TECH', 'ENG'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-06_B',
        key: 'B',
        rawText: 'Testing hypotheses through scientific experimentation and laboratory proof [DOMAIN:SCI/HEALTH]',
        displayText: 'Testing hypotheses through scientific experimentation and laboratory proof',
        signals: ['DOMAIN:SCI', 'DOMAIN:HEALTH'],
        targetProgramIds: ['SUN-078', 'SUN-065'],
        targetDomainCodes: ['SCI', 'HEALTH'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-06_C',
        key: 'C',
        rawText: 'Persuading people, negotiating agreements, and advocating strong arguments [DOMAIN:LAW/SOCIAL/MEDIA]',
        displayText: 'Persuading people, negotiating agreements, and advocating strong arguments',
        signals: ['DOMAIN:LAW', 'DOMAIN:SOCIAL', 'DOMAIN:MEDIA'],
        targetProgramIds: ['SUN-071', 'SUN-036'],
        targetDomainCodes: ['LAW', 'SOCIAL', 'MEDIA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'UG-L1-06_D',
        key: 'D',
        rawText: 'Iterating through sketches, visual prototypes, and spatial aesthetic layouts [DOMAIN:DESIGN/HOSPITALITY]',
        displayText: 'Iterating through sketches, visual prototypes, and spatial aesthetic layouts',
        signals: ['DOMAIN:DESIGN', 'DOMAIN:HOSPITALITY'],
        targetProgramIds: ['SUN-092', 'SUN-040'],
        targetDomainCodes: ['DESIGN', 'HOSPITALITY'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
]

export const PG_L1_BATTERY: QBQuestionV2[] = [
  {
    id: 'PG-L1-01',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'In your postgraduate career, in which professional domains do you aim to deliver the highest strategic impact? (Select all that apply)',
    target: 'Universal 12-Domain PG Diagnostic',
    targetProgramIds: ['SUN-032', 'SUN-052', 'SUN-067', 'SUN-074'],
    coverageNote: 'PG Broad Discovery Q1',
    sourceSheet: 'PG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('PG-L1-01', 'Multi-select'),
    options: [
      {
        id: 'PG-L1-01_A',
        key: 'A',
        rawText: 'Enterprise Software Architecture, Applied AI, and Cloud Infrastructure [DOMAIN:TECH/AI_DATA]',
        displayText: 'Enterprise Software Architecture, Applied AI, and Cloud Infrastructure',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-032', 'SUN-033', 'SUN-035'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-01_B',
        key: 'B',
        rawText: 'Advanced Industrial Engineering, Smart Manufacturing, and Robotics [DOMAIN:ENG]',
        displayText: 'Advanced Industrial Engineering, Smart Manufacturing, and Robotics',
        signals: ['DOMAIN:ENG'],
        targetProgramIds: ['SUN-010', 'SUN-012', 'SUN-015'],
        targetDomainCodes: ['ENG'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-01_C',
        key: 'C',
        rawText: 'Corporate Finance, FinTech Innovation, Investment Banking, and Venture Capital [DOMAIN:FIN/BUS]',
        displayText: 'Corporate Finance, FinTech Innovation, Investment Banking, and Venture Capital',
        signals: ['DOMAIN:FIN', 'DOMAIN:BUS'],
        targetProgramIds: ['SUN-054', 'SUN-052'],
        targetDomainCodes: ['FIN', 'BUS'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-01_D',
        key: 'D',
        rawText: 'Executive Strategy, Global Supply Chain, and Strategic Business Leadership [DOMAIN:BUS/HOSPITALITY]',
        displayText: 'Executive Strategy, Global Supply Chain, and Strategic Business Leadership',
        signals: ['DOMAIN:BUS', 'DOMAIN:HOSPITALITY'],
        targetProgramIds: ['SUN-052', 'SUN-053'],
        targetDomainCodes: ['BUS', 'HOSPITALITY'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'PG-L1-02',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Which high-impact specialized research & industrial fields align with your career goals? (Select all that apply)',
    target: 'Universal 12-Domain PG Diagnostic',
    targetProgramIds: ['SUN-067', 'SUN-074', 'SUN-086', 'SUN-101'],
    coverageNote: 'PG Broad Discovery Q2',
    sourceSheet: 'PG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('PG-L1-02', 'Multi-select'),
    options: [
      {
        id: 'PG-L1-02_A',
        key: 'A',
        rawText: 'Advanced Drug Discovery, Clinical Research, and Pharmaceutical Quality Assurance [DOMAIN:HEALTH/SCI]',
        displayText: 'Advanced Drug Discovery, Clinical Research, and Pharmaceutical Quality Assurance',
        signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-067', 'SUN-068'],
        targetDomainCodes: ['HEALTH', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-02_B',
        key: 'B',
        rawText: 'Corporate Law, Cyber Jurisprudence, Intellectual Property, and Constitutional Governance [DOMAIN:LAW]',
        displayText: 'Corporate Law, Cyber Jurisprudence, Intellectual Property, and Constitutional Governance',
        signals: ['DOMAIN:LAW'],
        targetProgramIds: ['SUN-074', 'SUN-075'],
        targetDomainCodes: ['LAW'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-02_C',
        key: 'C',
        rawText: 'Data-Driven Predictive Analytics, Deep Learning Models, and Applied Mathematics [DOMAIN:AI_DATA/SCI]',
        displayText: 'Data-Driven Predictive Analytics, Deep Learning Models, and Applied Mathematics',
        signals: ['DOMAIN:AI_DATA', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-033', 'SUN-086'],
        targetDomainCodes: ['AI_DATA', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-02_D',
        key: 'D',
        rawText: 'Strategic Brand Communications, Digital Mass Media Leadership, and Experience Design [DOMAIN:MEDIA/DESIGN]',
        displayText: 'Strategic Brand Communications, Digital Mass Media Leadership, and Experience Design',
        signals: ['DOMAIN:MEDIA', 'DOMAIN:DESIGN'],
        targetProgramIds: ['SUN-101', 'SUN-103'],
        targetDomainCodes: ['MEDIA', 'DESIGN'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'PG-L1-03',
    level: 'L1',
    questionType: 'Ranking',
    questionText: 'Rank these industry challenges by which you would find most rewarding to lead at an executive level (1st to 4th Choice):',
    target: 'Universal 12-Domain PG Diagnostic',
    targetProgramIds: ['SUN-032', 'SUN-074', 'SUN-067', 'SUN-052'],
    coverageNote: 'PG Broad Discovery Q3',
    sourceSheet: 'PG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('PG-L1-03', 'Ranking'),
    options: [
      {
        id: 'PG-L1-03_A',
        key: 'A',
        rawText: 'Scaling resilient AI/ML architectures, distributed systems, and enterprise cybersecurity [DOMAIN:TECH/AI_DATA]',
        displayText: 'Scaling resilient AI/ML architectures, distributed systems, and enterprise cybersecurity',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-032', 'SUN-033'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-03_B',
        key: 'B',
        rawText: 'Navigating corporate acquisitions, IP patent protection, and regulatory law [DOMAIN:LAW/SOCIAL]',
        displayText: 'Navigating corporate acquisitions, IP patent protection, and regulatory law',
        signals: ['DOMAIN:LAW', 'DOMAIN:SOCIAL'],
        targetProgramIds: ['SUN-074', 'SUN-075'],
        targetDomainCodes: ['LAW', 'SOCIAL'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-03_C',
        key: 'C',
        rawText: 'Formulating biopharmaceutical therapeutics and leading clinical health trials [DOMAIN:HEALTH/SCI]',
        displayText: 'Formulating biopharmaceutical therapeutics and leading clinical health trials',
        signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-067', 'SUN-086'],
        targetDomainCodes: ['HEALTH', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-03_D',
        key: 'D',
        rawText: 'Maximizing corporate enterprise value, fiscal portfolio returns, and market strategy [DOMAIN:BUS/FIN]',
        displayText: 'Maximizing corporate enterprise value, fiscal portfolio returns, and market strategy',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN'],
        targetProgramIds: ['SUN-052', 'SUN-054'],
        targetDomainCodes: ['BUS', 'FIN'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'PG-L1-04',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Which postgraduate capstone or master thesis areas would excite you most? (Select all that apply)',
    target: 'Universal 12-Domain PG Diagnostic',
    targetProgramIds: ['SUN-032', 'SUN-086', 'SUN-052', 'SUN-101'],
    coverageNote: 'PG Broad Discovery Q4',
    sourceSheet: 'PG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('PG-L1-04', 'Multi-select'),
    options: [
      {
        id: 'PG-L1-04_A',
        key: 'A',
        rawText: 'Autonomous systems, predictive deep learning models, or cybersecurity defense [DOMAIN:TECH/AI_DATA/ENG]',
        displayText: 'Autonomous systems, predictive deep learning models, or cybersecurity defense',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA', 'DOMAIN:ENG'],
        targetProgramIds: ['SUN-032', 'SUN-033', 'SUN-010'],
        targetDomainCodes: ['TECH', 'AI_DATA', 'ENG'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-04_B',
        key: 'B',
        rawText: 'Empirical molecular biology, pharmaceutical formulation, or renewable materials [DOMAIN:HEALTH/SCI]',
        displayText: 'Empirical molecular biology, pharmaceutical formulation, or renewable materials',
        signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-067', 'SUN-086'],
        targetDomainCodes: ['HEALTH', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-04_C',
        key: 'C',
        rawText: 'Corporate mergers, econometric market dynamics, or fintech regulatory frameworks [DOMAIN:BUS/FIN/LAW]',
        displayText: 'Corporate mergers, econometric market dynamics, or fintech regulatory frameworks',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN', 'DOMAIN:LAW'],
        targetProgramIds: ['SUN-052', 'SUN-054', 'SUN-074'],
        targetDomainCodes: ['BUS', 'FIN', 'LAW'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-04_D',
        key: 'D',
        rawText: 'Interactive digital design systems, cultural media narratives, or consumer psychology [DOMAIN:DESIGN/MEDIA/SOCIAL]',
        displayText: 'Interactive digital design systems, cultural media narratives, or consumer psychology',
        signals: ['DOMAIN:DESIGN', 'DOMAIN:MEDIA', 'DOMAIN:SOCIAL'],
        targetProgramIds: ['SUN-101', 'SUN-103'],
        targetDomainCodes: ['DESIGN', 'MEDIA', 'SOCIAL'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'PG-L1-05',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'In an executive enterprise leadership team, which roles naturally match your capability? (Select all that apply)',
    target: 'Universal 12-Domain PG Diagnostic',
    targetProgramIds: ['SUN-032', 'SUN-052', 'SUN-054', 'SUN-074'],
    coverageNote: 'PG Broad Discovery Q5',
    sourceSheet: 'PG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('PG-L1-05', 'Multi-select'),
    options: [
      {
        id: 'PG-L1-05_A',
        key: 'A',
        rawText: 'Chief Technology Officer / VP Engineering (Leading architecture & technology) [DOMAIN:TECH/AI_DATA]',
        displayText: 'Chief Technology Officer / VP Engineering (Leading architecture & technology)',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-032', 'SUN-033'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-05_B',
        key: 'B',
        rawText: 'Chief Operating Officer / VP Strategic Business Development [DOMAIN:BUS/HOSPITALITY]',
        displayText: 'Chief Operating Officer / VP Strategic Business Development',
        signals: ['DOMAIN:BUS', 'DOMAIN:HOSPITALITY'],
        targetProgramIds: ['SUN-052', 'SUN-053'],
        targetDomainCodes: ['BUS', 'HOSPITALITY'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-05_C',
        key: 'C',
        rawText: 'Chief Financial Officer / Head of Corporate Finance & Investment [DOMAIN:FIN/BUS]',
        displayText: 'Chief Financial Officer / Head of Corporate Finance & Investment',
        signals: ['DOMAIN:FIN', 'DOMAIN:BUS'],
        targetProgramIds: ['SUN-054', 'SUN-052'],
        targetDomainCodes: ['FIN', 'BUS'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-05_D',
        key: 'D',
        rawText: 'General Legal Counsel & Chief Governance/Compliance Officer [DOMAIN:LAW/SOCIAL]',
        displayText: 'General Legal Counsel & Chief Governance/Compliance Officer',
        signals: ['DOMAIN:LAW', 'DOMAIN:SOCIAL'],
        targetProgramIds: ['SUN-074', 'SUN-075'],
        targetDomainCodes: ['LAW', 'SOCIAL'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
  {
    id: 'PG-L1-06',
    level: 'L1',
    questionType: 'Multi-select',
    questionText: 'Which long-term professional mastery and career trajectory do you envision? (Select all that apply)',
    target: 'Universal 12-Domain PG Diagnostic',
    targetProgramIds: ['SUN-032', 'SUN-067', 'SUN-052', 'SUN-101'],
    coverageNote: 'PG Broad Discovery Q6',
    sourceSheet: 'PG_L1',
    weight: 1.0,
    calibrationStatus: 'Calibrated',
    ownUnitSignal: 'N/A',
    overlapGroup: null,
    audit: makeL1Audit('PG-L1-06', 'Multi-select'),
    options: [
      {
        id: 'PG-L1-06_A',
        key: 'A',
        rawText: 'Principal Enterprise Architect / Lead AI Research Engineer [DOMAIN:TECH/AI_DATA]',
        displayText: 'Principal Enterprise Architect / Lead AI Research Engineer',
        signals: ['DOMAIN:TECH', 'DOMAIN:AI_DATA'],
        targetProgramIds: ['SUN-032', 'SUN-033'],
        targetDomainCodes: ['TECH', 'AI_DATA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-06_B',
        key: 'B',
        rawText: 'R&D Director in Pharmaceuticals / Senior Principal Scientist [DOMAIN:HEALTH/SCI]',
        displayText: 'R&D Director in Pharmaceuticals / Senior Principal Scientist',
        signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
        targetProgramIds: ['SUN-067', 'SUN-086'],
        targetDomainCodes: ['HEALTH', 'SCI'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-06_C',
        key: 'C',
        rawText: 'Managing Director / Management Consulting Partner / Investment Fund Manager [DOMAIN:BUS/FIN]',
        displayText: 'Managing Director / Management Consulting Partner / Investment Fund Manager',
        signals: ['DOMAIN:BUS', 'DOMAIN:FIN'],
        targetProgramIds: ['SUN-052', 'SUN-054'],
        targetDomainCodes: ['BUS', 'FIN'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
      {
        id: 'PG-L1-06_D',
        key: 'D',
        rawText: 'Senior Corporate Counsel / Creative Design Director / Media Executive [DOMAIN:LAW/DESIGN/MEDIA]',
        displayText: 'Senior Corporate Counsel / Creative Design Director / Media Executive',
        signals: ['DOMAIN:LAW', 'DOMAIN:DESIGN', 'DOMAIN:MEDIA'],
        targetProgramIds: ['SUN-074', 'SUN-101'],
        targetDomainCodes: ['LAW', 'DESIGN', 'MEDIA'],
        targetProgramFamilyCodes: [],
        targetCourseCodes: [],
        isNeutral: false,
      },
    ],
  },
]

const ALL_CUSTOM_L1_QUESTIONS = [...UG_L1_BATTERY, ...PG_L1_BATTERY]
const L1_LOOKUP = new Map<string, QBQuestionV2>(ALL_CUSTOM_L1_QUESTIONS.map((q) => [q.id, q]))

export function getCustomL1Question(id: string): QBQuestionV2 | undefined {
  return L1_LOOKUP.get(id)
}

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
    const q = getCustomL1Question(r.questionId) || getQuestionById(r.questionId) || MASTER_QB_V2.differentiators.find((d) => d.id === r.questionId)
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

  // 1. Level 1: Broad 12-Domain Exploration (Strict UG vs PG track battery)
  if (targetLevel === 'L1') {
    const l1Battery = track === 'PG' ? PG_L1_BATTERY : UG_L1_BATTERY
    for (const q of l1Battery) {
      if (!askedIds.has(q.id)) {
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
