/**
 * Career Intelligence System - Matrix & Dimension Definitions
 * Implements standard 10 UG dimensions, 6 PG dimensions, domain definitions,
 * course compatibility matrix, specialization matrices, and eligibility rules.
 */

export interface DimensionDef {
  code: string
  name: string
  description: string
  category: 'UG' | 'PG' | 'COMMON'
}

export const CAREER_DIMENSIONS: Record<string, DimensionDef> = {
  // Core 10 UG Dimensions
  INT: { code: 'INT', name: 'Interest & Passion', description: 'Intrinsic engagement and what the student enjoys doing most', category: 'COMMON' },
  ANA: { code: 'ANA', name: 'Analytical Thinking', description: 'Logic, deduction, structured reasoning and problem decomposition', category: 'COMMON' },
  NUM: { code: 'NUM', name: 'Numerical Orientation', description: 'Comfort with quantitative modeling, statistics and mathematical problems', category: 'COMMON' },
  TECH: { code: 'TECH', name: 'Technology Orientation', description: 'Enthusiasm for software, computing systems, architecture and digital tools', category: 'COMMON' },
  SCI: { code: 'SCI', name: 'Scientific Orientation', description: 'Empirical curiosity, hypotheses testing and scientific experimentation', category: 'COMMON' },
  COM: { code: 'COM', name: 'Communication & Expression', description: 'Verbal, written, persuasive and interpersonal presentation capabilities', category: 'COMMON' },
  CRE: { code: 'CRE', name: 'Creativity & Design', description: 'Aesthetic sensibility, visual ideation and divergent problem solving', category: 'COMMON' },
  SOC: { code: 'SOC', name: 'Social & Empathy Orientation', description: 'Interest in human behavior, welfare, community and counseling', category: 'COMMON' },
  BUS: { code: 'BUS', name: 'Business & Commercial Orientation', description: 'Commercial acumen, organizational economics and entrepreneurial drive', category: 'COMMON' },
  RES: { code: 'RES', name: 'Research Orientation', description: 'Deep curiosity, literature synthesis and independent investigative inquiry', category: 'COMMON' },

  // Stage 1 Dimensions
  AR: { code: 'AR', name: 'Analytical Reasoning', description: 'Breaks complex problems into parts; evaluates assumptions and relationships', category: 'COMMON' },
  LR: { code: 'LR', name: 'Logical Reasoning', description: 'Recognizes rules, sequences, deductions and valid conclusions', category: 'COMMON' },
  QR: { code: 'QR', name: 'Quantitative Reasoning', description: 'Mathematical relationships, ratios, computational modeling and quantitative data', category: 'COMMON' },
  PS: { code: 'PS', name: 'Problem Solving', description: 'Develops structured solutions to unfamiliar practical problems', category: 'COMMON' },
  SC: { code: 'SC', name: 'Scientific Thinking', description: 'Empirical inquiry, hypotheses testing, experimental controls and scientific method', category: 'COMMON' },
  RE: { code: 'RE', name: 'Research Orientation', description: 'Investigative inquiry, literature synthesis and evidence-backed claims', category: 'COMMON' },
  TC: { code: 'TC', name: 'Technology Orientation', description: 'Interest and aptitude for computing, systems and technology', category: 'COMMON' },
  CR: { code: 'CR', name: 'Creativity & Innovation', description: 'Generates alternatives, novel ideas and user-centered improvements', category: 'COMMON' },
  CO: { code: 'CO', name: 'Communication & Expression', description: 'Explains, interprets and adapts information for different audiences', category: 'COMMON' },
  SO: { code: 'SO', name: 'Social Orientation', description: 'Shows interest in people, behaviour, society and stakeholder needs', category: 'COMMON' },
  LE: { code: 'LE', name: 'Leadership & Management', description: 'Plans, prioritizes, coordinates, resolves trade-offs and allocates resources', category: 'COMMON' },
  BU: { code: 'BU', name: 'Business Orientation', description: 'Understands value, markets, finance, customers, risk and entrepreneurship', category: 'COMMON' },

  // PG Specific Dimensions
  ADV: { code: 'ADV', name: 'Advanced Subject Mastery', description: 'Deep technical rigor and advanced conceptual mastery', category: 'PG' },
  PRA: { code: 'PRA', name: 'Practical Application', description: 'Real-world deployment, hands-on labs and industrial execution', category: 'PG' },
  LEAD: { code: 'LEAD', name: 'Leadership & People Management', description: 'Team orchestration, decision accountability and talent stewardship', category: 'PG' },
  STR: { code: 'STR', name: 'Strategic Thinking', description: 'Long-term planning, market foresight and systems architecture', category: 'PG' },
  SPEC: { code: 'SPEC', name: 'Specialization Depth', description: 'Vertical domain depth and concentrated expertise', category: 'PG' },
  IND: { code: 'IND', name: 'Industry Orientation', description: 'Commercial readiness, client delivery and professional practice', category: 'PG' },
}

export interface DomainWeightProfile {
  id: string
  name: string
  code: string
  description: string
  dimensionWeights: Record<string, number> // e.g. { BUS: 0.30, COM: 0.15, ANA: 0.15, LEAD: 0.15, INT: 0.15, STR: 0.10 }
}

export const DOMAIN_PROFILES: Record<string, DomainWeightProfile> = {
  COMPUTER_SCIENCE: {
    id: 'domain_cs_it',
    name: 'Computer Science & Information Technology',
    code: 'CS_IT',
    description: 'Software engineering, algorithmic intelligence, cloud systems and digital computing.',
    dimensionWeights: { TC: 0.35, PS: 0.25, LR: 0.20, QR: 0.10, AR: 0.10, TECH: 0.35, ANA: 0.25, NUM: 0.20, RES: 0.10, INT: 0.10 },
  },
  ENGINEERING_TECH: {
    id: 'domain_engineering',
    name: 'Engineering & Advanced Technology',
    code: 'ENG_TECH',
    description: 'Applied physics, systems engineering, hardware computing and robotics.',
    dimensionWeights: { TC: 0.30, QR: 0.25, SC: 0.20, PS: 0.15, LR: 0.10, TECH: 0.30, NUM: 0.25, ANA: 0.20, SCI: 0.15, INT: 0.10 },
  },
  BUSINESS_MGMT: {
    id: 'domain_business_mgmt',
    name: 'Business & Management',
    code: 'BUS_MGMT',
    description: 'Commercial enterprise leadership, organizational strategy, and venture operations.',
    dimensionWeights: { BU: 0.35, LE: 0.25, CO: 0.20, LR: 0.10, SO: 0.10, BUS: 0.35, LEAD: 0.25, COM: 0.20, ANA: 0.10, INT: 0.10 },
  },
  COMMERCE_FINANCE: {
    id: 'domain_commerce_fin',
    name: 'Commerce, Banking & Finance',
    code: 'COM_FIN',
    description: 'Quantitative capital markets, audit, accounting analytics and corporate treasury.',
    dimensionWeights: { QR: 0.35, BU: 0.30, LR: 0.20, AR: 0.15, NUM: 0.35, BUS: 0.30, ANA: 0.20, COM: 0.15 },
  },
  DESIGN_CREATIVE: {
    id: 'domain_design_creative',
    name: 'Design & Creative Studies',
    code: 'DES_CRE',
    description: 'User experience design, visual communication, digital arts and creative production.',
    dimensionWeights: { CR: 0.40, CO: 0.20, SO: 0.20, PS: 0.20, CRE: 0.40, COM: 0.20, SOC: 0.20, INT: 0.20 },
  },
  LAW_LEGAL: {
    id: 'domain_law',
    name: 'Law & Jurisprudence',
    code: 'LAW_LEG',
    description: 'Legal reasoning, constitutional law, corporate compliance and public advocacy.',
    dimensionWeights: { CO: 0.35, LR: 0.25, SO: 0.20, RE: 0.20, COM: 0.35, ANA: 0.25, SOC: 0.20, RES: 0.20 },
  },
  HUMANITIES_SOCIAL: {
    id: 'domain_humanities',
    name: 'Humanities & Social Sciences',
    code: 'HUM_SOC',
    description: 'Sociology, psychology, media journalism and cultural policy analysis.',
    dimensionWeights: { SO: 0.35, CO: 0.30, RE: 0.20, CR: 0.15, SOC: 0.35, COM: 0.30, RES: 0.20, CRE: 0.15 },
  },
  PURE_SCIENCES: {
    id: 'domain_pure_sci',
    name: 'Pure & Applied Sciences',
    code: 'PURE_SCI',
    description: 'Fundamental research, biotechnology, data modeling and scientific inquiry.',
    dimensionWeights: { SC: 0.35, RE: 0.25, QR: 0.25, LR: 0.15, SCI: 0.35, RES: 0.25, NUM: 0.25, ANA: 0.15 },
  },
}

export interface CourseCompatibilityDef {
  id: string
  code: string
  name: string
  level: 'UG' | 'PG'
  domainCode: string
  dimensionWeights: Record<string, number>
  eligibilityRules: {
    requiredSubjects?: string[]
    minGradePercent?: number
    streamRequired?: string[]
    description: string
  }
  specializations: Array<{
    id: string
    name: string
    code: string
    description: string
    weights: Record<string, number>
  }>
}

export const COURSE_COMPATIBILITY_MATRIX: CourseCompatibilityDef[] = [
  // ─── UG COURSES ───────────────────────────────────────────────────────────
  {
    id: 'course_btech',
    code: 'B.Tech / Engineering',
    name: 'B.Tech in Computer Science & Engineering',
    level: 'UG',
    domainCode: 'CS_IT',
    dimensionWeights: { TECH: 30, ANA: 25, NUM: 20, PRA: 15, SCI: 5, RES: 5 },
    eligibilityRules: {
      requiredSubjects: ['Physics', 'Mathematics'],
      minGradePercent: 55,
      streamRequired: ['Science (PCM)'],
      description: '10+2 with Physics and Mathematics (PCM) with minimum 55% aggregate.',
    },
    specializations: [
      {
        id: 'spec_btech_ai_ml',
        code: 'BTECH_AIML',
        name: 'AI, Autonomous Systems & Large Language Models',
        description: 'Deep neural networks, PyTorch/TensorFlow systems, and generative intelligence.',
        weights: { ANA: 30, TECH: 30, NUM: 25, RES: 15 },
      },
      {
        id: 'spec_btech_cyber',
        code: 'BTECH_CYBER',
        name: 'Cyber Security, Forensics & Zero-Trust Defense',
        description: 'Ethical exploitation, cryptographic protocols, security ops and digital forensics.',
        weights: { TECH: 35, ANA: 30, RES: 20, PRA: 15 },
      },
      {
        id: 'spec_btech_data',
        code: 'BTECH_DS',
        name: 'Big Data Engineering & Distributed Systems',
        description: 'Spark pipelines, Kafka streaming, data warehouses and high-throughput databases.',
        weights: { NUM: 30, TECH: 30, ANA: 25, RES: 15 },
      },
    ],
  },
  {
    id: 'course_bca',
    code: 'BCA',
    name: 'Bachelor of Computer Applications (BCA)',
    level: 'UG',
    domainCode: 'CS_IT',
    dimensionWeights: { TECH: 35, ANA: 25, NUM: 15, PRA: 10, RES: 10, BUS: 5 },
    eligibilityRules: {
      minGradePercent: 50,
      description: '10+2 with Mathematics / Computer Science / Statistics / Informatics at qualifying level.',
    },
    specializations: [
      {
        id: 'spec_bca_ai',
        code: 'BCA_AI',
        name: 'Artificial Intelligence & Machine Learning',
        description: 'Neural architectures, predictive regression, computer vision and NLP pipelines.',
        weights: { TECH: 35, ANA: 30, NUM: 20, RES: 15 },
      },
      {
        id: 'spec_bca_cloud',
        code: 'BCA_CLOUD',
        name: 'Cloud Computing & DevOps Architecture',
        description: 'Container orchestration, AWS/Azure infrastructure, CI/CD pipelines and microservices.',
        weights: { TECH: 35, ANA: 25, PRA: 25, NUM: 15 },
      },
      {
        id: 'spec_bca_fullstack',
        code: 'BCA_FS',
        name: 'Full-Stack Web & Mobile Architecture',
        description: 'React, Node.js, distributed databases, REST/GraphQL APIs and modern UX.',
        weights: { TECH: 30, CRE: 25, ANA: 25, PRA: 20 },
      },
    ],
  },
  {
    id: 'course_bba',
    code: 'BBA',
    name: 'Bachelor of Business Administration (BBA)',
    level: 'UG',
    domainCode: 'BUS_MGMT',
    dimensionWeights: { BUS: 30, LEAD: 20, COM: 15, STR: 15, ANA: 10, SOC: 10 },
    eligibilityRules: {
      minGradePercent: 50,
      description: '10+2 in any stream (Science/Commerce/Arts) with minimum 50% aggregate.',
    },
    specializations: [
      {
        id: 'spec_bba_analytics',
        code: 'BBA_BA',
        name: 'Business Analytics & Decision Science',
        description: 'Data-driven business decision making, predictive analytics and operational dashboards.',
        weights: { ANA: 30, NUM: 20, TECH: 15, BUS: 15, RES: 10, COM: 10 },
      },
      {
        id: 'spec_bba_fin',
        code: 'BBA_FIN',
        name: 'Banking & Corporate Finance',
        description: 'Investment appraisal, corporate valuation, wealth management and financial markets.',
        weights: { NUM: 35, BUS: 25, ANA: 20, COM: 10, RES: 10 },
      },
      {
        id: 'spec_bba_mkt',
        code: 'BBA_MKT',
        name: 'Digital Marketing & Brand Strategy',
        description: 'Consumer psychology, brand management, digital advertising and growth marketing.',
        weights: { COM: 25, CRE: 25, BUS: 20, SOC: 15, ANA: 15 },
      },
      {
        id: 'spec_bba_hr',
        code: 'BBA_HR',
        name: 'Human Resources & Talent Management',
        description: 'Organizational behavior, corporate recruiting, workplace culture and talent development.',
        weights: { SOC: 30, COM: 25, LEAD: 20, BUS: 15, ANA: 10 },
      },
    ],
  },
  {
    id: 'course_bcom',
    code: 'B.Com',
    name: 'Bachelor of Commerce (Honours / FinTech)',
    level: 'UG',
    domainCode: 'COM_FIN',
    dimensionWeights: { BUS: 30, NUM: 25, ANA: 20, STR: 10, COM: 10, PRA: 5 },
    eligibilityRules: {
      minGradePercent: 50,
      description: '10+2 with Commerce or Mathematics background preferred with min 50%.',
    },
    specializations: [
      {
        id: 'spec_bcom_fintech',
        code: 'BCOM_FT',
        name: 'Financial Technology & Algorithmic Trading',
        description: 'Modern ledger systems, payment gateways, quantitative valuation and FinTech regulation.',
        weights: { NUM: 30, TECH: 25, BUS: 25, ANA: 20 },
      },
      {
        id: 'spec_bcom_audit',
        code: 'BCOM_AUD',
        name: 'Accounting, Auditing & Taxation',
        description: 'Statutory compliance, international taxation, forensic accounting and IFRS.',
        weights: { NUM: 35, ANA: 25, BUS: 25, COM: 15 },
      },
    ],
  },
  {
    id: 'course_ba_psych',
    code: 'BA Psychology',
    name: 'Bachelor of Arts in Applied Psychology & Behavioral Science',
    level: 'UG',
    domainCode: 'HUM_SOC',
    dimensionWeights: { SOC: 30, COM: 20, RES: 20, ANA: 15, SCI: 10, CRE: 5 },
    eligibilityRules: {
      minGradePercent: 50,
      description: '10+2 in any stream with minimum 50% aggregate.',
    },
    specializations: [
      {
        id: 'spec_ba_counseling',
        code: 'BA_COUNS',
        name: 'Clinical & Counseling Psychology',
        description: 'Diagnostic assessment, mental health guidance, and cognitive development.',
        weights: { SOC: 35, RES: 25, COM: 20, ANA: 20 },
      },
      {
        id: 'spec_ba_org_psych',
        code: 'BA_ORG_PSY',
        name: 'Organizational Psychology & Consumer Behavior',
        description: 'Workplace dynamics, consumer decision making, and talent assessment.',
        weights: { SOC: 30, BUS: 25, COM: 25, ANA: 20 },
      },
    ],
  },
  {
    id: 'course_bdes',
    code: 'B.Des',
    name: 'Bachelor of Design (UI/UX, Product & Visual)',
    level: 'UG',
    domainCode: 'DES_CRE',
    dimensionWeights: { CRE: 40, PRA: 20, COM: 15, SOC: 10, ANA: 10, TECH: 5 },
    eligibilityRules: {
      minGradePercent: 50,
      description: '10+2 in any stream with creative aptitude test compliance.',
    },
    specializations: [
      {
        id: 'spec_bdes_ux',
        code: 'BDES_UX',
        name: 'User Experience & Interaction Design',
        description: 'Design systems, prototyping, wireframing and user research.',
        weights: { CRE: 35, TECH: 25, SOC: 20, PRA: 20 },
      },
      {
        id: 'spec_bdes_product',
        code: 'BDES_PROD',
        name: 'Industrial & Product Design',
        description: 'Physical prototyping, ergonomics, material aesthetics and fabrication.',
        weights: { CRE: 35, PRA: 30, ANA: 20, TECH: 15 },
      },
    ],
  },

  // ─── PG COURSES ───────────────────────────────────────────────────────────
  {
    id: 'course_mba',
    code: 'MBA',
    name: 'Master of Business Administration (MBA)',
    level: 'PG',
    domainCode: 'BUS_MGMT',
    dimensionWeights: { BUS: 30, LEAD: 20, STR: 20, ANA: 15, IND: 10, COM: 5 },
    eligibilityRules: {
      minGradePercent: 50,
      description: 'Recognized Bachelor degree in any discipline with minimum 50% aggregate.',
    },
    specializations: [
      {
        id: 'spec_mba_ba',
        code: 'MBA_BA',
        name: 'Business Analytics & AI Strategy',
        description: 'Enterprise data modeling, executive decision intelligence, and predictive optimization.',
        weights: { ANA: 30, NUM: 25, TECH: 20, BUS: 15, STR: 10 },
      },
      {
        id: 'spec_mba_fin',
        code: 'MBA_FIN',
        name: 'Financial Analytics & Investment Banking',
        description: 'Portfolio construction, derivatives pricing, financial engineering and risk management.',
        weights: { NUM: 35, BUS: 25, ANA: 20, STR: 10, LEAD: 10 },
      },
      {
        id: 'spec_mba_mkt',
        code: 'MBA_MKT',
        name: 'Strategic Marketing & Consumer Analytics',
        description: 'Omnichannel customer engagement, marketing mix modeling and brand governance.',
        weights: { COM: 25, CRE: 20, BUS: 20, SOC: 15, ANA: 20 },
      },
    ],
  },
  {
    id: 'course_msc_ds',
    code: 'M.Sc Data Science',
    name: 'Master of Science in Data Science & Big Data',
    level: 'PG',
    domainCode: 'CS_IT',
    dimensionWeights: { TECH: 30, NUM: 25, ANA: 25, RES: 15, SPEC: 5 },
    eligibilityRules: {
      streamRequired: ['B.Tech', 'BCA', 'B.Sc (Math/Stat/CS)'],
      minGradePercent: 55,
      description: 'Bachelor degree in CS/IT/Mathematics/Statistics/Engineering with minimum 55%.',
    },
    specializations: [
      {
        id: 'spec_msc_ai',
        code: 'MSC_AI',
        name: 'Machine Learning Research & Computer Vision',
        description: 'Advanced theoretical deep learning, generative diffusion models and high performance compute.',
        weights: { SPEC: 30, ANA: 25, TECH: 25, NUM: 20 },
      },
      {
        id: 'spec_msc_quant',
        code: 'MSC_QUANT',
        name: 'Quantitative Finance Analytics & Stochastic Modeling',
        description: 'High-frequency market time-series, risk simulations and algorithmic execution.',
        weights: { NUM: 35, ANA: 25, TECH: 20, BUS: 20 },
      },
    ],
  },
]
