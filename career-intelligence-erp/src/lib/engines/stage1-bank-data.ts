/**
 * Stage 1 Redesigned Question Bank & Scoring Matrix Engine
 * Generated directly from:
 * 1. Stage1_Detailed_Scoring_Matrix_Implementation_Guide.xlsx
 * 2. stage1_redesigned_ug_pg_question_bank.xlsx
 *
 * Implements:
 * - 12 Standard Assessment Dimensions
 * - 15 University Course Families & Weights
 * - Complete 65 UG + 65 PG Question Bank (13 questions per level × 5 levels)
 * - Exact mathematical Suitability Formula: S_c = Σ(D_d × W_c,d) / Σ(W_c,d)
 * - Deterministic Option Shuffling with internal option ID tracking
 */

export interface OptionWeightItem {
  id: string
  key?: 'A' | 'B' | 'C' | 'D'
  text: string
  weights: Record<string, number>
}

export interface Stage1Question {
  id: string
  number: number
  track: 'UG' | 'PG'
  level: number
  type: string
  question: string
  bestAnswer?: string
  discriminator?: string
  usedAs?: string
  options: OptionWeightItem[]
}

export interface CourseFamilyDef {
  id: string
  name: string
  weights: Record<string, number>
  primaryDims: string[]
  recommendedDegreeUG: string
  recommendedDegreePG: string
  description: string
}

export const STAGE1_DIMENSION_DEFS: Record<string, { code: string; name: string; description: string }> = {
  AR: { code: 'AR', name: 'Analytical Reasoning', description: 'Breaks complex problems into parts; evaluates assumptions and relationships.' },
  LR: { code: 'LR', name: 'Logical Reasoning', description: 'Recognizes rules, sequences, deductions and valid conclusions.' },
  QR: { code: 'QR', name: 'Quantitative Reasoning', description: 'Works with numbers, ratios, mathematical relationships and quantitative data.' },
  PS: { code: 'PS', name: 'Problem Solving', description: 'Develops and evaluates solutions to unfamiliar practical problems.' },
  SC: { code: 'SC', name: 'Scientific Thinking', description: 'Uses hypotheses, evidence, controls, experimentation and uncertainty.' },
  RE: { code: 'RE', name: 'Research Orientation', description: 'Seeks evidence, compares sources, investigates causes and tests claims.' },
  TC: { code: 'TC', name: 'Technology Orientation', description: 'Shows interest and aptitude for computing, systems and technology.' },
  CR: { code: 'CR', name: 'Creativity', description: 'Generates alternatives, novel ideas and user-centered improvements.' },
  CO: { code: 'CO', name: 'Communication', description: 'Explains, interprets and adapts information for different audiences.' },
  SO: { code: 'SO', name: 'Social Orientation', description: 'Shows interest in people, behaviour, society and stakeholder needs.' },
  LE: { code: 'LE', name: 'Leadership & Management', description: 'Plans, prioritizes, coordinates, resolves trade-offs and allocates resources.' },
  BU: { code: 'BU', name: 'Business Orientation', description: 'Understands value, markets, finance, customers, risk and entrepreneurship.' },
}

export const COURSE_FAMILY_MATRIX: CourseFamilyDef[] = [
  {
    id: 'cf_computing___it',
    name: 'Computing & IT',
    weights: {"AR": 5, "LR": 5, "QR": 4, "PS": 5, "SC": 2, "RE": 3, "TC": 5, "CR": 3, "CO": 3, "SO": 2, "LE": 2, "BU": 2},
    primaryDims: [],
    recommendedDegreeUG: 'B.Tech Computer Science & Engineering (Cloud & Cyber Security)',
    recommendedDegreePG: 'Master of Computer Applications (MCA Full-Stack Architecture)',
    description: 'Software engineering, enterprise computing, cloud architecture, and cybersecurity.',
  },
  {
    id: 'cf_ai___data',
    name: 'AI & Data',
    weights: {"AR": 5, "LR": 5, "QR": 5, "PS": 5, "SC": 3, "RE": 5, "TC": 5, "CR": 3, "CO": 3, "SO": 2, "LE": 2, "BU": 2},
    primaryDims: [],
    recommendedDegreeUG: 'B.Tech CSE (Artificial Intelligence & Machine Learning / Data Science)',
    recommendedDegreePG: 'M.Tech Computer Science (AI, Deep Learning & Big Data Analytics)',
    description: 'Machine learning systems, algorithmic intelligence, data pipelines, and applied AI.',
  },
  {
    id: 'cf_engineering',
    name: 'Engineering',
    weights: {"AR": 5, "LR": 5, "QR": 5, "PS": 5, "SC": 5, "RE": 3, "TC": 5, "CR": 3, "CO": 3, "SO": 2, "LE": 3, "BU": 2},
    primaryDims: [],
    recommendedDegreeUG: 'B.Tech Mechanical / Civil / Electrical & Robotics Engineering',
    recommendedDegreePG: 'M.Tech Advanced Systems, Automation & Design Engineering',
    description: 'Core applied engineering, infrastructure design, mechatronics, and physical systems.',
  },
  {
    id: 'cf_math___statistics',
    name: 'Math & Statistics',
    weights: {"AR": 5, "LR": 5, "QR": 5, "PS": 4, "SC": 5, "RE": 5, "TC": 3, "CR": 2, "CO": 3, "SO": 2, "LE": 2, "BU": 1},
    primaryDims: [],
    recommendedDegreeUG: 'B.Sc (Hons) Applied Mathematics, Statistics & Analytics',
    recommendedDegreePG: 'M.Sc Data Analytics & Financial Mathematics',
    description: 'Mathematical modeling, statistical inference, quantitative research, and analytics.',
  },
  {
    id: 'cf_natural_science',
    name: 'Natural Science',
    weights: {"AR": 4, "LR": 4, "QR": 5, "PS": 4, "SC": 5, "RE": 5, "TC": 3, "CR": 2, "CO": 3, "SO": 2, "LE": 2, "BU": 1},
    primaryDims: [],
    recommendedDegreeUG: 'B.Sc (Hons) Physics / Chemistry / Applied Sciences',
    recommendedDegreePG: 'M.Sc Applied Sciences & Material Technology',
    description: 'Empirical sciences, chemical formulation, physics research, and laboratory discovery.',
  },
  {
    id: 'cf_life_science',
    name: 'Life Science',
    weights: {"AR": 4, "LR": 4, "QR": 3, "PS": 4, "SC": 5, "RE": 5, "TC": 3, "CR": 3, "CO": 3, "SO": 3, "LE": 2, "BU": 1},
    primaryDims: [],
    recommendedDegreeUG: 'B.Sc / B.Tech Biotechnology & Biomedical Sciences',
    recommendedDegreePG: 'M.Sc Biotechnology, Microbiology & Genomics',
    description: 'Biological systems, healthcare diagnostics, genetics, and pharmaceutical biotechnology.',
  },
  {
    id: 'cf_commerce___finance',
    name: 'Commerce & Finance',
    weights: {"AR": 3, "LR": 3, "QR": 5, "PS": 3, "SC": 1, "RE": 2, "TC": 2, "CR": 3, "CO": 4, "SO": 3, "LE": 4, "BU": 5},
    primaryDims: [],
    recommendedDegreeUG: 'B.Com (Hons) Banking, Financial Analytics & Fintech',
    recommendedDegreePG: 'M.Com / MBA Corporate Finance, Taxation & Investment Banking',
    description: 'Corporate finance, auditing, financial modeling, capital markets, and fintech.',
  },
  {
    id: 'cf_management',
    name: 'Management',
    weights: {"AR": 4, "LR": 4, "QR": 3, "PS": 5, "SC": 1, "RE": 2, "TC": 2, "CR": 4, "CO": 5, "SO": 4, "LE": 5, "BU": 5},
    primaryDims: [],
    recommendedDegreeUG: 'BBA (Hons) / Integrated BBA-MBA in Strategic Leadership',
    recommendedDegreePG: 'MBA Business Administration (Tech Management & Operations)',
    description: 'Enterprise management, strategic marketing, supply chain, and organizational leadership.',
  },
  {
    id: 'cf_economics',
    name: 'Economics',
    weights: {"AR": 5, "LR": 4, "QR": 5, "PS": 4, "SC": 3, "RE": 5, "TC": 2, "CR": 3, "CO": 4, "SO": 3, "LE": 4, "BU": 5},
    primaryDims: [],
    recommendedDegreeUG: 'B.Sc (Hons) Economics, Public Policy & Econometrics',
    recommendedDegreePG: 'M.Sc Applied Economics & Financial Markets',
    description: 'Macro/microeconomic analysis, econometric modeling, market trends, and policy design.',
  },
  {
    id: 'cf_humanities',
    name: 'Humanities',
    weights: {"AR": 3, "LR": 2, "QR": 2, "PS": 3, "SC": 1, "RE": 4, "TC": 1, "CR": 5, "CO": 5, "SO": 5, "LE": 5, "BU": 2},
    primaryDims: [],
    recommendedDegreeUG: 'B.A. (Hons) English Literature, History & International Studies',
    recommendedDegreePG: 'M.A. Applied Humanities, Cultural Studies & Public Policy',
    description: 'Literature, historical analysis, philosophy, linguistic expression, and ethics.',
  },
  {
    id: 'cf_social_science',
    name: 'Social Science',
    weights: {"AR": 4, "LR": 4, "QR": 3, "PS": 4, "SC": 2, "RE": 5, "TC": 2, "CR": 5, "CO": 5, "SO": 5, "LE": 4, "BU": 3},
    primaryDims: [],
    recommendedDegreeUG: 'B.A. / B.Sc Psychology, Sociology & Behavioral Sciences',
    recommendedDegreePG: 'M.A. Clinical Psychology, Social Work & Human Behavior',
    description: 'Human psychology, sociological trends, counseling, and organizational behavior.',
  },
  {
    id: 'cf_media___communication',
    name: 'Media & Communication',
    weights: {"AR": 3, "LR": 3, "QR": 2, "PS": 4, "SC": 1, "RE": 4, "TC": 3, "CR": 5, "CO": 5, "SO": 5, "LE": 4, "BU": 4},
    primaryDims: [],
    recommendedDegreeUG: 'BA Journalism, Digital Mass Media & Film Production',
    recommendedDegreePG: 'MA Advertising, Digital PR & Strategic Media Communications',
    description: 'Broadcast journalism, digital media production, corporate communications, and PR.',
  },
  {
    id: 'cf_design___creative',
    name: 'Design & Creative',
    weights: {"AR": 3, "LR": 3, "QR": 2, "PS": 5, "SC": 1, "RE": 3, "TC": 4, "CR": 5, "CO": 4, "SO": 3, "LE": 3, "BU": 3},
    primaryDims: [],
    recommendedDegreeUG: 'B.Des User Experience (UX/UI), Graphic & Industrial Product Design',
    recommendedDegreePG: 'M.Des Advanced Interaction Design & Visual Innovation',
    description: 'UI/UX design, visual storytelling, digital creative arts, and product styling.',
  },
  {
    id: 'cf_law',
    name: 'Law',
    weights: {"AR": 4, "LR": 5, "QR": 3, "PS": 5, "SC": 1, "RE": 4, "TC": 2, "CR": 3, "CO": 5, "SO": 4, "LE": 4, "BU": 4},
    primaryDims: [],
    recommendedDegreeUG: 'B.A. LL.B. (Hons) / B.B.A. LL.B. (Hons) Integrated Law',
    recommendedDegreePG: 'LL.M. Corporate Law, Intellectual Property & Cyber Law',
    description: 'Jurisprudence, constitutional advocacy, corporate compliance, and dispute resolution.',
  },
  {
    id: 'cf_hospitality___tourism',
    name: 'Hospitality & Tourism',
    weights: {"AR": 3, "LR": 3, "QR": 2, "PS": 5, "SC": 1, "RE": 2, "TC": 2, "CR": 4, "CO": 5, "SO": 5, "LE": 5, "BU": 5},
    primaryDims: [],
    recommendedDegreeUG: 'B.Sc Hotel Management, Culinary Arts & International Tourism',
    recommendedDegreePG: 'MBA Global Hospitality & Tourism Enterprise Operations',
    description: 'Luxury resort operations, event design, food & beverage management, and travel systems.',
  },
]

export const UG_STAGE1_QUESTIONS: Stage1Question[] = [
  {
    "id": "UG001",
    "number": 1,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "You receive a problem you have never seen before. What would you prefer to do first?",
    "bestAnswer": "A",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG001_OPT_A",
        "key": "A",
        "text": "Break it into smaller parts and look for a logical structure.",
        "weights": {
          "AR": 5,
          "LR": 5,
          "PS": 5
        }
      },
      {
        "id": "UG001_OPT_B",
        "key": "B",
        "text": "Understand who is affected and what they need.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG001_OPT_C",
        "key": "C",
        "text": "Generate several different possible approaches.",
        "weights": {
          "CR": 5,
          "PS": 5
        }
      },
      {
        "id": "UG001_OPT_D",
        "key": "D",
        "text": "Gather information and look for patterns or evidence.",
        "weights": {
          "AR": 5,
          "RE": 5
        }
      }
    ]
  },
  {
    "id": "UG002",
    "number": 2,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which activity sounds most satisfying?",
    "bestAnswer": "B",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG002_OPT_A",
        "key": "A",
        "text": "Finding a hidden pattern in information.",
        "weights": {
          "PS": 5,
          "TC": 5
        }
      },
      {
        "id": "UG002_OPT_B",
        "key": "B",
        "text": "Organizing people toward a shared goal.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "QR": 5
        }
      },
      {
        "id": "UG002_OPT_C",
        "key": "C",
        "text": "Creating something original and visually or conceptually different.",
        "weights": {
          "LE": 5,
          "CO": 5
        }
      },
      {
        "id": "UG002_OPT_D",
        "key": "D",
        "text": "Building something that works.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG003",
    "number": 3,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "When learning something difficult, what helps you most?",
    "bestAnswer": "C",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG003_OPT_A",
        "key": "A",
        "text": "Discussing different viewpoints.",
        "weights": {
          "LR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG003_OPT_B",
        "key": "B",
        "text": "Experimenting and observing what happens.",
        "weights": {
          "PS": 5
        }
      },
      {
        "id": "UG003_OPT_C",
        "key": "C",
        "text": "Understanding the underlying logic.",
        "weights": {
          "CO": 5,
          "SO": 5
        }
      },
      {
        "id": "UG003_OPT_D",
        "key": "D",
        "text": "Seeing a practical example.",
        "weights": {
          "SC": 5,
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG004",
    "number": 4,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which problem would you most enjoy solving?",
    "bestAnswer": "D",
    "discriminator": "computing|business|social|design",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG004_OPT_A",
        "key": "A",
        "text": "How to create a better design or user experience.",
        "weights": {
          "TC": 5,
          "PS": 5,
          "AR": 5
        }
      },
      {
        "id": "UG004_OPT_B",
        "key": "B",
        "text": "Why a machine or software system is not working.",
        "weights": {
          "BU": 5,
          "AR": 5,
          "SO": 5
        }
      },
      {
        "id": "UG004_OPT_C",
        "key": "C",
        "text": "Why customers are leaving a service.",
        "weights": {
          "SO": 5,
          "RE": 5
        }
      },
      {
        "id": "UG004_OPT_D",
        "key": "D",
        "text": "Why a community is facing a social problem.",
        "weights": {
          "CR": 5,
          "PS": 5
        }
      }
    ]
  },
  {
    "id": "UG005",
    "number": 5,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which result would make you most satisfied?",
    "bestAnswer": "A",
    "discriminator": "research|technology|people|business",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG005_OPT_A",
        "key": "A",
        "text": "Discovering something nobody noticed.",
        "weights": {
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "UG005_OPT_B",
        "key": "B",
        "text": "Making a system work more efficiently.",
        "weights": {
          "TC": 5,
          "PS": 5
        }
      },
      {
        "id": "UG005_OPT_C",
        "key": "C",
        "text": "Helping people make a better decision.",
        "weights": {
          "CO": 5,
          "SO": 5,
          "AR": 5
        }
      },
      {
        "id": "UG005_OPT_D",
        "key": "D",
        "text": "Turning an idea into a successful project.",
        "weights": {
          "BU": 5,
          "LE": 5,
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG006",
    "number": 6,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which type of challenge interests you most?",
    "bestAnswer": "B",
    "discriminator": "quantitative|people|engineering|creative",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG006_OPT_A",
        "key": "A",
        "text": "A people or communication challenge.",
        "weights": {
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG006_OPT_B",
        "key": "B",
        "text": "A technical or mechanical challenge.",
        "weights": {
          "CO": 5,
          "SO": 5
        }
      },
      {
        "id": "UG006_OPT_C",
        "key": "C",
        "text": "An open-ended creative challenge.",
        "weights": {
          "TC": 5,
          "PS": 5,
          "SC": 5
        }
      },
      {
        "id": "UG006_OPT_D",
        "key": "D",
        "text": "A numerical or data-based challenge.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG007",
    "number": 7,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "You are given a new topic with no instructions. What is your first instinct?",
    "bestAnswer": "C",
    "discriminator": "research|practical|social|creative",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG007_OPT_A",
        "key": "A",
        "text": "Ask people with relevant experience.",
        "weights": {
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "UG007_OPT_B",
        "key": "B",
        "text": "Sketch possible solutions before researching.",
        "weights": {
          "PS": 5,
          "SC": 5
        }
      },
      {
        "id": "UG007_OPT_C",
        "key": "C",
        "text": "Find reliable sources and compare them.",
        "weights": {
          "CO": 5,
          "SO": 5
        }
      },
      {
        "id": "UG007_OPT_D",
        "key": "D",
        "text": "Start trying things and learn by doing.",
        "weights": {
          "CR": 5,
          "PS": 5
        }
      }
    ]
  },
  {
    "id": "UG008",
    "number": 8,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which task would you volunteer for?",
    "bestAnswer": "D",
    "discriminator": "analysis|communication|management|design",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG008_OPT_A",
        "key": "A",
        "text": "Creating several concepts for a new product.",
        "weights": {
          "AR": 5,
          "LR": 5
        }
      },
      {
        "id": "UG008_OPT_B",
        "key": "B",
        "text": "Checking whether a process contains errors.",
        "weights": {
          "CO": 5
        }
      },
      {
        "id": "UG008_OPT_C",
        "key": "C",
        "text": "Explaining a complex idea to others.",
        "weights": {
          "LE": 5,
          "PS": 5
        }
      },
      {
        "id": "UG008_OPT_D",
        "key": "D",
        "text": "Planning how a team should complete a project.",
        "weights": {
          "CR": 5,
          "BU": 5
        }
      }
    ]
  },
  {
    "id": "UG009",
    "number": 9,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which outcome matters most to you when solving a problem?",
    "bestAnswer": "A",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG009_OPT_A",
        "key": "A",
        "text": "A solution that is logically sound.",
        "weights": {
          "AR": 5,
          "LR": 5
        }
      },
      {
        "id": "UG009_OPT_B",
        "key": "B",
        "text": "A solution people will accept and use.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG009_OPT_C",
        "key": "C",
        "text": "A solution that is efficient and measurable.",
        "weights": {
          "PS": 5,
          "QR": 5,
          "TC": 5
        }
      },
      {
        "id": "UG009_OPT_D",
        "key": "D",
        "text": "A solution that is original and distinctive.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG010",
    "number": 10,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which environment sounds most appealing?",
    "bestAnswer": "B",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG010_OPT_A",
        "key": "A",
        "text": "Working closely with people.",
        "weights": {
          "AR": 5,
          "TC": 5,
          "QR": 5
        }
      },
      {
        "id": "UG010_OPT_B",
        "key": "B",
        "text": "Working with experiments or physical processes.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG010_OPT_C",
        "key": "C",
        "text": "Working on ideas, stories or visual concepts.",
        "weights": {
          "SC": 5,
          "PS": 5
        }
      },
      {
        "id": "UG010_OPT_D",
        "key": "D",
        "text": "Working with data, systems or models.",
        "weights": {
          "CR": 5,
          "CO": 5
        }
      }
    ]
  },
  {
    "id": "UG011",
    "number": 11,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "When two solutions both seem possible, what do you naturally compare?",
    "bestAnswer": "C",
    "discriminator": "decision making",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG011_OPT_A",
        "key": "A",
        "text": "Their cost, time and resources.",
        "weights": {
          "AR": 5,
          "LR": 5
        }
      },
      {
        "id": "UG011_OPT_B",
        "key": "B",
        "text": "Their originality and future possibilities.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG011_OPT_C",
        "key": "C",
        "text": "Their assumptions and logic.",
        "weights": {
          "BU": 5,
          "LE": 5,
          "PS": 5
        }
      },
      {
        "id": "UG011_OPT_D",
        "key": "D",
        "text": "Their effect on people.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG012",
    "number": 12,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "What kind of question interests you most?",
    "bestAnswer": "D",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG012_OPT_A",
        "key": "A",
        "text": "How could we make this better?",
        "weights": {
          "TC": 5,
          "AR": 5
        }
      },
      {
        "id": "UG012_OPT_B",
        "key": "B",
        "text": "How does this system work?",
        "weights": {
          "SO": 5,
          "RE": 5
        }
      },
      {
        "id": "UG012_OPT_C",
        "key": "C",
        "text": "Why do people behave this way?",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG012_OPT_D",
        "key": "D",
        "text": "What evidence supports this claim?",
        "weights": {
          "CR": 5,
          "PS": 5
        }
      }
    ]
  },
  {
    "id": "UG013",
    "number": 13,
    "track": "UG",
    "level": 1,
    "type": "Preference",
    "question": "Which activity would you enjoy doing repeatedly?",
    "bestAnswer": "A",
    "discriminator": "broad",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "UG013_OPT_A",
        "key": "A",
        "text": "Solving logic or number problems.",
        "weights": {
          "LR": 5,
          "QR": 5
        }
      },
      {
        "id": "UG013_OPT_B",
        "key": "B",
        "text": "Interviewing or communicating with people.",
        "weights": {
          "CO": 5,
          "SO": 5
        }
      },
      {
        "id": "UG013_OPT_C",
        "key": "C",
        "text": "Testing ideas and recording results.",
        "weights": {
          "SC": 5,
          "RE": 5
        }
      },
      {
        "id": "UG013_OPT_D",
        "key": "D",
        "text": "Planning projects and coordinating tasks.",
        "weights": {
          "LE": 5,
          "PS": 5
        }
      }
    ]
  },
  {
    "id": "UG014",
    "number": 14,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "A team asks you to contribute. Which role attracts you most?",
    "bestAnswer": "B",
    "discriminator": "team",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG014_OPT_A",
        "key": "A",
        "text": "Understand user or stakeholder needs.",
        "weights": {
          "AR": 5,
          "PS": 5
        }
      },
      {
        "id": "UG014_OPT_B",
        "key": "B",
        "text": "Test whether the proposed solution works.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG014_OPT_C",
        "key": "C",
        "text": "Generate alternative ideas.",
        "weights": {
          "SC": 5,
          "RE": 5
        }
      },
      {
        "id": "UG014_OPT_D",
        "key": "D",
        "text": "Analyse the problem and identify constraints.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG015",
    "number": 15,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "Which type of improvement interests you most?",
    "bestAnswer": "C",
    "discriminator": "improvement",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG015_OPT_A",
        "key": "A",
        "text": "Making a business more profitable.",
        "weights": {
          "PS": 5,
          "AR": 5,
          "TC": 5
        }
      },
      {
        "id": "UG015_OPT_B",
        "key": "B",
        "text": "Making a product more attractive or distinctive.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG015_OPT_C",
        "key": "C",
        "text": "Making a process faster or more accurate.",
        "weights": {
          "BU": 5,
          "QR": 5
        }
      },
      {
        "id": "UG015_OPT_D",
        "key": "D",
        "text": "Making an experience easier for people.",
        "weights": {
          "CR": 5,
          "BU": 5
        }
      }
    ]
  },
  {
    "id": "UG016",
    "number": 16,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "When you see a surprising result, what are you most likely to do?",
    "bestAnswer": "D",
    "discriminator": "evidence",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG016_OPT_A",
        "key": "A",
        "text": "Think of alternative explanations or solutions.",
        "weights": {
          "AR": 5,
          "QR": 5
        }
      },
      {
        "id": "UG016_OPT_B",
        "key": "B",
        "text": "Check the calculations and assumptions.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG016_OPT_C",
        "key": "C",
        "text": "Ask how people experienced the situation.",
        "weights": {
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "UG016_OPT_D",
        "key": "D",
        "text": "Look for evidence explaining the result.",
        "weights": {
          "CR": 5,
          "PS": 5
        }
      }
    ]
  },
  {
    "id": "UG017",
    "number": 17,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "Which project sounds most interesting?",
    "bestAnswer": "A",
    "discriminator": "project",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG017_OPT_A",
        "key": "A",
        "text": "Build a tool that automates a repetitive task.",
        "weights": {
          "TC": 5,
          "PS": 5
        }
      },
      {
        "id": "UG017_OPT_B",
        "key": "B",
        "text": "Study why students choose different courses.",
        "weights": {
          "SO": 5,
          "RE": 5
        }
      },
      {
        "id": "UG017_OPT_C",
        "key": "C",
        "text": "Investigate a scientific question.",
        "weights": {
          "SC": 5,
          "RE": 5
        }
      },
      {
        "id": "UG017_OPT_D",
        "key": "D",
        "text": "Create a campaign for a new product.",
        "weights": {
          "BU": 5,
          "CO": 5,
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG018",
    "number": 18,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "Which kind of success would you value most?",
    "bestAnswer": "B",
    "discriminator": "broad",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG018_OPT_A",
        "key": "A",
        "text": "A measurable improvement in people's experience.",
        "weights": {
          "TC": 5,
          "PS": 5
        }
      },
      {
        "id": "UG018_OPT_B",
        "key": "B",
        "text": "A well-supported discovery.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG018_OPT_C",
        "key": "C",
        "text": "A profitable and sustainable operation.",
        "weights": {
          "SC": 5,
          "RE": 5
        }
      },
      {
        "id": "UG018_OPT_D",
        "key": "D",
        "text": "A technically reliable solution.",
        "weights": {
          "BU": 5,
          "LE": 5
        }
      }
    ]
  },
  {
    "id": "UG019",
    "number": 19,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "What would you rather improve?",
    "bestAnswer": "C",
    "discriminator": "broad",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG019_OPT_A",
        "key": "A",
        "text": "An experiment or testing process.",
        "weights": {
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG019_OPT_B",
        "key": "B",
        "text": "A product's concept and presentation.",
        "weights": {
          "CO": 5,
          "LE": 5
        }
      },
      {
        "id": "UG019_OPT_C",
        "key": "C",
        "text": "A calculation or decision model.",
        "weights": {
          "SC": 5,
          "RE": 5
        }
      },
      {
        "id": "UG019_OPT_D",
        "key": "D",
        "text": "A team's communication.",
        "weights": {
          "CR": 5,
          "CO": 5
        }
      }
    ]
  },
  {
    "id": "UG020",
    "number": 20,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "Which challenge feels most natural to you?",
    "bestAnswer": "D",
    "discriminator": "broad",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG020_OPT_A",
        "key": "A",
        "text": "Decide how limited resources should be allocated.",
        "weights": {
          "LR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG020_OPT_B",
        "key": "B",
        "text": "Find the rule behind a complicated situation.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG020_OPT_C",
        "key": "C",
        "text": "Understand different perspectives.",
        "weights": {
          "SC": 5,
          "PS": 5
        }
      },
      {
        "id": "UG020_OPT_D",
        "key": "D",
        "text": "Work out why an experiment failed.",
        "weights": {
          "BU": 5,
          "LE": 5,
          "QR": 5
        }
      }
    ]
  },
  {
    "id": "UG021",
    "number": 21,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "When a project starts with an unclear goal, what should happen first?",
    "bestAnswer": "A",
    "discriminator": "project",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG021_OPT_A",
        "key": "A",
        "text": "Define the problem and success criteria.",
        "weights": {
          "AR": 5,
          "PS": 5
        }
      },
      {
        "id": "UG021_OPT_B",
        "key": "B",
        "text": "Talk to the people involved.",
        "weights": {
          "CO": 5,
          "SO": 5
        }
      },
      {
        "id": "UG021_OPT_C",
        "key": "C",
        "text": "Collect relevant evidence.",
        "weights": {
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "UG021_OPT_D",
        "key": "D",
        "text": "Brainstorm possible directions.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG022",
    "number": 22,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "Which type of feedback would you find most useful?",
    "bestAnswer": "B",
    "discriminator": "feedback",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG022_OPT_A",
        "key": "A",
        "text": "Information about how people experienced the result.",
        "weights": {
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "UG022_OPT_B",
        "key": "B",
        "text": "Measurements showing whether performance improved.",
        "weights": {
          "SO": 5,
          "CO": 5
        }
      },
      {
        "id": "UG022_OPT_C",
        "key": "C",
        "text": "Ideas for making the result more original.",
        "weights": {
          "QR": 5,
          "SC": 5
        }
      },
      {
        "id": "UG022_OPT_D",
        "key": "D",
        "text": "Specific evidence about what is wrong.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG023",
    "number": 23,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "What would you rather investigate?",
    "bestAnswer": "C",
    "discriminator": "investigation",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG023_OPT_A",
        "key": "A",
        "text": "Whether a scientific claim is supported by evidence.",
        "weights": {
          "TC": 5,
          "AR": 5
        }
      },
      {
        "id": "UG023_OPT_B",
        "key": "B",
        "text": "Why one product succeeds while another fails.",
        "weights": {
          "SO": 5,
          "RE": 5
        }
      },
      {
        "id": "UG023_OPT_C",
        "key": "C",
        "text": "Why a system produces unexpected outputs.",
        "weights": {
          "SC": 5,
          "RE": 5
        }
      },
      {
        "id": "UG023_OPT_D",
        "key": "D",
        "text": "Why a group behaves differently from another group.",
        "weights": {
          "BU": 5,
          "AR": 5
        }
      }
    ]
  },
  {
    "id": "UG024",
    "number": 24,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "Which responsibility would you accept most willingly?",
    "bestAnswer": "D",
    "discriminator": "roles",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG024_OPT_A",
        "key": "A",
        "text": "Developing the concept for a new idea.",
        "weights": {
          "AR": 5,
          "LR": 5
        }
      },
      {
        "id": "UG024_OPT_B",
        "key": "B",
        "text": "Checking accuracy and consistency.",
        "weights": {
          "CO": 5
        }
      },
      {
        "id": "UG024_OPT_C",
        "key": "C",
        "text": "Presenting information to a group.",
        "weights": {
          "LE": 5
        }
      },
      {
        "id": "UG024_OPT_D",
        "key": "D",
        "text": "Coordinating people and deadlines.",
        "weights": {
          "CR": 5
        }
      }
    ]
  },
  {
    "id": "UG025",
    "number": 25,
    "track": "UG",
    "level": 2,
    "type": "Preference",
    "question": "If you had a free month to learn something, which direction attracts you most?",
    "bestAnswer": "A",
    "discriminator": "broad",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG025_OPT_A",
        "key": "A",
        "text": "Programming, data or systems.",
        "weights": {
          "TC": 5,
          "AR": 5,
          "QR": 5
        }
      },
      {
        "id": "UG025_OPT_B",
        "key": "B",
        "text": "Psychology, society or communication.",
        "weights": {
          "SO": 5,
          "CO": 5,
          "RE": 5
        }
      },
      {
        "id": "UG025_OPT_C",
        "key": "C",
        "text": "Science, experiments or mathematics.",
        "weights": {
          "SC": 5,
          "QR": 5,
          "RE": 5
        }
      },
      {
        "id": "UG025_OPT_D",
        "key": "D",
        "text": "Business, management or entrepreneurship.",
        "weights": {
          "BU": 5,
          "LE": 5
        }
      }
    ]
  },
  {
    "id": "UG026",
    "number": 26,
    "track": "UG",
    "level": 2,
    "type": "Reasoning",
    "question": "A sequence is 2, 6, 12, 20, 30, ?. What comes next?",
    "bestAnswer": "B",
    "discriminator": "numerical",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "UG026_OPT_A",
        "key": "A",
        "text": "44",
        "weights": {}
      },
      {
        "id": "UG026_OPT_B",
        "key": "B",
        "text": "36",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG026_OPT_C",
        "key": "C",
        "text": "40",
        "weights": {
          "LR": 5,
          "AR": 5,
          "QR": 5
        }
      },
      {
        "id": "UG026_OPT_D",
        "key": "D",
        "text": "42",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG027",
    "number": 27,
    "track": "UG",
    "level": 3,
    "type": "Quantitative",
    "question": "While working on an undergraduate project, a product costs \u20b91,000 and is discounted by 20%. What is the new price?",
    "bestAnswer": "C",
    "discriminator": "numerical",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG027_OPT_A",
        "key": "A",
        "text": "\u20b9800",
        "weights": {}
      },
      {
        "id": "UG027_OPT_B",
        "key": "B",
        "text": "\u20b9820",
        "weights": {
          "QR": 5
        }
      },
      {
        "id": "UG027_OPT_C",
        "key": "C",
        "text": "\u20b9850",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG027_OPT_D",
        "key": "D",
        "text": "\u20b9750",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG028",
    "number": 28,
    "track": "UG",
    "level": 3,
    "type": "Evidence",
    "question": "While working on an undergraduate project, two reports give conflicting information. What should you do first?",
    "bestAnswer": "D",
    "discriminator": "research",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG028_OPT_A",
        "key": "A",
        "text": "Choose the report written by an expert.",
        "weights": {}
      },
      {
        "id": "UG028_OPT_B",
        "key": "B",
        "text": "Find additional evidence and compare methods.",
        "weights": {}
      },
      {
        "id": "UG028_OPT_C",
        "key": "C",
        "text": "Average the two conclusions.",
        "weights": {
          "RE": 5,
          "AR": 5,
          "SC": 5
        }
      },
      {
        "id": "UG028_OPT_D",
        "key": "D",
        "text": "Choose the newer report.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG029",
    "number": 29,
    "track": "UG",
    "level": 3,
    "type": "Quantitative",
    "question": "While working on an undergraduate project, a machine produces 200 units per hour. Production increases by 15%. What is the new rate?",
    "bestAnswer": "A",
    "discriminator": "numerical",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG029_OPT_A",
        "key": "A",
        "text": "230",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG029_OPT_B",
        "key": "B",
        "text": "240",
        "weights": {}
      },
      {
        "id": "UG029_OPT_C",
        "key": "C",
        "text": "215",
        "weights": {
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG029_OPT_D",
        "key": "D",
        "text": "220",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG030",
    "number": 30,
    "track": "UG",
    "level": 3,
    "type": "Logic",
    "question": "While working on an undergraduate project, which statement is strongest?",
    "bestAnswer": "B",
    "discriminator": "critical thinking",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG030_OPT_A",
        "key": "A",
        "text": "Science is better than other fields.",
        "weights": {}
      },
      {
        "id": "UG030_OPT_B",
        "key": "B",
        "text": "Successful people often study science, so science guarantees success.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG030_OPT_C",
        "key": "C",
        "text": "Science is useful, therefore everyone should study it.",
        "weights": {
          "AR": 5,
          "LR": 5
        }
      },
      {
        "id": "UG030_OPT_D",
        "key": "D",
        "text": "A field should be selected using interests, abilities, eligibility and goals.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG031",
    "number": 31,
    "track": "UG",
    "level": 3,
    "type": "Logic",
    "question": "While working on an undergraduate project, if all A are B and all B are C, which statement must be true?",
    "bestAnswer": "C",
    "discriminator": "logic",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG031_OPT_A",
        "key": "A",
        "text": "All A are C.",
        "weights": {}
      },
      {
        "id": "UG031_OPT_B",
        "key": "B",
        "text": "Some C are not B.",
        "weights": {
          "LR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG031_OPT_C",
        "key": "C",
        "text": "No A are C.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG031_OPT_D",
        "key": "D",
        "text": "All C are A.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG032",
    "number": 32,
    "track": "UG",
    "level": 3,
    "type": "Quantitative",
    "question": "While working on an undergraduate project, a class has 40 students. 60% pass a test. How many students pass?",
    "bestAnswer": "D",
    "discriminator": "numerical",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG032_OPT_A",
        "key": "A",
        "text": "22",
        "weights": {}
      },
      {
        "id": "UG032_OPT_B",
        "key": "B",
        "text": "24",
        "weights": {}
      },
      {
        "id": "UG032_OPT_C",
        "key": "C",
        "text": "26",
        "weights": {
          "QR": 5
        }
      },
      {
        "id": "UG032_OPT_D",
        "key": "D",
        "text": "20",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG033",
    "number": 33,
    "track": "UG",
    "level": 3,
    "type": "Pattern",
    "question": "While working on an undergraduate project, a process takes 10 minutes for the first task and 12 for the second. If the increase continues by 2 minutes, how long does the fifth task take?",
    "bestAnswer": "A",
    "discriminator": "pattern",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG033_OPT_A",
        "key": "A",
        "text": "22",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG033_OPT_B",
        "key": "B",
        "text": "16",
        "weights": {
          "LR": 5,
          "QR": 5
        }
      },
      {
        "id": "UG033_OPT_C",
        "key": "C",
        "text": "18",
        "weights": {}
      },
      {
        "id": "UG033_OPT_D",
        "key": "D",
        "text": "20",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG034",
    "number": 34,
    "track": "UG",
    "level": 3,
    "type": "Evidence",
    "question": "While working on an undergraduate project, a social media post claims a new study proves a product works. What should you check first?",
    "bestAnswer": "B",
    "discriminator": "media literacy",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG034_OPT_A",
        "key": "A",
        "text": "How many likes the post has.",
        "weights": {}
      },
      {
        "id": "UG034_OPT_B",
        "key": "B",
        "text": "The original study and its methods.",
        "weights": {
          "RE": 5,
          "SC": 5,
          "AR": 5
        }
      },
      {
        "id": "UG034_OPT_C",
        "key": "C",
        "text": "Whether your friends agree.",
        "weights": {}
      },
      {
        "id": "UG034_OPT_D",
        "key": "D",
        "text": "The product's advertising.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG035",
    "number": 35,
    "track": "UG",
    "level": 3,
    "type": "Problem solving",
    "question": "While working on an undergraduate project, a project is behind schedule because three tasks depend on one unfinished task. What is the best first step?",
    "bestAnswer": "C",
    "discriminator": "project",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG035_OPT_A",
        "key": "A",
        "text": "Identify the dependency and unblock the critical task.",
        "weights": {}
      },
      {
        "id": "UG035_OPT_B",
        "key": "B",
        "text": "Ignore the dependency.",
        "weights": {
          "PS": 5,
          "LE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG035_OPT_C",
        "key": "C",
        "text": "Restart the whole project.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG035_OPT_D",
        "key": "D",
        "text": "Add people to every task.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG036",
    "number": 36,
    "track": "UG",
    "level": 3,
    "type": "Quantitative",
    "question": "While working on an undergraduate project, a budget of \u20b950,000 is divided equally among five activities. How much is allocated to each?",
    "bestAnswer": "D",
    "discriminator": "numerical",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG036_OPT_A",
        "key": "A",
        "text": "\u20b98,000",
        "weights": {}
      },
      {
        "id": "UG036_OPT_B",
        "key": "B",
        "text": "\u20b910,000",
        "weights": {}
      },
      {
        "id": "UG036_OPT_C",
        "key": "C",
        "text": "\u20b912,000",
        "weights": {
          "QR": 5
        }
      },
      {
        "id": "UG036_OPT_D",
        "key": "D",
        "text": "\u20b95,000",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG037",
    "number": 37,
    "track": "UG",
    "level": 3,
    "type": "Logic",
    "question": "While working on an undergraduate project, if a rule says every approved application must have complete documents, which conclusion follows?",
    "bestAnswer": "A",
    "discriminator": "logic",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG037_OPT_A",
        "key": "A",
        "text": "Complete documents guarantee approval.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG037_OPT_B",
        "key": "B",
        "text": "Every application with complete documents is approved.",
        "weights": {
          "LR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG037_OPT_C",
        "key": "C",
        "text": "An approved application has complete documents.",
        "weights": {}
      },
      {
        "id": "UG037_OPT_D",
        "key": "D",
        "text": "No incomplete application exists.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG038",
    "number": 38,
    "track": "UG",
    "level": 3,
    "type": "Research",
    "question": "While working on an undergraduate project, you want to know whether students prefer online or classroom learning. Which method gives broader evidence?",
    "bestAnswer": "B",
    "discriminator": "research",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG038_OPT_A",
        "key": "A",
        "text": "Ask one friend.",
        "weights": {}
      },
      {
        "id": "UG038_OPT_B",
        "key": "B",
        "text": "Ask a randomly selected sample of students.",
        "weights": {
          "RE": 5,
          "SC": 5,
          "AR": 5
        }
      },
      {
        "id": "UG038_OPT_C",
        "key": "C",
        "text": "Ask only students who like online learning.",
        "weights": {}
      },
      {
        "id": "UG038_OPT_D",
        "key": "D",
        "text": "Ask only teachers.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG039",
    "number": 39,
    "track": "UG",
    "level": 3,
    "type": "Business",
    "question": "While working on an undergraduate project, a shop's sales rise but profit falls. Which information is most useful?",
    "bestAnswer": "C",
    "discriminator": "business",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "UG039_OPT_A",
        "key": "A",
        "text": "Revenue and costs.",
        "weights": {}
      },
      {
        "id": "UG039_OPT_B",
        "key": "B",
        "text": "Number of social media followers only.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG039_OPT_C",
        "key": "C",
        "text": "Store music.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG039_OPT_D",
        "key": "D",
        "text": "Wall colour.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG040",
    "number": 40,
    "track": "UG",
    "level": 4,
    "type": "Scientific",
    "question": "In an advanced undergraduate project, an experiment produces a different result from the prediction. What is the best response?",
    "bestAnswer": "D",
    "discriminator": "science",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG040_OPT_A",
        "key": "A",
        "text": "Ignore the result.",
        "weights": {}
      },
      {
        "id": "UG040_OPT_B",
        "key": "B",
        "text": "Investigate possible causes and repeat the test.",
        "weights": {}
      },
      {
        "id": "UG040_OPT_C",
        "key": "C",
        "text": "Assume the experiment is useless.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "PS": 5
        }
      },
      {
        "id": "UG040_OPT_D",
        "key": "D",
        "text": "Change the data.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG041",
    "number": 41,
    "track": "UG",
    "level": 4,
    "type": "Communication",
    "question": "In an advanced undergraduate project, which explanation is strongest for a technical idea?",
    "bestAnswer": "A",
    "discriminator": "communication",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG041_OPT_A",
        "key": "A",
        "text": "Avoid explaining assumptions.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG041_OPT_B",
        "key": "B",
        "text": "Use as much jargon as possible.",
        "weights": {
          "CO": 5,
          "AR": 5
        }
      },
      {
        "id": "UG041_OPT_C",
        "key": "C",
        "text": "Explain the idea using the audience's level and relevant examples.",
        "weights": {}
      },
      {
        "id": "UG041_OPT_D",
        "key": "D",
        "text": "Give only the final answer.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG042",
    "number": 42,
    "track": "UG",
    "level": 4,
    "type": "Logic",
    "question": "In an advanced undergraduate project, four tasks must be completed in order: A before B, B before C, and C before D. Which order is valid?",
    "bestAnswer": "B",
    "discriminator": "logic",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG042_OPT_A",
        "key": "A",
        "text": "D-C-B-A",
        "weights": {}
      },
      {
        "id": "UG042_OPT_B",
        "key": "B",
        "text": "B-A-C-D",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG042_OPT_C",
        "key": "C",
        "text": "A-C-B-D",
        "weights": {
          "LR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG042_OPT_D",
        "key": "D",
        "text": "A-B-C-D",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG043",
    "number": 43,
    "track": "UG",
    "level": 4,
    "type": "Problem solving",
    "question": "In an advanced undergraduate project, a device stops working intermittently. What is the strongest first step?",
    "bestAnswer": "C",
    "discriminator": "technology",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG043_OPT_A",
        "key": "A",
        "text": "Observe when the failure occurs and identify patterns.",
        "weights": {}
      },
      {
        "id": "UG043_OPT_B",
        "key": "B",
        "text": "Assume the newest component is faulty.",
        "weights": {
          "PS": 5,
          "TC": 5,
          "AR": 5
        }
      },
      {
        "id": "UG043_OPT_C",
        "key": "C",
        "text": "Stop using the device permanently.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG043_OPT_D",
        "key": "D",
        "text": "Replace every component.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG044",
    "number": 44,
    "track": "UG",
    "level": 4,
    "type": "Quantitative",
    "question": "In an advanced undergraduate project, a value rises from 80 to 100. What is the percentage increase?",
    "bestAnswer": "D",
    "discriminator": "numerical",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG044_OPT_A",
        "key": "A",
        "text": "30%",
        "weights": {}
      },
      {
        "id": "UG044_OPT_B",
        "key": "B",
        "text": "40%",
        "weights": {
          "QR": 5
        }
      },
      {
        "id": "UG044_OPT_C",
        "key": "C",
        "text": "20%",
        "weights": {}
      },
      {
        "id": "UG044_OPT_D",
        "key": "D",
        "text": "25%",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG045",
    "number": 45,
    "track": "UG",
    "level": 4,
    "type": "Research",
    "question": "In an advanced undergraduate project, you find two websites with different claims. Which source deserves more weight?",
    "bestAnswer": "A",
    "discriminator": "research",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG045_OPT_A",
        "key": "A",
        "text": "The one with more advertisements.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG045_OPT_B",
        "key": "B",
        "text": "The one with the more attractive design.",
        "weights": {
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG045_OPT_C",
        "key": "C",
        "text": "The one with identifiable evidence, methods and credible sources.",
        "weights": {}
      },
      {
        "id": "UG045_OPT_D",
        "key": "D",
        "text": "The one appearing first in search results.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG046",
    "number": 46,
    "track": "UG",
    "level": 4,
    "type": "Management",
    "question": "In an advanced undergraduate project, a team has four tasks and two people. What is the best first step?",
    "bestAnswer": "B",
    "discriminator": "management",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG046_OPT_A",
        "key": "A",
        "text": "Give every task to both people.",
        "weights": {}
      },
      {
        "id": "UG046_OPT_B",
        "key": "B",
        "text": "Prioritize tasks based on urgency and impact.",
        "weights": {
          "LE": 5,
          "PS": 5,
          "AR": 5
        }
      },
      {
        "id": "UG046_OPT_C",
        "key": "C",
        "text": "Choose tasks randomly.",
        "weights": {}
      },
      {
        "id": "UG046_OPT_D",
        "key": "D",
        "text": "Delay all tasks.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG047",
    "number": 47,
    "track": "UG",
    "level": 4,
    "type": "Creativity",
    "question": "In an advanced undergraduate project, a product is difficult for users to understand. What is the best response?",
    "bestAnswer": "C",
    "discriminator": "design",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG047_OPT_A",
        "key": "A",
        "text": "Study where users struggle and redesign the experience.",
        "weights": {}
      },
      {
        "id": "UG047_OPT_B",
        "key": "B",
        "text": "Remove all features.",
        "weights": {
          "CR": 5,
          "CO": 5,
          "SO": 5,
          "PS": 5
        }
      },
      {
        "id": "UG047_OPT_C",
        "key": "C",
        "text": "Keep it unchanged.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG047_OPT_D",
        "key": "D",
        "text": "Tell users to try harder.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG048",
    "number": 48,
    "track": "UG",
    "level": 4,
    "type": "Economics",
    "question": "In an advanced undergraduate project, demand for a product rises while supply stays constant. What pressure is likely to occur?",
    "bestAnswer": "D",
    "discriminator": "economics",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG048_OPT_A",
        "key": "A",
        "text": "No possible change.",
        "weights": {}
      },
      {
        "id": "UG048_OPT_B",
        "key": "B",
        "text": "Supply becomes zero.",
        "weights": {
          "QR": 5,
          "BU": 5,
          "AR": 5
        }
      },
      {
        "id": "UG048_OPT_C",
        "key": "C",
        "text": "Downward pressure on price.",
        "weights": {}
      },
      {
        "id": "UG048_OPT_D",
        "key": "D",
        "text": "Upward pressure on price.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG049",
    "number": 49,
    "track": "UG",
    "level": 4,
    "type": "Social science",
    "question": "In an advanced undergraduate project, a survey shows one group reports higher stress. What should you conclude?",
    "bestAnswer": "A",
    "discriminator": "social science",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG049_OPT_A",
        "key": "A",
        "text": "The other group has no stress.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG049_OPT_B",
        "key": "B",
        "text": "The group definitely has the cause of stress identified.",
        "weights": {
          "SO": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG049_OPT_C",
        "key": "C",
        "text": "The result is a finding that needs further investigation.",
        "weights": {}
      },
      {
        "id": "UG049_OPT_D",
        "key": "D",
        "text": "The survey proves why stress occurs.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG050",
    "number": 50,
    "track": "UG",
    "level": 4,
    "type": "Law",
    "question": "In an advanced undergraduate project, two people give conflicting accounts of an event. What is the strongest next step?",
    "bestAnswer": "B",
    "discriminator": "law",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG050_OPT_A",
        "key": "A",
        "text": "Choose the more confident speaker.",
        "weights": {}
      },
      {
        "id": "UG050_OPT_B",
        "key": "B",
        "text": "Examine evidence and consistency of the accounts.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "CO": 5
        }
      },
      {
        "id": "UG050_OPT_C",
        "key": "C",
        "text": "Choose the older person.",
        "weights": {}
      },
      {
        "id": "UG050_OPT_D",
        "key": "D",
        "text": "Ignore both accounts.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG051",
    "number": 51,
    "track": "UG",
    "level": 4,
    "type": "Hospitality",
    "question": "In an advanced undergraduate project, a hotel receives repeated complaints about slow check-in. What should management do first?",
    "bestAnswer": "C",
    "discriminator": "hospitality",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG051_OPT_A",
        "key": "A",
        "text": "Map the check-in process and identify the bottleneck.",
        "weights": {}
      },
      {
        "id": "UG051_OPT_B",
        "key": "B",
        "text": "Reduce room prices.",
        "weights": {
          "PS": 5,
          "LE": 5,
          "CO": 5
        }
      },
      {
        "id": "UG051_OPT_C",
        "key": "C",
        "text": "Change the hotel logo.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG051_OPT_D",
        "key": "D",
        "text": "Ignore complaints.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG052",
    "number": 52,
    "track": "UG",
    "level": 4,
    "type": "Design",
    "question": "In an advanced undergraduate project, a product looks attractive but users struggle to operate it. What should guide the redesign?",
    "bestAnswer": "D",
    "discriminator": "design",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "UG052_OPT_A",
        "key": "A",
        "text": "Only the colour palette.",
        "weights": {}
      },
      {
        "id": "UG052_OPT_B",
        "key": "B",
        "text": "Making it more complicated.",
        "weights": {
          "CR": 5,
          "SO": 5,
          "PS": 5,
          "CO": 5
        }
      },
      {
        "id": "UG052_OPT_C",
        "key": "C",
        "text": "Only the designer's preference.",
        "weights": {}
      },
      {
        "id": "UG052_OPT_D",
        "key": "D",
        "text": "User needs, observed problems and usability evidence.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG053",
    "number": 53,
    "track": "UG",
    "level": 5,
    "type": "Media",
    "question": "When making an advanced undergraduate project decision, a headline is emotionally strong but the article provides little evidence. What should you do?",
    "bestAnswer": "A",
    "discriminator": "media",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG053_OPT_A",
        "key": "A",
        "text": "Ignore every article.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG053_OPT_B",
        "key": "B",
        "text": "Share it immediately.",
        "weights": {
          "CO": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG053_OPT_C",
        "key": "C",
        "text": "Check the underlying evidence and original sources.",
        "weights": {}
      },
      {
        "id": "UG053_OPT_D",
        "key": "D",
        "text": "Assume it is true because it is popular.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG054",
    "number": 54,
    "track": "UG",
    "level": 5,
    "type": "Finance",
    "question": "When making an advanced undergraduate project decision, an investment offers high potential return with high risk. What should be assessed before deciding?",
    "bestAnswer": "B",
    "discriminator": "finance",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG054_OPT_A",
        "key": "A",
        "text": "Only the potential return.",
        "weights": {}
      },
      {
        "id": "UG054_OPT_B",
        "key": "B",
        "text": "Risk, expected return, time horizon and ability to absorb losses.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "UG054_OPT_C",
        "key": "C",
        "text": "Only what friends choose.",
        "weights": {}
      },
      {
        "id": "UG054_OPT_D",
        "key": "D",
        "text": "Only the advertisement.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG055",
    "number": 55,
    "track": "UG",
    "level": 5,
    "type": "Education",
    "question": "When making an advanced undergraduate project decision, students perform poorly on a test. What should a teacher investigate before changing the entire course?",
    "bestAnswer": "C",
    "discriminator": "education",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG055_OPT_A",
        "key": "A",
        "text": "Review test difficulty and objectives.",
        "weights": {}
      },
      {
        "id": "UG055_OPT_B",
        "key": "B",
        "text": "Review classroom decoration.",
        "weights": {
          "RE": 5,
          "SC": 5,
          "CO": 5,
          "AR": 5
        }
      },
      {
        "id": "UG055_OPT_C",
        "key": "C",
        "text": "Review the textbook cover.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG055_OPT_D",
        "key": "D",
        "text": "Review student attendance.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG056",
    "number": 56,
    "track": "UG",
    "level": 5,
    "type": "Scenario",
    "question": "When making an advanced undergraduate project decision, a university notices students with lower attendance also tend to have lower marks. What is the strongest conclusion?",
    "bestAnswer": "D",
    "discriminator": "causal reasoning",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG056_OPT_A",
        "key": "A",
        "text": "Low marks cause low attendance.",
        "weights": {}
      },
      {
        "id": "UG056_OPT_B",
        "key": "B",
        "text": "Attendance and marks are associated, but other factors need investigation.",
        "weights": {}
      },
      {
        "id": "UG056_OPT_C",
        "key": "C",
        "text": "Attendance has no relationship with marks.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "UG056_OPT_D",
        "key": "D",
        "text": "Low attendance causes low marks.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG057",
    "number": 57,
    "track": "UG",
    "level": 5,
    "type": "Decision",
    "question": "When making an advanced undergraduate project decision, you must choose between three solutions: A is cheap but unreliable, B is expensive but reliable, C has moderate cost and reliability. What should you do first?",
    "bestAnswer": "A",
    "discriminator": "decision",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG057_OPT_A",
        "key": "A",
        "text": "Identify priorities and constraints.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG057_OPT_B",
        "key": "B",
        "text": "Select the cheap option.",
        "weights": {}
      },
      {
        "id": "UG057_OPT_C",
        "key": "C",
        "text": "Select the reliable option.",
        "weights": {
          "PS": 5,
          "AR": 5,
          "LE": 5
        }
      },
      {
        "id": "UG057_OPT_D",
        "key": "D",
        "text": "Select the moderate option.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG058",
    "number": 58,
    "track": "UG",
    "level": 5,
    "type": "Research",
    "question": "When making an advanced undergraduate project decision, you want to understand why customers stop using an application. Which approach is strongest?",
    "bestAnswer": "B",
    "discriminator": "business research",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG058_OPT_A",
        "key": "A",
        "text": "Copy a competitor.",
        "weights": {}
      },
      {
        "id": "UG058_OPT_B",
        "key": "B",
        "text": "Look only at revenue.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG058_OPT_C",
        "key": "C",
        "text": "Interview one customer.",
        "weights": {
          "RE": 5,
          "AR": 5,
          "BU": 5,
          "CO": 5
        }
      },
      {
        "id": "UG058_OPT_D",
        "key": "D",
        "text": "Combine usage data with customer feedback.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG059",
    "number": 59,
    "track": "UG",
    "level": 5,
    "type": "Scientific",
    "question": "When making an advanced undergraduate project decision, an experiment gives an unexpected result. What should you do?",
    "bestAnswer": "C",
    "discriminator": "science",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG059_OPT_A",
        "key": "A",
        "text": "Change the result.",
        "weights": {}
      },
      {
        "id": "UG059_OPT_B",
        "key": "B",
        "text": "Ignore the result.",
        "weights": {}
      },
      {
        "id": "UG059_OPT_C",
        "key": "C",
        "text": "Investigate causes and repeat the test.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG059_OPT_D",
        "key": "D",
        "text": "Publish the result immediately.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG060",
    "number": 60,
    "track": "UG",
    "level": 5,
    "type": "Technology",
    "question": "When making an advanced undergraduate project decision, you want to automate a repetitive office task. What should you define before choosing software?",
    "bestAnswer": "D",
    "discriminator": "technology",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG060_OPT_A",
        "key": "A",
        "text": "Review the logo.",
        "weights": {}
      },
      {
        "id": "UG060_OPT_B",
        "key": "B",
        "text": "Review social media followers.",
        "weights": {
          "TC": 5,
          "AR": 5,
          "PS": 5
        }
      },
      {
        "id": "UG060_OPT_C",
        "key": "C",
        "text": "Review the software brand.",
        "weights": {}
      },
      {
        "id": "UG060_OPT_D",
        "key": "D",
        "text": "Define the process and success criteria.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG061",
    "number": 61,
    "track": "UG",
    "level": 5,
    "type": "Business",
    "question": "When making an advanced undergraduate project decision, a small business has many visitors but few purchases. What should be investigated first?",
    "bestAnswer": "A",
    "discriminator": "business",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG061_OPT_A",
        "key": "A",
        "text": "Company colour.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG061_OPT_B",
        "key": "B",
        "text": "Office furniture.",
        "weights": {
          "BU": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "UG061_OPT_C",
        "key": "C",
        "text": "Where customers leave the purchase process and why.",
        "weights": {}
      },
      {
        "id": "UG061_OPT_D",
        "key": "D",
        "text": "Employee uniforms.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG062",
    "number": 62,
    "track": "UG",
    "level": 5,
    "type": "Engineering",
    "question": "When making an advanced undergraduate project decision, a machine fails more often after operating for several hours. What is a useful first investigation?",
    "bestAnswer": "B",
    "discriminator": "engineering",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG062_OPT_A",
        "key": "A",
        "text": "Replace everything.",
        "weights": {}
      },
      {
        "id": "UG062_OPT_B",
        "key": "B",
        "text": "Look for temperature, load and time-related patterns.",
        "weights": {
          "SC": 5,
          "AR": 5,
          "PS": 5,
          "TC": 5
        }
      },
      {
        "id": "UG062_OPT_C",
        "key": "C",
        "text": "Ignore the timing.",
        "weights": {}
      },
      {
        "id": "UG062_OPT_D",
        "key": "D",
        "text": "Change the machine colour.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG063",
    "number": 63,
    "track": "UG",
    "level": 5,
    "type": "Science",
    "question": "When making an advanced undergraduate project decision, a researcher wants to test whether light affects plant growth. Which design is strongest?",
    "bestAnswer": "C",
    "discriminator": "science",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG063_OPT_A",
        "key": "A",
        "text": "Keep relevant conditions controlled and vary light systematically.",
        "weights": {}
      },
      {
        "id": "UG063_OPT_B",
        "key": "B",
        "text": "Use one plant and one observation.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG063_OPT_C",
        "key": "C",
        "text": "Choose the result expected in advance.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG063_OPT_D",
        "key": "D",
        "text": "Change light and water at the same time.",
        "weights": {}
      }
    ]
  },
  {
    "id": "UG064",
    "number": 64,
    "track": "UG",
    "level": 5,
    "type": "Data",
    "question": "When making an advanced undergraduate project decision, a dataset contains missing values. What should happen before analysis?",
    "bestAnswer": "D",
    "discriminator": "data",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG064_OPT_A",
        "key": "A",
        "text": "Replace missing values with zero.",
        "weights": {}
      },
      {
        "id": "UG064_OPT_B",
        "key": "B",
        "text": "Ignore missing values.",
        "weights": {
          "QR": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "UG064_OPT_C",
        "key": "C",
        "text": "Delete incomplete rows.",
        "weights": {}
      },
      {
        "id": "UG064_OPT_D",
        "key": "D",
        "text": "Investigate why values are missing.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "UG065",
    "number": 65,
    "track": "UG",
    "level": 5,
    "type": "Psychology",
    "question": "When making an advanced undergraduate project decision, a survey asks students whether they are happy with university life. What is a useful improvement?",
    "bestAnswer": "A",
    "discriminator": "psychology",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "UG065_OPT_A",
        "key": "A",
        "text": "Ask only close friends.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "UG065_OPT_B",
        "key": "B",
        "text": "Ask only high-performing students.",
        "weights": {
          "SO": 5,
          "RE": 5,
          "CO": 5
        }
      },
      {
        "id": "UG065_OPT_C",
        "key": "C",
        "text": "Use clear, neutral questions and a representative sample.",
        "weights": {}
      },
      {
        "id": "UG065_OPT_D",
        "key": "D",
        "text": "Tell students which answer is expected.",
        "weights": {}
      }
    ]
  }
]

export const PG_STAGE1_QUESTIONS: Stage1Question[] = [
  {
    "id": "PG001",
    "number": 1,
    "track": "PG",
    "level": 1,
    "type": "Management",
    "question": "In postgraduate study, two team members disagree strongly about priorities. What should the team leader do first?",
    "bestAnswer": "B",
    "discriminator": "management",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG001_OPT_A",
        "key": "A",
        "text": "Define the research problem first",
        "weights": {}
      },
      {
        "id": "PG001_OPT_B",
        "key": "B",
        "text": "Map stakeholder requirements first",
        "weights": {
          "LE": 5,
          "CO": 5,
          "AR": 5
        }
      },
      {
        "id": "PG001_OPT_C",
        "key": "C",
        "text": "Review the relevant evidence first",
        "weights": {}
      },
      {
        "id": "PG001_OPT_D",
        "key": "D",
        "text": "Draft several solution paths first",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG002",
    "number": 2,
    "track": "PG",
    "level": 1,
    "type": "Communication",
    "question": "In postgraduate study, you must explain a complex technical result to nontechnical decision-makers. What should you emphasize?",
    "bestAnswer": "C",
    "discriminator": "communication",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG002_OPT_A",
        "key": "A",
        "text": "Coordinate the project workflow",
        "weights": {}
      },
      {
        "id": "PG002_OPT_B",
        "key": "B",
        "text": "Compare competing explanations",
        "weights": {
          "CO": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG002_OPT_C",
        "key": "C",
        "text": "Design an original intervention",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG002_OPT_D",
        "key": "D",
        "text": "Build a quantitative analysis",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG003",
    "number": 3,
    "track": "PG",
    "level": 1,
    "type": "Design",
    "question": "In postgraduate study, users repeatedly fail to find a key button in an application. What is the strongest response?",
    "bestAnswer": "D",
    "discriminator": "design",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG003_OPT_A",
        "key": "A",
        "text": "Strengthen the evidence base",
        "weights": {}
      },
      {
        "id": "PG003_OPT_B",
        "key": "B",
        "text": "Develop alternative scenarios",
        "weights": {
          "CR": 5,
          "SO": 5,
          "PS": 5,
          "TC": 5
        }
      },
      {
        "id": "PG003_OPT_C",
        "key": "C",
        "text": "State assumptions explicitly",
        "weights": {}
      },
      {
        "id": "PG003_OPT_D",
        "key": "D",
        "text": "Collect stakeholder perspectives",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG004",
    "number": 4,
    "track": "PG",
    "level": 1,
    "type": "Economics",
    "question": "In postgraduate study, a country experiences rising prices and weak economic growth. Which information helps analyse the situation?",
    "bestAnswer": "A",
    "discriminator": "economics",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG004_OPT_A",
        "key": "A",
        "text": "Design a practical intervention",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG004_OPT_B",
        "key": "B",
        "text": "Formulate a testable question",
        "weights": {
          "QR": 5,
          "BU": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG004_OPT_C",
        "key": "C",
        "text": "Compare competing theoretical views",
        "weights": {}
      },
      {
        "id": "PG004_OPT_D",
        "key": "D",
        "text": "Build an analytical model",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG005",
    "number": 5,
    "track": "PG",
    "level": 1,
    "type": "Law",
    "question": "In postgraduate study, a contract clause is disputed. What should be examined first?",
    "bestAnswer": "B",
    "discriminator": "law",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG005_OPT_A",
        "key": "A",
        "text": "Produce a defensible conclusion",
        "weights": {}
      },
      {
        "id": "PG005_OPT_B",
        "key": "B",
        "text": "Deliver a useful intervention",
        "weights": {
          "AR": 5,
          "RE": 5,
          "CO": 5
        }
      },
      {
        "id": "PG005_OPT_C",
        "key": "C",
        "text": "Produce a reproducible finding",
        "weights": {}
      },
      {
        "id": "PG005_OPT_D",
        "key": "D",
        "text": "Develop a scalable solution",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG006",
    "number": 6,
    "track": "PG",
    "level": 1,
    "type": "Media",
    "question": "In postgraduate study, a viral video claims to show an event but provides no date or location. What should you do?",
    "bestAnswer": "C",
    "discriminator": "media",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG006_OPT_A",
        "key": "A",
        "text": "Conduct structured field interviews",
        "weights": {}
      },
      {
        "id": "PG006_OPT_B",
        "key": "B",
        "text": "Run controlled tests",
        "weights": {
          "CO": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG006_OPT_C",
        "key": "C",
        "text": "Develop a new conceptual framework",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG006_OPT_D",
        "key": "D",
        "text": "Analyse primary evidence",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG007",
    "number": 7,
    "track": "PG",
    "level": 1,
    "type": "Hospitality",
    "question": "In postgraduate study, guests complain that rooms are ready late despite enough staff. What should management examine?",
    "bestAnswer": "D",
    "discriminator": "hospitality",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG007_OPT_A",
        "key": "A",
        "text": "Review the supporting evidence",
        "weights": {}
      },
      {
        "id": "PG007_OPT_B",
        "key": "B",
        "text": "Test a revised interpretation",
        "weights": {
          "PS": 5,
          "LE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG007_OPT_C",
        "key": "C",
        "text": "Recheck the reasoning",
        "weights": {}
      },
      {
        "id": "PG007_OPT_D",
        "key": "D",
        "text": "Clarify the disagreement",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG008",
    "number": 8,
    "track": "PG",
    "level": 1,
    "type": "Commerce",
    "question": "In postgraduate study, a retailer sells more units but earns less profit. What should be analysed?",
    "bestAnswer": "A",
    "discriminator": "commerce",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG008_OPT_A",
        "key": "A",
        "text": "Develop a novel approach",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG008_OPT_B",
        "key": "B",
        "text": "Evaluate the assumptions",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "PG008_OPT_C",
        "key": "C",
        "text": "Present findings to stakeholders",
        "weights": {}
      },
      {
        "id": "PG008_OPT_D",
        "key": "D",
        "text": "Manage the research workflow",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG009",
    "number": 9,
    "track": "PG",
    "level": 1,
    "type": "Life science",
    "question": "In postgraduate study, a lab result differs from previous trials. What should the team check?",
    "bestAnswer": "B",
    "discriminator": "life science",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG009_OPT_A",
        "key": "A",
        "text": "Explain the observed pattern",
        "weights": {}
      },
      {
        "id": "PG009_OPT_B",
        "key": "B",
        "text": "Interpret stakeholder experience",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG009_OPT_C",
        "key": "C",
        "text": "Test the proposed explanation",
        "weights": {}
      },
      {
        "id": "PG009_OPT_D",
        "key": "D",
        "text": "Redesign the system",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG010",
    "number": 10,
    "track": "PG",
    "level": 1,
    "type": "Mathematics",
    "question": "In postgraduate study, a model gives accurate predictions on known data but poor predictions on new data. What issue should be considered?",
    "bestAnswer": "C",
    "discriminator": "math|data",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG010_OPT_A",
        "key": "A",
        "text": "Work with stakeholders",
        "weights": {}
      },
      {
        "id": "PG010_OPT_B",
        "key": "B",
        "text": "Work in a research setting",
        "weights": {
          "QR": 5,
          "AR": 5,
          "TC": 5
        }
      },
      {
        "id": "PG010_OPT_C",
        "key": "C",
        "text": "Work on innovation projects",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG010_OPT_D",
        "key": "D",
        "text": "Work on analytical problems",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG011",
    "number": 11,
    "track": "PG",
    "level": 1,
    "type": "Programming",
    "question": "In postgraduate study, a program gives the wrong output for one type of input. What is the best first step?",
    "bestAnswer": "D",
    "discriminator": "computing",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG011_OPT_A",
        "key": "A",
        "text": "Improve evidence quality",
        "weights": {}
      },
      {
        "id": "PG011_OPT_B",
        "key": "B",
        "text": "Increase original contribution",
        "weights": {
          "TC": 5,
          "LR": 5,
          "PS": 5
        }
      },
      {
        "id": "PG011_OPT_C",
        "key": "C",
        "text": "Strengthen the reasoning",
        "weights": {}
      },
      {
        "id": "PG011_OPT_D",
        "key": "D",
        "text": "Improve stakeholder communication",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG012",
    "number": 12,
    "track": "PG",
    "level": 1,
    "type": "Environmental science",
    "question": "In postgraduate study, a city wants to reduce air pollution. What should be done before selecting an intervention?",
    "bestAnswer": "A",
    "discriminator": "science",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG012_OPT_A",
        "key": "A",
        "text": "Lead a new initiative",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG012_OPT_B",
        "key": "B",
        "text": "Lead a complex analysis",
        "weights": {
          "SC": 5,
          "RE": 5,
          "PS": 5,
          "AR": 5
        }
      },
      {
        "id": "PG012_OPT_C",
        "key": "C",
        "text": "Lead a stakeholder consultation",
        "weights": {}
      },
      {
        "id": "PG012_OPT_D",
        "key": "D",
        "text": "Lead a research study",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG013",
    "number": 13,
    "track": "PG",
    "level": 1,
    "type": "Entrepreneurship",
    "question": "In postgraduate study, you have an idea for a new service. What should happen before building the full product?",
    "bestAnswer": "B",
    "discriminator": "entrepreneurship",
    "usedAs": "Broad profile discovery",
    "options": [
      {
        "id": "PG013_OPT_A",
        "key": "A",
        "text": "Review peer-reviewed evidence",
        "weights": {}
      },
      {
        "id": "PG013_OPT_B",
        "key": "B",
        "text": "Review stakeholder evidence",
        "weights": {
          "BU": 5,
          "CR": 5,
          "RE": 5,
          "PS": 5
        }
      },
      {
        "id": "PG013_OPT_C",
        "key": "C",
        "text": "Review professional evidence",
        "weights": {}
      },
      {
        "id": "PG013_OPT_D",
        "key": "D",
        "text": "Review conceptual frameworks",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG014",
    "number": 14,
    "track": "PG",
    "level": 2,
    "type": "Social science",
    "question": "In a postgraduate project, a community program appears successful. What evidence would strengthen the conclusion?",
    "bestAnswer": "C",
    "discriminator": "social research",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG014_OPT_A",
        "key": "A",
        "text": "Comparison data and evidence of outcomes over time.",
        "weights": {}
      },
      {
        "id": "PG014_OPT_B",
        "key": "B",
        "text": "A promotional poster.",
        "weights": {
          "SO": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG014_OPT_C",
        "key": "C",
        "text": "One success story.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG014_OPT_D",
        "key": "D",
        "text": "Only positive comments.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG015",
    "number": 15,
    "track": "PG",
    "level": 2,
    "type": "Humanities",
    "question": "In a postgraduate project, two historical sources describe the same event differently. What should a researcher do?",
    "bestAnswer": "D",
    "discriminator": "humanities",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG015_OPT_A",
        "key": "A",
        "text": "Choose the newer source automatically.",
        "weights": {}
      },
      {
        "id": "PG015_OPT_B",
        "key": "B",
        "text": "Average the stories.",
        "weights": {
          "RE": 5,
          "AR": 5,
          "CO": 5
        }
      },
      {
        "id": "PG015_OPT_C",
        "key": "C",
        "text": "Choose the longer source.",
        "weights": {}
      },
      {
        "id": "PG015_OPT_D",
        "key": "D",
        "text": "Compare authorship, context, purpose and supporting evidence.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG016",
    "number": 16,
    "track": "PG",
    "level": 2,
    "type": "Statistics",
    "question": "In a postgraduate project, a survey reports that 90% of respondents prefer option A, but only 10 people answered. What should concern you?",
    "bestAnswer": "A",
    "discriminator": "statistics",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG016_OPT_A",
        "key": "A",
        "text": "The percentage should be changed.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG016_OPT_B",
        "key": "B",
        "text": "The percentage is high.",
        "weights": {
          "QR": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG016_OPT_C",
        "key": "C",
        "text": "The small sample size limits how confidently the result generalizes.",
        "weights": {}
      },
      {
        "id": "PG016_OPT_D",
        "key": "D",
        "text": "The survey must be correct.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG017",
    "number": 17,
    "track": "PG",
    "level": 2,
    "type": "Teamwork",
    "question": "In a postgraduate project, a team completes tasks quickly but keeps making avoidable mistakes. What should the leader improve first?",
    "bestAnswer": "B",
    "discriminator": "management",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG017_OPT_A",
        "key": "A",
        "text": "Increase speed further.",
        "weights": {}
      },
      {
        "id": "PG017_OPT_B",
        "key": "B",
        "text": "Review the process, quality checks and role clarity.",
        "weights": {
          "LE": 5,
          "PS": 5,
          "AR": 5
        }
      },
      {
        "id": "PG017_OPT_C",
        "key": "C",
        "text": "Remove all quality checks.",
        "weights": {}
      },
      {
        "id": "PG017_OPT_D",
        "key": "D",
        "text": "Stop measuring results.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG018",
    "number": 18,
    "track": "PG",
    "level": 2,
    "type": "Communication",
    "question": "In a postgraduate project, two audiences need the same information, but one is technical and one is not. What should you do?",
    "bestAnswer": "C",
    "discriminator": "communication",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG018_OPT_A",
        "key": "A",
        "text": "Adapt terminology and examples while preserving the core evidence.",
        "weights": {}
      },
      {
        "id": "PG018_OPT_B",
        "key": "B",
        "text": "Give the technical audience less information.",
        "weights": {
          "CO": 5,
          "AR": 5
        }
      },
      {
        "id": "PG018_OPT_C",
        "key": "C",
        "text": "Use jargon for everyone.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG018_OPT_D",
        "key": "D",
        "text": "Use identical language for both.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG019",
    "number": 19,
    "track": "PG",
    "level": 2,
    "type": "Creative problem solving",
    "question": "In a postgraduate project, a product category is crowded with similar offerings. What is a strong first creative step?",
    "bestAnswer": "D",
    "discriminator": "creative|business",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG019_OPT_A",
        "key": "A",
        "text": "Lower the price immediately.",
        "weights": {}
      },
      {
        "id": "PG019_OPT_B",
        "key": "B",
        "text": "Change only the logo.",
        "weights": {
          "CR": 5,
          "BU": 5,
          "SO": 5,
          "PS": 5
        }
      },
      {
        "id": "PG019_OPT_C",
        "key": "C",
        "text": "Copy the market leader.",
        "weights": {}
      },
      {
        "id": "PG019_OPT_D",
        "key": "D",
        "text": "Identify unmet user needs and generate alternative concepts.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG020",
    "number": 20,
    "track": "PG",
    "level": 2,
    "type": "Decision",
    "question": "In a postgraduate project, you have limited time and five possible tasks. What is the strongest prioritization method?",
    "bestAnswer": "A",
    "discriminator": "management",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG020_OPT_A",
        "key": "A",
        "text": "Follow the loudest request.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG020_OPT_B",
        "key": "B",
        "text": "Do the easiest tasks first.",
        "weights": {
          "LE": 5,
          "PS": 5,
          "AR": 5
        }
      },
      {
        "id": "PG020_OPT_C",
        "key": "C",
        "text": "Rank urgency, impact and dependencies.",
        "weights": {}
      },
      {
        "id": "PG020_OPT_D",
        "key": "D",
        "text": "Choose tasks randomly.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG021",
    "number": 21,
    "track": "PG",
    "level": 2,
    "type": "Data analysis",
    "question": "In a postgraduate project, you have 50,000 student records and want to predict which students are at risk of dropping out. Which approach is most appropriate?",
    "bestAnswer": "B",
    "discriminator": "AI/Data|Computing",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG021_OPT_A",
        "key": "A",
        "text": "Read every record manually.",
        "weights": {}
      },
      {
        "id": "PG021_OPT_B",
        "key": "B",
        "text": "Use statistical and computational methods to identify patterns.",
        "weights": {
          "QR": 5,
          "AR": 5,
          "TC": 5,
          "RE": 5
        }
      },
      {
        "id": "PG021_OPT_C",
        "key": "C",
        "text": "Ask one student for an opinion.",
        "weights": {}
      },
      {
        "id": "PG021_OPT_D",
        "key": "D",
        "text": "Randomly select 100 records.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG022",
    "number": 22,
    "track": "PG",
    "level": 2,
    "type": "Engineering",
    "question": "In a postgraduate project, a bridge must withstand different loads and environmental conditions. What should be considered first?",
    "bestAnswer": "C",
    "discriminator": "Engineering",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG022_OPT_A",
        "key": "A",
        "text": "Structural requirements and constraints.",
        "weights": {}
      },
      {
        "id": "PG022_OPT_B",
        "key": "B",
        "text": "Construction speed only.",
        "weights": {
          "PS": 5,
          "AR": 5,
          "QR": 5,
          "SC": 5
        }
      },
      {
        "id": "PG022_OPT_C",
        "key": "C",
        "text": "Lowest material cost.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG022_OPT_D",
        "key": "D",
        "text": "Appearance.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG023",
    "number": 23,
    "track": "PG",
    "level": 2,
    "type": "Science",
    "question": "In a postgraduate project, two treatments appear to have different success rates. What matters most before deciding one is better?",
    "bestAnswer": "D",
    "discriminator": "Science|Health",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG023_OPT_A",
        "key": "A",
        "text": "Use treatment popularity.",
        "weights": {}
      },
      {
        "id": "PG023_OPT_B",
        "key": "B",
        "text": "Use treatment cost.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "QR": 5
        }
      },
      {
        "id": "PG023_OPT_C",
        "key": "C",
        "text": "Use researcher count.",
        "weights": {}
      },
      {
        "id": "PG023_OPT_D",
        "key": "D",
        "text": "Review sample size and study design.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG024",
    "number": 24,
    "track": "PG",
    "level": 2,
    "type": "Commerce",
    "question": "In a postgraduate project, a company has many customers but low profits. Which information should you investigate first?",
    "bestAnswer": "A",
    "discriminator": "Commerce|Finance",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG024_OPT_A",
        "key": "A",
        "text": "Revenue and cost structure.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG024_OPT_B",
        "key": "B",
        "text": "Customer age only.",
        "weights": {}
      },
      {
        "id": "PG024_OPT_C",
        "key": "C",
        "text": "Office size.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "PG024_OPT_D",
        "key": "D",
        "text": "Employee count.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG025",
    "number": 25,
    "track": "PG",
    "level": 2,
    "type": "Computing",
    "question": "In a postgraduate project, a software system works on test data but fails with real users. What should the team examine first?",
    "bestAnswer": "B",
    "discriminator": "Computing",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG025_OPT_A",
        "key": "A",
        "text": "Only the programming language.",
        "weights": {}
      },
      {
        "id": "PG025_OPT_B",
        "key": "B",
        "text": "Real-world inputs, assumptions, edge cases and user workflow.",
        "weights": {
          "TC": 5,
          "PS": 5,
          "AR": 5,
          "CO": 5
        }
      },
      {
        "id": "PG025_OPT_C",
        "key": "C",
        "text": "The office furniture.",
        "weights": {}
      },
      {
        "id": "PG025_OPT_D",
        "key": "D",
        "text": "The software logo.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG026",
    "number": 26,
    "track": "PG",
    "level": 2,
    "type": "Data science",
    "question": "In a postgraduate project, a predictive model performs well on training data but poorly on unseen data. What is the strongest concern?",
    "bestAnswer": "C",
    "discriminator": "AI/Data",
    "usedAs": "Foundational reasoning",
    "options": [
      {
        "id": "PG026_OPT_A",
        "key": "A",
        "text": "The model may be overfitting the training data.",
        "weights": {}
      },
      {
        "id": "PG026_OPT_B",
        "key": "B",
        "text": "The dataset must be perfect.",
        "weights": {
          "TC": 5,
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "PG026_OPT_C",
        "key": "C",
        "text": "More training accuracy is always enough.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG026_OPT_D",
        "key": "D",
        "text": "The model is too simple by definition.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG027",
    "number": 27,
    "track": "PG",
    "level": 3,
    "type": "Mathematics",
    "question": "While working on an advanced postgraduate project, two mathematical models fit observed data similarly, but one is much more complex. What should be considered?",
    "bestAnswer": "D",
    "discriminator": "Math|Statistics",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG027_OPT_A",
        "key": "A",
        "text": "Choose randomly.",
        "weights": {}
      },
      {
        "id": "PG027_OPT_B",
        "key": "B",
        "text": "Ignore model assumptions.",
        "weights": {
          "QR": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG027_OPT_C",
        "key": "C",
        "text": "Choose the more complex model automatically.",
        "weights": {}
      },
      {
        "id": "PG027_OPT_D",
        "key": "D",
        "text": "Consider fit, assumptions, complexity and generalization.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG028",
    "number": 28,
    "track": "PG",
    "level": 3,
    "type": "Research",
    "question": "While working on an advanced postgraduate project, a study finds a correlation between two variables. What should you avoid concluding without further evidence?",
    "bestAnswer": "A",
    "discriminator": "Research",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG028_OPT_A",
        "key": "A",
        "text": "One variable definitely causes the other.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG028_OPT_B",
        "key": "B",
        "text": "The finding might depend on the sample.",
        "weights": {}
      },
      {
        "id": "PG028_OPT_C",
        "key": "C",
        "text": "The variables are related in the observed data.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "PG028_OPT_D",
        "key": "D",
        "text": "The relationship deserves investigation.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG029",
    "number": 29,
    "track": "PG",
    "level": 3,
    "type": "Business",
    "question": "While working on an advanced postgraduate project, a new product has high sales but high return rates. What should the company investigate?",
    "bestAnswer": "B",
    "discriminator": "Business",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG029_OPT_A",
        "key": "A",
        "text": "Review sales volume.",
        "weights": {}
      },
      {
        "id": "PG029_OPT_B",
        "key": "B",
        "text": "Review product quality and returns.",
        "weights": {
          "BU": 5,
          "RE": 5,
          "PS": 5,
          "CO": 5
        }
      },
      {
        "id": "PG029_OPT_C",
        "key": "C",
        "text": "Review advertising reach.",
        "weights": {}
      },
      {
        "id": "PG029_OPT_D",
        "key": "D",
        "text": "Review employee count.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG030",
    "number": 30,
    "track": "PG",
    "level": 3,
    "type": "Management",
    "question": "While working on an advanced postgraduate project, a team repeatedly misses deadlines despite having enough staff. What should a manager examine?",
    "bestAnswer": "C",
    "discriminator": "Management",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG030_OPT_A",
        "key": "A",
        "text": "Review estimates and dependencies.",
        "weights": {}
      },
      {
        "id": "PG030_OPT_B",
        "key": "B",
        "text": "Review office size.",
        "weights": {
          "LE": 5,
          "PS": 5,
          "AR": 5
        }
      },
      {
        "id": "PG030_OPT_C",
        "key": "C",
        "text": "Review working hours.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG030_OPT_D",
        "key": "D",
        "text": "Review employee motivation.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG031",
    "number": 31,
    "track": "PG",
    "level": 3,
    "type": "Psychology",
    "question": "While working on an advanced postgraduate project, a survey finds that students who sleep more report better concentration. What is the most cautious interpretation?",
    "bestAnswer": "D",
    "discriminator": "Psychology",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG031_OPT_A",
        "key": "A",
        "text": "Assume sleep causes concentration.",
        "weights": {}
      },
      {
        "id": "PG031_OPT_B",
        "key": "B",
        "text": "Treat the result as meaningless.",
        "weights": {
          "SO": 5,
          "RE": 5,
          "AR": 5,
          "SC": 5
        }
      },
      {
        "id": "PG031_OPT_C",
        "key": "C",
        "text": "Assume concentration causes sleep.",
        "weights": {}
      },
      {
        "id": "PG031_OPT_D",
        "key": "D",
        "text": "Treat the finding as an association.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG032",
    "number": 32,
    "track": "PG",
    "level": 3,
    "type": "Sociology",
    "question": "While working on an advanced postgraduate project, a community survey has a high response rate but excludes people without internet access. What issue matters?",
    "bestAnswer": "A",
    "discriminator": "Social Science",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG032_OPT_A",
        "key": "A",
        "text": "Internet access has no effect.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG032_OPT_B",
        "key": "B",
        "text": "Response rate is enough.",
        "weights": {
          "SO": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG032_OPT_C",
        "key": "C",
        "text": "The sample may underrepresent people without internet access.",
        "weights": {}
      },
      {
        "id": "PG032_OPT_D",
        "key": "D",
        "text": "The survey is automatically unbiased.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG033",
    "number": 33,
    "track": "PG",
    "level": 3,
    "type": "Media",
    "question": "While working on an advanced postgraduate project, a news story cites a study but the headline makes a stronger claim than the study itself. What should you examine?",
    "bestAnswer": "B",
    "discriminator": "Media|Research",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG033_OPT_A",
        "key": "A",
        "text": "Only the headline.",
        "weights": {}
      },
      {
        "id": "PG033_OPT_B",
        "key": "B",
        "text": "The original study, methods, sample and actual findings.",
        "weights": {
          "CO": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG033_OPT_C",
        "key": "C",
        "text": "Only the comments.",
        "weights": {}
      },
      {
        "id": "PG033_OPT_D",
        "key": "D",
        "text": "Only the publication date.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG034",
    "number": 34,
    "track": "PG",
    "level": 3,
    "type": "Law",
    "question": "While working on an advanced postgraduate project, two legal interpretations are possible under the wording of a clause. What should guide the analysis?",
    "bestAnswer": "C",
    "discriminator": "Law",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG034_OPT_A",
        "key": "A",
        "text": "Review text, context and applicable rules.",
        "weights": {}
      },
      {
        "id": "PG034_OPT_B",
        "key": "B",
        "text": "Follow online popularity.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "CO": 5
        }
      },
      {
        "id": "PG034_OPT_C",
        "key": "C",
        "text": "Choose the simpler interpretation.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG034_OPT_D",
        "key": "D",
        "text": "Use personal preference.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG035",
    "number": 35,
    "track": "PG",
    "level": 3,
    "type": "Design",
    "question": "While working on an advanced postgraduate project, a product is visually attractive but users abandon the process halfway through. What should be analysed?",
    "bestAnswer": "D",
    "discriminator": "Design",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG035_OPT_A",
        "key": "A",
        "text": "Only advertising.",
        "weights": {}
      },
      {
        "id": "PG035_OPT_B",
        "key": "B",
        "text": "Only the logo.",
        "weights": {
          "CR": 5,
          "SO": 5,
          "PS": 5,
          "CO": 5
        }
      },
      {
        "id": "PG035_OPT_C",
        "key": "C",
        "text": "Only colour choices.",
        "weights": {}
      },
      {
        "id": "PG035_OPT_D",
        "key": "D",
        "text": "User journey, friction points, task completion and feedback.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG036",
    "number": 36,
    "track": "PG",
    "level": 3,
    "type": "Hospitality",
    "question": "While working on an advanced postgraduate project, a hotel has high occupancy but low guest satisfaction. What should management examine?",
    "bestAnswer": "A",
    "discriminator": "Hospitality",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG036_OPT_A",
        "key": "A",
        "text": "Examine the hotel name.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG036_OPT_B",
        "key": "B",
        "text": "Review occupancy only.",
        "weights": {
          "LE": 5,
          "SO": 5,
          "PS": 5,
          "CO": 5
        }
      },
      {
        "id": "PG036_OPT_C",
        "key": "C",
        "text": "Analyse service flow and guest feedback.",
        "weights": {}
      },
      {
        "id": "PG036_OPT_D",
        "key": "D",
        "text": "Review room prices only.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG037",
    "number": 37,
    "track": "PG",
    "level": 3,
    "type": "Life science",
    "question": "While working on an advanced postgraduate project, a biological experiment produces different results across laboratories. What should researchers compare?",
    "bestAnswer": "B",
    "discriminator": "Life Science",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG037_OPT_A",
        "key": "A",
        "text": "Only the final averages.",
        "weights": {}
      },
      {
        "id": "PG037_OPT_B",
        "key": "B",
        "text": "Protocols, samples, equipment, controls and environmental conditions.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG037_OPT_C",
        "key": "C",
        "text": "Only researcher names.",
        "weights": {}
      },
      {
        "id": "PG037_OPT_D",
        "key": "D",
        "text": "Only publication dates.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG038",
    "number": 38,
    "track": "PG",
    "level": 3,
    "type": "Natural science",
    "question": "While working on an advanced postgraduate project, a measured value differs from the theoretical prediction. What is the best analytical response?",
    "bestAnswer": "C",
    "discriminator": "Natural Science",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG038_OPT_A",
        "key": "A",
        "text": "Check uncertainty and assumptions.",
        "weights": {}
      },
      {
        "id": "PG038_OPT_B",
        "key": "B",
        "text": "Discard the theory immediately.",
        "weights": {
          "SC": 5,
          "AR": 5,
          "RE": 5,
          "QR": 5
        }
      },
      {
        "id": "PG038_OPT_C",
        "key": "C",
        "text": "Ignore the measurement.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG038_OPT_D",
        "key": "D",
        "text": "Force the data to fit.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG039",
    "number": 39,
    "track": "PG",
    "level": 3,
    "type": "Economics",
    "question": "While working on an advanced postgraduate project, a policy increases employment in one sector but raises costs elsewhere. How should it be evaluated?",
    "bestAnswer": "D",
    "discriminator": "Economics",
    "usedAs": "Application and pathway narrowing",
    "options": [
      {
        "id": "PG039_OPT_A",
        "key": "A",
        "text": "Use public opinion only.",
        "weights": {}
      },
      {
        "id": "PG039_OPT_B",
        "key": "B",
        "text": "Use one month of data.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG039_OPT_C",
        "key": "C",
        "text": "Use employment numbers only.",
        "weights": {}
      },
      {
        "id": "PG039_OPT_D",
        "key": "D",
        "text": "Compare benefits, costs and side effects.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG040",
    "number": 40,
    "track": "PG",
    "level": 4,
    "type": "Entrepreneurship",
    "question": "During postgraduate research or professional analysis, a startup has many users but is losing money. Which question is most important?",
    "bestAnswer": "A",
    "discriminator": "Entrepreneurship",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG040_OPT_A",
        "key": "A",
        "text": "Review office size.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG040_OPT_B",
        "key": "B",
        "text": "Review logo appeal.",
        "weights": {
          "BU": 5,
          "AR": 5,
          "QR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG040_OPT_C",
        "key": "C",
        "text": "Review value, costs and user segments.",
        "weights": {}
      },
      {
        "id": "PG040_OPT_D",
        "key": "D",
        "text": "Review employee social activity.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG041",
    "number": 41,
    "track": "PG",
    "level": 4,
    "type": "Technology",
    "question": "During postgraduate research or professional analysis, a company wants to introduce an AI system into a high-stakes workflow. What should be assessed before deployment?",
    "bestAnswer": "B",
    "discriminator": "AI|Technology",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG041_OPT_A",
        "key": "A",
        "text": "Assess accuracy and failure risks.",
        "weights": {}
      },
      {
        "id": "PG041_OPT_B",
        "key": "B",
        "text": "Assess only interface design.",
        "weights": {
          "TC": 5,
          "SC": 5,
          "RE": 5,
          "AR": 5,
          "LE": 5
        }
      },
      {
        "id": "PG041_OPT_C",
        "key": "C",
        "text": "Assess only development speed.",
        "weights": {}
      },
      {
        "id": "PG041_OPT_D",
        "key": "D",
        "text": "Assess only model accuracy.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG042",
    "number": 42,
    "track": "PG",
    "level": 4,
    "type": "Communication",
    "question": "During postgraduate research or professional analysis, a report contains strong data but decision-makers misunderstand it. What should be improved first?",
    "bestAnswer": "C",
    "discriminator": "Communication",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG042_OPT_A",
        "key": "A",
        "text": "Clarify message, evidence and implications.",
        "weights": {}
      },
      {
        "id": "PG042_OPT_B",
        "key": "B",
        "text": "Remove all numbers.",
        "weights": {
          "CO": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG042_OPT_C",
        "key": "C",
        "text": "Make every section longer.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG042_OPT_D",
        "key": "D",
        "text": "Add more technical terms.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG043",
    "number": 43,
    "track": "PG",
    "level": 4,
    "type": "Research",
    "question": "During postgraduate research or professional analysis, a researcher has a hypothesis but finds evidence against it. What is the strongest response?",
    "bestAnswer": "D",
    "discriminator": "Research",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG043_OPT_A",
        "key": "A",
        "text": "Change the evidence.",
        "weights": {}
      },
      {
        "id": "PG043_OPT_B",
        "key": "B",
        "text": "Stop researching.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG043_OPT_C",
        "key": "C",
        "text": "Hide conflicting evidence.",
        "weights": {}
      },
      {
        "id": "PG043_OPT_D",
        "key": "D",
        "text": "Reassess the hypothesis and evidence.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG044",
    "number": 44,
    "track": "PG",
    "level": 4,
    "type": "Finance",
    "question": "During postgraduate research or professional analysis, two investments have similar expected returns but different risk profiles. What else should influence the choice?",
    "bestAnswer": "A",
    "discriminator": "Finance",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG044_OPT_A",
        "key": "A",
        "text": "Only the past one-week return.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG044_OPT_B",
        "key": "B",
        "text": "Only the advertised return.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5
        }
      },
      {
        "id": "PG044_OPT_C",
        "key": "C",
        "text": "Time horizon, risk tolerance, liquidity needs and diversification.",
        "weights": {}
      },
      {
        "id": "PG044_OPT_D",
        "key": "D",
        "text": "Only the popularity of each investment.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG045",
    "number": 45,
    "track": "PG",
    "level": 4,
    "type": "Cross-disciplinary",
    "question": "During postgraduate research or professional analysis, a city wants to reduce traffic congestion. Which approach shows the strongest problem-solving process?",
    "bestAnswer": "B",
    "discriminator": "Cross-disciplinary",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG045_OPT_A",
        "key": "A",
        "text": "Copy another city.",
        "weights": {}
      },
      {
        "id": "PG045_OPT_B",
        "key": "B",
        "text": "Build more roads.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG045_OPT_C",
        "key": "C",
        "text": "Use the popular suggestion.",
        "weights": {
          "PS": 5,
          "AR": 5,
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "PG045_OPT_D",
        "key": "D",
        "text": "Analyse causes and test interventions.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG046",
    "number": 46,
    "track": "PG",
    "level": 4,
    "type": "Advanced analysis",
    "question": "During postgraduate research or professional analysis, a model predicts student performance accurately overall but performs poorly for one subgroup. What should you investigate first?",
    "bestAnswer": "C",
    "discriminator": "AI/Data|Research",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG046_OPT_A",
        "key": "A",
        "text": "Check data quality, sample size and model behaviour across groups.",
        "weights": {}
      },
      {
        "id": "PG046_OPT_B",
        "key": "B",
        "text": "Ignore it because overall accuracy is high.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "TC": 5,
          "SC": 5
        }
      },
      {
        "id": "PG046_OPT_C",
        "key": "C",
        "text": "Increase the number of predictions.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG046_OPT_D",
        "key": "D",
        "text": "Remove the subgroup.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG047",
    "number": 47,
    "track": "PG",
    "level": 4,
    "type": "Advanced decision",
    "question": "During postgraduate research or professional analysis, a company must choose between two strategies. A has higher expected profit but greater uncertainty. B has lower expected profit and lower uncertainty. What should determine the decision?",
    "bestAnswer": "D",
    "discriminator": "Finance|Management",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG047_OPT_A",
        "key": "A",
        "text": "Choose the popular option.",
        "weights": {}
      },
      {
        "id": "PG047_OPT_B",
        "key": "B",
        "text": "Compare return, risk and loss capacity.",
        "weights": {}
      },
      {
        "id": "PG047_OPT_C",
        "key": "C",
        "text": "Choose randomly.",
        "weights": {
          "AR": 5,
          "BU": 5,
          "QR": 5,
          "LE": 5
        }
      },
      {
        "id": "PG047_OPT_D",
        "key": "D",
        "text": "Choose the cheapest option.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG048",
    "number": 48,
    "track": "PG",
    "level": 4,
    "type": "Advanced research",
    "question": "During postgraduate research or professional analysis, three research teams produce conflicting results. What is the strongest approach?",
    "bestAnswer": "A",
    "discriminator": "Research|Science",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG048_OPT_A",
        "key": "A",
        "text": "Compare methodology, samples and possible sources of error.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG048_OPT_B",
        "key": "B",
        "text": "Average the results.",
        "weights": {}
      },
      {
        "id": "PG048_OPT_C",
        "key": "C",
        "text": "Select the result supporting your belief.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG048_OPT_D",
        "key": "D",
        "text": "Select the majority result.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG049",
    "number": 49,
    "track": "PG",
    "level": 4,
    "type": "Advanced problem solving",
    "question": "During postgraduate research or professional analysis, a city wants to reduce traffic congestion. Which approach demonstrates the strongest problem-solving process?",
    "bestAnswer": "B",
    "discriminator": "Engineering|Policy|Research",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG049_OPT_A",
        "key": "A",
        "text": "Copy another city.",
        "weights": {}
      },
      {
        "id": "PG049_OPT_B",
        "key": "B",
        "text": "Build more roads immediately.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG049_OPT_C",
        "key": "C",
        "text": "Use the most popular suggestion.",
        "weights": {
          "PS": 5,
          "AR": 5,
          "RE": 5,
          "SC": 5
        }
      },
      {
        "id": "PG049_OPT_D",
        "key": "D",
        "text": "Analyse causes and test interventions.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG050",
    "number": 50,
    "track": "PG",
    "level": 4,
    "type": "Advanced technology",
    "question": "During postgraduate research or professional analysis, an AI system has high average accuracy but occasionally makes severe errors in a high-stakes setting. What should the organization do?",
    "bestAnswer": "C",
    "discriminator": "AI|Technology",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG050_OPT_A",
        "key": "A",
        "text": "Assess error patterns and severity.",
        "weights": {}
      },
      {
        "id": "PG050_OPT_B",
        "key": "B",
        "text": "Hide the severe errors.",
        "weights": {
          "TC": 5,
          "SC": 5,
          "AR": 5,
          "LE": 5,
          "RE": 5
        }
      },
      {
        "id": "PG050_OPT_C",
        "key": "C",
        "text": "Remove human review.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG050_OPT_D",
        "key": "D",
        "text": "Deploy because average accuracy is high.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG051",
    "number": 51,
    "track": "PG",
    "level": 4,
    "type": "Advanced data",
    "question": "During postgraduate research or professional analysis, a dataset shows that students using a particular resource score higher. Before recommending the resource, what should be examined?",
    "bestAnswer": "D",
    "discriminator": "AI/Data|Education",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG051_OPT_A",
        "key": "A",
        "text": "Review only the highest scores.",
        "weights": {}
      },
      {
        "id": "PG051_OPT_B",
        "key": "B",
        "text": "Review only user counts.",
        "weights": {
          "QR": 5,
          "RE": 5,
          "AR": 5,
          "SC": 5
        }
      },
      {
        "id": "PG051_OPT_C",
        "key": "C",
        "text": "Assume the result is causal.",
        "weights": {}
      },
      {
        "id": "PG051_OPT_D",
        "key": "D",
        "text": "Check selection effects and alternatives.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG052",
    "number": 52,
    "track": "PG",
    "level": 4,
    "type": "Advanced engineering",
    "question": "During postgraduate research or professional analysis, a new structure meets normal-load requirements but performs poorly under rare extreme conditions. What should guide the next design decision?",
    "bestAnswer": "A",
    "discriminator": "Engineering",
    "usedAs": "High-discrimination pathway selection",
    "options": [
      {
        "id": "PG052_OPT_A",
        "key": "A",
        "text": "Focus on appearance.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG052_OPT_B",
        "key": "B",
        "text": "Ignore rare conditions.",
        "weights": {
          "PS": 5,
          "SC": 5,
          "AR": 5,
          "LE": 5
        }
      },
      {
        "id": "PG052_OPT_C",
        "key": "C",
        "text": "Assess risk and failure consequences.",
        "weights": {}
      },
      {
        "id": "PG052_OPT_D",
        "key": "D",
        "text": "Choose the cheapest material.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG053",
    "number": 53,
    "track": "PG",
    "level": 5,
    "type": "Advanced science",
    "question": "When making an advanced postgraduate research or professional decision, a theory explains most observations but fails for a new class of observations. What is the strongest scientific response?",
    "bestAnswer": "B",
    "discriminator": "Science",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG053_OPT_A",
        "key": "A",
        "text": "Delete the new observations.",
        "weights": {}
      },
      {
        "id": "PG053_OPT_B",
        "key": "B",
        "text": "Reassess the theory and the measurements.",
        "weights": {
          "SC": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG053_OPT_C",
        "key": "C",
        "text": "Declare the theory perfect.",
        "weights": {}
      },
      {
        "id": "PG053_OPT_D",
        "key": "D",
        "text": "Choose the popular explanation.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG054",
    "number": 54,
    "track": "PG",
    "level": 5,
    "type": "Advanced business",
    "question": "When making an advanced postgraduate research or professional decision, a company must choose between entering a new market and improving its existing product. What analysis is most useful?",
    "bestAnswer": "C",
    "discriminator": "Business|Management",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG054_OPT_A",
        "key": "A",
        "text": "Compare customer need, competitive position, expected value, resources and risk.",
        "weights": {}
      },
      {
        "id": "PG054_OPT_B",
        "key": "B",
        "text": "Choose based only on employee preference.",
        "weights": {
          "BU": 5,
          "LE": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG054_OPT_C",
        "key": "C",
        "text": "Choose based only on market size.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG054_OPT_D",
        "key": "D",
        "text": "Choose the option with the most exciting presentation.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG055",
    "number": 55,
    "track": "PG",
    "level": 5,
    "type": "Advanced management",
    "question": "When making an advanced postgraduate research or professional decision, a high-performing team delivers results but has rising conflict and employee turnover. What should a manager do?",
    "bestAnswer": "D",
    "discriminator": "Management",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG055_OPT_A",
        "key": "A",
        "text": "Replace the whole team.",
        "weights": {}
      },
      {
        "id": "PG055_OPT_B",
        "key": "B",
        "text": "Increase targets.",
        "weights": {
          "LE": 5,
          "CO": 5,
          "SO": 5,
          "PS": 5
        }
      },
      {
        "id": "PG055_OPT_C",
        "key": "C",
        "text": "Ignore the conflict.",
        "weights": {}
      },
      {
        "id": "PG055_OPT_D",
        "key": "D",
        "text": "Review workload, roles and team climate.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG056",
    "number": 56,
    "track": "PG",
    "level": 5,
    "type": "Advanced social science",
    "question": "When making an advanced postgraduate research or professional decision, a policy improves average outcomes but worsens outcomes for a smaller group. How should it be evaluated?",
    "bestAnswer": "A",
    "discriminator": "Social Science|Policy",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG056_OPT_A",
        "key": "A",
        "text": "Assess effects, distribution and trade-offs.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG056_OPT_B",
        "key": "B",
        "text": "Ignore the smaller group.",
        "weights": {}
      },
      {
        "id": "PG056_OPT_C",
        "key": "C",
        "text": "Approve because the average improved.",
        "weights": {
          "SO": 5,
          "AR": 5,
          "RE": 5,
          "LE": 5
        }
      },
      {
        "id": "PG056_OPT_D",
        "key": "D",
        "text": "Reject because one group worsened.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG057",
    "number": 57,
    "track": "PG",
    "level": 5,
    "type": "Advanced communication",
    "question": "When making an advanced postgraduate research or professional decision, a scientific result is statistically significant but the practical effect is small. How should it be communicated?",
    "bestAnswer": "B",
    "discriminator": "Science|Communication",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG057_OPT_A",
        "key": "A",
        "text": "Call it a major breakthrough.",
        "weights": {}
      },
      {
        "id": "PG057_OPT_B",
        "key": "B",
        "text": "Explain both statistical evidence and practical magnitude, with limitations.",
        "weights": {
          "CO": 5,
          "QR": 5,
          "RE": 5,
          "AR": 5
        }
      },
      {
        "id": "PG057_OPT_C",
        "key": "C",
        "text": "Ignore statistical significance.",
        "weights": {}
      },
      {
        "id": "PG057_OPT_D",
        "key": "D",
        "text": "Report only the practical effect.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG058",
    "number": 58,
    "track": "PG",
    "level": 5,
    "type": "Advanced law",
    "question": "When making an advanced postgraduate research or professional decision, a decision depends on several pieces of conflicting evidence. What is the strongest analytical approach?",
    "bestAnswer": "C",
    "discriminator": "Law",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG058_OPT_A",
        "key": "A",
        "text": "Review relevance and reliability.",
        "weights": {}
      },
      {
        "id": "PG058_OPT_B",
        "key": "B",
        "text": "Choose the newest evidence.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "CO": 5
        }
      },
      {
        "id": "PG058_OPT_C",
        "key": "C",
        "text": "Average all evidence.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG058_OPT_D",
        "key": "D",
        "text": "Choose the most dramatic evidence.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG059",
    "number": 59,
    "track": "PG",
    "level": 5,
    "type": "Advanced design",
    "question": "When making an advanced postgraduate research or professional decision, a product has strong technical performance but low adoption. Research shows users do not understand its value. What should the team prioritize?",
    "bestAnswer": "D",
    "discriminator": "Design|Product",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG059_OPT_A",
        "key": "A",
        "text": "Remove all features.",
        "weights": {}
      },
      {
        "id": "PG059_OPT_B",
        "key": "B",
        "text": "Increase technical complexity.",
        "weights": {
          "CR": 5,
          "CO": 5,
          "SO": 5,
          "PS": 5,
          "BU": 5
        }
      },
      {
        "id": "PG059_OPT_C",
        "key": "C",
        "text": "Add more technical features.",
        "weights": {}
      },
      {
        "id": "PG059_OPT_D",
        "key": "D",
        "text": "Improve value communication and user experience based on evidence.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG060",
    "number": 60,
    "track": "PG",
    "level": 5,
    "type": "Advanced entrepreneurship",
    "question": "When making an advanced postgraduate research or professional decision, a startup's growth is fast but customer acquisition costs are also rising. What should founders examine?",
    "bestAnswer": "A",
    "discriminator": "Entrepreneurship",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG060_OPT_A",
        "key": "A",
        "text": "Review total users only.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG060_OPT_B",
        "key": "B",
        "text": "Review growth percentage only.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG060_OPT_C",
        "key": "C",
        "text": "Review unit economics and retention.",
        "weights": {}
      },
      {
        "id": "PG060_OPT_D",
        "key": "D",
        "text": "Review social media followers only.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG061",
    "number": 61,
    "track": "PG",
    "level": 5,
    "type": "Advanced research",
    "question": "When making an advanced postgraduate research or professional decision, a study's result is strong but the sample comes from one narrow population. What limitation matters most?",
    "bestAnswer": "B",
    "discriminator": "Research",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG061_OPT_A",
        "key": "A",
        "text": "Assume the result is false.",
        "weights": {}
      },
      {
        "id": "PG061_OPT_B",
        "key": "B",
        "text": "Check how well it generalizes.",
        "weights": {
          "RE": 5,
          "AR": 5,
          "SC": 5
        }
      },
      {
        "id": "PG061_OPT_C",
        "key": "C",
        "text": "Assume sample size is irrelevant.",
        "weights": {}
      },
      {
        "id": "PG061_OPT_D",
        "key": "D",
        "text": "Generalize the result to everyone.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG062",
    "number": 62,
    "track": "PG",
    "level": 5,
    "type": "Advanced economics",
    "question": "When making an advanced postgraduate research or professional decision, a policy has a large short-term benefit but may create long-term costs. What is the strongest evaluation?",
    "bestAnswer": "C",
    "discriminator": "Economics|Policy",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG062_OPT_A",
        "key": "A",
        "text": "Compare long-term benefits and costs.",
        "weights": {}
      },
      {
        "id": "PG062_OPT_B",
        "key": "B",
        "text": "Ignore future effects.",
        "weights": {
          "BU": 5,
          "QR": 5,
          "AR": 5,
          "RE": 5
        }
      },
      {
        "id": "PG062_OPT_C",
        "key": "C",
        "text": "Choose based only on popularity.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG062_OPT_D",
        "key": "D",
        "text": "Use only the first-year result.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG063",
    "number": 63,
    "track": "PG",
    "level": 5,
    "type": "Advanced cross-disciplinary",
    "question": "When making an advanced postgraduate research or professional decision, a university wants to reduce dropout rates. Which plan is strongest?",
    "bestAnswer": "D",
    "discriminator": "Education|Research",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG063_OPT_A",
        "key": "A",
        "text": "Increase course difficulty.",
        "weights": {}
      },
      {
        "id": "PG063_OPT_B",
        "key": "B",
        "text": "Copy another university.",
        "weights": {
          "AR": 5,
          "RE": 5,
          "PS": 5,
          "SO": 5,
          "LE": 5
        }
      },
      {
        "id": "PG063_OPT_C",
        "key": "C",
        "text": "Send one generic message.",
        "weights": {}
      },
      {
        "id": "PG063_OPT_D",
        "key": "D",
        "text": "Analyse patterns and test targeted interventions.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      }
    ]
  },
  {
    "id": "PG064",
    "number": 64,
    "track": "PG",
    "level": 5,
    "type": "Advanced decision",
    "question": "When making an advanced postgraduate research or professional decision, you have incomplete information, limited resources and several possible solutions. What is the strongest decision process?",
    "bestAnswer": "A",
    "discriminator": "Decision making",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG064_OPT_A",
        "key": "A",
        "text": "Choose the popular option.",
        "weights": {
          "AR": 5,
          "PS": 4
        }
      },
      {
        "id": "PG064_OPT_B",
        "key": "B",
        "text": "Wait for complete information.",
        "weights": {
          "AR": 5,
          "PS": 5,
          "RE": 5,
          "LE": 5
        }
      },
      {
        "id": "PG064_OPT_C",
        "key": "C",
        "text": "State assumptions and test key uncertainties.",
        "weights": {}
      },
      {
        "id": "PG064_OPT_D",
        "key": "D",
        "text": "Choose the lowest-cost option.",
        "weights": {}
      }
    ]
  },
  {
    "id": "PG065",
    "number": 65,
    "track": "PG",
    "level": 5,
    "type": "Advanced integrated",
    "question": "When making an advanced postgraduate research or professional decision, a project has a technically feasible solution, strong user demand and a limited budget, but the main risk is uncertain. What should happen before full implementation?",
    "bestAnswer": "B",
    "discriminator": "Integrated discriminator",
    "usedAs": "Advanced discrimination",
    "options": [
      {
        "id": "PG065_OPT_A",
        "key": "A",
        "text": "Launch the full solution.",
        "weights": {}
      },
      {
        "id": "PG065_OPT_B",
        "key": "B",
        "text": "Test the main uncertainty before scaling.",
        "weights": {
          "PS": 5,
          "AR": 5,
          "RE": 5,
          "BU": 5,
          "LE": 5
        }
      },
      {
        "id": "PG065_OPT_C",
        "key": "C",
        "text": "Cancel the project.",
        "weights": {}
      },
      {
        "id": "PG065_OPT_D",
        "key": "D",
        "text": "Spend the budget on promotion.",
        "weights": {}
      }
    ]
  }
]

/**
 * Deterministic pseudo-random generator
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

/**
 * Fisher-Yates array shuffle using seed
 */
function shuffleArray<T>(array: T[], seed: number): T[] {
  const arr = [...array]
  let currentSeed = seed
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(currentSeed++) * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Delivers 30 adaptive assessment questions across all 5 Levels (6 questions per level).
 * Each question has its 4 options shuffled deterministically while preserving exact internal option IDs.
 */
export function getStage1Questions(track: 'UG' | 'PG' = 'UG', seed: number = 2026): Stage1Question[] {
  const fullBank = track === 'PG' ? PG_STAGE1_QUESTIONS : UG_STAGE1_QUESTIONS
  const selected: Stage1Question[] = []

  // Select 6 questions per level across levels 1 to 5 = 30 questions
  for (let level = 1; level <= 5; level++) {
    const levelQuestions = fullBank.filter((q) => q.level === level)
    const shuffledLevel = shuffleArray(levelQuestions, seed + level * 73)
    const picked = shuffledLevel.slice(0, 6)
    selected.push(...picked)
  }

  // Shuffle options for all 30 questions
  return selected.map((q, qIndex) => {
    const shuffledOpts = shuffleArray(q.options, seed + qIndex * 19)
    return {
      ...q,
      options: shuffledOpts.map((opt, optIndex) => ({
        ...opt,
        key: (['A', 'B', 'C', 'D'][optIndex] || 'A') as 'A' | 'B' | 'C' | 'D',
      })),
    }
  })
}

export interface CourseSuitabilityResult {
  id: string
  name: string
  suitabilityScore: number // 0 - 100
  rank: number
  alignmentLabel: string
  primaryDims: string[]
  recommendedDegree: string
  description: string
}

/**
 * Exact implementation of the guide formula:
 * S_c = Σ(D_d × W_c,d) / Σ(W_c,d)
 */
export function calculateStage1Suitability(
  dimensionScores: Record<string, number>,
  track: 'UG' | 'PG' = 'UG'
): CourseSuitabilityResult[] {
  const results: CourseSuitabilityResult[] = COURSE_FAMILY_MATRIX.map((cf) => {
    let weightedSum = 0
    let totalWeight = 0

    Object.entries(cf.weights).forEach(([dimCode, weight]) => {
      const dimScore = dimensionScores[dimCode] ?? 50
      weightedSum += dimScore * weight
      totalWeight += weight
    })

    const rawSuitability = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50
    const suitabilityScore = Math.min(100, Math.max(15, rawSuitability))

    const label =
      suitabilityScore >= 80 ? 'Strong Alignment' :
      suitabilityScore >= 65 ? 'High Compatibility' :
      suitabilityScore >= 50 ? 'Moderate Alignment' : 'Exploratory Match'

    return {
      id: cf.id,
      name: cf.name,
      suitabilityScore,
      rank: 0,
      alignmentLabel: label,
      primaryDims: cf.primaryDims,
      recommendedDegree: track === 'UG' ? cf.recommendedDegreeUG : cf.recommendedDegreePG,
      description: cf.description,
    }
  })

  results.sort((a, b) => b.suitabilityScore - a.suitabilityScore)
  results.forEach((r, idx) => {
    r.rank = idx + 1
  })

  return results
}
