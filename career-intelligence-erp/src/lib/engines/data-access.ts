/**
 * Typed Data Access Layer for Sandip University Career Intelligence Assessment
 * Sandip University (SU-CIS-2026-27-v1)
 */

import rawData from '@/lib/data/su-career-intelligence-production-data.json'
import type {
  AssessmentDimension,
  UniversityCourse,
  AssessmentQuestion,
  AnswerOption,
  CourseDomainMapping,
  RoutingRule,
  AssessmentLevel,
  QuestionType,
  AcademicDegreeLevel,
} from '@/lib/types/assessment-v3.types'

// Raw JSON typed interfaces
interface RawDataset {
  schema_version: string
  assessment_version: string
  status: string
  source: {
    file: string
    academic_year: string
    source_url: string
  }
  dimensions: AssessmentDimension[]
  courses: Array<{
    program_id: string
    school: string
    level: string
    course: string
    specialization: string
    suitable_12th_stream: string
    career_domains: string
    notes?: string
    primary_stream?: string
    domain_ids: string[]
    active_status: string
  }>
  questions: Array<{
    question_id: string
    level: string
    question_type: string
    construct: string
    question_text: string
    dimension_id?: string
    routing_rule?: string
    required: boolean
    status: string
    note?: string
    min_selections?: number
    max_selections?: number
  }>
  answer_options: Array<{
    option_id: string
    question_id: string
    option_label: string
    dimension_id?: string
    score_value: number
    mapping_or_feedback?: string
    is_mutually_exclusive?: boolean
  }>
  course_domain_mappings: Array<{
    program_id: string
    dimension_id: string
    mapping_method: string
    review_status: string
  }>
  routing_rules: Array<{
    level: string
    rule: string
    description?: string
  }>
  production_guardrails: string[]
}

const dataset = rawData as unknown as RawDataset

// Normalize questions with attached answer options & standard question_type
const parsedQuestions: AssessmentQuestion[] = dataset.questions.map((q) => {
  let options: AnswerOption[] = dataset.answer_options
    .filter((opt) => opt.question_id === q.question_id)
    .map((opt) => ({
      option_id: opt.option_id,
      question_id: opt.question_id,
      option_label: opt.option_label,
      dimension_id: opt.dimension_id || undefined,
      score_value: typeof opt.score_value === 'number' ? opt.score_value : 1,
      mapping_or_feedback: opt.mapping_or_feedback,
      is_mutually_exclusive: opt.is_mutually_exclusive ?? (opt.option_label.toLowerCase().includes('none of') || opt.option_label.toLowerCase().includes('not sure')),
    }))

  // Populate dynamic options for catalog questions if only placeholder exists
  if (q.question_id === 'L3-006' && (options.length <= 1 || options.some(o => o.option_label.includes('populated from')))) {
    options = [
      {
        option_id: 'L3-006-A',
        question_id: 'L3-006',
        option_label: 'B.Tech in Computer Science & Engineering (AI, Cloud & Security)',
        dimension_id: 'TECHNOLOGY',
        score_value: 5,
        mapping_or_feedback: 'Technology & Computing pathway',
      },
      {
        option_id: 'L3-006-B',
        question_id: 'L3-006',
        option_label: 'BBA in Financial Management & Business Analytics',
        dimension_id: 'BUSINESS',
        score_value: 5,
        mapping_or_feedback: 'Business & Management pathway',
      },
      {
        option_id: 'L3-006-C',
        question_id: 'L3-006',
        option_label: 'B.Pharm in Pharmaceutical Sciences & Drug Formulation',
        dimension_id: 'HEALTH_PHARMA',
        score_value: 5,
        mapping_or_feedback: 'Health & Pharmacy pathway',
      },
      {
        option_id: 'L3-006-D',
        question_id: 'L3-006',
        option_label: 'B.Des in User Experience (UX) & Product Design',
        dimension_id: 'DESIGN',
        score_value: 5,
        mapping_or_feedback: 'Design & Creativity pathway',
      },
      {
        option_id: 'L3-006-E',
        question_id: 'L3-006',
        option_label: 'B.A. LL.B (Hons) in Cyber & Corporate Law',
        dimension_id: 'LAW',
        score_value: 5,
        mapping_or_feedback: 'Law & Legal Systems pathway',
      },
      {
        option_id: 'L3-006-F',
        question_id: 'L3-006',
        option_label: 'B.Sc in Applied Data Science & Statistical Analytics',
        dimension_id: 'ANALYTICS',
        score_value: 5,
        mapping_or_feedback: 'Analytics & Data pathway',
      },
    ]
  } else if (q.question_id === 'L4-008' && (options.length <= 1 || options.some(o => o.option_label.includes('populated from')))) {
    options = [
      {
        option_id: 'L4-008-A',
        question_id: 'L4-008',
        option_label: 'Artificial Intelligence & ML vs Cloud Architecture',
        dimension_id: 'TECHNOLOGY',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-B',
        question_id: 'L4-008',
        option_label: 'Financial Technology (FinTech) vs Marketing Analytics',
        dimension_id: 'BUSINESS',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-C',
        question_id: 'L4-008',
        option_label: 'Clinical Research vs Drug Formulation & Quality Control',
        dimension_id: 'HEALTH_PHARMA',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-D',
        question_id: 'L4-008',
        option_label: 'UI/UX Interactive Systems vs Spatial/Interior Design',
        dimension_id: 'DESIGN',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-E',
        question_id: 'L4-008',
        option_label: 'Corporate Compliance vs Cyber Law & Digital Forensics',
        dimension_id: 'LAW',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-F',
        question_id: 'L4-008',
        option_label: 'Business Intelligence vs Predictive Modelling & Big Data',
        dimension_id: 'ANALYTICS',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
    ]
  }

  // Map raw type to standard 3 question types
  let resolvedType: QuestionType = 'single_select'
  if (q.question_type === 'LIKERT') {
    resolvedType = 'rating_scale'
  } else if (q.question_type === 'MCQ') {
    // For interest/preference multi-domain questions (especially L2, L3, L4 multi-domain exploration), enable multi-select
    if (q.level === 'L1' || q.level === 'L2' || q.level === 'L3' || q.level === 'L4' || q.construct.toLowerCase().includes('multi') || q.construct.toLowerCase().includes('preference')) {
      resolvedType = 'multi_select'
    } else {
      resolvedType = 'single_select'
    }
  }

  let displayNote = q.note
  if (q.question_id === 'L3-006') {
    displayNote = 'Select the academic pathways and course streams that interest you most.'
  } else if (q.question_id === 'L4-008') {
    displayNote = 'Select the specialization comparison you would like to discuss with an academic advisor.'
  }

  return {
    question_id: q.question_id,
    level: q.level as AssessmentLevel,
    question_type: resolvedType,
    raw_type: q.question_type,
    construct: q.construct,
    question_text: q.question_text,
    dimension_id: q.dimension_id || undefined,
    routing_rule: q.routing_rule,
    required: q.required ?? true,
    status: q.status,
    note: displayNote,
    min_selections: q.min_selections ?? (resolvedType === 'multi_select' ? 1 : undefined),
    max_selections: q.max_selections ?? (resolvedType === 'multi_select' ? 4 : undefined),
    options,
  }
})

// Normalize courses
const parsedCourses: UniversityCourse[] = dataset.courses.map((c) => ({
  program_id: c.program_id,
  school: c.school,
  level: (c.level === 'PG' ? 'PG' : c.level === 'Diploma' ? 'Diploma' : c.level === 'PhD' ? 'PhD' : 'UG') as AcademicDegreeLevel,
  course: c.course,
  specialization: c.specialization || c.course,
  suitable_12th_stream: c.suitable_12th_stream || 'Any',
  career_domains: c.career_domains,
  notes: c.notes,
  primary_stream: c.primary_stream,
  domain_ids: c.domain_ids || [],
  active_status: c.active_status,
}))

// Normalization lookups
const questionMap = new Map<string, AssessmentQuestion>()
parsedQuestions.forEach((q) => questionMap.set(q.question_id, q))

const courseMap = new Map<string, UniversityCourse>()
parsedCourses.forEach((c) => courseMap.set(c.program_id, c))

const dimensionMap = new Map<string, AssessmentDimension>()
dataset.dimensions.forEach((d) => dimensionMap.set(d.dimension_id, d))

/**
 * Accessor Functions
 */
export function getAssessmentMetadata() {
  return {
    schema_version: dataset.schema_version,
    assessment_version: dataset.assessment_version,
    status: dataset.status,
    source: dataset.source,
  }
}

export function getAllDimensions(): AssessmentDimension[] {
  return dataset.dimensions
}

export function getDimensionById(dimensionId: string): AssessmentDimension | undefined {
  return dimensionMap.get(dimensionId)
}

export function getAllCourses(): UniversityCourse[] {
  return parsedCourses
}

export function getCoursesByLevel(level: AcademicDegreeLevel): UniversityCourse[] {
  return parsedCourses.filter((c) => c.level === level)
}

export function getCourseById(programId: string): UniversityCourse | undefined {
  return courseMap.get(programId)
}

export function getAllQuestions(): AssessmentQuestion[] {
  return parsedQuestions
}

export function getQuestionsByLevel(level: AssessmentLevel): AssessmentQuestion[] {
  return parsedQuestions.filter((q) => q.level === level)
}

export function getQuestionById(questionId: string): AssessmentQuestion | undefined {
  return questionMap.get(questionId)
}

export function getCourseDomainMappings(): CourseDomainMapping[] {
  return dataset.course_domain_mappings
}

export function getRoutingRules(): RoutingRule[] {
  return dataset.routing_rules.map((r) => ({
    level: r.level as AssessmentLevel,
    rule: r.rule,
    description: r.description,
  }))
}

export function getProductionGuardrails(): string[] {
  return dataset.production_guardrails || []
}

/**
 * Data Integrity Validation
 */
export function validateDatasetIntegrity(): {
  isValid: boolean
  totalDimensions: number
  totalCourses: number
  totalQuestions: number
  totalOptions: number
  totalMappings: number
  orphanOptions: string[]
  unmappedCourses: string[]
  errors: string[]
} {
  const errors: string[] = []
  const orphanOptions: string[] = []
  const unmappedCourses: string[] = []

  dataset.answer_options.forEach((opt) => {
    if (!questionMap.has(opt.question_id)) {
      orphanOptions.push(opt.option_id)
      errors.push(`Option ${opt.option_id} references non-existent question ${opt.question_id}`)
    }
  })

  parsedCourses.forEach((course) => {
    if (!course.domain_ids || course.domain_ids.length === 0) {
      unmappedCourses.push(course.program_id)
    }
  })

  return {
    isValid: errors.length === 0,
    totalDimensions: dataset.dimensions.length,
    totalCourses: parsedCourses.length,
    totalQuestions: parsedQuestions.length,
    totalOptions: dataset.answer_options.length,
    totalMappings: dataset.course_domain_mappings.length,
    orphanOptions,
    unmappedCourses,
    errors,
  }
}
