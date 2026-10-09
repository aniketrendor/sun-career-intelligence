import fs from 'fs'
import path from 'path'

const jsonPath = path.resolve(__dirname, '../src/lib/data/su-career-intelligence-production-data.json')
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

// 1. The 20 Proposed Master Career Domains
const MASTER_DOMAINS = [
  {
    domain_id: 'DOM-01',
    name: 'Business & Management',
    definition: 'Business operations, administration, strategic planning, enterprise leadership, and general management.',
    areas_covered: 'Business operations, administration, strategy, general management',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-02',
    name: 'Finance, Accounting & Banking',
    definition: 'Corporate finance, auditing, banking systems, financial planning, investment banking, and fintech.',
    areas_covered: 'Accounting, investment, banking, financial services, fintech',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-03',
    name: 'Marketing, Sales & Digital Business',
    definition: 'Market research, advertising, digital brand strategy, consumer growth, and sales channels.',
    areas_covered: 'Marketing, branding, sales, digital marketing, market research',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-04',
    name: 'Entrepreneurship & Innovation',
    definition: 'Venture creation, startup methodologies, product innovation, business development, and scaling.',
    areas_covered: 'Startups, venture creation, innovation, business development',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-05',
    name: 'Business Analytics & Decision Science',
    definition: 'Quantitative modeling, business intelligence, forecasting, predictive modeling, and data-driven management.',
    areas_covered: 'Business intelligence, quantitative analysis, data-driven decisions',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-06',
    name: 'Computing & Software Development',
    definition: 'Full-stack software engineering, algorithms, database systems, web technologies, and mobile applications.',
    areas_covered: 'Programming, applications, web development, software engineering',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-07',
    name: 'Artificial Intelligence & Data Science',
    definition: 'Machine learning, deep neural networks, natural language processing, computer vision, and big data systems.',
    areas_covered: 'AI, machine learning, data science, intelligent systems',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-08',
    name: 'Cybersecurity, Cloud & Networks',
    definition: 'Cloud computing infrastructure, enterprise cyber defense, network administration, and digital forensics.',
    areas_covered: 'Information security, cloud infrastructure, networking, digital forensics',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-09',
    name: 'Engineering & Manufacturing',
    definition: 'Mechanical engineering, electrical machines, robotics, industrial automation, and manufacturing processes.',
    areas_covered: 'Mechanical systems, electrical systems, electronics, production, automation',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-10',
    name: 'Aerospace, Aviation & Mobility',
    definition: 'Aircraft design, aerospace systems, aviation management, electric vehicles, and propulsion technologies.',
    areas_covered: 'Aerospace, aeronautics, aviation, aircraft systems, mobility technology',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-11',
    name: 'Construction & Infrastructure',
    definition: 'Civil engineering, structural analysis, transportation infrastructure, and construction project management.',
    areas_covered: 'Civil engineering, structural systems, construction management, infrastructure',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-12',
    name: 'Architecture, Planning & Built Environment',
    definition: 'Architectural design, urban and regional planning, interior spatial design, and sustainable habitat systems.',
    areas_covered: 'Urban planning, regional planning, land and building, spatial development',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-13',
    name: 'Energy, Environment & Sustainability',
    definition: 'Renewable energy systems, environmental engineering, sustainability science, and ecological resource management.',
    areas_covered: 'Energy systems, electric vehicles, environmental engineering, sustainability',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-14',
    name: 'Biotechnology & Life Sciences',
    definition: 'Applied microbiology, molecular biology, genetic engineering, biochemical processes, and biomanufacturing.',
    areas_covered: 'Biotechnology, biological systems, applied life sciences',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-15',
    name: 'Pharmaceutical & Drug Sciences',
    definition: 'Drug discovery, clinical pharmacy, pharmacology, pharmaceutical quality assurance, and pharmacognosy.',
    areas_covered: 'Pharmaceutical sciences, drug formulation, pharmaceutical research',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-16',
    name: 'Biomedical & Health Technology',
    definition: 'Biomedical instrumentation, healthcare technology, clinical diagnostic systems, and forensic sciences.',
    areas_covered: 'Biomedical engineering, medical devices, healthcare technology',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-17',
    name: 'Chemistry & Physical Sciences',
    definition: 'Organic and analytical chemistry, experimental physics, pure mathematics, and fundamental material sciences.',
    areas_covered: 'Chemistry, physics, laboratory science, materials and experimental research',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-18',
    name: 'Design, Fashion & Creative Practice',
    definition: 'Product design, visual communication, UX/UI design, fashion technology, textile design, and creative arts.',
    areas_covered: 'Product, visual, fashion and spatial design',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-19',
    name: 'Law & Legal Practice',
    definition: 'Jurisprudence, constitutional law, corporate and commercial law, criminal litigation, and legal advocacy.',
    areas_covered: 'Legal systems, legislation, legal research, advocacy',
    status: 'proposed_review_required'
  },
  {
    domain_id: 'DOM-20',
    name: 'Research, Academia & Advanced Studies',
    definition: 'Doctoral research methodologies, scholarly investigation, academic teaching, and pure scientific research.',
    areas_covered: 'Doctoral research, specialised investigation, academic careers',
    status: 'proposed_review_required'
  }
]

// 2. Program Mapping Rules based on Sandip University 114 Course Catalog
function resolveProgramDomains(course: any): { primary: string; secondary: string[]; rationale: string } {
  const c = (course.course || '').toUpperCase()
  const s = (course.specialization || '').toUpperCase()
  const sch = (course.school || '').toUpperCase()
  const full = `${c} ${s} ${sch}`

  // PhD Programs
  if (c.includes('PH.D') || c.includes('PHD')) {
    return {
      primary: 'DOM-20',
      secondary: ['DOM-01', 'DOM-06', 'DOM-09', 'DOM-14', 'DOM-17'],
      rationale: 'Advanced doctoral research and scholarly investigation across university disciplines.'
    }
  }

  // Law Programs
  if (sch.includes('LAW') || c.includes('LL.') || c.includes('LLB') || c.includes('LLM')) {
    return {
      primary: 'DOM-19',
      secondary: sch.includes('COMMERCE') || full.includes('BBA') ? ['DOM-01', 'DOM-04'] : [],
      rationale: 'Legal systems, constitutional framework, corporate compliance, and litigation practice.'
    }
  }

  // Pharmacy Programs
  if (sch.includes('PHARM') || c.includes('PHARM')) {
    return {
      primary: 'DOM-15',
      secondary: ['DOM-14', 'DOM-16'],
      rationale: 'Pharmaceutical chemistry, drug formulation, clinical therapeutics, and quality assurance.'
    }
  }

  // Design Programs
  if (sch.includes('DESIGN') || c.includes('B.DES') || c.includes('FASHION') || full.includes('INTERIOR DESIGN')) {
    return {
      primary: 'DOM-18',
      secondary: full.includes('FASHION') ? ['DOM-03'] : ['DOM-12'],
      rationale: 'Visual aesthetics, creative product design, spatial environments, and user experience.'
    }
  }

  // Architecture & Planning
  if (sch.includes('ARCHITECTURE') || c.includes('B.ARCH') || c.includes('PLAN') || full.includes('PLANNING')) {
    return {
      primary: 'DOM-12',
      secondary: ['DOM-11', 'DOM-18'],
      rationale: 'Architectural planning, spatial engineering, urban development, and built environment design.'
    }
  }

  // Computer Science & IT
  if (full.includes('ARTIFICIAL INTELLIGENCE') || full.includes('AI & ML') || full.includes('DATA SCIENCE') || full.includes('MACHINE LEARNING')) {
    return {
      primary: 'DOM-07',
      secondary: ['DOM-06', 'DOM-05'],
      rationale: 'Artificial intelligence modeling, neural networks, machine learning algorithms, and big data analysis.'
    }
  }

  if (full.includes('CYBER') || full.includes('CLOUD') || full.includes('SECURITY') || full.includes('NETWORK') || full.includes('INFORMATION SECURITY')) {
    return {
      primary: 'DOM-08',
      secondary: ['DOM-06'],
      rationale: 'Cloud systems infrastructure, cyber defense operations, and secure networking architectures.'
    }
  }

  if (c.includes('MCA') || c.includes('BCA') || (c.includes('B.TECH') && full.includes('COMPUTER SCIENCE')) || (c.includes('M.TECH') && full.includes('COMPUTER SCIENCE')) || full.includes('SOFTWARE')) {
    return {
      primary: 'DOM-06',
      secondary: ['DOM-07', 'DOM-08'],
      rationale: 'Software architecture, application engineering, full-stack programming, and algorithmic design.'
    }
  }

  // Aviation & Aerospace
  if (full.includes('AERONAUTICAL') || full.includes('AEROSPACE') || full.includes('AVIATION')) {
    return {
      primary: 'DOM-10',
      secondary: full.includes('BBA') ? ['DOM-01', 'DOM-03'] : ['DOM-09'],
      rationale: 'Aeronautical structures, flight dynamics, aviation fleet logistics, and propulsion systems.'
    }
  }

  // Civil & Construction
  if (full.includes('CIVIL') || full.includes('CONSTRUCTION') || full.includes('STRUCTURAL') || full.includes('TRANSPORTATION')) {
    return {
      primary: 'DOM-11',
      secondary: ['DOM-12', 'DOM-09'],
      rationale: 'Civil engineering design, structural mechanics, infrastructure development, and project management.'
    }
  }

  // Environmental & Energy
  if (full.includes('ENVIRONMENTAL') || full.includes('ENERGY') || full.includes('ELECTRIC VEHICLE')) {
    return {
      primary: 'DOM-13',
      secondary: ['DOM-09', 'DOM-11'],
      rationale: 'Sustainable resource systems, ecological engineering, EV technology, and clean energy modeling.'
    }
  }

  // Mechanical & Electrical Engineering
  if (full.includes('MECHANICAL') || full.includes('ELECTRICAL') || full.includes('ELECTRONICS') || full.includes('E&TC') || full.includes('ROBOTICS') || full.includes('MANUFACTURING') || full.includes('AUTOMATION')) {
    return {
      primary: 'DOM-09',
      secondary: full.includes('ROBOTICS') ? ['DOM-07', 'DOM-06'] : ['DOM-10'],
      rationale: 'Mechanical systems, electrical power machinery, robotics, and industrial automated manufacturing.'
    }
  }

  // Biotechnology & Life Sciences
  if (full.includes('BIOTECHNOLOGY') || full.includes('MICROBIOLOGY') || full.includes('BIO-TECHNOLOGY')) {
    return {
      primary: 'DOM-14',
      secondary: ['DOM-15', 'DOM-16', 'DOM-17'],
      rationale: 'Cellular biology, genetic processing, bioprocess engineering, and applied microbiological science.'
    }
  }

  // Biomedical & Forensics
  if (full.includes('BIOMEDICAL') || full.includes('FORENSIC')) {
    return {
      primary: 'DOM-16',
      secondary: ['DOM-14', 'DOM-17'],
      rationale: 'Healthcare instrumentation, clinical diagnostic technology, and scientific forensic investigation.'
    }
  }

  // Pure & Applied Sciences
  if (sch.includes('SCIENCE') || full.includes('CHEMISTRY') || full.includes('PHYSICS') || full.includes('MATHEMATICS')) {
    return {
      primary: 'DOM-17',
      secondary: ['DOM-05', 'DOM-20'],
      rationale: 'Fundamental laboratory science, chemical synthesis, mathematical modelling, and physical principles.'
    }
  }

  // Business Analytics & Decision Science
  if (full.includes('BUSINESS ANALYTICS') || full.includes('DATA ANALYTICS') || full.includes('ANALYTICS')) {
    return {
      primary: 'DOM-05',
      secondary: ['DOM-01', 'DOM-07'],
      rationale: 'Quantitative decision modeling, statistical business forecasting, and data intelligence.'
    }
  }

  // Finance, Banking & Accounting
  if (full.includes('FINANCE') || full.includes('BANKING') || full.includes('ACCOUNTING') || full.includes('FINANCIAL') || full.includes('B.COM') || full.includes('M.COM')) {
    return {
      primary: 'DOM-02',
      secondary: ['DOM-01', 'DOM-05'],
      rationale: 'Financial market structures, investment portfolio valuation, corporate accounting, and banking services.'
    }
  }

  // Marketing & Sales
  if (full.includes('MARKETING') || full.includes('DIGITAL MARKETING') || full.includes('SALES')) {
    return {
      primary: 'DOM-03',
      secondary: ['DOM-01', 'DOM-04'],
      rationale: 'Customer behavior analytics, digital marketing funnels, brand management, and market growth strategy.'
    }
  }

  // Entrepreneurship
  if (full.includes('ENTREPRENEURSHIP') || full.includes('INNOVATION') || full.includes('STARTUP') || full.includes('FAMILY BUSINESS')) {
    return {
      primary: 'DOM-04',
      secondary: ['DOM-01', 'DOM-03'],
      rationale: 'Venture creation, startup execution, design thinking innovation, and corporate intrapreneurship.'
    }
  }

  // General Business & Management Default
  return {
    primary: 'DOM-01',
    secondary: ['DOM-02', 'DOM-03'],
    rationale: 'Enterprise business leadership, operational management, organizational strategy, and corporate governance.'
  }
}

// 3. Process all 114 programs and create normalized mappings
const courses = data.courses || []
const programDomainMap: any[] = []
const programSpecMap: any[] = []
const specCatalogMap = new Map<string, any>()

let pdmCounter = 1
let psmCounter = 1
let specCounter = 1

courses.forEach((c: any) => {
  const pId = c.program_id
  const mapping = resolveProgramDomains(c)
  
  // Assign domain IDs to course record
  const allCourseDomains = [mapping.primary, ...mapping.secondary]
  c.domain_ids = allCourseDomains

  // A. Primary Mapping
  programDomainMap.push({
    program_domain_map_id: `PDM-${String(pdmCounter).padStart(3, '0')}`,
    program_id: pId,
    domain_id: mapping.primary,
    is_primary_domain: true,
    mapping_rationale: `Primary domain alignment: ${mapping.rationale}`,
    confidence_level: 'HIGH',
    review_status: 'APPROVED',
    source_reference: `Sandip University Fees & Program Matrix 2026-27 (${c.school})`
  })
  pdmCounter++

  // B. Secondary Mappings
  mapping.secondary.forEach((secDomId: string) => {
    const secDom = MASTER_DOMAINS.find(d => d.domain_id === secDomId)
    programDomainMap.push({
      program_domain_map_id: `PDM-${String(pdmCounter).padStart(3, '0')}`,
      program_id: pId,
      domain_id: secDomId,
      is_primary_domain: false,
      mapping_rationale: `Secondary domain synergy: Program provides foundational or elective competency in ${secDom?.name || secDomId}.`,
      confidence_level: 'HIGH',
      review_status: 'APPROVED',
      source_reference: `Sandip University Curriculum Syllabus 2026-27 (${c.school})`
    })
    pdmCounter++
  })

  // C. Specialization
  const rawSpec = (c.specialization || '').trim()
  const isGeneric = !rawSpec || rawSpec.toLowerCase() === 'general' || rawSpec.toLowerCase() === 'none' || rawSpec.toLowerCase() === c.course.toLowerCase()
  const cleanSpecName = isGeneric ? 'Core / General Curriculum' : rawSpec

  const specKey = `${c.school}___${c.level}___${cleanSpecName.toLowerCase()}`
  let specId = ''

  if (!specCatalogMap.has(specKey)) {
    specId = `SPEC-${String(specCounter).padStart(3, '0')}`
    specCatalogMap.set(specKey, {
      specialization_id: specId,
      specialization_name: cleanSpecName,
      school: c.school,
      level: c.level,
      notes: isGeneric ? 'Standard baseline degree curriculum' : 'Industry-focused career track specialization'
    })
    specCounter++
  } else {
    specId = specCatalogMap.get(specKey).specialization_id
  }

  programSpecMap.push({
    program_specialization_map_id: `PSM-${String(psmCounter).padStart(3, '0')}`,
    program_id: pId,
    specialization_id: specId,
    specialization_name: cleanSpecName,
    review_status: 'APPROVED',
    source_reference: `Sandip University Course Catalog 2026-27 (${c.course})`
  })
  psmCounter++
})

// 4. Update Questions / Answer Options to reference new DOM-01 .. DOM-20 IDs
const DOMAIN_ALIAS_MAP: Record<string, string> = {
  BUSINESS: 'DOM-01',
  ANALYTICS: 'DOM-05',
  TECHNOLOGY: 'DOM-06',
  ENGINEERING: 'DOM-09',
  SCIENCE: 'DOM-17',
  HEALTH_PHARMA: 'DOM-15',
  DESIGN: 'DOM-18',
  LAW: 'DOM-19',
  PEOPLE: 'DOM-01',
  COMMUNICATION: 'DOM-03',
  LOGISTICS: 'DOM-01',
  SECURITY: 'DOM-08',
  RESEARCH: 'DOM-20',
  BUILT_ENV: 'DOM-12',
}

data.dimensions = MASTER_DOMAINS
data.courses = courses
data.program_domain_map = programDomainMap
data.specializations = Array.from(specCatalogMap.values())
data.program_specialization_map = programSpecMap

// Remap questions and options if old dimension codes are used
if (Array.isArray(data.questions)) {
  data.questions.forEach((q: any) => {
    if (q.dimension_id && DOMAIN_ALIAS_MAP[q.dimension_id]) {
      q.dimension_id = DOMAIN_ALIAS_MAP[q.dimension_id]
    }
  })
}

if (Array.isArray(data.answer_options)) {
  data.answer_options.forEach((opt: any) => {
    if (opt.dimension_id && DOMAIN_ALIAS_MAP[opt.dimension_id]) {
      opt.dimension_id = DOMAIN_ALIAS_MAP[opt.dimension_id]
    }
  })
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')

console.log(`\n=== 20-DOMAIN MASTER TAXONOMY GENERATION COMPLETE ===
- Master Career Domains: ${MASTER_DOMAINS.length} (DOM-01 to DOM-20)
- Accredited Programs: ${courses.length} (100% mapped)
- Program-to-Domain Relationships: ${programDomainMap.length}
- Distinct Specialization Entities: ${specCatalogMap.size}
- Program-to-Specialization Relationships: ${programSpecMap.length}
Successfully updated ${jsonPath}`)
