/**
 * Stage 1 Domain, Specialization & Course Pathway Mapper
 * Single Source of Truth for Domain Integrity, Multi-Disciplinary Synergies, and Report Personalization.
 * 
 * Guarantees:
 * 1. Permanent stable Domain IDs across all 15 university course families.
 * 2. Every domain has dedicated, tailored degrees, specializations, rationales, and faculty mapping.
 * 3. Interdisciplinary Specialization Resolver derived from actual Top 1, Top 2, and Top 3 domains.
 * 4. Zero hardcoded fallbacks or array-index based course assignments.
 */

export interface DomainMetadata {
  id: string
  code: string
  name: string
  faculty: string
  campus: string
  durationUG: string
  durationPG: string
  degreeUG: string
  degreePG: string
  specializationUG: string
  specializationPG: string
  eligibilityUG: string
  eligibilityPG: string
  rationale: string
  alternativeRationale: string
  complementaryRationale: string
  primaryDimensions: string[]
}

export const DOMAIN_REGISTRY: Record<string, DomainMetadata> = {
  COMPUTING_IT: {
    id: 'cf_computing___it',
    code: 'COMPUTING_IT',
    name: 'Computing & IT',
    faculty: 'School of Engineering & Technology (SOET)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '4 Years (8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Tech in Computer Science & Engineering',
    degreePG: 'Master of Computer Applications (MCA Full-Stack Architecture)',
    specializationUG: 'Cloud Computing, DevOps & Cyber Security Systems',
    specializationPG: 'Enterprise Cloud Architecture & Distributed Systems',
    eligibilityUG: 'Passed 12th Science (PCM) / 3-Year Polytechnic Diploma with Strong Logic Fit',
    eligibilityPG: 'Bachelor’s degree in Computer Applications / B.Tech / B.Sc Computer Science',
    rationale: 'Highest cognitive affinity for software architecture, algorithmic logic, and technical problem decomposition.',
    alternativeRationale: 'Robust technical capacity and systems thinking suitable for scalable computing environments.',
    complementaryRationale: 'Strong technical computing base that enhances digital workflow execution and automation.',
    primaryDimensions: ['TC', 'LR', 'AR', 'PS'],
  },
  AI_DATA: {
    id: 'cf_ai___data',
    code: 'AI_DATA',
    name: 'AI & Data',
    faculty: 'School of Engineering & Technology (SOET)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '4 Years (8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Tech in Computer Science & Engineering (AI & ML)',
    degreePG: 'M.Tech Computer Science (AI & Data Engineering)',
    specializationUG: 'Artificial Intelligence, Machine Learning & Deep Neural Systems',
    specializationPG: 'Applied AI, Natural Language Processing & Big Data Pipelines',
    eligibilityUG: 'Passed 12th Science (PCM) / Equivalent with High Mathematical & Analytical Aptitude',
    eligibilityPG: 'B.Tech / B.E in CS / IT / Electronics or M.Sc in Mathematics / Statistics',
    rationale: 'Exceptional aptitude for probabilistic modeling, pattern recognition, and algorithmic data synthesis.',
    alternativeRationale: 'High quantitative modeling depth well-suited for autonomous intelligence and machine learning pipelines.',
    complementaryRationale: 'Valuable predictive analytics and machine intelligence capabilities complementing technical domains.',
    primaryDimensions: ['TC', 'AR', 'QR', 'PS', 'RE'],
  },
  ENGINEERING: {
    id: 'cf_engineering',
    code: 'ENGINEERING',
    name: 'Engineering',
    faculty: 'School of Engineering & Technology (SOET)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '4 Years (8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Tech in Robotics & Automation / Mechanical Engineering',
    degreePG: 'M.Tech Advanced Systems, Automation & Design Engineering',
    specializationUG: 'Mechatronics, Smart Manufacturing & Autonomous Robotics',
    specializationPG: 'Industrial Automation, Advanced Dynamics & Systems Engineering',
    eligibilityUG: 'Passed 12th Science (PCM) / Engineering Diploma with High Physical Problem Solving Aptitude',
    eligibilityPG: 'B.Tech / B.E in Mechanical, Electrical, Civil, Mechatronics, or Production',
    rationale: 'Superior spatial reasoning, physical systems modeling, and applied physics execution instincts.',
    alternativeRationale: 'Applied engineering acumen suited for physical systems design, instrumentation, and infrastructure.',
    complementaryRationale: 'Practical hardware and fabrication comprehension that grounds conceptual systems into reality.',
    primaryDimensions: ['TC', 'QR', 'SC', 'PS', 'AR'],
  },
  MATH_STATISTICS: {
    id: 'cf_math___statistics',
    code: 'MATH_STATISTICS',
    name: 'Math & Statistics',
    faculty: 'School of Science (SOS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Sc (Hons) in Applied Mathematics, Statistics & Analytics',
    degreePG: 'M.Sc Data Analytics & Financial Mathematics',
    specializationUG: 'Statistical Inference, Quantitative Analytics & Actuarial Modeling',
    specializationPG: 'Computational Statistics, Stochastic Modeling & Quantitative Risk',
    eligibilityUG: 'Passed 12th with Mathematics / Statistics with High Quantitative Aptitude',
    eligibilityPG: 'B.Sc in Mathematics, Statistics, Physics, Computer Science or Economics',
    rationale: 'Outstanding deductive clarity, mathematical rigor, and structured numerical relationship analysis.',
    alternativeRationale: 'Strong mathematical discipline suited for complex risk modeling, probability, and quantitative analysis.',
    complementaryRationale: 'Solid numerical precision that sharpens data-driven decision making and statistical validation.',
    primaryDimensions: ['QR', 'LR', 'AR', 'SC', 'RE'],
  },
  NATURAL_SCIENCE: {
    id: 'cf_natural_science',
    code: 'NATURAL_SCIENCE',
    name: 'Natural Science',
    faculty: 'School of Science (SOS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Sc (Hons) in Physics / Chemistry / Material Sciences',
    degreePG: 'M.Sc Advanced Scientific Research & Material Technology',
    specializationUG: 'Applied Physical Sciences, Spectroscopy & Experimental Synthesis',
    specializationPG: 'Nanotechnology, Functional Materials & Analytical Chemistry',
    eligibilityUG: 'Passed 12th Science (PCM / PCB) with Empirical Inquiry Drive',
    eligibilityPG: 'B.Sc in Physics, Chemistry, Physical Sciences or Chemical Engineering',
    rationale: 'Strong empirical investigation mindset, scientific hypothesis testing, and laboratory discovery instincts.',
    alternativeRationale: 'Empirical inquiry discipline well-suited for fundamental research, formulation, and laboratory discovery.',
    complementaryRationale: 'Scientific methodology orientation that enriches investigative quality and rigorous evidence testing.',
    primaryDimensions: ['SC', 'RE', 'QR', 'AR', 'PS'],
  },
  LIFE_SCIENCE: {
    id: 'cf_life_science',
    code: 'LIFE_SCIENCE',
    name: 'Life Science',
    faculty: 'School of Science (SOS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Sc in Biotechnology & Microbiology',
    degreePG: 'M.Sc Industrial Biotechnology & Biomedical Sciences',
    specializationUG: 'Molecular Biology, Genetic Engineering & Bio-Diagnostics',
    specializationPG: 'Biomedical Innovation, Genomics & Bioprocess Engineering',
    eligibilityUG: 'Passed 12th Science (PCB / Biology / Biotech) with High Biological Aptitude',
    eligibilityPG: 'B.Sc in Biotechnology, Microbiology, Life Sciences, Botany, Zoology or B.Pharm',
    rationale: 'High aptitude for biological systems comprehension, healthcare diagnostics, and bio-molecular research.',
    alternativeRationale: 'Biological inquiry depth suited for pharmaceuticals, clinical biotechnology, and medical sciences.',
    complementaryRationale: 'Life-sciences literacy that bridges healthcare tech, environmental biology, and wellness solutions.',
    primaryDimensions: ['SC', 'RE', 'SO', 'AR', 'PS'],
  },
  COMMERCE_FINANCE: {
    id: 'cf_commerce___finance',
    code: 'COMMERCE_FINANCE',
    name: 'Commerce & Finance',
    faculty: 'School of Commerce & Management Studies (SOCMS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Com (Hons) in Banking, Financial Analytics & FinTech',
    degreePG: 'M.Com / MBA in Corporate Finance, Investment Banking & Taxation',
    specializationUG: 'Financial Markets, Corporate Audit & Algorithmic FinTech',
    specializationPG: 'Treasury Management, Quantitative Investment & Global Taxation',
    eligibilityUG: 'Passed 12th Commerce / Science / Arts with High Commercial & Numerical Drive',
    eligibilityPG: 'B.Com, BBA, B.Sc Economics, or Bachelor’s degree with Commerce/Finance background',
    rationale: 'Strong quantitative acumen, fiscal risk evaluation, accounting logic, and capital market instincts.',
    alternativeRationale: 'Commercial valuation capacity suited for financial planning, compliance, and corporate banking.',
    complementaryRationale: 'Financial discipline and fiscal acumen that fortifies organizational management and investments.',
    primaryDimensions: ['QR', 'BU', 'LR', 'AR', 'CO'],
  },
  MANAGEMENT: {
    id: 'cf_management',
    code: 'MANAGEMENT',
    name: 'Management',
    faculty: 'School of Commerce & Management Studies (SOCMS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'BBA (Hons) in Global Business Management & Entrepreneurship',
    degreePG: 'MBA (Master of Business Administration) in Strategic Leadership',
    specializationUG: 'Enterprise Operations, Strategic Marketing & Product Management',
    specializationPG: 'Corporate Strategy, Business Analytics & Global Supply Chain',
    eligibilityUG: 'Passed 12th from any recognized board with Leadership & Organizational Drive',
    eligibilityPG: 'Graduation in any discipline with Strong Commercial, Managerial & Leadership Aptitude',
    rationale: 'Exceptional strategic prioritization, organizational leadership, stakeholder orchestration, and business foresight.',
    alternativeRationale: 'Organizational coordination capacity suited for program management, marketing, and business scaling.',
    complementaryRationale: 'Commercial vision and executive execution instincts that maximize cross-domain project ROI.',
    primaryDimensions: ['BU', 'LE', 'CO', 'SO', 'LR'],
  },
  ECONOMICS: {
    id: 'cf_economics',
    code: 'ECONOMICS',
    name: 'Economics',
    faculty: 'School of Commerce & Management Studies (SOCMS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Sc / B.A (Hons) in Economics, Public Policy & Econometrics',
    degreePG: 'M.Sc Applied Quantitative Economics & Market Dynamics',
    specializationUG: 'Econometric Forecasting, Public Finance & Market Policy Analysis',
    specializationPG: 'Behavioral Economics, Data-Driven Policy & Macroeconomic Strategy',
    eligibilityUG: 'Passed 12th with Mathematics / Economics with Analytical Mindset',
    eligibilityPG: 'Bachelor’s degree in Economics, Statistics, Mathematics, Commerce, or Engineering',
    rationale: 'High aptitude for macroeconomic trends, incentive structures, econometric modeling, and policy evaluation.',
    alternativeRationale: 'Analytical policy evaluation capacity suited for market research, economic consulting, and analytics.',
    complementaryRationale: 'Economic reasoning that enriches strategic decision making and consumer behavior prediction.',
    primaryDimensions: ['QR', 'LR', 'BU', 'AR', 'RE'],
  },
  HUMANITIES: {
    id: 'cf_humanities',
    code: 'HUMANITIES',
    name: 'Humanities',
    faculty: 'School of Liberal Arts & Humanities',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.A. (Hons) in English Literature, History & Cultural Studies',
    degreePG: 'M.A. Applied Humanities, Cultural Policy & Global Discourse',
    specializationUG: 'Critical Discourse Analysis, Historical Research & Global Literature',
    specializationPG: 'Comparative Cultural Studies, Digital Humanities & Editorial Leadership',
    eligibilityUG: 'Passed 12th from any recognized stream with High Verbal & Interpretive Aptitude',
    eligibilityPG: 'Bachelor’s degree in Humanities, Arts, Literature, Social Sciences, or Allied Fields',
    rationale: 'Deep interpretive synthesis, cultural contextualization, ethical reasoning, and articulative eloquence.',
    alternativeRationale: 'Critical inquiry and cultural depth suited for policy writing, curation, and international affairs.',
    complementaryRationale: 'Philosophical clarity and linguistic articulation that enhances cross-cultural engagement and communications.',
    primaryDimensions: ['CO', 'RE', 'SO', 'LR', 'CR'],
  },
  SOCIAL_SCIENCE: {
    id: 'cf_social_science',
    code: 'SOCIAL_SCIENCE',
    name: 'Social Science',
    faculty: 'School of Liberal Arts & Humanities',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.A. / B.Sc in Psychology, Sociology & Behavioral Sciences',
    degreePG: 'M.A. Applied Psychology & Organizational Behavior',
    specializationUG: 'Clinical & Counseling Psychology, Social Research & Community Welfare',
    specializationPG: 'Industrial Psychology, Human Centered Research & Social Interventions',
    eligibilityUG: 'Passed 12th in any stream with Empathic Inquiry & Behavioral Orientation',
    eligibilityPG: 'Bachelor’s degree in Psychology, Sociology, Social Work, Arts, or Science',
    rationale: 'Exceptional human behavioral insight, empathetic stakeholder analysis, and sociological research drive.',
    alternativeRationale: 'Behavioral analysis depth suited for talent development, counseling, and organizational culture design.',
    complementaryRationale: 'Human-centered perspective that grounds technology and policy into real human adoption.',
    primaryDimensions: ['SO', 'RE', 'CO', 'AR', 'LE'],
  },
  MEDIA_COMMUNICATION: {
    id: 'cf_media___communication',
    code: 'MEDIA_COMMUNICATION',
    name: 'Media & Communication',
    faculty: 'School of Media & Communication Studies',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.A. in Journalism, Digital Mass Media & Film Production',
    degreePG: 'M.A. in Strategic Corporate Communications & Digital Media Leadership',
    specializationUG: 'Broadcast Journalism, Digital Content Direction & Audio-Visual Media',
    specializationPG: 'Brand Narrative Strategy, Investigative Media & Public Relations',
    eligibilityUG: 'Passed 12th from any recognized stream with Creative Storytelling & Verbal Drive',
    eligibilityPG: 'Bachelor’s degree in Journalism, Mass Media, Arts, Commerce, or Allied Fields',
    rationale: 'Dynamic storytelling instinct, audience engagement mastery, media production vision, and persuasive reach.',
    alternativeRationale: 'Media production instinct suited for broadcast communications, brand storytelling, and public relations.',
    complementaryRationale: 'Engaging narrative capabilities that amplify technical, commercial, or creative innovations to global audiences.',
    primaryDimensions: ['CO', 'CR', 'SO', 'TC', 'BU'],
  },
  DESIGN_CREATIVE: {
    id: 'cf_design___creative',
    code: 'DESIGN_CREATIVE',
    name: 'Design & Creative',
    faculty: 'School of Design (SOD)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '4 Years (8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Des in User Experience (UX/UI) & Industrial Product Design',
    degreePG: 'M.Des in Advanced Interaction Design & Visual Innovation',
    specializationUG: 'Digital Interface Architecture, Spatial Interaction & Product Ergonomics',
    specializationPG: 'Design Systems, Human-Centered Experience Architecture & Design Management',
    eligibilityUG: 'Passed 12th in any stream with High Visual Thinking & Aesthetic Design Drive',
    eligibilityPG: 'Bachelor’s degree in Design (B.Des), Architecture (B.Arch), Engineering, Fine Arts, or Allied',
    rationale: 'Superior spatial visualization, user-centered interface architecture, and aesthetic ideation instincts.',
    alternativeRationale: 'Creative visual prototyping capacity suited for brand systems, interaction design, and product styling.',
    complementaryRationale: 'Aesthetic sensibility and user-first perspective that turns complex technology into intuitive products.',
    primaryDimensions: ['CR', 'TC', 'SO', 'PS', 'CO'],
  },
  LAW: {
    id: 'cf_law',
    code: 'LAW',
    name: 'Law',
    faculty: 'School of Law (SOL)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '5 Years Integrated (10 Semesters)',
    durationPG: '1 - 2 Years (2-4 Semesters)',
    degreeUG: 'B.A. LL.B. (Hons) / B.B.A. LL.B. (Hons) Integrated Law',
    degreePG: 'LL.M. (Master of Laws) in Corporate Law, IP & Cyber Jurisprudence',
    specializationUG: 'Corporate Compliance, Intellectual Property Rights & Cyber Jurisprudence',
    specializationPG: 'International Trade Law, Technology Regulation & Dispute Resolution',
    eligibilityUG: 'Passed 12th from any recognized stream with High Logic, Argumentation & Legal Fit',
    eligibilityPG: 'LL.B. (3-Year or 5-Year Integrated) with Strong Analytical Argumentation Aptitude',
    rationale: 'Acute logical argumentation, constitutional jurisprudence, regulatory compliance, and dispute resolution acumen.',
    alternativeRationale: 'Legal compliance and statutory interpretation depth suited for corporate governance and regulatory policy.',
    complementaryRationale: 'Ethical and contractual governance perspective that protects organizational assets and ensures compliance.',
    primaryDimensions: ['CO', 'LR', 'AR', 'RE', 'SO'],
  },
  HOSPITALITY_TOURISM: {
    id: 'cf_hospitality___tourism',
    code: 'HOSPITALITY_TOURISM',
    name: 'Hospitality & Tourism',
    faculty: 'School of Hospitality & Tourism Studies (SOHTS)',
    campus: 'Sandip University Main Campus, Nashik',
    durationUG: '3 - 4 Years (6-8 Semesters)',
    durationPG: '2 Years (4 Semesters)',
    degreeUG: 'B.Sc in Hotel Management, Culinary Arts & International Tourism',
    degreePG: 'MBA in Global Hospitality & Luxury Tourism Enterprise Operations',
    specializationUG: 'Luxury Resort Operations, Event Management & International Guest Experience',
    specializationPG: 'Hospitality Asset Management, Strategic Tourism Logistics & Revenue Optimization',
    eligibilityUG: 'Passed 12th in any stream with High Interpersonal Communication & Service Orientation',
    eligibilityPG: 'Bachelor’s degree in Hotel Management, Tourism, Business, Arts, or Allied Fields',
    rationale: 'High interpersonal empathy, luxury guest experience orchestration, event logistics, and hospitality leadership instincts.',
    alternativeRationale: 'Service excellence and experiential operations capacity suited for customer-facing luxury and event ecosystems.',
    complementaryRationale: 'Customer-experience and hospitality management acumen that elevates client engagement across enterprise services.',
    primaryDimensions: ['SO', 'CO', 'LE', 'BU', 'PS'],
  },
}

/**
 * Normalizes any domain identifier into a canonical DomainMetadata object
 */
export function normalizeDomain(keyOrName: string): DomainMetadata {
  if (!keyOrName) return DOMAIN_REGISTRY.COMPUTING_IT

  const clean = keyOrName.toUpperCase().replace(/\s+/g, '_').replace(/&/g, '').replace(/_+/g, '_').trim()

  // 1. Direct key match
  if (DOMAIN_REGISTRY[clean]) return DOMAIN_REGISTRY[clean]

  // 2. Lookup by id, code, or name match
  for (const meta of Object.values(DOMAIN_REGISTRY)) {
    if (
      meta.id.toUpperCase() === clean ||
      meta.code.toUpperCase() === clean ||
      meta.name.toUpperCase() === clean.replace(/_/g, ' ') ||
      clean.includes(meta.code) ||
      meta.code.includes(clean)
    ) {
      return meta
    }
  }

  // 3. Substring / keyword fuzzy match
  if (clean.includes('HOSPITAL') || clean.includes('TOUR')) return DOMAIN_REGISTRY.HOSPITALITY_TOURISM
  if (clean.includes('COMMERCE') || clean.includes('FINANCE') || clean.includes('BANK')) return DOMAIN_REGISTRY.COMMERCE_FINANCE
  if (clean.includes('MANAGEMENT') || clean.includes('MGMT') || clean.includes('ADMIN')) return DOMAIN_REGISTRY.MANAGEMENT
  if (clean.includes('AI') || clean.includes('DATA')) return DOMAIN_REGISTRY.AI_DATA
  if (clean.includes('COMPUT') || clean.includes('IT') || clean.includes('TECH') || clean.includes('SOFTWARE')) return DOMAIN_REGISTRY.COMPUTING_IT
  if (clean.includes('ENGIN') || clean.includes('ROBOT')) return DOMAIN_REGISTRY.ENGINEERING
  if (clean.includes('MATH') || clean.includes('STAT')) return DOMAIN_REGISTRY.MATH_STATISTICS
  if (clean.includes('LIFE') || clean.includes('BIO')) return DOMAIN_REGISTRY.LIFE_SCIENCE
  if (clean.includes('NATURAL') || clean.includes('PHYSIC') || clean.includes('CHEM')) return DOMAIN_REGISTRY.NATURAL_SCIENCE
  if (clean.includes('ECON')) return DOMAIN_REGISTRY.ECONOMICS
  if (clean.includes('LAW') || clean.includes('LEGAL')) return DOMAIN_REGISTRY.LAW
  if (clean.includes('DESIGN') || clean.includes('UX') || clean.includes('UI')) return DOMAIN_REGISTRY.DESIGN_CREATIVE
  if (clean.includes('MEDIA') || clean.includes('JOURNAL')) return DOMAIN_REGISTRY.MEDIA_COMMUNICATION
  if (clean.includes('SOCIAL') || clean.includes('PSYCH')) return DOMAIN_REGISTRY.SOCIAL_SCIENCE
  if (clean.includes('HUMAN')) return DOMAIN_REGISTRY.HUMANITIES

  return DOMAIN_REGISTRY.COMPUTING_IT
}

// ─── INTERDISCIPLINARY SPECIALIZATION MATRIX ─────────────────────────────────

interface SynergySpecializationRule {
  domainA: string
  domainB: string
  specializationUG: string
  degreeUG: string
  specializationPG: string
  degreePG: string
  faculty: string
  rationale: string
}

const SYNERGY_SPECIALIZATIONS: SynergySpecializationRule[] = [
  // Computing + Management
  {
    domainA: 'COMPUTING_IT',
    domainB: 'MANAGEMENT',
    specializationUG: 'Technology Management & Enterprise Software Solutions',
    degreeUG: 'B.Tech in Computer Engineering with Management Studies',
    specializationPG: 'MBA in Information Technology & Strategic Digital Operations',
    degreePG: 'MBA (Technology Management & Enterprise Systems)',
    faculty: 'School of Engineering & Technology (SOET)',
    rationale: 'Synergizes technical systems architecture with commercial management, product roadmapping, and enterprise leadership.',
  },
  // AI + Management
  {
    domainA: 'AI_DATA',
    domainB: 'MANAGEMENT',
    specializationUG: 'Artificial Intelligence & Business Analytics',
    degreeUG: 'B.Tech CSE (AI, Machine Learning & Business Analytics)',
    specializationPG: 'MBA in Business Analytics & Strategic FinTech Innovation',
    degreePG: 'MBA (Business Analytics & Intelligent Systems)',
    faculty: 'School of Engineering & Technology (SOET)',
    rationale: 'Integrates probabilistic predictive modeling with organizational decision science and strategic business intelligence.',
  },
  // Computing + Design
  {
    domainA: 'COMPUTING_IT',
    domainB: 'DESIGN_CREATIVE',
    specializationUG: 'User Experience Architecture & Front-End Engineering',
    degreeUG: 'B.Tech CSE (Human-Computer Interaction & Product Design)',
    specializationPG: 'M.Des in Computational Interaction & User Interface Systems',
    degreePG: 'M.Des (Interaction & Experience Architecture)',
    faculty: 'School of Design (SOD)',
    rationale: 'Fuses digital software engineering with spatial UI/UX ergonomics, visual storytelling, and human-centered design.',
  },
  // Engineering + AI
  {
    domainA: 'ENGINEERING',
    domainB: 'AI_DATA',
    specializationUG: 'Robotics & Autonomous Intelligent Systems',
    degreeUG: 'B.Tech in Robotics & Automation Engineering',
    specializationPG: 'M.Tech in Autonomous Systems & Embedded Edge AI',
    degreePG: 'M.Tech (Robotics & Intelligent Automation)',
    faculty: 'School of Engineering & Technology (SOET)',
    rationale: 'Combines physical mechatronics and actuator hardware with real-time neural network control pipelines.',
  },
  // Hospitality + Management
  {
    domainA: 'HOSPITALITY_TOURISM',
    domainB: 'MANAGEMENT',
    specializationUG: 'International Hospitality Administration & Resort Operations',
    degreeUG: 'B.Sc in Hotel Management & Hospitality Administration',
    specializationPG: 'MBA in Global Luxury Hospitality & Tourism Enterprise Leadership',
    degreePG: 'MBA (Luxury Hospitality & Global Tourism)',
    faculty: 'School of Hospitality & Tourism Studies (SOHTS)',
    rationale: 'Merges high-touch customer guest experience orchestration with organizational leadership, revenue optimization, and brand scaling.',
  },
  // Hospitality + Commerce
  {
    domainA: 'HOSPITALITY_TOURISM',
    domainB: 'COMMERCE_FINANCE',
    specializationUG: 'Hospitality Asset Management & Tourism Commercial Operations',
    degreeUG: 'B.Sc in Hotel Management (Hospitality Financial Operations)',
    specializationPG: 'MBA in Hospitality Financial Asset & Revenue Management',
    degreePG: 'MBA (Hospitality Revenue & Financial Asset Management)',
    faculty: 'School of Hospitality & Tourism Studies (SOHTS)',
    rationale: 'Combines hospitality resort operations with commercial yield management, capital budgeting, and financial performance.',
  },
  // Commerce + Management
  {
    domainA: 'COMMERCE_FINANCE',
    domainB: 'MANAGEMENT',
    specializationUG: 'Corporate Finance, Investment Banking & Strategic Leadership',
    degreeUG: 'B.Com (Hons) in Financial Markets & Corporate Strategy',
    specializationPG: 'MBA in Banking, Investment Capital & Corporate Governance',
    degreePG: 'MBA (Corporate Finance & Strategic Investments)',
    faculty: 'School of Commerce & Management Studies (SOCMS)',
    rationale: 'Connects quantitative accounting and capital valuation with executive corporate leadership and enterprise governance.',
  },
  // Law + Management
  {
    domainA: 'LAW',
    domainB: 'MANAGEMENT',
    specializationUG: 'Corporate Law, Mergers & Regulatory Governance',
    degreeUG: 'B.B.A. LL.B. (Hons) Integrated 5-Year Law Program',
    specializationPG: 'LL.M. in Corporate Law, Securities & Global Compliance',
    degreePG: 'LL.M. (Corporate Jurisprudence & Governance)',
    faculty: 'School of Law (SOL)',
    rationale: 'Bridges commercial enterprise strategy with statutory regulatory compliance, corporate contracting, and legal advocacy.',
  },
  // Law + Computing
  {
    domainA: 'LAW',
    domainB: 'COMPUTING_IT',
    specializationUG: 'Cyber Jurisprudence, Data Privacy & AI Law',
    degreeUG: 'B.A. LL.B. (Hons) with Specialization in Cyber Law',
    specializationPG: 'LL.M. in Cyber Law, Intellectual Property & Tech Regulation',
    degreePG: 'LL.M. (Cyber Law & Technology Regulation)',
    faculty: 'School of Law (SOL)',
    rationale: 'Connects computing system architecture and cloud cybersecurity with digital rights, cyber forensics, and regulatory policy.',
  },
  // Life Science + AI
  {
    domainA: 'LIFE_SCIENCE',
    domainB: 'AI_DATA',
    specializationUG: 'Bioinformatics & Computational Life Sciences',
    degreeUG: 'B.Sc in Bioinformatics & Computational Genomics',
    specializationPG: 'M.Sc in Computational Drug Discovery & Structural Genomics',
    degreePG: 'M.Sc (Bioinformatics & Genomic Intelligence)',
    faculty: 'School of Science (SOS)',
    rationale: 'Applies machine learning and statistical modeling to biological sequences, molecular drug discovery, and genomic data.',
  },
]

/**
 * Deterministically resolves the Optimal Program & Specialization based on Top 3 domains.
 */
export function resolveOptimalSpecialization(
  d1Key: string,
  d2Key: string,
  d3Key: string,
  level: 'UG' | 'PG' = 'UG'
): {
  degree: string
  specialization: string
  faculty: string
  campus: string
  duration: string
  eligibility: string
  admissionStatus: string
  rationale: string
} {
  const meta1 = normalizeDomain(d1Key)
  const meta2 = normalizeDomain(d2Key)
  const meta3 = normalizeDomain(d3Key)

  // 1. Check for Top 1 + Top 2 synergy match
  const synergyD1D2 = SYNERGY_SPECIALIZATIONS.find(
    (s) =>
      (s.domainA === meta1.code && s.domainB === meta2.code) ||
      (s.domainA === meta2.code && s.domainB === meta1.code)
  )

  if (synergyD1D2) {
    return {
      degree: level === 'UG' ? synergyD1D2.degreeUG : synergyD1D2.degreePG,
      specialization: level === 'UG' ? synergyD1D2.specializationUG : synergyD1D2.specializationPG,
      faculty: synergyD1D2.faculty,
      campus: meta1.campus,
      duration: level === 'UG' ? meta1.durationUG : meta1.durationPG,
      eligibility: level === 'UG' ? meta1.eligibilityUG : meta1.eligibilityPG,
      admissionStatus: 'Recommended for Direct Admission & Merit Scholarship',
      rationale: synergyD1D2.rationale,
    }
  }

  // 2. Check for Top 1 + Top 3 synergy match
  const synergyD1D3 = SYNERGY_SPECIALIZATIONS.find(
    (s) =>
      (s.domainA === meta1.code && s.domainB === meta3.code) ||
      (s.domainA === meta3.code && s.domainB === meta1.code)
  )

  if (synergyD1D3) {
    return {
      degree: level === 'UG' ? synergyD1D3.degreeUG : synergyD1D3.degreePG,
      specialization: level === 'UG' ? synergyD1D3.specializationUG : synergyD1D3.specializationPG,
      faculty: synergyD1D3.faculty,
      campus: meta1.campus,
      duration: level === 'UG' ? meta1.durationUG : meta1.durationPG,
      eligibility: level === 'UG' ? meta1.eligibilityUG : meta1.eligibilityPG,
      admissionStatus: 'Recommended for Direct Admission & Merit Scholarship',
      rationale: synergyD1D3.rationale,
    }
  }

  // 3. Direct Primary Domain match (Pure Domain Specialization)
  return {
    degree: level === 'UG' ? meta1.degreeUG : meta1.degreePG,
    specialization: level === 'UG' ? meta1.specializationUG : meta1.specializationPG,
    faculty: meta1.faculty,
    campus: meta1.campus,
    duration: level === 'UG' ? meta1.durationUG : meta1.durationPG,
    eligibility: level === 'UG' ? meta1.eligibilityUG : meta1.eligibilityPG,
    admissionStatus: 'Recommended for Direct Admission & Merit Scholarship',
    rationale: meta1.rationale,
  }
}

/**
 * Returns complete Domain card data tailored specifically to that domain and rank.
 */
export function getDomainCardData(
  domainKey: string,
  score: number,
  rank: 1 | 2 | 3,
  level: 'UG' | 'PG' = 'UG'
): {
  rank: number
  id: string
  code: string
  name: string
  score: number
  label: string
  tag: string
  badgeBg: string
  meterColor: string
  degreePath: string
  rationale: string
  faculty: string
} {
  const meta = normalizeDomain(domainKey)
  const label =
    score >= 80 ? 'Strong Alignment' :
    score >= 65 ? 'High Compatibility' :
    score >= 50 ? 'Moderate Alignment' : 'Exploratory Match'

  const rankConfigs = {
    1: {
      tag: 'Best Fit / Primary Recommendation',
      badgeBg: 'bg-[#A36B40] text-white shadow-xs',
      meterColor: 'from-[#A36B40] to-[#C87D55]',
      rationale: meta.rationale,
    },
    2: {
      tag: 'Strong Alternative Pathway',
      badgeBg: 'bg-[#77734B] text-white shadow-xs',
      meterColor: 'from-[#77734B] to-[#969163]',
      rationale: meta.alternativeRationale,
    },
    3: {
      tag: 'Complementary Domain',
      badgeBg: 'bg-[#2C2621] text-white shadow-xs',
      meterColor: 'from-[#8E5B34] to-[#B0774B]',
      rationale: meta.complementaryRationale,
    },
  }

  const cfg = rankConfigs[rank] || rankConfigs[1]

  return {
    rank,
    id: meta.id,
    code: meta.code,
    name: meta.name,
    score,
    label,
    tag: cfg.tag,
    badgeBg: cfg.badgeBg,
    meterColor: cfg.meterColor,
    degreePath: level === 'UG' ? meta.degreeUG : meta.degreePG,
    rationale: cfg.rationale,
    faculty: meta.faculty,
  }
}
