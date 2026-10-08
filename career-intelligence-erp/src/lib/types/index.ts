export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN' | 'COUNSELOR' | 'DEAN_HOD'
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE'
export type ReferralCodeStatus = 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'FULL'
export type EnrollmentStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED'
export type ProgramStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type ClassStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
export type AssessmentStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT'
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'LIKERT_SCALE' | 'SCENARIO' | 'NUMERICAL' | 'TEXT' | 'TRUE_FALSE'
export type RoadmapItemStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
export type CounselingStatus = 'OPEN' | 'FOLLOW_UP' | 'RESOLVED'
export type NotificationType = 'DEAN_HOD_APPROVAL' | 'DEAN_HOD_REJECTION' | 'STUDENT_ENROLLMENT' | 'ASSESSMENT_COMPLETION' | 'COUNSELOR_ASSIGNMENT' | 'COUNSELING_FOLLOWUP' | 'REFERRAL_EXPIRATION' | 'PROGRAM_UPDATE' | 'GENERAL'

export interface User {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface StudentProfile {
  id: string
  user_id: string
  prn?: string
  gender?: string
  date_of_birth?: string
  institution?: string
  school?: string
  current_program?: string
  current_semester?: number
  academic_year?: string
  skills?: string[]
  interests?: string[]
  career_goals?: string
  created_at: string
  updated_at: string
}

export interface CounselorProfile {
  id: string
  user_id: string
  employee_id?: string
  designation?: string
  institution_id?: string
  department_id?: string
  can_manage_assessments: boolean
}

export interface DeanHodProfile {
  id: string
  user_id: string
  employee_id?: string
  designation: string
  institution_id?: string
  department_id?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
}

export interface Institution {
  id: string
  name: string
  code: string
  address?: string
  website?: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  institution_id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  name: string
  code: string
  description?: string
  institution_id: string
  department_id?: string
  academic_year: string
  duration_years: number
  total_semesters: number
  status: ProgramStatus
  created_by: string
  created_at: string
  updated_at: string
  institution?: Institution
  department?: Department
}

export interface Class {
  id: string
  name: string
  code: string
  program_id: string
  semester: number
  division?: string
  academic_year: string
  faculty_coordinator?: string
  student_capacity: number
  status: ClassStatus
  created_by: string
  created_at: string
  updated_at: string
  program?: Program
}

export interface ReferralCode {
  id: string
  code: string
  program_id: string
  class_id: string
  created_by: string
  created_at: string
  expires_at?: string
  max_uses?: number
  usage_count: number
  status: ReferralCodeStatus
  notes?: string
  program?: Program
  class?: Class
}

export interface Enrollment {
  id: string
  student_id: string
  program_id: string
  class_id: string
  referral_code_id?: string
  academic_year: string
  status: EnrollmentStatus
  enrolled_at: string
  created_at: string
  program?: Program
  class?: Class
}

export interface Trait {
  id: string
  name: string
  description?: string
  category?: string
  is_active: boolean
  created_at: string
}

export interface CareerDomain {
  id: string
  name: string
  description?: string
  icon?: string
  is_active: boolean
  created_at: string
}

export interface CareerRole {
  id: string
  domain_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  domain?: CareerDomain
}

export interface Skill {
  id: string
  name: string
  category?: string
  description?: string
  is_active: boolean
}

export interface AssessmentTemplate {
  id: string
  name: string
  description?: string
  assessment_type: string
  is_active: boolean
  created_at: string
}

export interface AssessmentVersion {
  id: string
  template_id: string
  version_number: string
  description?: string
  status: AssessmentStatus
  time_limit_minutes?: number
  is_resumable: boolean
  allow_retake: boolean
  published_at?: string
  created_at: string
  template?: AssessmentTemplate
  sections?: AssessmentSection[]
}

export interface AssessmentSection {
  id: string
  version_id: string
  title: string
  description?: string
  order_index: number
  questions?: Question[]
}

export interface Question {
  id: string
  section_id: string
  question_text: string
  question_type: QuestionType
  difficulty: string
  weight: number
  order_index: number
  is_required: boolean
  is_reverse_scored: boolean
  max_scale?: number
  status: string
  options?: QuestionOption[]
  trait_weights?: QuestionTraitWeight[]
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  option_value: number
  order_index: number
}

export interface QuestionTraitWeight {
  id: string
  question_id: string
  trait_id: string
  weight: number
  trait?: Trait
}

export interface AssessmentAttempt {
  id: string
  student_id: string
  version_id: string
  status: AttemptStatus
  started_at: string
  completed_at?: string
  last_saved_at?: string
  current_section_id?: string
  time_spent_seconds: number
  is_locked: boolean
  version?: AssessmentVersion
}

export interface AssessmentResponse {
  id: string
  attempt_id: string
  question_id: string
  response_value?: number
  response_text?: string
  selected_options?: string[]
  responded_at: string
}

export interface TraitScore {
  id: string
  attempt_id: string
  student_id: string
  trait_id: string
  raw_score: number
  normalized_score: number
  calculated_at: string
  trait?: Trait
}

export interface DomainScore {
  id: string
  attempt_id: string
  student_id: string
  domain_id: string
  raw_score: number
  normalized_score: number
  alignment_label?: string
  rank?: number
  calculated_at: string
  domain?: CareerDomain
}

export interface CareerProfile {
  id: string
  student_id: string
  attempt_id?: string
  profile_label?: string
  profile_description?: string
  primary_domain_id?: string
  secondary_domain_id?: string
  top_traits?: string[]
  generated_at: string
  updated_at: string
  primary_domain?: CareerDomain
  secondary_domain?: CareerDomain
}

export interface SkillGapResult {
  id: string
  student_id: string
  attempt_id?: string
  role_id: string
  skill_id: string
  current_level: number
  target_level: number
  gap: number
  calculated_at: string
  skill?: Skill
  role?: CareerRole
}

export interface LearningRoadmap {
  id: string
  student_id: string
  role_id: string
  attempt_id?: string
  title: string
  is_active: boolean
  created_at: string
  updated_at: string
  role?: CareerRole
  items?: RoadmapItem[]
}

export interface RoadmapItem {
  id: string
  roadmap_id: string
  skill_id?: string
  title: string
  description?: string
  phase: number
  priority: number
  estimated_days?: number
  resource_url?: string
  status: RoadmapItemStatus
  completed_at?: string
  skill?: Skill
}

export interface CounselingSession {
  id: string
  student_id: string
  counselor_id: string
  session_date: string
  discussion_summary?: string
  identified_concerns?: string
  recommended_actions?: string
  follow_up_date?: string
  status: CounselingStatus
  created_at: string
  updated_at: string
  student?: User
  counselor?: User
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  metadata?: Record<string, unknown>
  created_at: string
  read_at?: string
}

export interface StudentCounselorAssignment {
  id: string
  student_id: string
  counselor_id: string
  assigned_at: string
  assigned_by?: string
  status: string
  notes?: string
  student?: User
  counselor?: User
}

export interface AuditLog {
  id: string
  actor_user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, unknown>
  ip_address?: string
  created_at: string
  actor?: User
}
