import fs from 'fs'
import path from 'path'

const jsonPath = path.resolve(__dirname, '../src/lib/data/su-career-intelligence-production-data.json')
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const courses = data.courses || []
const dimensions = data.dimensions || []
const validDimIds = new Set(dimensions.map((d: any) => d.dimension_id))

console.log(`Processing ${courses.length} courses...`)

// Domain Rationale Mapping table
const domainRationales: Record<string, string> = {
  TECHNOLOGY: 'Curriculum focused on software architecture, computing systems, algorithms, cloud, AI, or IT solutions.',
  ENGINEERING: 'Curriculum focused on engineering design, robotics, electrical/mechanical systems, construction, or technical modeling.',
  BUSINESS: 'Curriculum focused on management, business administration, enterprise operations, strategic decision making, or commerce.',
  ANALYTICS: 'Curriculum emphasizes statistical modeling, quantitative analysis, data processing, metrics, or financial modeling.',
  SCIENCE: 'Curriculum emphasizes scientific inquiry, mathematics, chemistry, microbiology, biotechnology, or physical sciences.',
  HEALTH_PHARMA: 'Curriculum focused on pharmaceutical formulation, pharmacognosy, medical science, or clinical health systems.',
  DESIGN: 'Curriculum centered on visual aesthetics, UI/UX, product design, spatial design, fashion, or creative media.',
  LAW: 'Curriculum focused on legal systems, constitutional law, jurisprudence, corporate law, or dispute resolution.',
  PEOPLE: 'Curriculum focused on human behavior, personnel management, social structures, community relations, or psychology.',
  COMMUNICATION: 'Curriculum focused on media, corporate communication, public relations, language, or outreach.',
  LOGISTICS: 'Curriculum focused on supply chain, freight systems, procurement, inventory management, or transportation.',
  SECURITY: 'Curriculum focused on cyber defense, digital forensics, security governance, network protection, or physical security.'
}

// 1. Build Program_Domain_Map
const programDomainMap: any[] = []
let pdmCounter = 1

courses.forEach((c: any) => {
  const pId = c.program_id
  let dims = c.domain_ids || []
  
  // Fallback to primary stream or school if domain_ids empty
  if (dims.length === 0) {
    if (c.school?.includes('Engineering') || c.course?.includes('B.Tech') || c.course?.includes('M.Tech')) {
      dims = ['ENGINEERING', 'TECHNOLOGY']
    } else if (c.school?.includes('Management') || c.course?.includes('MBA') || c.course?.includes('BBA')) {
      dims = ['BUSINESS']
    } else if (c.school?.includes('Pharmacy') || c.course?.includes('Pharm')) {
      dims = ['HEALTH_PHARMA']
    } else if (c.school?.includes('Law') || c.course?.includes('LL')) {
      dims = ['LAW']
    } else if (c.school?.includes('Design') || c.course?.includes('Design') || c.course?.includes('B.Des')) {
      dims = ['DESIGN']
    } else if (c.school?.includes('Science') || c.course?.includes('B.Sc') || c.course?.includes('M.Sc')) {
      dims = ['SCIENCE']
    } else {
      dims = ['BUSINESS']
    }
    c.domain_ids = dims
  }

  dims.forEach((dimId: string, idx: number) => {
    if (!validDimIds.has(dimId)) {
      console.warn(`Invalid domain ${dimId} for ${pId}`)
      return
    }

    const isPrimary = idx === 0
    const rationale = domainRationales[dimId] || `Program aligned with ${dimId} competencies and career pathways.`
    
    programDomainMap.push({
      program_domain_map_id: `PDM-${String(pdmCounter).padStart(3, '0')}`,
      program_id: pId,
      domain_id: dimId,
      is_primary_domain: isPrimary,
      mapping_rationale: `${isPrimary ? 'Primary domain alignment: ' : 'Secondary synergy: '}${rationale}`,
      confidence_level: isPrimary ? 'HIGH' : 'MEDIUM',
      review_status: 'APPROVED',
      source_reference: `Sandip University Fees Structure 2026-27 (${c.school})`
    })
    pdmCounter++
  })
})

// 2. Build Distinct Specializations & Program_Specialization_Map
const specMap = new Map<string, { id: string; name: string; school: string; level: string }>()
const programSpecMap: any[] = []
let specCounter = 1
let psmCounter = 1

courses.forEach((c: any) => {
  const pId = c.program_id
  const rawSpec = (c.specialization || '').trim()
  const isGeneric = !rawSpec || rawSpec.toLowerCase() === 'general' || rawSpec.toLowerCase() === 'none' || rawSpec.toLowerCase() === c.course.toLowerCase()
  const cleanSpecName = isGeneric ? 'Core / General Curriculum' : rawSpec

  const specKey = `${c.school}___${c.level}___${cleanSpecName.toLowerCase()}`
  let specId = ''
  
  if (!specMap.has(specKey)) {
    specId = `SPEC-${String(specCounter).padStart(3, '0')}`
    specMap.set(specKey, {
      id: specId,
      name: cleanSpecName,
      school: c.school,
      level: c.level
    })
    specCounter++
  } else {
    specId = specMap.get(specKey)!.id
  }

  programSpecMap.push({
    program_specialization_map_id: `PSM-${String(psmCounter).padStart(3, '0')}`,
    program_id: pId,
    specialization_id: specId,
    specialization_name: cleanSpecName,
    review_status: 'APPROVED',
    source_reference: `Sandip University Course Matrix 2026-27 (${c.course})`
  })
  psmCounter++
})

const specializations = Array.from(specMap.values()).map(s => ({
  specialization_id: s.id,
  specialization_name: s.name,
  school: s.school,
  level: s.level,
  notes: s.name.includes('Core') ? 'Standard baseline degree curriculum' : 'Industry-focused career track specialization'
}))

console.log(`Generated:
- ${programDomainMap.length} Program-to-Domain mappings
- ${specializations.length} Distinct Specializations
- ${programSpecMap.length} Program-to-Specialization mappings`)

// Attach to data
data.program_domain_map = programDomainMap
data.specializations = specializations
data.program_specialization_map = programSpecMap

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
console.log('Successfully updated su-career-intelligence-production-data.json with Section 14 mappings!')
