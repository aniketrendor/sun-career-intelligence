/**
 * Assessment Router & Navigation Engine (5-Level Journey)
 * Sandip University (SU-CIS-2026-27-v1)
 */

import {
  getAllQuestions,
  getQuestionsByLevel,
  getQuestionById,
} from './data-access'
import type {
  AssessmentLevel,
  AssessmentQuestion,
  StudentAnswer,
} from '@/lib/types/assessment-v3.types'

export interface LevelConfig {
  level: AssessmentLevel
  levelNumber: number
  title: string
  subtitle: string
  description: string
  questionCount: number
}

export const ASSESSMENT_LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 'L1',
    levelNumber: 1,
    title: 'Career Domain Discovery',
    subtitle: 'Broad Interest Mapping',
    description: 'Explore your foundational interests across 12 broad career domains using a 1-5 rating scale.',
    questionCount: 10,
  },
  {
    level: 'L2',
    levelNumber: 2,
    title: 'Program Family Discovery',
    subtitle: 'Discipline & Field Exploration',
    description: 'Narrow your interests into distinct program families and academic disciplines.',
    questionCount: 8,
  },
  {
    level: 'L3',
    levelNumber: 3,
    title: 'Course Recommendation Fit',
    subtitle: 'Degree & Program Preferences',
    description: 'Evaluate course contexts, learning environments, and specific degree architectures.',
    questionCount: 8,
  },
  {
    level: 'L4',
    levelNumber: 4,
    title: 'Specialization Discovery',
    subtitle: 'Advanced Focus Areas',
    description: 'Explore cutting-edge specialization tracks, problem domains, and skill concentrations.',
    questionCount: 8,
  },
  {
    level: 'L5',
    levelNumber: 5,
    title: 'Final Fit & Academic Readiness',
    subtitle: 'Background & Eligibility',
    description: 'Confirm your academic background, admission priorities, and readiness for university life.',
    questionCount: 6,
  },
]

export function getQuestionsForAssessment(): AssessmentQuestion[] {
  return getAllQuestions()
}

export function getLevelConfig(level: AssessmentLevel): LevelConfig {
  return (
    ASSESSMENT_LEVEL_CONFIGS.find((c) => c.level === level) ||
    ASSESSMENT_LEVEL_CONFIGS[0]
  )
}

export function validateAnswerForQuestion(
  question: AssessmentQuestion,
  answer?: StudentAnswer
): { isValid: boolean; errorMessage?: string } {
  if (!question.required && (!answer || (!answer.option_id && (!answer.option_ids || answer.option_ids.length === 0) && typeof answer.rating_value !== 'number'))) {
    return { isValid: true }
  }

  if (!answer) {
    return { isValid: false, errorMessage: 'Please answer this question to proceed.' }
  }

  if (question.question_type === 'rating_scale') {
    if (typeof answer.rating_value !== 'number' || answer.rating_value < 1 || answer.rating_value > 5) {
      return { isValid: false, errorMessage: 'Please select a rating from 1 to 5.' }
    }
    return { isValid: true }
  }

  if (question.question_type === 'single_select') {
    if (!answer.option_id) {
      return { isValid: false, errorMessage: 'Please select one option to continue.' }
    }
    return { isValid: true }
  }

  if (question.question_type === 'multi_select') {
    const selected = answer.option_ids || (answer.option_id ? [answer.option_id] : [])
    const min = question.min_selections ?? 1
    const max = question.max_selections ?? 4

    if (selected.length < min) {
      return {
        isValid: false,
        errorMessage: `Please select at least ${min} option${min > 1 ? 's' : ''}.`,
      }
    }

    if (selected.length > max) {
      return {
        isValid: false,
        errorMessage: `You can select a maximum of ${max} options.`,
      }
    }

    return { isValid: true }
  }

  return { isValid: true }
}
