/**
 * Assessment Orchestrator & Shadow Mode Runner
 * Sandip University Career Intelligence System
 */

import {
  processAssessmentResponses,
  type ResponseRecord,
  type ProcessedAssessment,
} from './assessment-engine'
import {
  runRecommendationEngine,
  type FinalRecommendationOutput,
  type StudentAcademicBackground,
} from './recommendation-engine'
import {
  processV2Assessment,
} from './v2-scoring-adapter'
import type {
  V2ResponseRecord,
  V2AssessmentResult,
} from '@/lib/types/qb-v2.types'
import type { StudentProfileContext } from './v2-hierarchical-router'

export interface UnifiedAssessmentExecutionResult {
  engineMode: 'LEGACY_V1' | 'V2_HIERARCHICAL' | 'V2_SHADOW'
  featureFlagEnabled: boolean
  legacyReport?: FinalRecommendationOutput
  v2Result?: V2AssessmentResult
  shadowDiagnostics?: {
    isTopDomainMatching: boolean
    legacyTopDomain: string
    v2TopDomain: string
    legacyPrimaryProgram: string
    v2PrimaryProgram: string
    isProgramCategoryMatching: boolean
    executionTimestamp: string
  }
}

/**
 * Feature flag checker
 */
export function isV2Enabled(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_CAREER_QB_V2_ENABLED === 'false') return false
    if (process.env.NEXT_PUBLIC_CAREER_QB_V2_ENABLED === 'true' || process.env.CAREER_QB_V2_ENABLED === 'true') return true
  }
  return true
}

/**
 * Shadow mode checker
 */
export function isShadowModeEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_SHADOW_MODE_ENABLED === 'true' || process.env.SHADOW_MODE_ENABLED === 'true'
  }
  return false
}

/**
 * Unified assessment execution runner
 */
export function executeUnifiedAssessment(params: {
  legacyResponses: ResponseRecord[]
  v2Responses?: V2ResponseRecord[]
  profile?: StudentAcademicBackground & StudentProfileContext
  forceV2?: boolean
  forceShadow?: boolean
}): UnifiedAssessmentExecutionResult {
  const shadowActive = params.forceShadow !== undefined ? params.forceShadow : isShadowModeEnabled()
  const v2Active = params.forceV2 !== undefined ? params.forceV2 : (!shadowActive && isV2Enabled())

  const levelVal: 'UG' | 'PG' =
    params.profile?.level === 'PG' || params.profile?.academicLevel === 'PG' ? 'PG' : 'UG'

  const academicProfile: StudentAcademicBackground = {
    level: levelVal,
    stream: params.profile?.stream,
    qualifyingGradePercent: params.profile?.qualifyingPercentage || params.profile?.qualifyingGradePercent,
  }

  const v2ProfileContext: StudentProfileContext = {
    academicLevel: params.profile?.academicLevel || (academicProfile.level === 'PG' ? 'PG' : 'UG'),
    stream: params.profile?.stream,
    qualifyingPercentage: academicProfile.qualifyingGradePercent,
  }

  // ─── 1. Run Legacy Pipeline (Always available for baseline & rollback) ────
  const processedLegacy: ProcessedAssessment = processAssessmentResponses(
    params.legacyResponses,
    undefined,
    academicProfile.level || 'UG'
  )
  const legacyReport: FinalRecommendationOutput = runRecommendationEngine(
    processedLegacy.traitScores,
    processedLegacy.qualityMetrics,
    academicProfile
  )

  // ─── 2. If V2 Enabled: Run V2 Assessment ──────────────────────────────────
  if (v2Active && params.v2Responses && params.v2Responses.length > 0) {
    const v2Result = processV2Assessment(params.v2Responses, v2ProfileContext, {
      featureFlagEnabled: true,
      isShadowMode: false,
    })

    return {
      engineMode: 'V2_HIERARCHICAL',
      featureFlagEnabled: true,
      legacyReport,
      v2Result,
    }
  }

  // ─── 3. If Shadow Mode Active: Run V2 in background and compute metrics ────
  if (shadowActive && params.v2Responses && params.v2Responses.length > 0) {
    const v2Result = processV2Assessment(params.v2Responses, v2ProfileContext, {
      featureFlagEnabled: false,
      isShadowMode: true,
    })

    const legacyTopDomain = legacyReport.primaryDomain?.name || 'N/A'
    const v2TopDomain = v2Result.topDomains[0]?.name || 'N/A'
    const legacyPrimary = legacyReport.primaryPathway?.courseName || 'N/A'
    const v2Primary = v2Result.primaryProgram?.name || 'N/A'

    return {
      engineMode: 'V2_SHADOW',
      featureFlagEnabled: false,
      legacyReport,
      v2Result,
      shadowDiagnostics: {
        isTopDomainMatching: legacyTopDomain.toLowerCase().includes(v2TopDomain.toLowerCase()) || v2TopDomain.toLowerCase().includes(legacyTopDomain.toLowerCase()),
        legacyTopDomain,
        v2TopDomain,
        legacyPrimaryProgram: legacyPrimary,
        v2PrimaryProgram: v2Primary,
        isProgramCategoryMatching: true,
        executionTimestamp: new Date().toISOString(),
      },
    }
  }

  // ─── 4. Default: Return Pure Legacy Report ─────────────────────────────────
  return {
    engineMode: 'LEGACY_V1',
    featureFlagEnabled: false,
    legacyReport,
  }
}
