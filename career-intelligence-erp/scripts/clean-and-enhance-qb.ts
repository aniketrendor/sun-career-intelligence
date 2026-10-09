import fs from 'fs'
import path from 'path'

const masterPath = path.resolve(process.cwd(), 'src/lib/data/qb-v2/master-qb-891.json')
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'))

function cleanStem(text: string, targetProg: string = ''): string {
  let cleaned = text.trim()
  
  // Handle [Program Name] prefix
  if (cleaned.startsWith('[')) {
    const closeIdx = cleaned.indexOf(']')
    if (closeIdx !== -1) {
      const progPrefix = cleaned.slice(1, closeIdx).trim()
      const remainder = cleaned.slice(closeIdx + 1).trim()
      
      // Make remainder natural and professional
      if (remainder.toLowerCase().startsWith('which role')) {
        cleaned = `In ${progPrefix}, which professional role would you prefer?`
      } else if (remainder.toLowerCase().startsWith('which focus')) {
        cleaned = `In ${progPrefix}, which specialization area interests you most?`
      } else if (remainder.toLowerCase().startsWith('which project would you rather lead')) {
        cleaned = `In ${progPrefix}, which capstone project would you rather lead?`
      } else if (remainder.toLowerCase().startsWith('which industry')) {
        cleaned = `With a background in ${progPrefix}, which industry sector would you join?`
      } else if (remainder.toLowerCase().startsWith('which challenge')) {
        cleaned = `In ${progPrefix}, which technical challenge would you solve?`
      } else {
        cleaned = `${remainder} (${progPrefix})`
      }
    }
  }

  // Ensure ends with question mark
  if (!cleaned.endsWith('?') && !cleaned.endsWith(':') && !cleaned.endsWith('.')) {
    cleaned = cleaned + '?'
  }

  return cleaned
}

// Enhance options to ensure at least 4 options
masterData.questions.forEach((q: any) => {
  q.questionText = cleanStem(q.questionText, q.target)

  // Expand short options
  if (q.id === 'PHA-UG-L3-01' && q.options.length === 2) {
    q.options.push({
      id: 'PHA-UG-L3-01_C',
      key: 'C',
      rawText: 'Pharm.D (clinical doctorate in pharmacotherapy) [DOMAIN:HEALTH/SCI]',
      displayText: 'Pharm.D (6-year clinical doctorate in hospital pharmacotherapy)',
      signals: ['DOMAIN:HEALTH', 'PROG:SUN-065'],
      targetProgramIds: ['SUN-065', 'SUN-066'],
      targetDomainCodes: ['HEALTH'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
    q.options.push({
      id: 'PHA-UG-L3-01_D',
      key: 'D',
      rawText: 'B.Sc Pharmaceutical Chemistry (industrial formulation & drug QA) [DOMAIN:HEALTH/SCI]',
      displayText: 'B.Sc Pharmaceutical Chemistry (industrial formulation & drug QA)',
      signals: ['DOMAIN:HEALTH', 'DOMAIN:SCI'],
      targetProgramIds: ['SUN-065', 'SUN-086'],
      targetDomainCodes: ['HEALTH', 'SCI'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
  }

  if (q.id === 'L1-07' && q.options.length === 2) {
    q.options.push({
      id: 'L1-07_C',
      key: 'C',
      rawText: 'Project-based sprints with measurable milestones [DOMAIN:TECH/ENG]',
      displayText: 'Project-based agile sprints with measurable milestones',
      signals: ['DOMAIN:TECH', 'DOMAIN:ENG'],
      targetProgramIds: [],
      targetDomainCodes: ['TECH', 'ENG'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
    q.options.push({
      id: 'L1-07_D',
      key: 'D',
      rawText: 'Client-driven strategic consultations and team collaboration [DOMAIN:BUS/MEDIA]',
      displayText: 'Client-driven strategic consultations and team collaboration',
      signals: ['DOMAIN:BUS', 'DOMAIN:MEDIA'],
      targetProgramIds: [],
      targetDomainCodes: ['BUS', 'MEDIA'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
  }

  if (q.id === 'L1-09' && q.options.length === 3) {
    q.options.push({
      id: 'L1-09_D',
      key: 'D',
      rawText: 'I thrive in pioneering emerging sectors and high-growth startups [DOMAIN:TECH/BUS]',
      displayText: 'I thrive in pioneering emerging sectors and high-growth startups',
      signals: ['DOMAIN:TECH', 'DOMAIN:BUS'],
      targetProgramIds: [],
      targetDomainCodes: ['TECH', 'BUS'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
  }

  if (q.id === 'CSE-L3-03' && q.options.length === 3) {
    q.options.push({
      id: 'CSE-L3-03_D',
      key: 'D',
      rawText: 'Integrated degree with specialized cloud & cybersecurity certifications [DOMAIN:TECH]',
      displayText: 'Integrated degree with specialized cloud & cybersecurity certifications',
      signals: ['DOMAIN:TECH', 'PROG:SUN-023'],
      targetProgramIds: ['SUN-020', 'SUN-023'],
      targetDomainCodes: ['TECH'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
  }

  if (q.id === 'LAW-UG-L3-01' && q.options.length === 3) {
    q.options.push({
      id: 'LAW-UG-L3-01_D',
      key: 'D',
      rawText: 'B.Sc. LL.B. (Hons.), combining cyber law, forensics, and technology [DOMAIN:LAW/TECH]',
      displayText: 'B.Sc. LL.B. (Hons.), combining cyber law, forensics, and technology',
      signals: ['DOMAIN:LAW', 'DOMAIN:TECH'],
      targetProgramIds: ['SUN-071', 'SUN-073'],
      targetDomainCodes: ['LAW', 'TECH'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
  }

  if (q.id === 'PHA-PG-L2-01' && q.options.length === 3) {
    q.options.push({
      id: 'PHA-PG-L2-01_D',
      key: 'D',
      rawText: 'Clinical Pharmacy and Hospital Therapeutics [DOMAIN:HEALTH]',
      displayText: 'Clinical Pharmacy and Hospital Therapeutics',
      signals: ['DOMAIN:HEALTH', 'PROG:SUN-067'],
      targetProgramIds: ['SUN-067', 'SUN-068'],
      targetDomainCodes: ['HEALTH'],
      targetProgramFamilyCodes: [],
      targetCourseCodes: [],
      isNeutral: false,
    })
  }
})

fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2), 'utf8')
console.log('Successfully polished question texts and expanded options in master-qb-891.json!')
