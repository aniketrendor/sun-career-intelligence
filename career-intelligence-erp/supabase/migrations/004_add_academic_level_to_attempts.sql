-- Migration 004: Add academic_level column to assessment_attempts
-- This enables per-attempt track storage (UG/PG) so the history page
-- can replay scoring with the correct program catalog filter.
--
-- Applied: Sandip University CIS 2026-27

ALTER TABLE assessment_attempts
  ADD COLUMN IF NOT EXISTS academic_level TEXT CHECK (academic_level IN ('UG', 'PG', 'Diploma', 'PhD'));

-- Backfill existing attempts: default to NULL (history page will fall back
-- to student profile's inferred track for old rows)
COMMENT ON COLUMN assessment_attempts.academic_level IS
  'The degree level track chosen by the student when starting this assessment attempt (UG, PG, Diploma, PhD). NULL for legacy attempts without this data.';
