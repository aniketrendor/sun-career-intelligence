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
  AcademicDegreeLevel,
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

export function getQuestionsForAssessment(track: AcademicDegreeLevel = 'UG'): AssessmentQuestion[] {
  const baseQuestions = getAllQuestions()
  if (track === 'PG') {
    return baseQuestions.map((q) => {
      if (q.question_id === 'L3-006') {
        return {
          ...q,
          note: 'Select the postgraduate degree pathways (Masters / MBA / M.Tech / M.Sc) that best fit your goals.',
          options: [
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
          ],
        }
      }
      if (q.question_id === 'L4-008') {
        return {
          ...q,
          note: 'Select the postgraduate specialization comparison you would like to evaluate with a mentor.',
          options: [
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
          ],
        }
      }
      return q
    })
  }
  return baseQuestions
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
