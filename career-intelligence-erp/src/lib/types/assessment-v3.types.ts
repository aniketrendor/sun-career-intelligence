/**
 * Career Intelligence Assessment Data Types (V3)
 * Sandip University Career Intelligence System (SU-CIS-2026-27-v1)
 */

export type AssessmentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

export type QuestionType = 'single_select' | 'multi_select' | 'rating_scale'

export type AcademicDegreeLevel = 'UG' | 'PG' | 'Diploma' | 'PhD'

export type EligibilityStatus = 
  | 'VERIFIED_ELIGIBLE' 
  | 'CONDITIONAL_REVIEW' 
  | 'INELIGIBLE' 
  | 'UNVERIFIED_DATA'

export interface AssessmentDimension {
  dimension_id: string
  name: string
  definition: string
  status: 'approved' | 'proposed_review_required' | 'draft' | string
}

export interface UniversityCourse {
  program_id: string
  school: string
  level: AcademicDegreeLevel
  course: string
  specialization: string
  suitable_12th_stream: string
  career_domains: string
  notes?: string
  primary_stream?: string
  domain_ids: string[]
  active_status: 'ACTIVE' | 'REVIEW_REQUIRED' | 'DRAFT' | string
}

export interface AnswerOption {
  option_id: string
  question_id: string
  option_label: string
  dimension_id?: string
  score_value: number
  mapping_or_feedback?: string
  is_mutually_exclusive?: boolean
}

export interface AssessmentQuestion {
  question_id: string
  level: AssessmentLevel
  question_type: QuestionType
  raw_type?: string // e.g. 'LIKERT' or 'MCQ' from source
  construct: string
  question_text: string
  dimension_id?: string
  routing_rule?: string
  required: boolean
  status: string
  note?: string
  min_selections?: number
  max_selections?: number
  options: AnswerOption[]
}

export interface CourseDomainMapping {
  program_id: string
  dimension_id: string
  mapping_method: string
  review_status: 'verified' | 'review_required' | 'keyword_proposed' | string
}

export interface RoutingRule {
  level: AssessmentLevel
  rule: string
  description?: string
}

export interface StudentProfileContext {
  fullName?: string
  email?: string
  phone?: string
  academicLevel: AcademicDegreeLevel
  stream?: string // e.g. 'PCM', 'PCB', 'Commerce', 'Arts', 'Diploma'
  previousDegree?: string
  referralCode?: string
  mentorName?: string
}

export interface StudentAnswer {
  question_id: string
  option_id?: string // for single_select
  option_ids?: string[] // for multi_select
  rating_value?: number // for rating_scale (1-5)
  time_spent_ms?: number
}

export interface DimensionScore {
  dimension_id: string
  name: string
  definition: string
  raw_score: number
  normalized_score: number // 0-100
  confidence_level: 'HIGH' | 'MODERATE' | 'EXPLORATORY'
  signals_count: number
}

export interface CourseRecommendation {
  program_id: string
  school: string
  course: string
  specialization: string
  level: AcademicDegreeLevel
  match_score: number // 0-100
  match_tier: 'EXCELLENT_FIT' | 'STRONG_FIT' | 'MODERATE_FIT' | 'EXPLORATORY'
  matched_dimensions: {
    dimension_id: string
    name: string
    score: number
  }[]
  reasons_for_match: string[]
  suggested_specializations: string[]
  eligibility: {
    status: EligibilityStatus
    reason: string
    required_stream?: string
    is_prerequisite_met: boolean
  }
  missing_information?: string[]
  suggested_next_steps: string[]
}

export interface AssessmentResultV3 {
  schema_version: string
  assessment_version: string
  completed_at: string
  profile: StudentProfileContext
  dimension_scores: DimensionScore[]
  top_dimensions: DimensionScore[]
  recommended_courses: CourseRecommendation[]
  primary_course: CourseRecommendation | null
  alternative_courses: CourseRecommendation[]
  level_progress: Record<AssessmentLevel, { total: number; answered: number }>
  guardrails_notice: string[]
  validation_audit: {
    total_questions: number
    total_answered: number
    is_complete: boolean
    has_unverified_data_warnings: boolean
  }
}
