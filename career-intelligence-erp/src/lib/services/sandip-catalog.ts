import sandipProgramsRaw from '@/lib/data/sandip-programs.json'

export interface SandipProgram {
  program_id: string
  school: string
  level: 'UG' | 'PG' | 'PhD' | 'Diploma'
  course_degree: string
  specialization: string
  name: string
  code: string
  suitable_stream: string
  primary_stream: string
  career_domains: string[]
  notes: string
  duration_years: number
  total_semesters: number
  academic_year: string
  status: string
}

export const SANDIP_MASTER_PROGRAMS: SandipProgram[] = sandipProgramsRaw as SandipProgram[]

export const SANDIP_SCHOOLS = [
  'All Schools',
  'Commerce & Management Studies',
  'Engineering & Technology',
  'Computer Science & Engineering',
  'Design',
  'Science',
  'Law',
  'Pharmaceutical Sciences',
  'Doctoral',
] as const

export const SANDIP_LEVELS = ['ALL', 'UG', 'PG', 'PhD', 'Diploma'] as const

/**
 * Filter Sandip programs by school, level, stream, or search query
 */
export function filterSandipPrograms(params: {
  school?: string
  level?: string
  search?: string
  stream?: string
}): SandipProgram[] {
  let list = [...SANDIP_MASTER_PROGRAMS]

  if (params.school && params.school !== 'All Schools' && params.school !== 'ALL') {
    list = list.filter(p => p.school.toLowerCase() === params.school!.toLowerCase())
  }

  if (params.level && params.level !== 'ALL') {
    list = list.filter(p => p.level.toUpperCase() === params.level!.toUpperCase())
  }

  if (params.stream && params.stream !== 'ALL' && params.stream !== 'Any') {
    const s = params.stream.toLowerCase()
    list = list.filter(p => 
      p.suitable_stream.toLowerCase().includes(s) || 
      p.primary_stream.toLowerCase().includes(s) ||
      p.suitable_stream.toLowerCase().includes('any')
    )
  }

  if (params.search && params.search.trim().length > 0) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.course_degree.toLowerCase().includes(q) ||
      p.specialization.toLowerCase().includes(q) ||
      p.school.toLowerCase().includes(q) ||
      p.career_domains.some(d => d.toLowerCase().includes(q))
    )
  }

  return list
}

/**
 * Suggest matching Sandip University courses given top career domains and academic level
 */
export function getRecommendedSandipCourses(topDomains: string[], level: 'UG' | 'PG' = 'UG', limit: number = 8) {
  const normalizedDomains = topDomains.map(d => d.toLowerCase())
  
  const scored = SANDIP_MASTER_PROGRAMS
    .filter(p => p.level === level)
    .map(program => {
      let score = 40 // base score
      
      program.career_domains.forEach(d => {
        const dLower = d.toLowerCase()
        normalizedDomains.forEach((topD, idx) => {
          if (dLower.includes(topD) || topD.includes(dLower)) {
            // Higher boost for higher-ranked domain
            score += (30 - idx * 5)
          }
        })
      })

      // Bonus for rich specializations
      if (program.specialization) score += 5

      return {
        program,
        matchScore: Math.min(98, Math.max(55, score)),
      }
    })

  scored.sort((a, b) => b.matchScore - a.matchScore)
  return scored.slice(0, limit)
}
