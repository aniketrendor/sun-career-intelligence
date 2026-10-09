/**
 * Master Question Bank V2 & Audit Loader
 * Provides indexed, typed, memory-efficient access to the 891 questions and 22 differentiators.
 */

import masterQbData from '@/lib/data/qb-v2/master-qb-891.json'
import auditFrameworkData from '@/lib/data/qb-v2/audit-framework-891.json'
import overlapClustersData from '@/lib/data/qb-v2/overlap-clusters.json'
import type {
  QBQuestionV2,
  QBDifferentiator,
  QBOverlapCluster,
  QBAuditRecord,
  AssessmentLevelV2,
} from '@/lib/types/qb-v2.types'

export interface MasterQBRegistry {
  version: string
  importedAt: string
  sourceWorkbook: string
  totalQuestions: number
  totalDifferentiators: number
  questions: QBQuestionV2[]
  differentiators: QBDifferentiator[]
  overlapClusters: QBOverlapCluster[]
}

const rawQB = masterQbData as any
const rawAudit = auditFrameworkData as any
const rawOverlap = overlapClustersData as any

export const MASTER_QB_V2: MasterQBRegistry = {
  version: rawQB.version || '2.0.0-phase1',
  importedAt: rawQB.importedAt || new Date().toISOString(),
  sourceWorkbook: rawQB.sourceWorkbook || 'Sandip_Career_QB_Phase1 (1).xlsx',
  totalQuestions: rawQB.totalQuestions || rawQB.questions.length,
  totalDifferentiators: rawQB.totalDifferentiators || rawQB.differentiators.length,
  questions: rawQB.questions as QBQuestionV2[],
  differentiators: rawQB.differentiators as QBDifferentiator[],
  overlapClusters: rawOverlap.clusters as QBOverlapCluster[],
}

// ─── Fast Lookups & Indices ───────────────────────────────────────────────────

const questionMap = new Map<string, QBQuestionV2>()
const questionsByLevel = new Map<AssessmentLevelV2, QBQuestionV2[]>()
const questionsByTargetProgram = new Map<string, QBQuestionV2[]>()
const questionsByDomain = new Map<string, QBQuestionV2[]>()
const differentiatorMap = new Map<string, QBDifferentiator>()
const differentiatorsByTwinUnits = new Map<string, QBDifferentiator[]>()

// Initialize index structures
MASTER_QB_V2.questions.forEach((q) => {
  questionMap.set(q.id, q)

  // Level index
  const lvlList = questionsByLevel.get(q.level) || []
  lvlList.push(q)
  questionsByLevel.set(q.level, lvlList)

  // Target Program index
  q.targetProgramIds.forEach((pid) => {
    const pList = questionsByTargetProgram.get(pid) || []
    pList.push(q)
    questionsByTargetProgram.set(pid, pList)
  })

  // Option signals index
  q.options.forEach((opt) => {
    opt.targetProgramIds.forEach((pid) => {
      const pList = questionsByTargetProgram.get(pid) || []
      if (!pList.some((existing) => existing.id === q.id)) {
        pList.push(q)
        questionsByTargetProgram.set(pid, pList)
      }
    })

    opt.targetDomainCodes.forEach((d) => {
      const dList = questionsByDomain.get(d) || []
      if (!dList.some((existing) => existing.id === q.id)) {
        dList.push(q)
        questionsByDomain.set(d, dList)
      }
    })
  })
})

MASTER_QB_V2.differentiators.forEach((diff) => {
  differentiatorMap.set(diff.id, diff)
  diff.twinUnits.forEach((u) => {
    const list = differentiatorsByTwinUnits.get(u) || []
    list.push(diff)
    differentiatorsByTwinUnits.set(u, list)
  })
})

/**
 * Retrieve a question by its exact stable ID
 */
export function getQuestionById(id: string): QBQuestionV2 | undefined {
  return questionMap.get(id)
}

/**
 * Retrieve all questions for a specific assessment level (L1, L2, L3, L4, L5)
 */
export function getQuestionsByLevel(level: AssessmentLevelV2): QBQuestionV2[] {
  return questionsByLevel.get(level) || []
}

/**
 * Retrieve questions relevant to a specific target Sandip University program ID (e.g. 'SUN-020')
 */
export function getQuestionsForProgram(programId: string): QBQuestionV2[] {
  return questionsByTargetProgram.get(programId) || []
}

/**
 * Retrieve questions relevant to a specific career domain (e.g. 'TECH', 'BUS', 'DESIGN')
 */
export function getQuestionsForDomain(domainCode: string): QBQuestionV2[] {
  return questionsByDomain.get(domainCode) || []
}

/**
 * Retrieve differentiator questions targeting a specific set of competing program IDs
 */
export function getDifferentiatorsForPrograms(programIds: string[]): QBDifferentiator[] {
  const result: QBDifferentiator[] = []
  const idSet = new Set(programIds)

  MASTER_QB_V2.differentiators.forEach((diff) => {
    // Check if diff distinguishes at least two programs from the candidate set
    const matchCount = diff.twinUnits.filter((u) => idSet.has(u)).length
    if (matchCount >= 2 && !result.some((r) => r.id === diff.id)) {
      result.push(diff)
    }
  })

  return result
}

/**
 * Retrieve full audit record for a given question ID
 */
export function getAuditRecord(questionId: string): QBAuditRecord | undefined {
  return rawAudit.auditRecords?.[questionId]
}
