-- ============================================================
-- Migration: 005_assessment_builder_and_su_intelligence.sql
-- Description: Decoupled Assessment Builder & SU 2-Stage Intelligence Engine
-- ============================================================

-- 1. Supported Assessment Enums
DO $$ BEGIN
  CREATE TYPE assessment_builder_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Master Question Bank (Decoupled from Assessments)
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'S1Q001'
  level INTEGER NOT NULL DEFAULT 0,
  level_name VARCHAR(100) NOT NULL DEFAULT 'Explore',
  case_type VARCHAR(150),
  ug_case TEXT NOT NULL,
  pg_case TEXT NOT NULL,
  prompt TEXT NOT NULL,
  instructions TEXT,
  response_limit INTEGER NOT NULL DEFAULT 3,
  difficulty question_difficulty_level NOT NULL DEFAULT 'MEDIUM',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_bank_code ON question_bank(code);
CREATE INDEX IF NOT EXISTS idx_question_bank_level ON question_bank(level);

-- 3. Question Bank Options
CREATE TABLE IF NOT EXISTS question_bank_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  key_label VARCHAR(10) NOT NULL, -- 'A', 'B', 'C' ... or 'OPT_OUT'
  option_text TEXT NOT NULL,
  is_opt_out BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qb_options_question_id ON question_bank_options(question_id);

-- 4. Option Dimension Psychometric Weights (20-D Vectors)
CREATE TABLE IF NOT EXISTS option_dimension_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES question_bank_options(id) ON DELETE CASCADE,
  dimension_code VARCHAR(10) NOT NULL, -- 'D01' to 'D20'
  dimension_name VARCHAR(150) NOT NULL,
  score_delta NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(option_id, dimension_code)
);

CREATE INDEX IF NOT EXISTS idx_ods_option_id ON option_dimension_scores(option_id);
CREATE INDEX IF NOT EXISTS idx_ods_dimension_code ON option_dimension_scores(dimension_code);

-- 5. Master Assessment Entity
CREATE TABLE IF NOT EXISTS master_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(150) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  purpose TEXT,
  target_group VARCHAR(150),
  status assessment_builder_status NOT NULL DEFAULT 'PUBLISHED',
  time_limit_minutes INTEGER DEFAULT 45,
  attempt_limit INTEGER NOT NULL DEFAULT 1,
  randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
  randomize_options BOOLEAN NOT NULL DEFAULT FALSE,
  current_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Immutable Published Version Snapshots
-- When an admin publishes V1.0 or V2.0, the full question set & scoring weights are frozen here
CREATE TABLE IF NOT EXISTS assessment_version_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES master_assessments(id) ON DELETE RESTRICT,
  version_number VARCHAR(20) NOT NULL, -- '1.0', '1.1'
  snapshot_data JSONB NOT NULL, -- Full frozen tree (questions, options, weights)
  total_questions INTEGER NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_notes TEXT,
  UNIQUE(assessment_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_avs_assessment_id ON assessment_version_snapshots(assessment_id);

-- 7. Student Assessment Attempts Linked to Frozen Snapshots
CREATE TABLE IF NOT EXISTS student_versioned_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES master_assessments(id) ON DELETE RESTRICT,
  version_id UUID REFERENCES assessment_version_snapshots(id) ON DELETE RESTRICT,
  pathway VARCHAR(10) NOT NULL DEFAULT 'UG', -- 'UG' or 'PG'
  stream VARCHAR(50),
  status attempt_status NOT NULL DEFAULT 'COMPLETED',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  dimension_scores JSONB DEFAULT '{}', -- 20-D scores
  candidate_domains JSONB DEFAULT '[]', -- 12 candidate domain IDs
  final_domains JSONB DEFAULT '[]', -- Ranked domains with scores
  matched_programs JSONB DEFAULT '[]', -- Top Sandip programs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sva_student_id ON student_versioned_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_sva_status ON student_versioned_attempts(status);

-- 8. Seed Initial Flagship Assessment Record
INSERT INTO master_assessments (id, slug, name, purpose, target_group, status, time_limit_minutes, attempt_limit, current_version)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'sun-career-2stage',
  'SUN Two-Stage Career Exploration Assessment',
  'Holistic 20-dimensional broad psychometric profiling followed by 20 personalized domain task evaluations.',
  'UG Class 12 & PG Graduates',
  'PUBLISHED',
  45,
  1,
  '1.0'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  current_version = EXCLUDED.current_version;
