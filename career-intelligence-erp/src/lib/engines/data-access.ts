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
      {
        option_id: 'L3-006-PG-A',
        question_id: 'L3-006',
        option_label: 'M.Tech in Computer Science & Engineering (AI, Cloud & Cyber Security)',
        dimension_id: 'TECHNOLOGY',
        score_value: 5,
        mapping_or_feedback: 'Technology & Computing postgraduate pathway',
      },
      {
        option_id: 'L3-006-PG-B',
        question_id: 'L3-006',
        option_label: 'MBA in Financial Management & Business Analytics',
        dimension_id: 'BUSINESS',
        score_value: 5,
        mapping_or_feedback: 'Business & Management postgraduate pathway',
      },
      {
        option_id: 'L3-006-PG-C',
        question_id: 'L3-006',
        option_label: 'M.Pharm in Pharmaceutics & Regulatory Affairs',
        dimension_id: 'HEALTH_PHARMA',
        score_value: 5,
        mapping_or_feedback: 'Health & Pharmacy postgraduate pathway',
      },
      {
        option_id: 'L3-006-PG-D',
        question_id: 'L3-006',
        option_label: 'M.Des in User Experience (UX) & Industrial Product Design',
        dimension_id: 'DESIGN',
        score_value: 5,
        mapping_or_feedback: 'Design & Creativity postgraduate pathway',
      },
      {
        option_id: 'L3-006-PG-E',
        question_id: 'L3-006',
        option_label: 'LL.M in Corporate & Commercial Law / Cyber Law',
        dimension_id: 'LAW',
        score_value: 5,
        mapping_or_feedback: 'Law & Legal Systems postgraduate pathway',
      },
      {
        option_id: 'L3-006-PG-F',
        question_id: 'L3-006',
        option_label: 'M.Sc in Applied Data Science, AI & Statistical Analytics',
        dimension_id: 'ANALYTICS',
        score_value: 5,
        mapping_or_feedback: 'Analytics & Data postgraduate pathway',
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
      {
        option_id: 'L4-008-PG-A',
        question_id: 'L4-008',
        option_label: 'Executive AI & Deep Learning Systems vs Cloud Infrastructure',
        dimension_id: 'TECHNOLOGY',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-PG-B',
        question_id: 'L4-008',
        option_label: 'FinTech & Quantitative Finance vs Strategic Brand Marketing',
        dimension_id: 'BUSINESS',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-PG-C',
        question_id: 'L4-008',
        option_label: 'Advanced Pharmacology & Drug Development vs Clinical Research',
        dimension_id: 'HEALTH_PHARMA',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-PG-D',
        question_id: 'L4-008',
        option_label: 'Advanced Human-Computer Interaction (HCI) vs Strategic Design Management',
        dimension_id: 'DESIGN',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-PG-E',
        question_id: 'L4-008',
        option_label: 'International Commercial Arbitration vs Cyber Law & Digital Governance',
        dimension_id: 'LAW',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
      {
        option_id: 'L4-008-PG-F',
        question_id: 'L4-008',
        option_label: 'Big Data Analytics & Business Intelligence vs Predictive Machine Learning',
        dimension_id: 'ANALYTICS',
        score_value: 5,
        mapping_or_feedback: 'Specialization comparison',
      },
    ]
  }

const QUESTION_ENHANCEMENTS: Record<string, { text?: string; note?: string }> = {
  'L1-001': {
    text: 'I enjoy finding patterns in data, analyzing statistics, and solving quantitative problems.',
    note: 'Rate how naturally this aligns with your intellectual curiosity.'
  },
  'L1-002': {
    text: 'I am interested in how companies operate, market trends, entrepreneurship, and financial growth.',
    note: 'Consider your interest in business leadership and commercial ventures.'
  },
  'L1-003': {
    text: 'I enjoy programming, developing digital apps, and exploring cutting-edge computing systems.',
    note: 'Reflect on your enthusiasm for coding, digital tools, and tech solutions.'
  },
  'L1-004': {
    text: 'I enjoy discovering how natural sciences work through experiments, biology, chemistry, and research.',
    note: 'Consider your curiosity for laboratory research and scientific inquiry.'
  },
  'L1-005': {
    text: 'I am drawn to healthcare, pharmaceutical sciences, drug research, and clinical advancements.',
    note: 'Reflect on your interest in improving human health and therapeutic sciences.'
  },
  'L1-006': {
    text: 'I am passionate about visual arts, user interface design, media creation, and aesthetic innovation.',
    note: 'Consider your drive to create engaging visual and physical designs.'
  },
  'L1-007': {
    text: 'I enjoy interpreting rules, constitutional rights, legal reasoning, and public policy debates.',
    note: 'Reflect on your interest in legal systems, advocacy, and justice.'
  },
  'L1-008': {
    text: 'I enjoy building, testing, and optimizing mechanical, electrical, or structural engineering systems.',
    note: 'Consider your passion for hands-on engineering and physical innovation.'
  },
  'L1-009': {
    text: 'I enjoy expressing ideas, journalism, digital storytelling, and media communication.',
    note: 'Reflect on your interest in content creation, media, and public influence.'
  },
  'L1-010': {
    text: 'I am interested in modern architecture, city planning, sustainable buildings, and physical infrastructure.',
    note: 'Consider your interest in spatial design and urban development.'
  },
  'L2-001': {
    text: 'Which hands-on project format would you most enthusiastically lead?',
    note: 'Choose the project domains that best match your preferred problem-solving style.'
  },
  'L2-002': {
    text: 'I learn best through practical industry projects, real-world case studies, and live experiments.',
    note: 'Reflect on your preferred hands-on learning methodology.'
  },
  'L2-003': {
    text: 'I enjoy utilizing evidence, statistical metrics, and analytics to solve complex, ambiguous challenges.',
    note: 'Consider your comfort with analytical and empirical problem solving.'
  },
  'L2-004': {
    text: 'I enjoy designing, prototyping, and iterating on functional products, hardware, or technical architectures.',
    note: 'Reflect on your drive to build tangible, functional solutions.'
  },
  'L2-005': {
    text: 'I am energized by understanding human psychology, team dynamics, communication, and organizational culture.',
    note: 'Consider your focus on interpersonal dynamics and social impact.'
  },
  'L2-006': {
    text: 'I enjoy studying market strategies, organizational finance, management consulting, and business scaling.',
    note: 'Reflect on your ambition for business management and market strategy.'
  },
  'L2-007': {
    text: 'I enjoy dissecting legal statutes, regulatory compliance, corporate governance, and formal argumentation.',
    note: 'Consider your analytical interest in legal and regulatory frameworks.'
  },
  'L2-008': {
    text: 'I want to explore interdisciplinary degrees that integrate technology, business, and creative design.',
    note: 'Reflect on your interest in cross-disciplinary and hybrid career paths.'
  },
  'L3-001': {
    text: 'Which academic discipline would you most like to study deeply throughout your degree?',
    note: 'Select the core subject areas you are most passionate about exploring.'
  },
  'L3-002': {
    text: 'I find the core academic curriculum and syllabus subjects in my leading study track exciting and intellectually stimulating.',
    note: 'Consider the theoretical and applied topics you will be studying daily.'
  },
  'L3-003': {
    text: 'I look forward to completing capstone projects, lab practicals, and industry-aligned assignments in this program.',
    note: 'Reflect on your excitement for practical course assignments.'
  },
  'L3-004': {
    text: 'I am fully committed to consistent daily practice, coursework, and skill-building in this academic track.',
    note: 'Consider your dedication to mastering demanding professional competencies.'
  },
  'L3-005': {
    text: 'What information is most important to you when deciding between two degree programs?',
    note: 'Select the factors that matter most for your university selection.'
  },
  'L3-006': {
    text: 'Which Sandip University course pathway are you most interested in exploring in depth?',
    note: 'Select the accredited degree pathways that best fit your career vision.'
  },
  'L3-007': {
    text: 'I have a clear and confident understanding of the academic coursework, subjects, and study demands of this program.',
    note: 'Rate your clarity regarding the curriculum and academic workload.'
  },
  'L3-008': {
    text: 'Which statement best captures where you currently stand in choosing your degree course?',
    note: 'Indicate your current decision-making stage.'
  },
  'L4-001': {
    text: 'Which specialized professional responsibilities would you most look forward to performing?',
    note: 'Choose the specific industry tasks that match your career goals.'
  },
  'L4-002': {
    text: 'I would enjoy studying the advanced specialist electives and cutting-edge curriculum in this domain.',
    note: 'Reflect on your appetite for specialized, advanced coursework.'
  },
  'L4-003': {
    text: 'I would enjoy executing hands-on industry projects, specialized simulations, and portfolio building in this specialization.',
    note: 'Consider your interest in building specialized portfolio artifacts.'
  },
  'L4-004': {
    text: 'Which advanced technological or computational focus area would you like to master?',
    note: 'Select the high-growth technical domains that interest you.'
  },
  'L4-005': {
    text: 'Which creative or structural design outcome would you be most proud to bring to life?',
    note: 'Select the tangible creative outputs that inspire you.'
  },
  'L4-006': {
    text: 'I understand how specialized concentrations (e.g. core technical vs. applied management tracks) shape distinct career pathways.',
    note: 'Rate your understanding of specialization differentiation.'
  },
  'L4-007': {
    text: 'What factor carries the highest weight when choosing your university specialization?',
    note: 'Select the key priorities guiding your specialization choice.'
  },
  'L4-008': {
    text: 'Which specialization tracks would you like to evaluate and compare during your mentor counseling session?',
    note: 'Select the specialization pairs you want to explore with academic advisors.'
  },
  'L5-001': {
    text: 'What is your current decision readiness regarding your top-recommended university course?',
    note: 'Select your readiness level for enrollment and counseling.'
  },
  'L5-002': {
    text: 'Have you reviewed the standard eligibility prerequisites and stream requirements for your leading course?',
    note: 'Verify your academic prerequisites (e.g. 12th stream / graduation requirements).'
  },
  'L5-003': {
    text: 'The industry career pathways, corporate job profiles, and long-term opportunities in this program strongly align with my goals.',
    note: 'Rate your alignment with the program\'s post-graduation career trajectories.'
  },
  'L5-004': {
    text: 'I feel well-informed regarding the degree timeline, curriculum rigour, and professional outcomes of this program.',
    note: 'Rate your overall confidence in this academic choice.'
  },
  'L5-005': {
    text: 'The diagnostic recommendations and dimension scores accurately reflect my genuine interests and strengths.',
    note: 'Provide your feedback on the diagnostic accuracy of this assessment.'
  },
  'L5-006': {
    text: 'What would you like your immediate next step to be with Sandip University Career Intelligence?',
    note: 'Select the follow-up action that best supports your admission journey.'
  }
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

  const enhancement = QUESTION_ENHANCEMENTS[q.question_id]
  const resolvedText = enhancement?.text || q.question_text
  const resolvedNote = enhancement?.note || q.note

  return {
    question_id: q.question_id,
    level: q.level as AssessmentLevel,
    question_type: resolvedType,
    raw_type: q.question_type,
    construct: q.construct,
    question_text: resolvedText,
    dimension_id: q.dimension_id || undefined,
    routing_rule: q.routing_rule,
    required: q.required ?? true,
    status: q.status,
    note: resolvedNote,
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
