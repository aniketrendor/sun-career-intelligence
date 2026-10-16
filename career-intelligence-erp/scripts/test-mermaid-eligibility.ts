import {
  PROGRAMS,
  DOMAINS
} from '../src/lib/data/su-career-data'

export type UGEligibilityCategory = 
  | 'PCM'
  | 'PCB_PCM'
  | 'SCIENCE'
  | 'SCIENCE_MATH'
  | 'SCIENCE_CHEM'
  | 'SCIENCE_PHY'
  | 'ANY'

export type PGEligibilityCategory =
  | 'RELEVANT_ENG'
  | 'RELEVANT_ENG_SCI'
  | 'CIVIL_ARCH'
  | 'RELEVANT_DEGREE'
  | 'ANY_GRAD_MATH'
  | 'ANY_GRAD'
  | 'B_PHARM'
  | 'LAW_DEGREE'
  | 'RELEVANT_SCI'
  | 'GRADUATION'

export type PhDEligibilityCategory =
  | 'RELEVANT_MASTER'

export interface ProgramEligibilityRule {
  programId: string
  level: 'UG' | 'PG' | 'PhD' | 'Diploma'
  category: UGEligibilityCategory | PGEligibilityCategory | PhDEligibilityCategory
  ruleLabel: string
  ruleDesc: string
}

export const PROGRAM_ELIGIBILITY_RULES: Record<string, ProgramEligibilityRule> = {
  // --- UG: PCM ---
  'SUN-001': { programId: 'SUN-001', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-002': { programId: 'SUN-002', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-003': { programId: 'SUN-003', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-004': { programId: 'SUN-004', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-005': { programId: 'SUN-005', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-006': { programId: 'SUN-006', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-009': { programId: 'SUN-009', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-020': { programId: 'SUN-020', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-021': { programId: 'SUN-021', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-022': { programId: 'SUN-022', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-023': { programId: 'SUN-023', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-024': { programId: 'SUN-024', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-025': { programId: 'SUN-025', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-026': { programId: 'SUN-026', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-027': { programId: 'SUN-027', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-028': { programId: 'SUN-028', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },
  'SUN-029': { programId: 'SUN-029', level: 'UG', category: 'PCM', ruleLabel: 'PCM', ruleDesc: '12th Science with Physics, Chemistry & Mathematics' },

  // --- UG: PCB / PCM ---
  'SUN-007': { programId: 'SUN-007', level: 'UG', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },
  'SUN-008': { programId: 'SUN-008', level: 'UG', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },
  'SUN-065': { programId: 'SUN-065', level: 'Diploma', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },
  'SUN-066': { programId: 'SUN-066', level: 'UG', category: 'PCB_PCM', ruleLabel: 'PCB / PCM', ruleDesc: '12th Science with PCB or PCM' },

  // --- UG: Science ---
  'SUN-078': { programId: 'SUN-078', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-079': { programId: 'SUN-079', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-080': { programId: 'SUN-080', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-081': { programId: 'SUN-081', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },
  'SUN-085': { programId: 'SUN-085', level: 'UG', category: 'SCIENCE', ruleLabel: 'Science', ruleDesc: '12th Science (any Science stream)' },

  // --- UG: Science + Mathematics ---
  'SUN-030': { programId: 'SUN-030', level: 'UG', category: 'SCIENCE_MATH', ruleLabel: 'Science + Mathematics', ruleDesc: '12th Science with Mathematics' },
  'SUN-082': { programId: 'SUN-082', level: 'UG', category: 'SCIENCE_MATH', ruleLabel: 'Science + Mathematics', ruleDesc: '12th Science with Mathematics' },

  // --- UG: Science + Chemistry ---
  'SUN-083': { programId: 'SUN-083', level: 'UG', category: 'SCIENCE_CHEM', ruleLabel: 'Science + Chemistry', ruleDesc: '12th Science with Chemistry' },

  // --- UG: Science + Physics & Mathematics ---
  'SUN-084': { programId: 'SUN-084', level: 'UG', category: 'SCIENCE_PHY', ruleLabel: 'Science + Physics & Mathematics', ruleDesc: '12th Science with Physics & Mathematics' },

  // --- UG: Any 12th Stream ---
  'SUN-031': { programId: 'SUN-031', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-036': { programId: 'SUN-036', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-037': { programId: 'SUN-037', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-038': { programId: 'SUN-038', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-039': { programId: 'SUN-039', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-040': { programId: 'SUN-040', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-041': { programId: 'SUN-041', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-042': { programId: 'SUN-042', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-043': { programId: 'SUN-043', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-044': { programId: 'SUN-044', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-045': { programId: 'SUN-045', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-046': { programId: 'SUN-046', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-047': { programId: 'SUN-047', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-048': { programId: 'SUN-048', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-049': { programId: 'SUN-049', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-050': { programId: 'SUN-050', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-051': { programId: 'SUN-051', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-071': { programId: 'SUN-071', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-072': { programId: 'SUN-072', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-073': { programId: 'SUN-073', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-092': { programId: 'SUN-092', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-093': { programId: 'SUN-093', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-094': { programId: 'SUN-094', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-095': { programId: 'SUN-095', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-096': { programId: 'SUN-096', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-097': { programId: 'SUN-097', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-098': { programId: 'SUN-098', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-099': { programId: 'SUN-099', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },
  'SUN-100': { programId: 'SUN-100', level: 'UG', category: 'ANY', ruleLabel: 'Any 12th Stream', ruleDesc: 'Any recognized 12th / HSC stream' },

  // --- PG: Relevant Engineering ---
  'SUN-010': { programId: 'SUN-010', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-011': { programId: 'SUN-011', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-012': { programId: 'SUN-012', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-013': { programId: 'SUN-013', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-014': { programId: 'SUN-014', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-015': { programId: 'SUN-015', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },
  'SUN-018': { programId: 'SUN-018', level: 'PG', category: 'RELEVANT_ENG', ruleLabel: 'Relevant Engineering', ruleDesc: 'B.E. / B.Tech in relevant Engineering branch' },

  // --- PG: Relevant Engineering / Science ---
  'SUN-016': { programId: 'SUN-016', level: 'PG', category: 'RELEVANT_ENG_SCI', ruleLabel: 'Relevant Engineering / Science', ruleDesc: 'B.Tech or B.Sc in Environmental / Allied Science' },

  // --- PG: Civil / Architecture ---
  'SUN-017': { programId: 'SUN-017', level: 'PG', category: 'CIVIL_ARCH', ruleLabel: 'Civil / Architecture', ruleDesc: 'B.E. / B.Tech in Civil Engineering or B.Arch' },

  // --- PG: Relevant Degree ---
  'SUN-019': { programId: 'SUN-019', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'Bachelor degree in Planning, Architecture, or Civil' },
  'SUN-032': { programId: 'SUN-032', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'B.E. / B.Tech in CSE / IT / MCA / M.Sc CS' },
  'SUN-033': { programId: 'SUN-033', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'B.E. / B.Tech in CSE / IT / MCA / M.Sc CS' },
  'SUN-034': { programId: 'SUN-034', level: 'PG', category: 'RELEVANT_DEGREE', ruleLabel: 'Relevant Degree', ruleDesc: 'B.E. / B.Tech in CSE / IT / MCA / M.Sc CS' },

  // --- PG: Any Graduation, preferably Mathematics ---
  'SUN-035': { programId: 'SUN-035', level: 'PG', category: 'ANY_GRAD_MATH', ruleLabel: 'Any Graduation, preferably Mathematics', ruleDesc: 'Any graduation with Mathematics / Statistics / CS' },

  // --- PG: Any Graduation ---
  'SUN-052': { programId: 'SUN-052', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-053': { programId: 'SUN-053', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-054': { programId: 'SUN-054', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-055': { programId: 'SUN-055', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-056': { programId: 'SUN-056', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-057': { programId: 'SUN-057', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-058': { programId: 'SUN-058', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-059': { programId: 'SUN-059', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-060': { programId: 'SUN-060', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-061': { programId: 'SUN-061', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-062': { programId: 'SUN-062', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-063': { programId: 'SUN-063', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-064': { programId: 'SUN-064', level: 'PG', category: 'ANY_GRAD', ruleLabel: 'Any Graduation', ruleDesc: 'Any recognized Bachelor degree' },

  // --- PG: B.Pharm ---
  'SUN-067': { programId: 'SUN-067', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },
  'SUN-068': { programId: 'SUN-068', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },
  'SUN-069': { programId: 'SUN-069', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },
  'SUN-070': { programId: 'SUN-070', level: 'PG', category: 'B_PHARM', ruleLabel: 'B.Pharm', ruleDesc: 'Bachelor of Pharmacy (B.Pharm) from PCI recognized institute' },

  // --- PG: Law Degree ---
  'SUN-074': { programId: 'SUN-074', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },
  'SUN-075': { programId: 'SUN-075', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },
  'SUN-076': { programId: 'SUN-076', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },
  'SUN-077': { programId: 'SUN-077', level: 'PG', category: 'LAW_DEGREE', ruleLabel: 'Law Degree', ruleDesc: 'LL.B. (3 years or 5 years integrated) from BCI recognized institute' },

  // --- PG: Relevant Science Degree ---
  'SUN-086': { programId: 'SUN-086', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Chemistry' },
  'SUN-087': { programId: 'SUN-087', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Physics' },
  'SUN-088': { programId: 'SUN-088', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Microbiology / Life Science' },
  'SUN-089': { programId: 'SUN-089', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc in Life Science / Biological Sciences' },
  'SUN-090': { programId: 'SUN-090', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc with Mathematics' },
  'SUN-091': { programId: 'SUN-091', level: 'PG', category: 'RELEVANT_SCI', ruleLabel: 'Relevant Science Degree', ruleDesc: 'B.Sc in Forensic Science / Physical / Biological Sciences' },

  // --- PG: Graduation ---
  'SUN-101': { programId: 'SUN-101', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree in Design, Science, or Arts' },
  'SUN-102': { programId: 'SUN-102', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-103': { programId: 'SUN-103', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-104': { programId: 'SUN-104', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },
  'SUN-105': { programId: 'SUN-105', level: 'PG', category: 'GRADUATION', ruleLabel: 'Graduation', ruleDesc: 'Any recognized Bachelor degree' },

  // --- Doctoral: Relevant Master's Degree ---
  'SUN-106': { programId: 'SUN-106', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.E. / M.Tech / MCA in relevant discipline' },
  'SUN-107': { programId: 'SUN-107', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Pharm in relevant specialization' },
  'SUN-108': { programId: 'SUN-108', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'MBA / PGDM in Management' },
  'SUN-109': { programId: 'SUN-109', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Com or Master degree in Finance / Commerce' },
  'SUN-110': { programId: 'SUN-110', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'LL.M. in Law' },
  'SUN-111': { programId: 'SUN-111', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Sc in relevant scientific discipline' },
  'SUN-112': { programId: 'SUN-112', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.A. in English / Linguistics' },
  'SUN-113': { programId: 'SUN-113', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Sc / M.Des / Master in Fashion Design' },
  'SUN-114': { programId: 'SUN-114', level: 'PhD', category: 'RELEVANT_MASTER', ruleLabel: "Relevant Master's Degree", ruleDesc: 'M.Sc / Master in Cosmetology or related field' },
}

console.log('PROGRAM_ELIGIBILITY_RULES length:', Object.keys(PROGRAM_ELIGIBILITY_RULES).length);
const missing = PROGRAMS.filter(p => !PROGRAM_ELIGIBILITY_RULES[p.id]);
console.log('Missing programs:', missing.map(p => p.id));

export function getProgramEligibility(
  p: any,
  profile: any
): { code: 'match' | 'review' | 'mismatch' | 'future'; label: string; reason: string } {
  const rule = PROGRAM_ELIGIBILITY_RULES[p.id]
  const field = (profile.previousField || profile.priorProgramme || 'Other').toLowerCase()

  // 1. Doctoral Check
  if (p.level === 'PhD') {
    if (profile.highestQualification !== "Master's degree") {
      return {
        code: 'future',
        label: 'Future pathway',
        reason: 'This is a doctoral programme requiring a relevant Master’s degree.'
      }
    }
    const cat = rule?.category
    if (cat === 'RELEVANT_MASTER') {
      const progName = p.name.toLowerCase()
      if (progName.includes('engineering') && (field.includes('eng') || field.includes('tech') || field.includes('comp'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Engineering.' }
      }
      if (progName.includes('pharmacy') && field.includes('pharm')) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Pharmacy.' }
      }
      if (progName.includes('management') && (field.includes('manag') || field.includes('mba') || field.includes('business'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Management.' }
      }
      if (progName.includes('commerce') && (field.includes('com') || field.includes('fin') || field.includes('account'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Commerce.' }
      }
      if (progName.includes('law') && (field.includes('law') || field.includes('llm'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Law.' }
      }
      if (progName.includes('science') && field.includes('sci')) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Sciences.' }
      }
      if (progName.includes('english') && (field.includes('eng') || field.includes('art') || field.includes('human'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral English.' }
      }
      if (progName.includes('fashion') && (field.includes('fash') || field.includes('design') || field.includes('art'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Fashion.' }
      }
      if (progName.includes('beauty') && (field.includes('beauty') || field.includes('cosmet') || field.includes('sci'))) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Master’s degree appears aligned with Doctoral Cosmetology.' }
      }
      return {
        code: 'review',
        label: 'Subject Review Needed',
        reason: 'Master’s degree subject match needs confirmation by research admissions committee.'
      }
    }
  }

  // 2. Undergraduate / Diploma Entry
  if (profile.pathway === 'UG') {
    const stream = (profile.stream || 'ALL').toUpperCase()
    const cat = rule?.category as UGEligibilityCategory || 'ANY'

    // "ANY" Stream Programs (BBA, B.Com, BCA, Law, Design)
    if (cat === 'ANY') {
      return {
        code: 'match',
        label: 'Open to All 12th Streams',
        reason: 'Admissions open to all recognized 12th streams (Commerce, Arts, Science, etc.).'
      }
    }

    // Student has unspecified or general stream
    if (stream === 'ALL' || stream === 'OTHER') {
      if (cat === 'PCM') {
        return {
          code: 'review',
          label: 'Requires PCM Stream',
          reason: 'Program requires 12th Physics, Chemistry & Mathematics. Confirm 12th subjects.'
        }
      }
      if (cat === 'PCB_PCM' || cat === 'SCIENCE' || cat === 'SCIENCE_CHEM') {
        return {
          code: 'review',
          label: 'Requires Science Stream',
          reason: 'Program requires 12th Science (PCB/PCM). Confirm 12th subjects.'
        }
      }
      if (cat === 'SCIENCE_MATH' || cat === 'SCIENCE_PHY') {
        return {
          code: 'review',
          label: 'Requires Science + Maths',
          reason: 'Program requires 12th Science with Mathematics. Confirm 12th subjects.'
        }
      }
    }

    // PCM Requirements
    if (cat === 'PCM') {
      if (['PCM', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (PCM)',
          reason: 'Eligible with 12th Physics, Chemistry & Mathematics.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Stream Incompatible',
        reason: 'Requires 12th PCM background (Physics, Chemistry & Mathematics).'
      }
    }

    // PCB / PCM Requirements (Biotech, Biomedical, D.Pharm, B.Pharm)
    if (cat === 'PCB_PCM') {
      if (['PCM', 'PCB', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (PCB/PCM)',
          reason: 'Eligible with 12th Science (PCB or PCM).'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Science (PCB/PCM)',
        reason: 'Requires 12th Science background with Physics, Chemistry and Biology/Maths.'
      }
    }

    // Science General Requirements (Wine Tech, Nanoscience, Microbiology, Forensics)
    if (cat === 'SCIENCE') {
      if (['PCM', 'PCB', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Science)',
          reason: 'Eligible with 12th Science background.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires 12th Science',
        reason: 'Requires 12th Science stream background.'
      }
    }

    // Science + Mathematics (B.Sc CS, B.Sc Computational Math & Data Science)
    if (cat === 'SCIENCE_MATH') {
      if (['PCM', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Science + Math)',
          reason: 'Eligible with 12th Science including Mathematics.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Science + Mathematics',
        reason: 'Requires 12th Science with Mathematics as a compulsory subject.'
      }
    }

    // Science + Chemistry (B.Sc Chemistry)
    if (cat === 'SCIENCE_CHEM') {
      if (['PCM', 'PCB', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Science + Chemistry)',
          reason: 'Eligible with 12th Science including Chemistry.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Science + Chemistry',
        reason: 'Requires 12th Science with Chemistry.'
      }
    }

    // Science + Physics & Mathematics (B.Sc Physics)
    if (cat === 'SCIENCE_PHY') {
      if (['PCM', 'PCMB'].includes(stream)) {
        return {
          code: 'match',
          label: 'Stream Aligned (Physics & Math)',
          reason: 'Eligible with 12th Science including Physics & Mathematics.'
        }
      }
      return {
        code: 'mismatch',
        label: 'Requires Physics & Mathematics',
        reason: 'Requires 12th Science with Physics and Mathematics.'
      }
    }
  }

  // 3. Postgraduate Entry (PG)
  const cat = rule?.category as PGEligibilityCategory || 'ANY_GRAD'

  // Any Graduation (All New Age & MBA 4.0 programs)
  if (cat === 'ANY_GRAD') {
    return {
      code: 'match',
      label: 'Open to Any Graduation',
      reason: 'Open to all recognized Bachelor degrees (B.Tech, BBA, B.Com, B.Sc, B.A, etc.).'
    }
  }

  // Graduation (Design PG: M.Sc Fashion, M.Sc Beauty, M.Des UX, Visual Comm, Game Design)
  if (cat === 'GRADUATION') {
    return {
      code: 'match',
      label: 'Eligible Degree',
      reason: 'Open to graduates from recognized universities with an aptitude for design & creative practice.'
    }
  }

  // Any Graduation, preferably Mathematics (MCA)
  if (cat === 'ANY_GRAD_MATH') {
    if (field.includes('computer') || field.includes('it') || field.includes('science') || field.includes('math') || field.includes('eng') || field.includes('bca')) {
      return {
        code: 'match',
        label: 'Degree Aligned (MCA)',
        reason: 'Prior degree in Computer Science, IT, Engineering, or Science with Mathematics.'
      }
    }
    return {
      code: 'review',
      label: 'Verify Mathematics Prerequisite',
      reason: 'MCA requires Mathematics / Statistics / Computer Science at 10+2 or Bachelor level.'
    }
  }

  // Relevant Engineering (M.Tech programs)
  if (cat === 'RELEVANT_ENG') {
    if (field.includes('engineering') || field.includes('tech') || field.includes('b.tech') || field.includes('computer')) {
      return {
        code: 'match',
        label: 'Engineering Degree Aligned',
        reason: 'Prior degree in B.E. / B.Tech engineering matches entry requirements.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Engineering Degree',
      reason: 'Requires relevant B.E. / B.Tech degree in the engineering branch.'
    }
  }

  // Relevant Engineering / Science (M.Tech Environmental)
  if (cat === 'RELEVANT_ENG_SCI') {
    if (field.includes('engineering') || field.includes('science') || field.includes('env') || field.includes('tech')) {
      return {
        code: 'match',
        label: 'Degree Aligned',
        reason: 'B.Tech or B.Sc in Environmental / Allied Science is recognized.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Engineering or Science',
      reason: 'Requires B.E. / B.Tech or B.Sc in Environmental / Allied Science.'
    }
  }

  // Civil / Architecture (M.Tech Valuation)
  if (cat === 'CIVIL_ARCH') {
    if (field.includes('civil') || field.includes('arch') || field.includes('construction') || field.includes('building')) {
      return {
        code: 'match',
        label: 'Degree Aligned (Civil / Architecture)',
        reason: 'B.E. / B.Tech in Civil Engineering or B.Arch matches requirement.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Civil or Architecture',
      reason: 'Requires B.E./B.Tech in Civil Engineering or B.Arch.'
    }
  }

  // Relevant Degree (M.Planning, M.Tech CSE Cloud / AIML / RPA)
  if (cat === 'RELEVANT_DEGREE') {
    const progName = p.name.toLowerCase()
    if (progName.includes('planning')) {
      if (field.includes('planning') || field.includes('arch') || field.includes('civil') || field.includes('geog')) {
        return { code: 'match', label: 'Degree Aligned', reason: 'Bachelor degree in Planning, Architecture, or Civil.' }
      }
      return { code: 'review', label: 'Check Degree Match', reason: 'Requires relevant degree in Planning, Architecture, or Civil Engineering.' }
    }
    // M.Tech CSE
    if (field.includes('computer') || field.includes('cse') || field.includes('it') || field.includes('mca') || field.includes('engineering')) {
      return { code: 'match', label: 'Degree Aligned (CSE / IT)', reason: 'B.E./B.Tech in CSE/IT or MCA/M.Sc CS matches criteria.' }
    }
    return { code: 'mismatch', label: 'Requires Computer / IT Degree', reason: 'Requires B.E./B.Tech in CSE/IT or equivalent degree.' }
  }

  // B.Pharm (M.Pharm)
  if (cat === 'B_PHARM') {
    if (field.includes('pharm')) {
      return {
        code: 'match',
        label: 'Degree Aligned (B.Pharm)',
        reason: 'Bachelor of Pharmacy (B.Pharm) satisfies PCI eligibility.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires B.Pharm',
      reason: 'Admission requires a Bachelor of Pharmacy (B.Pharm) degree.'
    }
  }

  // Law Degree (LL.M.)
  if (cat === 'LAW_DEGREE') {
    if (field.includes('law') || field.includes('llb')) {
      return {
        code: 'match',
        label: 'Degree Aligned (Law)',
        reason: 'LL.B. degree satisfies Bar Council of India entry criteria.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Law Degree',
      reason: 'Admission requires an LL.B. or 5-year Integrated Law degree.'
    }
  }

  // Relevant Science Degree (M.Sc)
  if (cat === 'RELEVANT_SCI') {
    if (field.includes('science') || field.includes('bsc') || field.includes('chem') || field.includes('phy') || field.includes('bio') || field.includes('math') || field.includes('forensic')) {
      return {
        code: 'match',
        label: 'Science Degree Aligned',
        reason: 'Bachelor of Science (B.Sc) in corresponding discipline matches criteria.'
      }
    }
    return {
      code: 'mismatch',
      label: 'Requires Relevant B.Sc',
      reason: 'Admission requires a Bachelor of Science (B.Sc) in the relevant subject.'
    }
  }

  return {
    code: 'review',
    label: 'Admissions Review',
    reason: `Confirm program entry note: ${p.streamSource || 'Specific degree requirements'}`
  }
}

// Test Scenarios
console.log('\n--- Scenario 1: Commerce Student (UG, Stream COM) ---');
const comMatches = PROGRAMS.filter(p => p.level === 'UG' || p.level === 'Diploma')
  .map(p => ({ id: p.id, name: p.name, ...getProgramEligibility(p, { pathway: 'UG', stream: 'COM' }) }));
console.log('Eligible matches (match):', comMatches.filter(m => m.code === 'match').length);
console.log('Sample matches:', comMatches.filter(m => m.code === 'match').slice(0, 5).map(m => m.name));
console.log('Mismatches (B.Tech etc.):', comMatches.filter(m => m.code === 'mismatch').length);
console.log('Sample mismatch:', comMatches.filter(m => m.code === 'mismatch')[0]);

console.log('\n--- Scenario 2: PCB Student (UG, Stream PCB) ---');
const pcbMatches = PROGRAMS.filter(p => p.level === 'UG' || p.level === 'Diploma')
  .map(p => ({ id: p.id, name: p.name, ...getProgramEligibility(p, { pathway: 'UG', stream: 'PCB' }) }));
console.log('Eligible matches:', pcbMatches.filter(m => m.code === 'match').length);
console.log('Biotech/B.Pharm status:', pcbMatches.filter(m => m.name.includes('Biotechnology') || m.name.includes('Pharm')).map(m => ({ name: m.name, code: m.code })));

console.log('\n--- Scenario 3: B.Com Graduate (PG, field Commerce) ---');
const pgMatches = PROGRAMS.filter(p => p.level === 'PG')
  .map(p => ({ id: p.id, name: p.name, ...getProgramEligibility(p, { pathway: 'PG', previousField: 'Commerce' }) }));
console.log('Eligible PG matches:', pgMatches.filter(m => m.code === 'match').length);
console.log('MBA match sample:', pgMatches.filter(m => m.name.includes('MBA')).slice(0, 3).map(m => ({ name: m.name, code: m.code })));
console.log('M.Tech Mech mismatch sample:', pgMatches.filter(m => m.name.includes('Mechanical')).map(m => ({ name: m.name, code: m.code })));

function isDomainEligible(d: any, profile: any): boolean {
  if (!d.programIds || d.programIds.length === 0) return true;
  const progs = d.programIds.map((pid: string) => PROGRAMS.find(p => p.id === pid)).filter(Boolean);
  const allowed = progs.filter((p: any) => profile.pathway === 'UG' ? ['UG', 'Diploma'].includes(p.level) : p.level === 'PG');
  if (allowed.length === 0) return false;
  return allowed.some((p: any) => {
    const el = getProgramEligibility(p, profile);
    return el.code === 'match' || el.code === 'review';
  });
}

console.log('\n--- Stage 2 Domain Eligibility Filtering ---');
const comProfile = { pathway: 'UG', stream: 'COM' };
const comEligibleDoms = DOMAINS.filter(d => isDomainEligible(d, comProfile));
console.log('Commerce student eligible domains count:', comEligibleDoms.length);
console.log('Sample Commerce eligible domains:', comEligibleDoms.slice(0, 6).map(d => d.name));

const pcmProfile = { pathway: 'UG', stream: 'PCM' };
const pcmEligibleDoms = DOMAINS.filter(d => isDomainEligible(d, pcmProfile));
console.log('PCM student eligible domains count:', pcmEligibleDoms.length);


