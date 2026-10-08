-- ============================================================
-- Career Intelligence ERP - Full Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('STUDENT', 'COUNSELOR', 'DEAN_HOD');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE referral_code_status AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED', 'FULL');
CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED');
CREATE TYPE program_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE class_status AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');
CREATE TYPE assessment_status AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIMED_OUT');
CREATE TYPE question_type AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'LIKERT_SCALE', 'SCENARIO', 'NUMERICAL', 'TEXT', 'TRUE_FALSE');
CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE roadmap_item_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE counseling_status AS ENUM ('OPEN', 'FOLLOW_UP', 'RESOLVED');
CREATE TYPE assignment_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE notification_type AS ENUM (
  'DEAN_HOD_APPROVAL', 'DEAN_HOD_REJECTION', 'STUDENT_ENROLLMENT',
  'ASSESSMENT_COMPLETION', 'COUNSELOR_ASSIGNMENT', 'COUNSELING_FOLLOWUP',
  'REFERRAL_EXPIRATION', 'PROGRAM_UPDATE', 'GENERAL'
);

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'STUDENT',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================
-- INSTITUTIONS & DEPARTMENTS
-- ============================================================

CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, code)
);

CREATE INDEX idx_departments_institution_id ON departments(institution_id);

-- ============================================================
-- ROLE-SPECIFIC PROFILES
-- ============================================================

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prn TEXT,
  gender gender_type,
  date_of_birth DATE,
  institution TEXT,
  school TEXT,
  current_program TEXT,
  current_semester INTEGER,
  academic_year TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  career_goals TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_prn ON student_profiles(prn);

CREATE TABLE counselor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT,
  designation TEXT,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  can_manage_assessments BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_counselor_profiles_user_id ON counselor_profiles(user_id);

CREATE TABLE dean_hod_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT,
  designation TEXT NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dean_hod_profiles_user_id ON dean_hod_profiles(user_id);
CREATE INDEX idx_dean_hod_profiles_institution_id ON dean_hod_profiles(institution_id);

-- ============================================================
-- PROGRAMS & CLASSES
-- ============================================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 2,
  total_semesters INTEGER NOT NULL DEFAULT 4,
  status program_status NOT NULL DEFAULT 'ACTIVE',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, code, academic_year)
);

CREATE INDEX idx_programs_institution_id ON programs(institution_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_created_by ON programs(created_by);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  semester INTEGER NOT NULL,
  division TEXT,
  academic_year TEXT NOT NULL,
  faculty_coordinator TEXT,
  student_capacity INTEGER NOT NULL DEFAULT 60,
  status class_status NOT NULL DEFAULT 'ACTIVE',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, code, academic_year)
);

CREATE INDEX idx_classes_program_id ON classes(program_id);
CREATE INDEX idx_classes_status ON classes(status);

-- ============================================================
-- REFERRAL CODES
-- ============================================================

CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  status referral_code_status NOT NULL DEFAULT 'ACTIVE',
  notes TEXT
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_program_id ON referral_codes(program_id);
CREATE INDEX idx_referral_codes_class_id ON referral_codes(class_id);
CREATE INDEX idx_referral_codes_status ON referral_codes(status);

-- ============================================================
-- ENROLLMENTS
-- ============================================================

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  status enrollment_status NOT NULL DEFAULT 'ACTIVE',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, program_id, academic_year)
);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_program_id ON enrollments(program_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);

-- ============================================================
-- STUDENT-COUNSELOR ASSIGNMENTS
-- ============================================================

CREATE TABLE student_counselor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status assignment_status NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  UNIQUE(student_id, counselor_id)
);

CREATE INDEX idx_sca_student_id ON student_counselor_assignments(student_id);
CREATE INDEX idx_sca_counselor_id ON student_counselor_assignments(counselor_id);

-- ============================================================
-- ASSESSMENT FRAMEWORK
-- ============================================================

CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL, -- PSYCHOMETRIC, INTEREST, BEHAVIORAL, WORK_PREFERENCE, APTITUDE, SIMULATION
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assessment_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE RESTRICT,
  version_number TEXT NOT NULL, -- e.g. "1.0", "1.1"
  description TEXT,
  status assessment_status NOT NULL DEFAULT 'DRAFT',
  time_limit_minutes INTEGER,
  is_resumable BOOLEAN NOT NULL DEFAULT TRUE,
  allow_retake BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, version_number)
);

CREATE INDEX idx_assessment_versions_template_id ON assessment_versions(template_id);
CREATE INDEX idx_assessment_versions_status ON assessment_versions(status);

CREATE TABLE assessment_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES assessment_versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessment_sections_version_id ON assessment_sections(version_id);

-- ============================================================
-- TRAITS
-- ============================================================

CREATE TABLE traits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT, -- COGNITIVE, BEHAVIORAL, PERSONALITY
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS
-- ============================================================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES assessment_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'LIKERT_SCALE',
  difficulty difficulty_level NOT NULL DEFAULT 'MEDIUM',
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_reverse_scored BOOLEAN NOT NULL DEFAULT FALSE,
  max_scale INTEGER DEFAULT 5, -- for Likert
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_section_id ON questions(section_id);

CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_value INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);

CREATE TABLE question_trait_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  trait_id UUID NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  UNIQUE(question_id, trait_id)
);

CREATE INDEX idx_qtw_question_id ON question_trait_weights(question_id);
CREATE INDEX idx_qtw_trait_id ON question_trait_weights(trait_id);

-- ============================================================
-- CAREER DOMAINS & ROLES
-- ============================================================

CREATE TABLE career_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domain_trait_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES career_domains(id) ON DELETE CASCADE,
  trait_id UUID NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  weight NUMERIC(4,2) NOT NULL DEFAULT 1.0, -- 0.0 to 1.0: Low=0.3, Medium=0.6, High=1.0
  UNIQUE(domain_id, trait_id)
);

CREATE INDEX idx_dtw_domain_id ON domain_trait_weights(domain_id);
CREATE INDEX idx_dtw_trait_id ON domain_trait_weights(trait_id);

CREATE TABLE career_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES career_domains(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(domain_id, name)
);

CREATE INDEX idx_career_roles_domain_id ON career_roles(domain_id);

-- ============================================================
-- SKILLS
-- ============================================================

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  required_level INTEGER NOT NULL DEFAULT 3 CHECK (required_level BETWEEN 0 AND 5),
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(role_id, skill_id)
);

CREATE INDEX idx_role_skills_role_id ON role_skills(role_id);

CREATE TABLE student_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 0 CHECK (current_level BETWEEN 0 AND 5),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_student_skills_student_id ON student_skills(student_id);

-- ============================================================
-- ASSESSMENT ATTEMPTS & RESPONSES
-- ============================================================

CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  version_id UUID NOT NULL REFERENCES assessment_versions(id) ON DELETE RESTRICT,
  status attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_saved_at TIMESTAMPTZ,
  current_section_id UUID REFERENCES assessment_sections(id) ON DELETE SET NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(student_id, version_id) -- one active attempt per version
);

CREATE INDEX idx_attempts_student_id ON assessment_attempts(student_id);
CREATE INDEX idx_attempts_version_id ON assessment_attempts(version_id);
CREATE INDEX idx_attempts_status ON assessment_attempts(status);

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  response_value INTEGER, -- for Likert / single choice
  response_text TEXT,     -- for text responses
  selected_options UUID[], -- for multi-choice
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

CREATE INDEX idx_responses_attempt_id ON assessment_responses(attempt_id);

-- ============================================================
-- SCORES & CAREER PROFILES
-- ============================================================

CREATE TABLE trait_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trait_id UUID NOT NULL REFERENCES traits(id) ON DELETE RESTRICT,
  raw_score NUMERIC(10,4) NOT NULL DEFAULT 0,
  normalized_score NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (normalized_score BETWEEN 0 AND 100),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, trait_id)
);

CREATE INDEX idx_trait_scores_attempt_id ON trait_scores(attempt_id);
CREATE INDEX idx_trait_scores_student_id ON trait_scores(student_id);

CREATE TABLE domain_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES career_domains(id) ON DELETE RESTRICT,
  raw_score NUMERIC(10,4) NOT NULL DEFAULT 0,
  normalized_score NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (normalized_score BETWEEN 0 AND 100),
  alignment_label TEXT, -- "Strong alignment", "Moderate alignment" etc.
  rank INTEGER,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, domain_id)
);

CREATE INDEX idx_domain_scores_attempt_id ON domain_scores(attempt_id);
CREATE INDEX idx_domain_scores_student_id ON domain_scores(student_id);

CREATE TABLE career_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE SET NULL,
  profile_label TEXT, -- e.g. "Analytical Business Problem Solver"
  profile_description TEXT,
  primary_domain_id UUID REFERENCES career_domains(id) ON DELETE SET NULL,
  secondary_domain_id UUID REFERENCES career_domains(id) ON DELETE SET NULL,
  top_traits UUID[], -- ordered list of trait IDs
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_career_profiles_student_id ON career_profiles(student_id);

-- ============================================================
-- SKILL GAPS & LEARNING ROADMAPS
-- ============================================================

CREATE TABLE skill_gap_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE SET NULL,
  role_id UUID NOT NULL REFERENCES career_roles(id) ON DELETE RESTRICT,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  current_level INTEGER NOT NULL DEFAULT 0,
  target_level INTEGER NOT NULL DEFAULT 3,
  gap INTEGER GENERATED ALWAYS AS (GREATEST(0, target_level - current_level)) STORED,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, role_id, skill_id)
);

CREATE INDEX idx_skill_gaps_student_id ON skill_gap_results(student_id);
CREATE INDEX idx_skill_gaps_role_id ON skill_gap_results(role_id);

CREATE TABLE learning_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES career_roles(id) ON DELETE RESTRICT,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, role_id)
);

CREATE INDEX idx_roadmaps_student_id ON learning_roadmaps(student_id);

CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  phase INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 1,
  estimated_days INTEGER,
  resource_url TEXT,
  status roadmap_item_status NOT NULL DEFAULT 'NOT_STARTED',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roadmap_items_roadmap_id ON roadmap_items(roadmap_id);

-- ============================================================
-- CAREER SIMULATIONS
-- ============================================================

CREATE TABLE career_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES career_domains(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  scenario TEXT,
  business_context TEXT,
  task TEXT,
  expected_reasoning TEXT,
  scoring_rules JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simulations_domain_id ON career_simulations(domain_id);

CREATE TABLE simulation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES career_simulations(id) ON DELETE RESTRICT,
  responses JSONB,
  score NUMERIC(6,2),
  feedback TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_simulation_attempts_student_id ON simulation_attempts(student_id);

-- ============================================================
-- COUNSELING SESSIONS
-- ============================================================

CREATE TABLE counseling_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  counselor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  discussion_summary TEXT,
  identified_concerns TEXT,
  recommended_actions TEXT,
  follow_up_date DATE,
  status counseling_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_counseling_student_id ON counseling_sessions(student_id);
CREATE INDEX idx_counseling_counselor_id ON counseling_sessions(counselor_id);
CREATE INDEX idx_counseling_status ON counseling_sessions(status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'GENERAL',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_counselor_profiles_updated_at BEFORE UPDATE ON counselor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dean_hod_profiles_updated_at BEFORE UPDATE ON dean_hod_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_templates_updated_at BEFORE UPDATE ON assessment_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_versions_updated_at BEFORE UPDATE ON assessment_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_profiles_updated_at BEFORE UPDATE ON career_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_roadmaps_updated_at BEFORE UPDATE ON learning_roadmaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roadmap_items_updated_at BEFORE UPDATE ON roadmap_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_counseling_sessions_updated_at BEFORE UPDATE ON counseling_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_skills_updated_at BEFORE UPDATE ON student_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dean_hod_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_counselor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_attempts ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's app user id
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: is current user a counselor?
CREATE OR REPLACE FUNCTION is_counselor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'COUNSELOR' AND status = 'ACTIVE')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: is current user an active dean/hod?
CREATE OR REPLACE FUNCTION is_dean_hod()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'DEAN_HOD' AND status = 'ACTIVE')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: is current user a student?
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'STUDENT' AND status = 'ACTIVE')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS: users can see their own record; counselors can see all
CREATE POLICY users_select_own ON users FOR SELECT USING (auth_user_id = auth.uid() OR is_counselor());
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- STUDENT PROFILES: students see own; counselors/deans see all active students
CREATE POLICY student_profiles_select ON student_profiles FOR SELECT USING (
  user_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY student_profiles_insert_own ON student_profiles FOR INSERT WITH CHECK (user_id = get_current_user_id());
CREATE POLICY student_profiles_update_own ON student_profiles FOR UPDATE USING (user_id = get_current_user_id());

-- COUNSELOR PROFILES: counselors see their own; counselors can see all counselors
CREATE POLICY counselor_profiles_select ON counselor_profiles FOR SELECT USING (
  user_id = get_current_user_id() OR is_counselor()
);
CREATE POLICY counselor_profiles_insert ON counselor_profiles FOR INSERT WITH CHECK (user_id = get_current_user_id());
CREATE POLICY counselor_profiles_update ON counselor_profiles FOR UPDATE USING (user_id = get_current_user_id() OR is_counselor());

-- DEAN HOD PROFILES: dean sees own; counselors see all
CREATE POLICY dean_hod_profiles_select ON dean_hod_profiles FOR SELECT USING (
  user_id = get_current_user_id() OR is_counselor()
);
CREATE POLICY dean_hod_profiles_insert ON dean_hod_profiles FOR INSERT WITH CHECK (user_id = get_current_user_id());
CREATE POLICY dean_hod_profiles_update ON dean_hod_profiles FOR UPDATE USING (is_counselor() OR user_id = get_current_user_id());

-- INSTITUTIONS & DEPARTMENTS: readable by all authenticated users
CREATE POLICY institutions_select ON institutions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY institutions_insert ON institutions FOR INSERT WITH CHECK (is_counselor());
CREATE POLICY institutions_update ON institutions FOR UPDATE USING (is_counselor());
CREATE POLICY departments_select ON departments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY departments_insert ON departments FOR INSERT WITH CHECK (is_counselor());
CREATE POLICY departments_update ON departments FOR UPDATE USING (is_counselor());

-- PROGRAMS: readable by all; writable by dean/hod and counselors
CREATE POLICY programs_select ON programs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY programs_insert ON programs FOR INSERT WITH CHECK (is_counselor() OR is_dean_hod());
CREATE POLICY programs_update ON programs FOR UPDATE USING (is_counselor() OR is_dean_hod());

-- CLASSES: similar to programs
CREATE POLICY classes_select ON classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY classes_insert ON classes FOR INSERT WITH CHECK (is_counselor() OR is_dean_hod());
CREATE POLICY classes_update ON classes FOR UPDATE USING (is_counselor() OR is_dean_hod());

-- REFERRAL CODES: dean/counselors manage; students can read active
CREATE POLICY referral_codes_select ON referral_codes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY referral_codes_insert ON referral_codes FOR INSERT WITH CHECK (is_counselor() OR is_dean_hod());
CREATE POLICY referral_codes_update ON referral_codes FOR UPDATE USING (is_counselor() OR is_dean_hod());

-- ENROLLMENTS: students see own; counselors/deans see all
CREATE POLICY enrollments_select ON enrollments FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY enrollments_insert ON enrollments FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR is_counselor()
);

-- ASSESSMENT ATTEMPTS: students see own; counselors see all
CREATE POLICY attempts_select ON assessment_attempts FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY attempts_insert ON assessment_attempts FOR INSERT WITH CHECK (student_id = get_current_user_id());
CREATE POLICY attempts_update ON assessment_attempts FOR UPDATE USING (student_id = get_current_user_id() OR is_counselor());

-- RESPONSES: students see own; counselors see all
CREATE POLICY responses_select ON assessment_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM assessment_attempts a WHERE a.id = attempt_id AND (a.student_id = get_current_user_id() OR is_counselor()))
);
CREATE POLICY responses_insert ON assessment_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assessment_attempts a WHERE a.id = attempt_id AND a.student_id = get_current_user_id())
);
CREATE POLICY responses_update ON assessment_responses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM assessment_attempts a WHERE a.id = attempt_id AND a.student_id = get_current_user_id())
);

-- SCORES: students see own; counselors/deans see all
CREATE POLICY trait_scores_select ON trait_scores FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY trait_scores_insert ON trait_scores FOR INSERT WITH CHECK (is_counselor() OR student_id = get_current_user_id());

CREATE POLICY domain_scores_select ON domain_scores FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY domain_scores_insert ON domain_scores FOR INSERT WITH CHECK (is_counselor() OR student_id = get_current_user_id());

-- CAREER PROFILES
CREATE POLICY career_profiles_select ON career_profiles FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY career_profiles_insert ON career_profiles FOR INSERT WITH CHECK (student_id = get_current_user_id() OR is_counselor());
CREATE POLICY career_profiles_update ON career_profiles FOR UPDATE USING (student_id = get_current_user_id() OR is_counselor());

-- SKILL GAPS
CREATE POLICY skill_gaps_select ON skill_gap_results FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY skill_gaps_insert ON skill_gap_results FOR INSERT WITH CHECK (student_id = get_current_user_id() OR is_counselor());

-- ROADMAPS
CREATE POLICY roadmaps_select ON learning_roadmaps FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY roadmaps_insert ON learning_roadmaps FOR INSERT WITH CHECK (student_id = get_current_user_id() OR is_counselor());
CREATE POLICY roadmaps_update ON learning_roadmaps FOR UPDATE USING (student_id = get_current_user_id() OR is_counselor());

CREATE POLICY roadmap_items_select ON roadmap_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM learning_roadmaps r WHERE r.id = roadmap_id AND (r.student_id = get_current_user_id() OR is_counselor()))
);
CREATE POLICY roadmap_items_insert ON roadmap_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM learning_roadmaps r WHERE r.id = roadmap_id AND (r.student_id = get_current_user_id() OR is_counselor()))
);
CREATE POLICY roadmap_items_update ON roadmap_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM learning_roadmaps r WHERE r.id = roadmap_id AND (r.student_id = get_current_user_id() OR is_counselor()))
);

-- STUDENT SKILLS
CREATE POLICY student_skills_select ON student_skills FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor() OR is_dean_hod()
);
CREATE POLICY student_skills_insert ON student_skills FOR INSERT WITH CHECK (student_id = get_current_user_id() OR is_counselor());
CREATE POLICY student_skills_update ON student_skills FOR UPDATE USING (student_id = get_current_user_id() OR is_counselor());

-- COUNSELING: students see own (read-only); counselors full access
CREATE POLICY counseling_select ON counseling_sessions FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor()
);
CREATE POLICY counseling_insert ON counseling_sessions FOR INSERT WITH CHECK (is_counselor());
CREATE POLICY counseling_update ON counseling_sessions FOR UPDATE USING (is_counselor());

-- STUDENT-COUNSELOR ASSIGNMENTS
CREATE POLICY sca_select ON student_counselor_assignments FOR SELECT USING (
  student_id = get_current_user_id() OR counselor_id = get_current_user_id() OR is_counselor()
);
CREATE POLICY sca_insert ON student_counselor_assignments FOR INSERT WITH CHECK (is_counselor());
CREATE POLICY sca_update ON student_counselor_assignments FOR UPDATE USING (is_counselor());

-- NOTIFICATIONS: users see only their own
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = get_current_user_id());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = get_current_user_id());
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (is_counselor() OR user_id = get_current_user_id());

-- AUDIT LOGS: counselors see all; others see nothing (logged by service role)
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (is_counselor());

-- SIMULATION ATTEMPTS: students see own; counselors see all
CREATE POLICY sim_attempts_select ON simulation_attempts FOR SELECT USING (
  student_id = get_current_user_id() OR is_counselor()
);
CREATE POLICY sim_attempts_insert ON simulation_attempts FOR INSERT WITH CHECK (student_id = get_current_user_id());
CREATE POLICY sim_attempts_update ON simulation_attempts FOR UPDATE USING (student_id = get_current_user_id());
