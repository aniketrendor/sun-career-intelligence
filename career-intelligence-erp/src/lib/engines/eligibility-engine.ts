/**
 * Academic Eligibility & Prerequisite Verification Engine
 * Sandip University (SU-CIS-2026-27-v1)
 *
 * Production Rule: Interest scores must NEVER override mandatory admission requirements.
 */

import type {
  UniversityCourse,
  StudentProfileContext,
  EligibilityStatus,
} from '@/lib/types/assessment-v3.types'

export interface EligibilityResult {
  status: EligibilityStatus
  is_prerequisite_met: boolean
  required_stream: string
  reason: string
  notes?: string
}

export function evaluateCourseEligibility(
  course: UniversityCourse,
  profile: StudentProfileContext
): EligibilityResult {
  const reqStream = course.suitable_12th_stream || 'Any'
  const studentTrack = profile.academicLevel || 'UG'
  const studentStream = (profile.stream || '').trim().toLowerCase()

  // 1. Degree Level Verification
  if (course.level !== studentTrack) {
    return {
      status: 'INELIGIBLE',
      is_prerequisite_met: false,
      required_stream: reqStream,
      reason: `Program degree level (${course.level}) does not match student target level (${studentTrack}).`,
      notes: course.notes,
    }
  }

  // 2. Stream Prerequisite Evaluation for Undergraduate Programs
  if (course.level === 'UG') {
    const reqStreamLower = reqStream.toLowerCase()

    if (reqStreamLower === 'any' || reqStreamLower === 'open to all' || reqStreamLower === '') {
      return {
        status: 'VERIFIED_ELIGIBLE',
        is_prerequisite_met: true,
        required_stream: 'Open to all 12th streams',
        reason: 'Candidate meets general Sandip University 12th pass admission prerequisites.',
        notes: course.notes,
      }
    }

    if (!studentStream || studentStream === 'not specified' || studentStream === 'other') {
      return {
        status: 'CONDITIONAL_REVIEW',
        is_prerequisite_met: true,
        required_stream: reqStream,
        reason: `Requires formal verification of 12th standard mark sheet with ${reqStream} subjects.`,
        notes: course.notes,
      }
    }

    // PCM Requirements (Engineering, Architecture, BCA Tech, Aviation, etc.)
    if (reqStreamLower.includes('pcm')) {
      if (studentStream.includes('pcm') || studentStream.includes('physics') || studentStream.includes('math')) {
        return {
          status: 'VERIFIED_ELIGIBLE',
          is_prerequisite_met: true,
          required_stream: reqStream,
          reason: 'Candidate profile satisfies the mandatory Physics, Chemistry & Mathematics (PCM) prerequisite.',
          notes: course.notes,
        }
      } else if (studentStream.includes('commerce') || studentStream.includes('arts') || studentStream.includes('humanities')) {
        return {
          status: 'INELIGIBLE',
          is_prerequisite_met: false,
          required_stream: reqStream,
          reason: `Mandatory Physics & Mathematics prerequisite required. Student stream (${profile.stream}) is not eligible for direct B.Tech/Engineering admissions.`,
          notes: course.notes,
        }
      } else {
        return {
          status: 'CONDITIONAL_REVIEW',
          is_prerequisite_met: true,
          required_stream: reqStream,
          reason: `Subject to counseling verification of minimum 45% (40% reserved) aggregate in Physics & Mathematics.`,
          notes: course.notes,
        }
      }
    }

    // PCB Requirements (Pharmacy, Health Sciences, Microbiology, Bio-Technology)
    if (reqStreamLower.includes('pcb') || reqStreamLower.includes('biology')) {
      if (studentStream.includes('pcb') || studentStream.includes('biology') || studentStream.includes('science')) {
        return {
          status: 'VERIFIED_ELIGIBLE',
          is_prerequisite_met: true,
          required_stream: reqStream,
          reason: 'Candidate profile satisfies the Biology/Life Sciences prerequisite.',
          notes: course.notes,
        }
      } else if (studentStream.includes('commerce') || studentStream.includes('arts')) {
        return {
          status: 'INELIGIBLE',
          is_prerequisite_met: false,
          required_stream: reqStream,
          reason: `Mandatory Biology/Life Sciences prerequisite required. Student stream (${profile.stream}) does not meet pharmacy/health admission criteria.`,
          notes: course.notes,
        }
      }
    }

    // Commerce Requirements
    if (reqStreamLower.includes('commerce')) {
      if (studentStream.includes('commerce') || studentStream.includes('any') || studentStream.includes('science')) {
        return {
          status: 'VERIFIED_ELIGIBLE',
          is_prerequisite_met: true,
          required_stream: reqStream,
          reason: 'Candidate profile satisfies Commerce & Management eligibility.',
          notes: course.notes,
        }
      }
    }
  }

  // 3. Postgraduate / Doctoral Evaluation
  if (course.level === 'PG') {
    const prevDegree = (profile.previousDegree || profile.stream || '').toLowerCase()
    const courseDegree = (course.course || '').toUpperCase()

    // MBA and Management: Open to all recognized Bachelor degrees
    if (courseDegree.includes('MBA') || courseDegree.includes('MANAGEMENT') || course.specialization.toLowerCase().includes('management')) {
      return {
        status: 'VERIFIED_ELIGIBLE',
        is_prerequisite_met: true,
        required_stream: 'Any recognized Bachelor degree',
        reason: 'Candidate meets general postgraduate admission prerequisites (open to all graduate disciplines).',
        notes: course.notes,
      }
    }

    // M.Tech: Requires B.Tech / B.E. in relevant engineering
    if (courseDegree.includes('M.TECH') || courseDegree.includes('ENGINEERING')) {
      if (prevDegree.includes('b.tech') || prevDegree.includes('b.e') || prevDegree.includes('engineering')) {
        return {
          status: 'VERIFIED_ELIGIBLE',
          is_prerequisite_met: true,
          required_stream: 'B.Tech / B.E. in relevant discipline',
          reason: 'Candidate profile satisfies the engineering prerequisite for M.Tech admissions.',
          notes: course.notes,
        }
      } else if (prevDegree && (prevDegree.includes('bba') || prevDegree.includes('b.com') || prevDegree.includes('arts') || prevDegree.includes('commerce') || prevDegree.includes('llb') || prevDegree.includes('b.pharm'))) {
        return {
          status: 'INELIGIBLE',
          is_prerequisite_met: false,
          required_stream: 'B.Tech / B.E. in relevant discipline',
          reason: `M.Tech requires a recognized B.Tech/B.E. degree. Non-engineering background (${profile.previousDegree || profile.stream}) is not eligible for direct M.Tech.`,
          notes: course.notes,
        }
      } else {
        return {
          status: 'CONDITIONAL_REVIEW',
          is_prerequisite_met: true,
          required_stream: 'B.Tech / B.E. in relevant discipline',
          reason: 'Requires formal verification of Bachelor of Technology (B.Tech / B.E.) graduation credentials.',
          notes: course.notes,
        }
      }
    }

    // LL.M: Requires LL.B.
    if (courseDegree.includes('LL.M') || courseDegree.includes('LAW')) {
      if (prevDegree.includes('ll.b') || prevDegree.includes('llb') || prevDegree.includes('law')) {
        return {
          status: 'VERIFIED_ELIGIBLE',
          is_prerequisite_met: true,
          required_stream: 'LL.B. (3-year or 5-year)',
          reason: 'Candidate satisfies the prerequisite LL.B. degree for LL.M. admissions.',
          notes: course.notes,
        }
      } else if (prevDegree && !prevDegree.includes('law')) {
        return {
          status: 'CONDITIONAL_REVIEW',
          is_prerequisite_met: false,
          required_stream: 'LL.B. (3-year or 5-year)',
          reason: 'Requires recognized LL.B. degree from a Bar Council of India approved institution.',
          notes: course.notes,
        }
      }
    }

    // M.Pharm: Requires B.Pharm
    if (courseDegree.includes('M.PHARM') || courseDegree.includes('PHARMACY')) {
      if (prevDegree.includes('b.pharm') || prevDegree.includes('pharm')) {
        return {
          status: 'VERIFIED_ELIGIBLE',
          is_prerequisite_met: true,
          required_stream: 'B.Pharm (PCI approved)',
          reason: 'Candidate satisfies the B.Pharm prerequisite for M.Pharm admissions.',
          notes: course.notes,
        }
      } else {
        return {
          status: 'CONDITIONAL_REVIEW',
          is_prerequisite_met: true,
          required_stream: 'B.Pharm (PCI approved)',
          reason: 'Requires recognized B.Pharm degree from a Pharmacy Council of India approved institution.',
          notes: course.notes,
        }
      }
    }

    return {
      status: 'VERIFIED_ELIGIBLE',
      is_prerequisite_met: true,
      required_stream: reqStream,
      reason: `Requires recognized Bachelor's Degree with minimum passing grade.`,
      notes: course.notes,
    }
  }

  if (course.level === 'PhD') {
    return {
      status: 'CONDITIONAL_REVIEW',
      is_prerequisite_met: true,
      required_stream: 'Master’s Degree (55% aggregate)',
      reason: 'Requires Master’s Degree with minimum 55% and Sandip University Ph.D. Entrance Test (SUN-PET) / UGC-NET / CSIR-NET qualification.',
      notes: course.notes,
    }
  }

  return {
    status: 'VERIFIED_ELIGIBLE',
    is_prerequisite_met: true,
    required_stream: reqStream,
    reason: 'Standard university eligibility criteria apply.',
    notes: course.notes,
  }
}
