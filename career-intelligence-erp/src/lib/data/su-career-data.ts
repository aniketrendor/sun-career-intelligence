// SU Career Intelligence Master Data
// Audited production dataset: 20 Dimensions, 79 Domains, 114 Programmes, 30 Stage 1 Cases, 79x3 Stage 2 Activities

export interface Dimension {
  id: string
  name: string
  desc: string
}

export interface CareerDomain {
  id: string
  sector: string
  name: string
  task: string
  profile: Record<string, number>
  programIds: string[]
  programmeCount: number
  profileBasis: string
}

export interface SandipMasterProgram {
  id: string
  school: string
  level: 'UG' | 'PG' | 'PhD' | 'Diploma'
  course: string
  specialization: string
  name: string
  streamSource: string
  careerSource: string
  domainIds: string[]
}

export interface Stage1Option {
  id: string
  text: string
  dims: Record<string, number>
  primaryDim?: string
  secondaryDim?: string
  optOut?: boolean
}

export interface Stage1Question {
  id: string
  level: number
  levelName: string
  ugCase: string
  pgCase: string
  prompt: string
  options: Stage1Option[]
  caseType: string
  responseLimit: number
  instructions: string
}

export interface SectorContext {
  caseType: string
  ug: string
  pg: string
  prompt: string
}

export interface DiscoveryCase {
  caseType: string
  ug: string
  pg: string
  prompt: string
}

export const DIMENSIONS: Dimension[] = [
  { id: "D01", name: "Analytical Reasoning", desc: "Finding patterns, causes and differences." },
  { id: "D02", name: "Quantitative Reasoning", desc: "Using numbers, measurements and estimates." },
  { id: "D03", name: "Logical Reasoning", desc: "Thinking in steps and understanding how things connect." },
  { id: "D04", name: "Scientific Thinking", desc: "Testing ideas and understanding how things work." },
  { id: "D05", name: "Technology Orientation", desc: "Using and exploring digital tools and technology." },
  { id: "D06", name: "Problem Solving", desc: "Finding practical ways to handle problems." },
  { id: "D07", name: "Research Orientation", desc: "Asking questions and finding useful evidence." },
  { id: "D08", name: "Creativity & Innovation", desc: "Coming up with new ideas and better approaches." },
  { id: "D09", name: "Design & Visual Thinking", desc: "Planning how things look, feel and work for people." },
  { id: "D10", name: "Communication", desc: "Explaining ideas, listening and sharing information." },
  { id: "D11", name: "Social Orientation", desc: "Thinking about communities and wider effects." },
  { id: "D12", name: "People & Behaviour", desc: "Understanding people’s needs and actions." },
  { id: "D13", name: "Leadership & Management", desc: "Organising people, time and work." },
  { id: "D14", name: "Business Orientation", desc: "Understanding customers, services and organisations." },
  { id: "D15", name: "Financial Orientation", desc: "Thinking about costs, money and resources." },
  { id: "D16", name: "Entrepreneurship", desc: "Turning ideas into useful services or ventures." },
  { id: "D17", name: "Decision Making", desc: "Comparing choices and deciding what to do next." },
  { id: "D18", name: "Evidence, Quality & Compliance", desc: "Checking accuracy, safety, fairness and standards." },
  { id: "D19", name: "Practical & Technical Orientation", desc: "Building, operating, repairing or improving things." },
  { id: "D20", name: "Adaptability & Learning", desc: "Learning from feedback and adjusting to change." }
];

export const SECTORS: string[] = [
  "Engineering, Infrastructure & Mobility",
  "Computing, AI, Data & Digital",
  "Business, Finance & Management",
  "Law, Governance & Justice",
  "Health, Life Science & Forensics",
  "Design, Media & Creative Industries"
];

export const DOMAINS: CareerDomain[] = [
  {"id":"CD001","sector":"Engineering, Infrastructure & Mobility","name":"Aeronautical Engineering","task":"improving an aircraft’s performance and safety","profile":{"D01":3,"D02":5,"D03":3,"D04":3,"D05":1,"D06":2,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":4,"D19":4,"D20":2},"programIds":["SUN-001","SUN-002"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD002","sector":"Engineering, Infrastructure & Mobility","name":"Aerospace Engineering","task":"studying how air, forces and engines affect flying vehicles","profile":{"D01":3,"D02":5,"D03":3,"D04":4,"D05":1,"D06":2,"D07":2,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":3,"D19":4,"D20":2},"programIds":["SUN-001","SUN-002","SUN-106"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD003","sector":"Engineering, Infrastructure & Mobility","name":"Aircraft Design","task":"sketching and testing ideas for a safer, lighter aircraft","profile":{"D01":2,"D02":2,"D03":2,"D04":3,"D05":1,"D06":3,"D07":1,"D08":5,"D09":4,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":2,"D19":4,"D20":3},"programIds":["SUN-001","SUN-002"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD004","sector":"Engineering, Infrastructure & Mobility","name":"Automotive Engineering","task":"improving how a vehicle moves, uses energy and stays safe","profile":{"D01":2,"D02":3,"D03":2,"D04":4,"D05":3,"D06":4,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":3,"D19":5,"D20":2},"programIds":["SUN-006","SUN-018"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD005","sector":"Engineering, Infrastructure & Mobility","name":"Aviation","task":"planning how flights, passengers and airport teams work together","profile":{"D01":2,"D02":2,"D03":3,"D04":1,"D05":1,"D06":2,"D07":1,"D08":1,"D09":1,"D10":4,"D11":2,"D12":3,"D13":5,"D14":2,"D15":1,"D16":0,"D17":3,"D18":4,"D19":2,"D20":2},"programIds":["SUN-001","SUN-002","SUN-045"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD006","sector":"Engineering, Infrastructure & Mobility","name":"Civil Engineering","task":"designing safe roads, bridges and buildings","profile":{"D01":2,"D02":4,"D03":3,"D04":1,"D05":1,"D06":3,"D07":1,"D08":1,"D09":2,"D10":1,"D11":1,"D12":1,"D13":2,"D14":1,"D15":1,"D16":0,"D17":3,"D18":4,"D19":5,"D20":2},"programIds":["SUN-003","SUN-009","SUN-010","SUN-011","SUN-012","SUN-017","SUN-021","SUN-032"],"programmeCount":8,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD007","sector":"Engineering, Infrastructure & Mobility","name":"Construction Management","task":"planning a building project’s people, materials, cost and timeline","profile":{"D01":2,"D02":4,"D03":3,"D04":1,"D05":1,"D06":2,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":5,"D14":2,"D15":4,"D16":0,"D17":3,"D18":2,"D19":3,"D20":2},"programIds":["SUN-003","SUN-010","SUN-011"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD008","sector":"Engineering, Infrastructure & Mobility","name":"Design Engineering","task":"creating and testing a useful product","profile":{"D01":2,"D02":2,"D03":2,"D04":4,"D05":2,"D06":3,"D07":1,"D08":5,"D09":4,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":2,"D19":4,"D20":3},"programIds":["SUN-014","SUN-015"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD009","sector":"Engineering, Infrastructure & Mobility","name":"Electric Vehicles","task":"improving a battery, charging system or electric vehicle range","profile":{"D01":2,"D02":3,"D03":2,"D04":4,"D05":5,"D06":2,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":3,"D16":0,"D17":2,"D18":3,"D19":4,"D20":2},"programIds":["SUN-006","SUN-018"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD010","sector":"Engineering, Infrastructure & Mobility","name":"Electrical Engineering","task":"making electrical equipment and systems work safely","profile":{"D01":2,"D02":2,"D03":3,"D04":4,"D05":4,"D06":3,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":3,"D19":5,"D20":2},"programIds":["SUN-004","SUN-013"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD011","sector":"Engineering, Infrastructure & Mobility","name":"Electronics & Telecommunication","task":"building devices that send, receive or process signals","profile":{"D01":3,"D02":2,"D03":4,"D04":3,"D05":5,"D06":3,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":2,"D19":4,"D20":2},"programIds":["SUN-005","SUN-084"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD012","sector":"Engineering, Infrastructure & Mobility","name":"Environmental Engineering","task":"finding practical ways to improve water, waste or pollution problems","profile":{"D01":2,"D02":2,"D03":2,"D04":4,"D05":1,"D06":3,"D07":3,"D08":1,"D09":1,"D10":1,"D11":5,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":3,"D19":4,"D20":2},"programIds":["SUN-016"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD013","sector":"Engineering, Infrastructure & Mobility","name":"Mechanical Engineering","task":"designing, testing or improving machines","profile":{"D01":2,"D02":3,"D03":3,"D04":4,"D05":1,"D06":4,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":3,"D19":5,"D20":2},"programIds":["SUN-001","SUN-002","SUN-006","SUN-014","SUN-015","SUN-018","SUN-067","SUN-070","SUN-078","SUN-106"],"programmeCount":10,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD014","sector":"Engineering, Infrastructure & Mobility","name":"Power Systems","task":"making the supply of electricity safer and more reliable","profile":{"D01":2,"D02":3,"D03":2,"D04":3,"D05":5,"D06":3,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":4,"D19":4,"D20":2},"programIds":["SUN-004","SUN-013"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD015","sector":"Engineering, Infrastructure & Mobility","name":"Robotics & Automation","task":"making machines or software handle repeated tasks safely","profile":{"D01":2,"D02":2,"D03":4,"D04":3,"D05":5,"D06":3,"D07":1,"D08":3,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":2,"D19":4,"D20":2},"programIds":["SUN-004","SUN-006","SUN-026","SUN-034"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD016","sector":"Engineering, Infrastructure & Mobility","name":"Structural Engineering","task":"checking why a building or bridge may bend or weaken","profile":{"D01":3,"D02":5,"D03":2,"D04":4,"D05":1,"D06":3,"D07":1,"D08":1,"D09":1,"D10":1,"D11":1,"D12":1,"D13":1,"D14":1,"D15":1,"D16":0,"D17":2,"D18":3,"D19":4,"D20":2},"programIds":["SUN-003","SUN-011"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD017","sector":"Engineering, Infrastructure & Mobility","name":"Transportation Engineering","task":"improving how people and goods travel safely","profile":{"D01":2,"D02":5,"D03":2,"D04":1,"D05":1,"D06":2,"D07":1,"D08":1,"D09":1,"D10":1,"D11":4,"D12":1,"D13":3,"D14":1,"D15":1,"D16":0,"D17":3,"D18":3,"D19":4,"D20":2},"programIds":["SUN-012"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD018","sector":"Engineering, Infrastructure & Mobility","name":"Urban & Regional Planning","task":"planning neighbourhoods, roads and public places around people’s needs","profile":{"D01":2,"D02":3,"D03":2,"D04":1,"D05":1,"D06":2,"D07":1,"D08":1,"D09":5,"D10":3,"D11":4,"D12":1,"D13":4,"D14":2,"D15":1,"D16":0,"D17":3,"D18":2,"D19":2,"D20":2},"programIds":["SUN-009","SUN-019","SUN-071","SUN-075"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD019","sector":"Computing, AI, Data & Digital","name":"Artificial Intelligence","task":"building tools that learn from examples and suggest useful answers","profile":{"D01":4,"D02":3,"D03":4,"D04":2,"D05":5,"D06":2,"D07":3,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":2,"D19":1,"D20":3},"programIds":["SUN-023","SUN-024","SUN-025","SUN-027","SUN-033","SUN-034","SUN-062","SUN-099"],"programmeCount":8,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD020","sector":"Computing, AI, Data & Digital","name":"Business Analytics","task":"using data to help an organisation make better decisions","profile":{"D01":5,"D02":4,"D03":2,"D04":1,"D05":3,"D06":2,"D07":4,"D08":1,"D09":0,"D10":2,"D11":0,"D12":1,"D13":1,"D14":3,"D15":0,"D16":1,"D17":3,"D18":2,"D19":1,"D20":2},"programIds":["SUN-040","SUN-052","SUN-108"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD021","sector":"Computing, AI, Data & Digital","name":"Cloud Computing","task":"helping online services work reliably for many people","profile":{"D01":2,"D02":1,"D03":4,"D04":1,"D05":5,"D06":3,"D07":2,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":4,"D19":3,"D20":3},"programIds":["SUN-021","SUN-032"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD022","sector":"Computing, AI, Data & Digital","name":"Computational Mathematics","task":"using maths and computer tools to solve a difficult problem","profile":{"D01":4,"D02":5,"D03":4,"D04":1,"D05":4,"D06":3,"D07":3,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":2,"D19":1,"D20":2},"programIds":["SUN-082"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD023","sector":"Computing, AI, Data & Digital","name":"Computer Science","task":"writing and improving software to make useful tasks easier","profile":{"D01":4,"D02":1,"D03":4,"D04":1,"D05":5,"D06":3,"D07":3,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":2,"D19":2,"D20":3},"programIds":["SUN-020","SUN-021","SUN-022","SUN-023","SUN-024","SUN-025","SUN-026","SUN-027","SUN-028","SUN-029","SUN-030","SUN-031","SUN-032","SUN-033","SUN-034","SUN-035","SUN-058","SUN-064","SUN-106"],"programmeCount":19,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD024","sector":"Computing, AI, Data & Digital","name":"Cybersecurity","task":"finding ways to protect computer systems and data from attacks","profile":{"D01":3,"D02":1,"D03":4,"D04":1,"D05":5,"D06":2,"D07":3,"D08":1,"D09":0,"D10":1,"D11":0,"D12":2,"D13":1,"D14":1,"D15":0,"D16":1,"D17":3,"D18":4,"D19":1,"D20":2},"programIds":["SUN-021","SUN-022","SUN-028","SUN-032"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD025","sector":"Computing, AI, Data & Digital","name":"Data Analytics","task":"turning numbers and records into clear patterns","profile":{"D01":5,"D02":4,"D03":2,"D04":1,"D05":3,"D06":2,"D07":4,"D08":1,"D09":0,"D10":3,"D11":0,"D12":1,"D13":1,"D14":2,"D15":0,"D16":1,"D17":3,"D18":2,"D19":1,"D20":2},"programIds":["SUN-040","SUN-052","SUN-059"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD026","sector":"Computing, AI, Data & Digital","name":"Data Science","task":"using data to make predictions and test how reliable they are","profile":{"D01":5,"D02":4,"D03":2,"D04":3,"D05":3,"D06":2,"D07":4,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":1,"D14":1,"D15":0,"D16":1,"D17":3,"D18":2,"D19":1,"D20":2},"programIds":["SUN-023","SUN-024","SUN-082"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD027","sector":"Computing, AI, Data & Digital","name":"Digital Transformation","task":"helping an organisation improve its work with digital tools","profile":{"D01":2,"D02":1,"D03":3,"D04":1,"D05":4,"D06":2,"D07":2,"D08":1,"D09":0,"D10":2,"D11":0,"D12":1,"D13":4,"D14":5,"D15":0,"D16":1,"D17":3,"D18":2,"D19":1,"D20":3},"programIds":["SUN-043","SUN-064"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD028","sector":"Computing, AI, Data & Digital","name":"Information Security","task":"keeping private information safe and managing who can access it","profile":{"D01":2,"D02":1,"D03":4,"D04":1,"D05":4,"D06":2,"D07":3,"D08":1,"D09":0,"D10":1,"D11":0,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":3,"D18":5,"D19":1,"D20":2},"programIds":["SUN-021","SUN-022","SUN-028","SUN-032"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD029","sector":"Computing, AI, Data & Digital","name":"Machine Learning","task":"testing how a computer model learns patterns from examples","profile":{"D01":5,"D02":3,"D03":3,"D04":4,"D05":4,"D06":2,"D07":3,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":2,"D19":1,"D20":2},"programIds":["SUN-023","SUN-025","SUN-027","SUN-033","SUN-034"],"programmeCount":5,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD030","sector":"Computing, AI, Data & Digital","name":"Software Engineering","task":"planning, building and testing software people can rely on","profile":{"D01":2,"D02":1,"D03":4,"D04":1,"D05":5,"D06":4,"D07":2,"D08":1,"D09":0,"D10":1,"D11":0,"D12":1,"D13":3,"D14":1,"D15":0,"D16":1,"D17":2,"D18":3,"D19":2,"D20":3},"programIds":["SUN-020","SUN-023","SUN-024","SUN-025","SUN-030","SUN-031","SUN-033","SUN-035"],"programmeCount":8,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD031","sector":"Computing, AI, Data & Digital","name":"Virtual & Augmented Reality","task":"creating a digital space or simulation people can explore","profile":{"D01":2,"D02":1,"D03":2,"D04":3,"D05":5,"D06":2,"D07":2,"D08":4,"D09":4,"D10":3,"D11":0,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":2,"D19":2,"D20":2},"programIds":["SUN-029","SUN-100"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD032","sector":"Business, Finance & Management","name":"Accounting & Finance","task":"checking money records and explaining what they show","profile":{"D01":3,"D02":4,"D03":3,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":3,"D11":1,"D12":2,"D13":2,"D14":2,"D15":5,"D16":1,"D17":2,"D18":4,"D19":0,"D20":2},"programIds":["SUN-044","SUN-050","SUN-051","SUN-109"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD033","sector":"Business, Finance & Management","name":"Banking & Financial Services","task":"helping people or businesses choose and use financial services","profile":{"D01":1,"D02":3,"D03":1,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":4,"D11":2,"D12":4,"D13":2,"D14":5,"D15":4,"D16":1,"D17":3,"D18":3,"D19":0,"D20":2},"programIds":["SUN-036","SUN-041","SUN-053","SUN-055"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD034","sector":"Business, Finance & Management","name":"Costing","task":"working out the full cost of making or delivering something","profile":{"D01":4,"D02":5,"D03":3,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":2,"D11":1,"D12":2,"D13":2,"D14":3,"D15":4,"D16":1,"D17":3,"D18":2,"D19":0,"D20":2},"programIds":["SUN-051"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD035","sector":"Business, Finance & Management","name":"Digital Business","task":"using online tools to create or improve a business","profile":{"D01":1,"D02":1,"D03":1,"D04":0,"D05":4,"D06":1,"D07":1,"D08":2,"D09":0,"D10":3,"D11":1,"D12":2,"D13":3,"D14":5,"D15":2,"D16":4,"D17":3,"D18":1,"D19":0,"D20":2},"programIds":["SUN-043","SUN-064"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD036","sector":"Business, Finance & Management","name":"Digital Marketing","task":"planning online content and learning what reaches customers","profile":{"D01":3,"D02":1,"D03":1,"D04":0,"D05":4,"D06":1,"D07":1,"D08":3,"D09":4,"D10":5,"D11":1,"D12":4,"D13":2,"D14":4,"D15":2,"D16":2,"D17":2,"D18":1,"D19":0,"D20":2},"programIds":["SUN-037","SUN-043","SUN-064"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD037","sector":"Business, Finance & Management","name":"Entrepreneurship & Startups","task":"turning a useful idea into a small, workable business","profile":{"D01":1,"D02":1,"D03":1,"D04":0,"D05":1,"D06":1,"D07":1,"D08":4,"D09":0,"D10":2,"D11":1,"D12":3,"D13":2,"D14":4,"D15":3,"D16":5,"D17":3,"D18":1,"D19":0,"D20":2},"programIds":["SUN-042","SUN-061"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD038","sector":"Business, Finance & Management","name":"Event Management","task":"planning an event so people, time and resources fit together","profile":{"D01":1,"D02":1,"D03":2,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":4,"D11":2,"D12":2,"D13":5,"D14":4,"D15":3,"D16":1,"D17":3,"D18":3,"D19":0,"D20":2},"programIds":["SUN-047"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD039","sector":"Business, Finance & Management","name":"Financial Management","task":"planning how an organisation uses, saves and invests money","profile":{"D01":3,"D02":4,"D03":2,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":2,"D11":1,"D12":2,"D13":3,"D14":2,"D15":5,"D16":1,"D17":4,"D18":3,"D19":0,"D20":2},"programIds":["SUN-036","SUN-041","SUN-053","SUN-055","SUN-109"],"programmeCount":5,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD040","sector":"Business, Finance & Management","name":"Fintech","task":"combining financial services with digital technology","profile":{"D01":2,"D02":3,"D03":2,"D04":0,"D05":5,"D06":1,"D07":1,"D08":1,"D09":0,"D10":2,"D11":1,"D12":2,"D13":2,"D14":4,"D15":4,"D16":1,"D17":3,"D18":3,"D19":0,"D20":2},"programIds":["SUN-059"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD041","sector":"Business, Finance & Management","name":"Global Management","task":"helping a business and its teams work across countries or markets","profile":{"D01":1,"D02":1,"D03":1,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":4,"D11":4,"D12":3,"D13":5,"D14":3,"D15":2,"D16":1,"D17":3,"D18":2,"D19":0,"D20":2},"programIds":["SUN-039","SUN-048","SUN-057","SUN-108"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD042","sector":"Business, Finance & Management","name":"Hospitality Management","task":"improving how guests are welcomed, served and supported","profile":{"D01":1,"D02":1,"D03":1,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":4,"D11":3,"D12":5,"D13":4,"D14":3,"D15":2,"D16":1,"D17":2,"D18":3,"D19":0,"D20":2},"programIds":["SUN-049"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD043","sector":"Business, Finance & Management","name":"Human Resources","task":"helping a team hire people, learn, work well and grow","profile":{"D01":1,"D02":1,"D03":1,"D04":0,"D05":1,"D06":1,"D07":2,"D08":1,"D09":0,"D10":4,"D11":4,"D12":5,"D13":3,"D14":2,"D15":2,"D16":1,"D17":2,"D18":3,"D19":0,"D20":3},"programIds":["SUN-038","SUN-054"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD044","sector":"Business, Finance & Management","name":"International Business","task":"understanding how businesses buy, sell and work across countries","profile":{"D01":1,"D02":1,"D03":1,"D04":0,"D05":1,"D06":1,"D07":1,"D08":1,"D09":0,"D10":4,"D11":4,"D12":3,"D13":3,"D14":5,"D15":2,"D16":1,"D17":3,"D18":2,"D19":0,"D20":2},"programIds":["SUN-039","SUN-048","SUN-057"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD045","sector":"Business, Finance & Management","name":"Investment & Finance","task":"comparing investments, risk and possible returns","profile":{"D01":4,"D02":4,"D03":2,"D04":0,"D05":1,"D06":1,"D07":3,"D08":1,"D09":0,"D10":2,"D11":1,"D12":2,"D13":2,"D14":2,"D15":5,"D16":1,"D17":3,"D18":3,"D19":0,"D20":2},"programIds":["SUN-036","SUN-041","SUN-053","SUN-055"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD046","sector":"Business, Finance & Management","name":"Logistics & Supply Chain","task":"planning how goods move from suppliers to customers","profile":{"D01":1,"D02":4,"D03":4,"D04":0,"D05":3,"D06":1,"D07":1,"D08":1,"D09":0,"D10":2,"D11":1,"D12":2,"D13":5,"D14":3,"D15":2,"D16":1,"D17":3,"D18":1,"D19":2,"D20":2},"programIds":["SUN-045","SUN-046","SUN-060","SUN-065"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD047","sector":"Business, Finance & Management","name":"Marketing","task":"understanding customer needs and explaining why a product is useful","profile":{"D01":3,"D02":1,"D03":1,"D04":0,"D05":3,"D06":1,"D07":1,"D08":3,"D09":0,"D10":4,"D11":1,"D12":4,"D13":2,"D14":5,"D15":2,"D16":2,"D17":2,"D18":1,"D19":0,"D20":2},"programIds":["SUN-037","SUN-043","SUN-047","SUN-056"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD048","sector":"Law, Governance & Justice","name":"Constitutional & Administrative Law","task":"understanding rules that shape government and public decisions","profile":{"D01":2,"D02":0,"D03":5,"D04":0,"D05":0,"D06":1,"D07":3,"D08":0,"D09":0,"D10":3,"D11":4,"D12":1,"D13":2,"D14":0,"D15":0,"D16":0,"D17":3,"D18":4,"D19":0,"D20":1},"programIds":["SUN-075"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD049","sector":"Law, Governance & Justice","name":"Corporate & Commercial Law","task":"helping organisations understand contracts, duties and legal risks","profile":{"D01":2,"D02":0,"D03":5,"D04":0,"D05":0,"D06":1,"D07":2,"D08":0,"D09":0,"D10":3,"D11":2,"D12":1,"D13":1,"D14":4,"D15":3,"D16":0,"D17":3,"D18":4,"D19":0,"D20":1},"programIds":["SUN-072","SUN-076"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD050","sector":"Law, Governance & Justice","name":"Criminal Law","task":"examining evidence and legal questions in a criminal case","profile":{"D01":5,"D02":0,"D03":3,"D04":0,"D05":0,"D06":1,"D07":4,"D08":0,"D09":0,"D10":3,"D11":2,"D12":2,"D13":1,"D14":0,"D15":0,"D16":0,"D17":3,"D18":4,"D19":0,"D20":1},"programIds":["SUN-074"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD051","sector":"Law, Governance & Justice","name":"Law","task":"understanding rights, rules and how to make a fair argument","profile":{"D01":2,"D02":0,"D03":5,"D04":0,"D05":0,"D06":1,"D07":3,"D08":0,"D09":0,"D10":4,"D11":3,"D12":2,"D13":1,"D14":0,"D15":0,"D16":0,"D17":3,"D18":4,"D19":0,"D20":1},"programIds":["SUN-071","SUN-072","SUN-073","SUN-074","SUN-075","SUN-076","SUN-077","SUN-110"],"programmeCount":8,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD052","sector":"Law, Governance & Justice","name":"Mediation Law","task":"helping people find a fair way to settle a disagreement","profile":{"D01":2,"D02":0,"D03":2,"D04":0,"D05":0,"D06":1,"D07":2,"D08":0,"D09":0,"D10":5,"D11":4,"D12":4,"D13":3,"D14":0,"D15":0,"D16":0,"D17":3,"D18":4,"D19":0,"D20":3},"programIds":["SUN-077"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD053","sector":"Health, Life Science & Forensics","name":"Biomedical Engineering","task":"designing or improving devices used in health care","profile":{"D01":2,"D02":2,"D03":1,"D04":4,"D05":4,"D06":3,"D07":3,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":3,"D19":5,"D20":2},"programIds":["SUN-008"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD054","sector":"Health, Life Science & Forensics","name":"Biotechnology","task":"using living cells or biological processes to solve a real problem","profile":{"D01":3,"D02":2,"D03":1,"D04":5,"D05":1,"D06":3,"D07":4,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":3,"D19":4,"D20":2},"programIds":["SUN-007","SUN-080","SUN-088","SUN-089"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD055","sector":"Health, Life Science & Forensics","name":"Chemistry","task":"testing what a material contains and how it changes","profile":{"D01":4,"D02":4,"D03":2,"D04":5,"D05":1,"D06":2,"D07":3,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":3,"D19":3,"D20":2},"programIds":["SUN-083","SUN-086","SUN-111"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD056","sector":"Health, Life Science & Forensics","name":"Forensic Science","task":"examining evidence carefully to help answer what happened","profile":{"D01":4,"D02":1,"D03":3,"D04":3,"D05":1,"D06":2,"D07":5,"D08":0,"D09":0,"D10":2,"D11":1,"D12":2,"D13":1,"D14":0,"D15":0,"D16":0,"D17":3,"D18":4,"D19":1,"D20":2},"programIds":["SUN-022","SUN-028","SUN-081","SUN-085","SUN-091"],"programmeCount":5,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD057","sector":"Health, Life Science & Forensics","name":"Industrial Pharmacy","task":"improving how medicines are made and checked","profile":{"D01":2,"D02":3,"D03":2,"D04":4,"D05":1,"D06":3,"D07":2,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":3,"D14":0,"D15":0,"D16":0,"D17":1,"D18":4,"D19":5,"D20":2},"programIds":["SUN-070"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD058","sector":"Health, Life Science & Forensics","name":"Life Sciences","task":"studying living things and how they work","profile":{"D01":4,"D02":1,"D03":2,"D04":5,"D05":1,"D06":2,"D07":4,"D08":0,"D09":0,"D10":1,"D11":3,"D12":2,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":3,"D19":1,"D20":3},"programIds":["SUN-007","SUN-089","SUN-111"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD059","sector":"Health, Life Science & Forensics","name":"Mathematics","task":"using patterns and calculations to solve complex questions","profile":{"D01":4,"D02":5,"D03":4,"D04":2,"D05":3,"D06":2,"D07":3,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":3,"D18":2,"D19":1,"D20":2},"programIds":["SUN-082","SUN-090"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD060","sector":"Health, Life Science & Forensics","name":"Microbiology","task":"studying tiny living things and their effects","profile":{"D01":4,"D02":3,"D03":2,"D04":5,"D05":1,"D06":2,"D07":4,"D08":0,"D09":0,"D10":1,"D11":1,"D12":2,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":3,"D19":1,"D20":3},"programIds":["SUN-080","SUN-088"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD061","sector":"Health, Life Science & Forensics","name":"Nanoscience & Nanotechnology","task":"exploring very small materials and how they can be used","profile":{"D01":2,"D02":3,"D03":1,"D04":5,"D05":4,"D06":2,"D07":4,"D08":3,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":2,"D19":3,"D20":2},"programIds":["SUN-079"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD062","sector":"Health, Life Science & Forensics","name":"Pharmaceutical Quality Assurance","task":"checking that medicines meet safety and quality rules","profile":{"D01":2,"D02":3,"D03":3,"D04":4,"D05":1,"D06":2,"D07":2,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":4,"D14":0,"D15":0,"D16":0,"D17":2,"D18":5,"D19":3,"D20":2},"programIds":["SUN-069","SUN-078"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD063","sector":"Health, Life Science & Forensics","name":"Pharmaceutical Sciences","task":"studying how medicines are developed, made and tested","profile":{"D01":4,"D02":2,"D03":1,"D04":5,"D05":1,"D06":2,"D07":4,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":4,"D19":3,"D20":3},"programIds":["SUN-065","SUN-066","SUN-067","SUN-068","SUN-069","SUN-070"],"programmeCount":6,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD064","sector":"Health, Life Science & Forensics","name":"Pharmaceutics","task":"working on how medicines are prepared and delivered","profile":{"D01":2,"D02":3,"D03":2,"D04":5,"D05":1,"D06":3,"D07":3,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":4,"D19":4,"D20":2},"programIds":["SUN-067"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD065","sector":"Health, Life Science & Forensics","name":"Pharmacology","task":"studying how medicines affect the body","profile":{"D01":4,"D02":2,"D03":1,"D04":5,"D05":1,"D06":2,"D07":4,"D08":0,"D09":0,"D10":1,"D11":1,"D12":3,"D13":1,"D14":0,"D15":0,"D16":0,"D17":3,"D18":3,"D19":1,"D20":2},"programIds":["SUN-068"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD066","sector":"Health, Life Science & Forensics","name":"Pharmacy","task":"helping people use medicines safely and correctly","profile":{"D01":2,"D02":1,"D03":1,"D04":3,"D05":1,"D06":2,"D07":3,"D08":0,"D09":0,"D10":5,"D11":2,"D12":4,"D13":1,"D14":0,"D15":0,"D16":0,"D17":3,"D18":4,"D19":2,"D20":2},"programIds":["SUN-065","SUN-066","SUN-070","SUN-107"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD067","sector":"Health, Life Science & Forensics","name":"Physics","task":"testing ideas about forces, energy, matter and how the world works","profile":{"D01":4,"D02":4,"D03":3,"D04":5,"D05":1,"D06":2,"D07":3,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":1,"D14":0,"D15":0,"D16":0,"D17":1,"D18":2,"D19":3,"D20":2},"programIds":["SUN-084","SUN-087","SUN-111"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD068","sector":"Health, Life Science & Forensics","name":"Wine Technology","task":"checking how a food or drink is made, tested and kept consistent","profile":{"D01":2,"D02":3,"D03":1,"D04":5,"D05":1,"D06":2,"D07":3,"D08":0,"D09":0,"D10":1,"D11":1,"D12":1,"D13":3,"D14":2,"D15":0,"D16":0,"D17":1,"D18":4,"D19":4,"D20":2},"programIds":["SUN-078"],"programmeCount":1,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD069","sector":"Design, Media & Creative Industries","name":"Beauty & Cosmetology","task":"helping people choose and use beauty or wellness services safely","profile":{"D01":1,"D02":0,"D03":1,"D04":0,"D05":1,"D06":1,"D07":1,"D08":2,"D09":3,"D10":4,"D11":2,"D12":5,"D13":1,"D14":3,"D15":0,"D16":1,"D17":1,"D18":3,"D19":4,"D20":2},"programIds":["SUN-093","SUN-102","SUN-114"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD070","sector":"Design, Media & Creative Industries","name":"Communication Design","task":"making visual messages easy to understand","profile":{"D01":1,"D02":0,"D03":1,"D04":0,"D05":3,"D06":1,"D07":1,"D08":4,"D09":5,"D10":4,"D11":1,"D12":3,"D13":1,"D14":2,"D15":0,"D16":1,"D17":1,"D18":3,"D19":1,"D20":2},"programIds":["SUN-095","SUN-104"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD071","sector":"Design, Media & Creative Industries","name":"Content Strategy","task":"planning useful messages for the right audience and channel","profile":{"D01":2,"D02":0,"D03":1,"D04":0,"D05":3,"D06":1,"D07":3,"D08":3,"D09":4,"D10":5,"D11":1,"D12":4,"D13":1,"D14":4,"D15":0,"D16":2,"D17":1,"D18":1,"D19":1,"D20":2},"programIds":["SUN-063","SUN-112"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD072","sector":"Design, Media & Creative Industries","name":"Fashion & Apparel","task":"developing clothing ideas and understanding materials and customer needs","profile":{"D01":2,"D02":0,"D03":1,"D04":0,"D05":1,"D06":2,"D07":1,"D08":5,"D09":4,"D10":2,"D11":1,"D12":3,"D13":1,"D14":3,"D15":0,"D16":1,"D17":1,"D18":1,"D19":4,"D20":3},"programIds":["SUN-092","SUN-097","SUN-101","SUN-113"],"programmeCount":4,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD073","sector":"Design, Media & Creative Industries","name":"Game Design","task":"creating the rules, story and experience of a game","profile":{"D01":1,"D02":0,"D03":3,"D04":0,"D05":4,"D06":2,"D07":1,"D08":5,"D09":4,"D10":2,"D11":1,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":1,"D18":1,"D19":1,"D20":3},"programIds":["SUN-029","SUN-100","SUN-105"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD074","sector":"Design, Media & Creative Industries","name":"Immersive Media","task":"creating digital experiences that people can explore","profile":{"D01":1,"D02":0,"D03":1,"D04":3,"D05":5,"D06":1,"D07":1,"D08":4,"D09":4,"D10":3,"D11":1,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":1,"D18":1,"D19":2,"D20":2},"programIds":["SUN-029","SUN-100","SUN-105"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD075","sector":"Design, Media & Creative Industries","name":"Interior & Space Design","task":"planning an indoor space so it works well and feels right","profile":{"D01":1,"D02":0,"D03":1,"D04":0,"D05":1,"D06":3,"D07":1,"D08":4,"D09":5,"D10":2,"D11":3,"D12":2,"D13":2,"D14":1,"D15":0,"D16":1,"D17":3,"D18":1,"D19":4,"D20":2},"programIds":["SUN-094","SUN-098"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD076","sector":"Design, Media & Creative Industries","name":"Media & Creative Communication","task":"creating stories or messages through video, audio or other media","profile":{"D01":1,"D02":0,"D03":1,"D04":0,"D05":3,"D06":1,"D07":3,"D08":4,"D09":4,"D10":5,"D11":2,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":1,"D19":1,"D20":2},"programIds":["SUN-043","SUN-063","SUN-099","SUN-100","SUN-105","SUN-112"],"programmeCount":6,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD077","sector":"Design, Media & Creative Industries","name":"Product Design","task":"designing and testing products people need","profile":{"D01":1,"D02":0,"D03":1,"D04":3,"D05":1,"D06":3,"D07":1,"D08":5,"D09":4,"D10":2,"D11":1,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":1,"D19":4,"D20":2},"programIds":["SUN-014","SUN-096","SUN-103"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD078","sector":"Design, Media & Creative Industries","name":"UX Design","task":"finding out how people use a digital product and making it easier","profile":{"D01":1,"D02":0,"D03":1,"D04":0,"D05":4,"D06":3,"D07":3,"D08":2,"D09":4,"D10":3,"D11":1,"D12":5,"D13":1,"D14":1,"D15":0,"D16":1,"D17":1,"D18":1,"D19":1,"D20":2},"programIds":["SUN-047","SUN-095","SUN-103"],"programmeCount":3,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."},
  {"id":"CD079","sector":"Design, Media & Creative Industries","name":"Visual Communication","task":"using images, layout and words to share a clear message","profile":{"D01":1,"D02":0,"D03":1,"D04":0,"D05":3,"D06":1,"D07":2,"D08":4,"D09":5,"D10":4,"D11":1,"D12":3,"D13":1,"D14":1,"D15":0,"D16":1,"D17":2,"D18":3,"D19":1,"D20":2},"programIds":["SUN-095","SUN-104"],"programmeCount":2,"profileBasis":"Conceptual task-profile mapping v2 (sector baseline + named work signature); advisory, not empirically validated."}
];

export const PROGRAMS: SandipMasterProgram[] = [
  {"id":"SUN-001","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Aerospace Engineering","name":"B.Tech Aerospace Engineering","streamSource":"PCM","careerSource":"Aerospace engineering, aviation, design, manufacturing","domainIds":["CD002","CD005","CD013","CD001","CD003"]},
  {"id":"SUN-002","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Aeronautical Engineering","name":"B.Tech Aeronautical Engineering","streamSource":"PCM","careerSource":"Aircraft design, aerospace, aviation, manufacturing","domainIds":["CD001","CD002","CD003","CD005","CD013"]},
  {"id":"SUN-003","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Civil Engineering","name":"B.Tech Civil Engineering","streamSource":"PCM","careerSource":"Construction, infrastructure, structural engineering, project management","domainIds":["CD006","CD007","CD016"]},
  {"id":"SUN-004","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Electrical Engineering","name":"B.Tech Electrical Engineering","streamSource":"PCM","careerSource":"Power systems, electrical design, automation, energy","domainIds":["CD010","CD014","CD015"]},
  {"id":"SUN-005","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Electronics & Telecommunication Engineering","name":"B.Tech Electronics & Telecommunication Engineering","streamSource":"PCM","careerSource":"Telecom, embedded systems, electronics, networking","domainIds":["CD011"]},
  {"id":"SUN-006","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Mechanical Engineering","name":"B.Tech Mechanical Engineering","streamSource":"PCM","careerSource":"Manufacturing, automotive, design, production, robotics","domainIds":["CD004","CD013","CD015","CD009"]},
  {"id":"SUN-007","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Biotechnology","name":"B.Tech Biotechnology","streamSource":"PCB/PCM","careerSource":"Biotech, pharmaceuticals, research, food and life sciences","domainIds":["CD054","CD058"]},
  {"id":"SUN-008","school":"Engineering & Technology","level":"UG","course":"B.Tech","specialization":"Biomedical Engineering","name":"B.Tech Biomedical Engineering","streamSource":"PCB/PCM","careerSource":"Medical devices, healthcare technology, biomedical research","domainIds":["CD053"]},
  {"id":"SUN-009","school":"Engineering & Technology","level":"UG","course":"B.Plan","specialization":"Planning","name":"B.Plan Planning","streamSource":"PCM","careerSource":"Urban planning, regional planning, infrastructure, public policy","domainIds":["CD006","CD018"]},
  {"id":"SUN-010","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Construction Management","name":"M.Tech Construction Management","streamSource":"Relevant engineering","careerSource":"Construction management, project management, infrastructure","domainIds":["CD006","CD007"]},
  {"id":"SUN-011","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Structural Engineering","name":"M.Tech Structural Engineering","streamSource":"Relevant engineering","careerSource":"Structural design, civil engineering, construction","domainIds":["CD006","CD007","CD016"]},
  {"id":"SUN-012","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Transportation Engineering & Planning","name":"M.Tech Transportation Engineering & Planning","streamSource":"Relevant engineering","careerSource":"Transport planning, highways, infrastructure","domainIds":["CD006","CD017"]},
  {"id":"SUN-013","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Power System","name":"M.Tech Power System","streamSource":"Relevant engineering","careerSource":"Power systems, electrical utilities, energy","domainIds":["CD010","CD014"]},
  {"id":"SUN-014","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Design Engineering","name":"M.Tech Design Engineering","streamSource":"Relevant engineering","careerSource":"Product design, CAD, mechanical design, manufacturing","domainIds":["CD008","CD013","CD077"]},
  {"id":"SUN-015","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Mechanical Engineering","name":"M.Tech Mechanical Engineering","streamSource":"Relevant engineering","careerSource":"Mechanical design, manufacturing, production","domainIds":["CD008","CD013"]},
  {"id":"SUN-016","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Environmental Engineering","name":"M.Tech Environmental Engineering","streamSource":"Relevant engineering/science","careerSource":"Environmental consulting, sustainability, water and waste management","domainIds":["CD012"]},
  {"id":"SUN-017","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Valuation - Land & Building","name":"M.Tech Valuation - Land & Building","streamSource":"Civil/Architecture","careerSource":"Property valuation, real estate, infrastructure","domainIds":["CD006"]},
  {"id":"SUN-018","school":"Engineering & Technology","level":"PG","course":"M.Tech","specialization":"Electrical Vehicles","name":"M.Tech Electrical Vehicles","streamSource":"Relevant engineering","careerSource":"EV systems, automotive, battery and mobility technology","domainIds":["CD004","CD009","CD013"]},
  {"id":"SUN-019","school":"Engineering & Technology","level":"PG","course":"Master of Planning","specialization":"Town & Country Planning","name":"Master of Planning Town & Country Planning","streamSource":"Relevant degree","careerSource":"Urban planning, regional planning, public policy","domainIds":["CD018"]},
  {"id":"SUN-020","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"General","name":"B.Tech CSE General","streamSource":"PCM","careerSource":"Software development, IT, technology consulting","domainIds":["CD023","CD030"]},
  {"id":"SUN-021","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Cloud Technology & Information Security","name":"B.Tech CSE Cloud Technology & Information Security","streamSource":"PCM","careerSource":"Cloud computing, cybersecurity, IT infrastructure","domainIds":["CD006","CD021","CD023","CD024","CD028"]},
  {"id":"SUN-022","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Cyber Security & Forensic","name":"B.Tech CSE Cyber Security & Forensic","streamSource":"PCM","careerSource":"Cybersecurity, digital forensics, information security","domainIds":["CD023","CD024","CD028","CD056"]},
  {"id":"SUN-023","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Artificial Intelligence & Machine Learning","name":"B.Tech CSE Artificial Intelligence & Machine Learning","streamSource":"PCM","careerSource":"AI, ML, data science, software","domainIds":["CD019","CD023","CD026","CD029","CD030"]},
  {"id":"SUN-024","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Artificial Intelligence & Data Science","name":"B.Tech CSE Artificial Intelligence & Data Science","streamSource":"PCM","careerSource":"AI, data science, analytics, software","domainIds":["CD019","CD023","CD026","CD030"]},
  {"id":"SUN-025","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Full Stack Development & Testing with AI & ML","name":"B.Tech CSE Full Stack Development & Testing with AI & ML","streamSource":"PCM","careerSource":"Software development, testing, AI, web technology","domainIds":["CD019","CD023","CD029","CD030"]},
  {"id":"SUN-026","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Robotics Process Automation","name":"B.Tech CSE Robotics Process Automation","streamSource":"PCM","careerSource":"RPA, automation, business technology","domainIds":["CD015","CD023"]},
  {"id":"SUN-027","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Artificial Intelligence","name":"B.Tech CSE Artificial Intelligence","streamSource":"PCM","careerSource":"AI, machine learning, intelligent systems","domainIds":["CD019","CD023","CD029"]},
  {"id":"SUN-028","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Cyber Forensic & Information Security","name":"B.Tech CSE Cyber Forensic & Information Security","streamSource":"PCM","careerSource":"Cyber forensics, cybersecurity, information security","domainIds":["CD023","CD024","CD028","CD056"]},
  {"id":"SUN-029","school":"Computer Science & Engineering","level":"UG","course":"B.Tech CSE","specialization":"Virtual & Augmented Reality","name":"B.Tech CSE Virtual & Augmented Reality","streamSource":"PCM","careerSource":"AR/VR, immersive technology, gaming, simulation","domainIds":["CD023","CD031","CD073","CD074"]},
  {"id":"SUN-030","school":"Computer Science & Engineering","level":"UG","course":"B.Sc Computer Science","specialization":"General","name":"B.Sc Computer Science General","streamSource":"Science + Mathematics","careerSource":"Software, IT, programming, data","domainIds":["CD023","CD030"]},
  {"id":"SUN-031","school":"Computer Science & Engineering","level":"UG","course":"BCA","specialization":"General","name":"BCA General","streamSource":"Any stream","careerSource":"Software, application development, IT support, web development","domainIds":["CD023","CD030"]},
  {"id":"SUN-032","school":"Computer Science & Engineering","level":"PG","course":"M.Tech CSE","specialization":"Cloud Technology & Information Security","name":"M.Tech CSE Cloud Technology & Information Security","streamSource":"Relevant degree","careerSource":"Cloud, cybersecurity, IT infrastructure","domainIds":["CD006","CD021","CD023","CD024","CD028"]},
  {"id":"SUN-033","school":"Computer Science & Engineering","level":"PG","course":"M.Tech CSE","specialization":"Software Development with AI & ML","name":"M.Tech CSE Software Development with AI & ML","streamSource":"Relevant degree","careerSource":"Software engineering, AI, ML","domainIds":["CD019","CD023","CD029","CD030"]},
  {"id":"SUN-034","school":"Computer Science & Engineering","level":"PG","course":"M.Tech CSE","specialization":"Robotics & Process Automation with AI & ML","name":"M.Tech CSE Robotics & Process Automation with AI & ML","streamSource":"Relevant degree","careerSource":"Robotics, RPA, AI, automation","domainIds":["CD015","CD019","CD023","CD029"]},
  {"id":"SUN-035","school":"Computer Science & Engineering","level":"PG","course":"MCA","specialization":"General","name":"MCA General","streamSource":"Any graduation, preferably Mathematics","careerSource":"Software, IT, application development, data","domainIds":["CD023","CD030"]},
  {"id":"SUN-036","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Financial Management","name":"BBA Financial Management","streamSource":"Any stream","careerSource":"Finance, banking, investment, corporate finance","domainIds":["CD033","CD039","CD045"]},
  {"id":"SUN-037","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Marketing Management","name":"BBA Marketing Management","streamSource":"Any stream","careerSource":"Marketing, sales, brand management, digital marketing","domainIds":["CD036","CD047"]},
  {"id":"SUN-038","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Human Resource Management","name":"BBA Human Resource Management","streamSource":"Any stream","careerSource":"HR, recruitment, talent management, learning and development","domainIds":["CD043"]},
  {"id":"SUN-039","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"International Business","name":"BBA International Business","streamSource":"Any stream","careerSource":"International trade, global business, export-import","domainIds":["CD041","CD044"]},
  {"id":"SUN-040","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Business Analytics","name":"BBA Business Analytics","streamSource":"Any stream","careerSource":"Business analytics, data analytics, consulting, decision support","domainIds":["CD020","CD025"]},
  {"id":"SUN-041","school":"Commerce & Management Studies","level":"UG","course":"BBA Hons","specialization":"Financial Services","name":"BBA Hons Financial Services","streamSource":"Any stream","careerSource":"Banking, financial services, investment, insurance","domainIds":["CD033","CD045","CD039"]},
  {"id":"SUN-042","school":"Commerce & Management Studies","level":"UG","course":"BBA Hons","specialization":"Entrepreneurship","name":"BBA Hons Entrepreneurship","streamSource":"Any stream","careerSource":"Startups, entrepreneurship, business development","domainIds":["CD037"]},
  {"id":"SUN-043","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Digital Marketing","name":"BBA Digital Marketing","streamSource":"Any stream","careerSource":"Digital marketing, social media, performance marketing","domainIds":["CD036","CD047","CD076","CD027","CD035"]},
  {"id":"SUN-044","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"International Accounting & Finance, ACCA-UK","name":"BBA International Accounting & Finance, ACCA-UK","streamSource":"Any stream","careerSource":"Accounting, audit, taxation, finance","domainIds":["CD032"]},
  {"id":"SUN-045","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Aviation Management","name":"BBA Aviation Management","streamSource":"Any stream","careerSource":"Airports, airlines, aviation operations","domainIds":["CD005","CD046"]},
  {"id":"SUN-046","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Logistics & Supply Chain Management","name":"BBA Logistics & Supply Chain Management","streamSource":"Any stream","careerSource":"Logistics, procurement, supply chain, operations","domainIds":["CD046"]},
  {"id":"SUN-047","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Event Management & User Experience","name":"BBA Event Management & User Experience","streamSource":"Any stream","careerSource":"Events, experience design, customer experience","domainIds":["CD038","CD047","CD078"]},
  {"id":"SUN-048","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Global Management","name":"BBA Global Management","streamSource":"Any stream","careerSource":"International business, management, consulting","domainIds":["CD041","CD044"]},
  {"id":"SUN-049","school":"Commerce & Management Studies","level":"UG","course":"BBA","specialization":"Hospitality Management","name":"BBA Hospitality Management","streamSource":"Any stream","careerSource":"Hotels, hospitality, tourism, service management","domainIds":["CD042"]},
  {"id":"SUN-050","school":"Commerce & Management Studies","level":"UG","course":"B.Com","specialization":"Accounting & Finance","name":"B.Com Accounting & Finance","streamSource":"Any stream","careerSource":"Accounting, finance, taxation, audit","domainIds":["CD032"]},
  {"id":"SUN-051","school":"Commerce & Management Studies","level":"UG","course":"B.Com","specialization":"Costing","name":"B.Com Costing","streamSource":"Any stream","careerSource":"Accounting, finance, taxation, audit","domainIds":["CD032","CD034"]},
  {"id":"SUN-052","school":"Commerce & Management Studies","level":"PG","course":"New Age MBA","specialization":"Business Analytics","name":"New Age MBA Business Analytics","streamSource":"Any graduation","careerSource":"Business analytics, data analytics, consulting","domainIds":["CD020","CD025"]},
  {"id":"SUN-053","school":"Commerce & Management Studies","level":"PG","course":"New Age MBA","specialization":"Banking & Financial Services","name":"New Age MBA Banking & Financial Services","streamSource":"Any graduation","careerSource":"Banking, finance, insurance, financial services","domainIds":["CD033","CD039","CD045"]},
  {"id":"SUN-054","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Human Resource Management","name":"MBA Human Resource Management","streamSource":"Any graduation","careerSource":"HR, talent management, people analytics","domainIds":["CD043"]},
  {"id":"SUN-055","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Financial Management","name":"MBA Financial Management","streamSource":"Any graduation","careerSource":"Corporate finance, investment, financial planning","domainIds":["CD039","CD045","CD033"]},
  {"id":"SUN-056","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Marketing Management","name":"MBA Marketing Management","streamSource":"Any graduation","careerSource":"Marketing, sales, brand management","domainIds":["CD047"]},
  {"id":"SUN-057","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"International Business","name":"MBA International Business","streamSource":"Any graduation","careerSource":"Global business, export-import, international trade","domainIds":["CD041","CD044"]},
  {"id":"SUN-058","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Information Technology","name":"MBA Information Technology","streamSource":"Any graduation","careerSource":"IT management, technology consulting, digital systems","domainIds":["CD023"]},
  {"id":"SUN-059","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Fintech & Data Analytics","name":"MBA Fintech & Data Analytics","streamSource":"Any graduation","careerSource":"Fintech, financial analytics, data analytics","domainIds":["CD025","CD040"]},
  {"id":"SUN-060","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Logistics & Supply Chain Management","name":"MBA Logistics & Supply Chain Management","streamSource":"Any graduation","careerSource":"Supply chain, procurement, logistics, operations","domainIds":["CD046"]},
  {"id":"SUN-061","school":"Commerce & Management Studies","level":"PG","course":"MBA","specialization":"Entrepreneurship & Startup Management","name":"MBA Entrepreneurship & Startup Management","streamSource":"Any graduation","careerSource":"Entrepreneurship, startups, business development","domainIds":["CD037"]},
  {"id":"SUN-062","school":"Commerce & Management Studies","level":"PG","course":"MBA 4.0","specialization":"Artificial Intelligence","name":"MBA 4.0 Artificial Intelligence","streamSource":"Any graduation","careerSource":"AI strategy, intelligent systems, business technology","domainIds":["CD019"]},
  {"id":"SUN-063","school":"Commerce & Management Studies","level":"PG","course":"MBA 4.0","specialization":"Content Strategy","name":"MBA 4.0 Content Strategy","streamSource":"Any graduation","careerSource":"Content, digital media, brand strategy, communications","domainIds":["CD071","CD076"]},
  {"id":"SUN-064","school":"Commerce & Management Studies","level":"PG","course":"MBA 4.0","specialization":"Digital Transformation","name":"MBA 4.0 Digital Transformation","streamSource":"Any graduation","careerSource":"Digital strategy, transformation, technology consulting","domainIds":["CD023","CD027","CD035","CD036"]},
  {"id":"SUN-065","school":"Pharmaceutical Sciences","level":"Diploma","course":"D.Pharm","specialization":"General","name":"D.Pharm General","streamSource":"PCB/PCM","careerSource":"Pharmacy, dispensing, pharmacy operations","domainIds":["CD046","CD063","CD066"]},
  {"id":"SUN-066","school":"Pharmaceutical Sciences","level":"UG","course":"B.Pharm","specialization":"General","name":"B.Pharm General","streamSource":"PCB/PCM","careerSource":"Pharmacy, pharmaceutical industry, clinical research","domainIds":["CD063","CD066"]},
  {"id":"SUN-067","school":"Pharmaceutical Sciences","level":"PG","course":"M.Pharm","specialization":"Pharmaceutics","name":"M.Pharm Pharmaceutics","streamSource":"B.Pharm","careerSource":"Drug formulation, manufacturing, pharmaceutical R&D","domainIds":["CD013","CD063","CD064"]},
  {"id":"SUN-068","school":"Pharmaceutical Sciences","level":"PG","course":"M.Pharm","specialization":"Pharmacology","name":"M.Pharm Pharmacology","streamSource":"B.Pharm","careerSource":"Drug research, clinical research, pharmacovigilance","domainIds":["CD063","CD065"]},
  {"id":"SUN-069","school":"Pharmaceutical Sciences","level":"PG","course":"M.Pharm","specialization":"Pharmaceutical Quality Assurance","name":"M.Pharm Pharmaceutical Quality Assurance","streamSource":"B.Pharm","careerSource":"Quality assurance, quality control, regulatory affairs","domainIds":["CD062","CD063"]},
  {"id":"SUN-070","school":"Pharmaceutical Sciences","level":"PG","course":"M.Pharm","specialization":"Industrial Pharmacy","name":"M.Pharm Industrial Pharmacy","streamSource":"B.Pharm","careerSource":"Pharmaceutical manufacturing, production, quality","domainIds":["CD013","CD057","CD063","CD066"]},
  {"id":"SUN-071","school":"Law","level":"UG","course":"B.A. LL.B. (Hons.)","specialization":"General","name":"B.A. LL.B. (Hons.) General","streamSource":"Any stream","careerSource":"Law, litigation, legal research, public policy","domainIds":["CD018","CD051"]},
  {"id":"SUN-072","school":"Law","level":"UG","course":"B.B.A. LL.B. (Hons.)","specialization":"General","name":"B.B.A. LL.B. (Hons.) General","streamSource":"Any stream","careerSource":"Corporate law, business law, compliance","domainIds":["CD049","CD051"]},
  {"id":"SUN-073","school":"Law","level":"UG","course":"LL.B. (Hons.)","specialization":"General","name":"LL.B. (Hons.) General","streamSource":"Any graduation","careerSource":"Legal practice, litigation, corporate legal","domainIds":["CD051"]},
  {"id":"SUN-074","school":"Law","level":"PG","course":"LL.M.","specialization":"Criminal Law","name":"LL.M. Criminal Law","streamSource":"Law degree","careerSource":"Criminal litigation, prosecution, legal research","domainIds":["CD050","CD051"]},
  {"id":"SUN-075","school":"Law","level":"PG","course":"LL.M.","specialization":"Constitutional & Administrative Law","name":"LL.M. Constitutional & Administrative Law","streamSource":"Law degree","careerSource":"Constitutional law, public policy, government/legal practice","domainIds":["CD018","CD048","CD051"]},
  {"id":"SUN-076","school":"Law","level":"PG","course":"LL.M.","specialization":"Corporate & Commercial Law","name":"LL.M. Corporate & Commercial Law","streamSource":"Law degree","careerSource":"Corporate law, commercial contracts, compliance","domainIds":["CD049","CD051"]},
  {"id":"SUN-077","school":"Law","level":"PG","course":"LL.M.","specialization":"Mediation Law","name":"LL.M. Mediation Law","streamSource":"Law degree","careerSource":"Mediation, dispute resolution, legal practice","domainIds":["CD051","CD052"]},
  {"id":"SUN-078","school":"Science","level":"UG","course":"B.Sc","specialization":"Wine Technology","name":"B.Sc Wine Technology","streamSource":"Science","careerSource":"Wine production, food technology, quality control","domainIds":["CD013","CD062","CD068"]},
  {"id":"SUN-079","school":"Science","level":"UG","course":"B.Sc","specialization":"Nanoscience & Nanotechnology","name":"B.Sc Nanoscience & Nanotechnology","streamSource":"Science","careerSource":"Nanotechnology, materials science, research","domainIds":["CD061"]},
  {"id":"SUN-080","school":"Science","level":"UG","course":"B.Sc","specialization":"Microbiology","name":"B.Sc Microbiology","streamSource":"Science","careerSource":"Microbiology, biotech, pharmaceuticals, research","domainIds":["CD054","CD060"]},
  {"id":"SUN-081","school":"Science","level":"UG","course":"B.Sc","specialization":"Forensic Science","name":"B.Sc Forensic Science","streamSource":"Science","careerSource":"Forensics, crime labs, investigation support","domainIds":["CD056"]},
  {"id":"SUN-082","school":"Science","level":"UG","course":"B.Sc","specialization":"Computational Mathematics & Data Science","name":"B.Sc Computational Mathematics & Data Science","streamSource":"Science + Mathematics","careerSource":"Data science, analytics, mathematical modelling","domainIds":["CD022","CD026","CD059"]},
  {"id":"SUN-083","school":"Science","level":"UG","course":"B.Sc","specialization":"Chemistry","name":"B.Sc Chemistry","streamSource":"Science + Chemistry","careerSource":"Chemistry, laboratories, pharmaceuticals, research","domainIds":["CD055"]},
  {"id":"SUN-084","school":"Science","level":"UG","course":"B.Sc","specialization":"Physics","name":"B.Sc Physics","streamSource":"Science + Physics & Mathematics","careerSource":"Physics, research, electronics, scientific computing","domainIds":["CD011","CD067"]},
  {"id":"SUN-085","school":"Science","level":"UG","course":"B.Sc","specialization":"Forensic Science & Criminology","name":"B.Sc Forensic Science & Criminology","streamSource":"Science","careerSource":"Forensics, criminology, investigation support","domainIds":["CD056"]},
  {"id":"SUN-086","school":"Science","level":"PG","course":"M.Sc","specialization":"Chemistry, Organic/Analytical","name":"M.Sc Chemistry, Organic/Analytical","streamSource":"Relevant science degree","careerSource":"Chemical analysis, pharmaceuticals, research","domainIds":["CD055"]},
  {"id":"SUN-087","school":"Science","level":"PG","course":"M.Sc","specialization":"Physics","name":"M.Sc Physics","streamSource":"Relevant science degree","careerSource":"Physics, research, scientific computing","domainIds":["CD067"]},
  {"id":"SUN-088","school":"Science","level":"PG","course":"M.Sc","specialization":"Microbiology","name":"M.Sc Microbiology","streamSource":"Relevant science degree","careerSource":"Microbiology, biotech, pharmaceuticals","domainIds":["CD054","CD060"]},
  {"id":"SUN-089","school":"Science","level":"PG","course":"M.Sc","specialization":"Life Science","name":"M.Sc Life Science","streamSource":"Relevant science degree","careerSource":"Life sciences, research, biotech","domainIds":["CD054","CD058"]},
  {"id":"SUN-090","school":"Science","level":"PG","course":"M.Sc","specialization":"Mathematics","name":"M.Sc Mathematics","streamSource":"Relevant science degree","careerSource":"Mathematics, analytics, education, quantitative research","domainIds":["CD059"]},
  {"id":"SUN-091","school":"Science","level":"PG","course":"M.Sc","specialization":"Forensic Science","name":"M.Sc Forensic Science","streamSource":"Relevant science degree","careerSource":"Forensic laboratories, investigation, research","domainIds":["CD056"]},
  {"id":"SUN-092","school":"Design","level":"UG","course":"B.Sc","specialization":"Fashion & Apparel Design","name":"B.Sc Fashion & Apparel Design","streamSource":"Any stream","careerSource":"Fashion, apparel, merchandising","domainIds":["CD072"]},
  {"id":"SUN-093","school":"Design","level":"UG","course":"B.Sc","specialization":"Beauty Cosmetology","name":"B.Sc Beauty Cosmetology","streamSource":"Any stream","careerSource":"Beauty, cosmetology, wellness services","domainIds":["CD069"]},
  {"id":"SUN-094","school":"Design","level":"UG","course":"B.Sc","specialization":"Interior Design & Decoration","name":"B.Sc Interior Design & Decoration","streamSource":"Any stream","careerSource":"Interior design, space planning, decoration","domainIds":["CD075"]},
  {"id":"SUN-095","school":"Design","level":"UG","course":"B.Des","specialization":"Communication Design","name":"B.Des Communication Design","streamSource":"Any stream","careerSource":"Graphic design, communication, branding, UI/visual design","domainIds":["CD070","CD078","CD079"]},
  {"id":"SUN-096","school":"Design","level":"UG","course":"B.Des","specialization":"Product Design","name":"B.Des Product Design","streamSource":"Any stream","careerSource":"Product design, industrial design, innovation","domainIds":["CD077"]},
  {"id":"SUN-097","school":"Design","level":"UG","course":"B.Des","specialization":"Fashion & Lifestyle Design","name":"B.Des Fashion & Lifestyle Design","streamSource":"Any stream","careerSource":"Fashion, lifestyle, apparel, merchandising","domainIds":["CD072"]},
  {"id":"SUN-098","school":"Design","level":"UG","course":"B.Des","specialization":"Space & Interior Design","name":"B.Des Space & Interior Design","streamSource":"Any stream","careerSource":"Interior design, spatial design, architecture support","domainIds":["CD075"]},
  {"id":"SUN-099","school":"Design","level":"UG","course":"B.Des","specialization":"AI & Intelligent Product Media Design","name":"B.Des AI & Intelligent Product Media Design","streamSource":"Any stream","careerSource":"AI-enabled design, product/media design","domainIds":["CD019","CD076"]},
  {"id":"SUN-100","school":"Design","level":"UG","course":"B.Des","specialization":"Immersive Media & Game Design","name":"B.Des Immersive Media & Game Design","streamSource":"Any stream","careerSource":"Game design, immersive media, AR/VR","domainIds":["CD031","CD073","CD074","CD076"]},
  {"id":"SUN-101","school":"Design","level":"PG","course":"M.Sc","specialization":"Fashion & Apparel Design","name":"M.Sc Fashion & Apparel Design","streamSource":"Graduation","careerSource":"Fashion, apparel, design management","domainIds":["CD072"]},
  {"id":"SUN-102","school":"Design","level":"PG","course":"M.Sc","specialization":"Beauty Cosmetology","name":"M.Sc Beauty Cosmetology","streamSource":"Graduation","careerSource":"Beauty, cosmetology, wellness","domainIds":["CD069"]},
  {"id":"SUN-103","school":"Design","level":"PG","course":"M.Des","specialization":"User Experience Design","name":"M.Des User Experience Design","streamSource":"Graduation","careerSource":"UX, UI, product design, digital experiences","domainIds":["CD077","CD078"]},
  {"id":"SUN-104","school":"Design","level":"PG","course":"M.Des","specialization":"Visual Communication Design","name":"M.Des Visual Communication Design","streamSource":"Graduation","careerSource":"Visual communication, branding, graphic design","domainIds":["CD070","CD079"]},
  {"id":"SUN-105","school":"Design","level":"PG","course":"M.Des","specialization":"Game Design","name":"M.Des Game Design","streamSource":"Graduation","careerSource":"Game design, immersive media, gaming","domainIds":["CD073","CD074","CD076"]},
  {"id":"SUN-106","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Engineering & Applications","name":"Ph.D. Engineering & Applications","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD002","CD013","CD023"]},
  {"id":"SUN-107","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Pharmacy","name":"Ph.D. Pharmacy","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD066"]},
  {"id":"SUN-108","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Management","name":"Ph.D. Management","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD020","CD041"]},
  {"id":"SUN-109","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Commerce","name":"Ph.D. Commerce","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD032","CD039"]},
  {"id":"SUN-110","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Law","name":"Ph.D. Law","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD051"]},
  {"id":"SUN-111","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Sciences","name":"Ph.D. Sciences","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD055","CD058","CD067"]},
  {"id":"SUN-112","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"English","name":"Ph.D. English","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD071","CD076"]},
  {"id":"SUN-113","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Fashion & Apparel Design","name":"Ph.D. Fashion & Apparel Design","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD072"]},
  {"id":"SUN-114","school":"Doctoral","level":"PhD","course":"Ph.D.","specialization":"Beauty Cosmetology","name":"Ph.D. Beauty Cosmetology","streamSource":"Relevant Master's degree","careerSource":"Research, academia, specialized professional research","domainIds":["CD069"]}
];

export const STAGE1: Stage1Question[] = [
  {"id":"S1Q001","level":0,"levelName":"Explore","ugCase":"Your class runs a one-day snack stall. By lunchtime, two snacks have sold out while several others are still left.","pgCase":"A small retail team finds that a few products sell out early while others remain in stock at the end of the day.","prompt":"If you joined this project, which part would you enjoy taking on?","options":[{"id":"S1Q001_O01","text":"Spot the pattern in sales by hour to estimate how much of each snack to prepare.","dims":{"D01":3,"D02":1},"primaryDim":"D01","secondaryDim":"D02"},{"id":"S1Q001_O02","text":"Talk with people about buyers what influenced their choices and what they could not find.","dims":{"D12":3,"D14":1},"primaryDim":"D12","secondaryDim":"D14"},{"id":"S1Q001_O03","text":"Create a new version of the menu board so the overlooked snacks are easier to notice.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"S1Q001_O04","text":"Find a practical way to ingredient use and change the preparation steps to reduce avoidable waste.","dims":{"D06":3,"D19":1},"primaryDim":"D06","secondaryDim":"D19"},{"id":"S1Q001_O05","text":"Offer a small combo for one hour and see whether buying patterns change.","dims":{"D14":3,"D16":1},"primaryDim":"D14","secondaryDim":"D16"},{"id":"S1Q001_O06","text":"Work out the cost or resource effect of a stock-and-cost sheet that flags what needs replenishing and what is being wasted.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Pop-up market challenge","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q002","level":0,"levelName":"Explore","ugCase":"An inter-class tournament is running late because teams are arriving at the wrong time and score updates are missing.","pgCase":"A multi-team event is running behind schedule, and staff are receiving incomplete score updates.","prompt":"Which role would you choose if your team needed someone to help here?","options":[{"id":"S1Q002_O01","text":"Rearrange the match order with realistic gaps between games and a clear backup schedule.","dims":{"D13":3,"D17":1},"primaryDim":"D13","secondaryDim":"D17"},{"id":"S1Q002_O02","text":"Arrange a reliable live score display that can be updated quickly from the field.","dims":{"D05":3,"D19":1},"primaryDim":"D05","secondaryDim":"D19"},{"id":"S1Q002_O03","text":"Speak with team captains to find out where the arrival instructions failed.","dims":{"D10":3,"D12":1},"primaryDim":"D10","secondaryDim":"D12"},{"id":"S1Q002_O04","text":"Confirm whether the tournament rules so timing, ties and score corrections are handled consistently.","dims":{"D18":3,"D03":1},"primaryDim":"D18","secondaryDim":"D03"},{"id":"S1Q002_O05","text":"Redesign visible signs so teams know where to report and spectators know where to go.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"S1Q002_O06","text":"Get ready with a simple contingency plan for late teams, weather or equipment trouble.","dims":{"D20":3,"D06":1},"primaryDim":"D20","secondaryDim":"D06"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Sports-day operations","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q003","level":0,"levelName":"Explore","ugCase":"Two rows of the same plants are growing differently. One row gets more sunlight, but the watering pattern may also differ.","pgCase":"A small growing trial shows different results between plant groups, and several conditions may explain the difference.","prompt":"What would you be most curious to try in this situation?","options":[{"id":"S1Q003_O01","text":"Try a small experiment with sunlight, water and growth for each plant over several days.","dims":{"D04":3,"D02":1},"primaryDim":"D04","secondaryDim":"D02"},{"id":"S1Q003_O02","text":"Change only one condition in a small follow-up test to see whether growth changes.","dims":{"D04":3,"D20":1},"primaryDim":"D04","secondaryDim":"D20"},{"id":"S1Q003_O03","text":"Spot the pattern in leaf shape and growth patterns to identify what differs between the rows.","dims":{"D01":3,"D07":1},"primaryDim":"D01","secondaryDim":"D07"},{"id":"S1Q003_O04","text":"Find useful evidence from the person caring for the plants what routines differed between the rows.","dims":{"D07":3,"D12":1},"primaryDim":"D07","secondaryDim":"D12"},{"id":"S1Q003_O05","text":"Work with a simple moisture sensor or measuring tool to check the soil more consistently.","dims":{"D04":3,"D05":1},"primaryDim":"D04","secondaryDim":"D05"},{"id":"S1Q003_O06","text":"Convert the findings into a practical care guide other students could follow.","dims":{"D10":3,"D08":1},"primaryDim":"D10","secondaryDim":"D08"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Plant-growth investigation","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q004","level":0,"levelName":"Explore","ugCase":"The college lost-and-found box is full. Some claims are hard to verify, and nobody knows how long items have been waiting.","pgCase":"A workplace receives many lost-property claims, but items are poorly labelled and returns take too long.","prompt":"Which kind of contribution would feel most natural to you?","options":[{"id":"S1Q004_O01","text":"Give every item a dated code and build a clear search-and-return sequence.","dims":{"D03":3,"D19":1},"primaryDim":"D03","secondaryDim":"D19"},{"id":"S1Q004_O02","text":"Spot the pattern in which types of belongings stay unclaimed and when they are usually reported.","dims":{"D01":3,"D07":1},"primaryDim":"D01","secondaryDim":"D07"},{"id":"S1Q004_O03","text":"Shape a claim form that captures useful details without asking for unnecessary personal data.","dims":{"D18":3,"D08":1},"primaryDim":"D18","secondaryDim":"D08"},{"id":"S1Q004_O04","text":"Talk with people about students which parts of the current process are confusing or discouraging.","dims":{"D12":3,"D10":1},"primaryDim":"D12","secondaryDim":"D10"},{"id":"S1Q004_O05","text":"Set fair identity checks so belongings are not handed to the wrong person.","dims":{"D18":3,"D03":1},"primaryDim":"D18","secondaryDim":"D03"},{"id":"S1Q004_O06","text":"Organise the work around a rotation and reminder plan so collection, logging and storage do not depend on one person.","dims":{"D13":3,"D20":1},"primaryDim":"D13","secondaryDim":"D20"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Lost-and-found redesign","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q005","level":0,"levelName":"Explore","ugCase":"People say a busy crossing near a school feels unsafe. Drivers, walkers and cyclists use it at different times.","pgCase":"Residents report that a junction is difficult to cross, but the risks and busiest periods have not been mapped.","prompt":"If you had one afternoon to help, what would you pick?","options":[{"id":"S1Q005_O01","text":"Count pedestrian and vehicle movements at several times instead of relying on one observation.","dims":{"D07":3,"D02":1},"primaryDim":"D07","secondaryDim":"D02"},{"id":"S1Q005_O02","text":"Draw sightlines, walking paths and places where people have to step around obstacles.","dims":{"D06":3,"D09":1},"primaryDim":"D06","secondaryDim":"D09"},{"id":"S1Q005_O03","text":"Think about how children, older residents and people with mobility needs about their actual journeys. affects different people","dims":{"D11":3,"D12":1},"primaryDim":"D11","secondaryDim":"D12"},{"id":"S1Q005_O04","text":"Confirm whether whether visibility, crossing timing, weather or road layout explains the near-misses.","dims":{"D18":3,"D04":1},"primaryDim":"D18","secondaryDim":"D04"},{"id":"S1Q005_O05","text":"Sketch a low-cost change to markings or signs and make a small mock-up for feedback.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"S1Q005_O06","text":"Get ready with a ranked proposal and coordinate input from the groups responsible for the road.","dims":{"D17":3,"D13":1},"primaryDim":"D17","secondaryDim":"D13"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Busy-road crossing","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q006","level":0,"levelName":"Explore","ugCase":"A college festival poster looks attractive on a laptop, but students miss the date, venue and registration steps on their phones.","pgCase":"An event campaign draws attention but readers often overlook practical details on small screens and printed notices.","prompt":"Which part would you like to make better or easier?","options":[{"id":"S1Q006_O01","text":"Rearrange the headline, date and action steps so the most important details stand out instantly.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"S1Q006_O02","text":"Rewrite confusing sentences and check whether people with different reading levels understand them.","dims":{"D10":3,"D12":1},"primaryDim":"D10","secondaryDim":"D12"},{"id":"S1Q006_O03","text":"Redesign contrast, font size and layout across phone screens and printed copies.","dims":{"D09":3,"D05":1},"primaryDim":"D09","secondaryDim":"D05"},{"id":"S1Q006_O04","text":"Draw the visitor journey from entrance to venue and spot where a person could get lost.","dims":{"D09":3,"D03":1},"primaryDim":"D09","secondaryDim":"D03"},{"id":"S1Q006_O05","text":"Share two versions to different students and compare what each person remembers.","dims":{"D07":3,"D01":1},"primaryDim":"D07","secondaryDim":"D01"},{"id":"S1Q006_O06","text":"Choose between the changes that improve clarity most while staying within the printing budget.","dims":{"D17":3,"D15":1},"primaryDim":"D17","secondaryDim":"D15"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Festival information design","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q007","level":1,"levelName":"Look for clues","ugCase":"Your class can take one trip, but the budget must cover travel, entry fees, food and unexpected costs.","pgCase":"A department has a fixed budget for an off-site learning visit and needs a realistic itinerary with contingency room.","prompt":"What would you enjoy being responsible for?","options":[{"id":"S1Q007_O01","text":"Work out the cost or resource effect of a per-person estimate that includes the small costs people often forget.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"S1Q007_O02","text":"Hear and note preferences first so the destination is not chosen by the loudest voices alone.","dims":{"D12":3,"D17":1},"primaryDim":"D12","secondaryDim":"D17"},{"id":"S1Q007_O03","text":"Work out how travel time, route options and activity timings to avoid a rushed day.","dims":{"D03":3,"D01":1},"primaryDim":"D03","secondaryDim":"D01"},{"id":"S1Q007_O04","text":"Confirm whether permission, accessibility, safety and what happens if the weather changes.","dims":{"D18":3,"D20":1},"primaryDim":"D18","secondaryDim":"D20"},{"id":"S1Q007_O05","text":"Create a balanced itinerary that combines a useful visit with enough time to enjoy it.","dims":{"D08":3,"D13":1},"primaryDim":"D08","secondaryDim":"D13"},{"id":"S1Q007_O06","text":"Contact venues or transport providers to ask about group rates and practical arrangements.","dims":{"D14":3,"D10":1},"primaryDim":"D14","secondaryDim":"D10"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Class-trip planning","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q008","level":1,"levelName":"Look for clues","ugCase":"A team escape-room puzzle has several clues. One symbol appears on two cards, and the obvious answer makes another clue impossible.","pgCase":"During a timed puzzle challenge, two pieces of evidence seem to conflict and the first solution breaks the logic of the final clue.","prompt":"Which way of working on the problem would appeal to you?","options":[{"id":"S1Q008_O01","text":"Draw a diagram showing how each clue could connect to the others.","dims":{"D03":3,"D01":1},"primaryDim":"D03","secondaryDim":"D01"},{"id":"S1Q008_O02","text":"Try a small experiment with one assumption at a time and keep track of which result rules it in or out.","dims":{"D04":3,"D07":1},"primaryDim":"D04","secondaryDim":"D07"},{"id":"S1Q008_O03","text":"Split the clues into groups and assign each person a different line to inspect.","dims":{"D13":3,"D03":1},"primaryDim":"D13","secondaryDim":"D03"},{"id":"S1Q008_O04","text":"Look for a misread symbol or an unstated rule before accepting the obvious answer.","dims":{"D18":3,"D01":1},"primaryDim":"D18","secondaryDim":"D01"},{"id":"S1Q008_O05","text":"Move the cards or make a quick physical model to see whether a new arrangement reveals a pattern.","dims":{"D19":3,"D08":1},"primaryDim":"D19","secondaryDim":"D08"},{"id":"S1Q008_O06","text":"Tell a teammate about your reasoning aloud and invite a teammate to find the weak step.","dims":{"D10":3,"D03":1},"primaryDim":"D10","secondaryDim":"D03"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Escape-room clue puzzle","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q009","level":1,"levelName":"Look for clues","ugCase":"Students say the library is crowded at some times and almost empty at others. Nobody has measured the pattern carefully.","pgCase":"A shared study facility receives complaints about crowding, although usage figures and preferred spaces are incomplete.","prompt":"If your idea had to become useful, where would you want to start?","options":[{"id":"S1Q009_O01","text":"Count occupancy in different areas and time slots across several days.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q009_O02","text":"Talk with people about students which activities they need space for and what makes them move elsewhere.","dims":{"D12":3,"D10":1},"primaryDim":"D12","secondaryDim":"D10"},{"id":"S1Q009_O03","text":"Confirm whether whether the counts include every floor, entrance and type of user.","dims":{"D18":3,"D07":1},"primaryDim":"D18","secondaryDim":"D07"},{"id":"S1Q009_O04","text":"Propose a booking or zoning plan that matches quiet study, group work and peak times.","dims":{"D06":3,"D13":1},"primaryDim":"D06","secondaryDim":"D13"},{"id":"S1Q009_O05","text":"Redesign a visual view of busy periods so the pattern is easy to understand.","dims":{"D09":3,"D01":1},"primaryDim":"D09","secondaryDim":"D09"},{"id":"S1Q009_O06","text":"Choose among possible changes using likely impact and effort.","dims":{"D17":3,"D01":1},"primaryDim":"D17","secondaryDim":"D01"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Library-space study","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q010","level":1,"levelName":"Look for clues","ugCase":"A campus wants to reduce water waste, but it is unclear whether the biggest issue is leaking taps, cleaning routines or daily habits.","pgCase":"A facility is trying to lower water use and needs to distinguish equipment problems from changes in behaviour.","prompt":"Which job would you happily own from start to finish?","options":[{"id":"S1Q010_O01","text":"Build or operate something around taps, pipes and refill points to find visible faults and measure flow.","dims":{"D19":3,"D06":1},"primaryDim":"D19","secondaryDim":"D06"},{"id":"S1Q010_O02","text":"Use the numbers in meter readings across weeks and relate them to occupancy or weather.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q010_O03","text":"Talk with people about where people leave taps running and learn what makes the habit likely.","dims":{"D12":3,"D11":1},"primaryDim":"D12","secondaryDim":"D11"},{"id":"S1Q010_O04","text":"Give a small trial to different reminder labels and see which wording or location changes behaviour.","dims":{"D04":3,"D08":1},"primaryDim":"D04","secondaryDim":"D08"},{"id":"S1Q010_O05","text":"Set a maintenance log with an owner and a follow-up date for each reported issue.","dims":{"D13":3,"D17":1},"primaryDim":"D13","secondaryDim":"D17"},{"id":"S1Q010_O06","text":"Work out the cost or resource effect of the cost and savings from a simple water-saving device before recommending it.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Water-use improvement","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q011","level":1,"levelName":"Look for clues","ugCase":"You need to make a one-minute video that helps new students sort common waste correctly. Several items are easy to confuse.","pgCase":"A communications team must create a short guide for sorting waste, including examples people commonly misclassify.","prompt":"Which part of the project sounds most interesting to you?","options":[{"id":"S1Q011_O01","text":"Film close-up examples of confusing items and show the bin they belong in.","dims":{"D05":3,"D09":1},"primaryDim":"D05","secondaryDim":"D09"},{"id":"S1Q011_O02","text":"Confirm whether each sorting rule against a reliable source before filming the advice.","dims":{"D18":3,"D07":1},"primaryDim":"D18","secondaryDim":"D07"},{"id":"S1Q011_O03","text":"Invent a better version of a short story that follows one item from use to the right next step.","dims":{"D08":3,"D10":1},"primaryDim":"D08","secondaryDim":"D10"},{"id":"S1Q011_O04","text":"Share a rough cut to students and note where they misunderstand the message.","dims":{"D12":3,"D07":1},"primaryDim":"D12","secondaryDim":"D07"},{"id":"S1Q011_O05","text":"Map out the equipment, locations and filming sequence so the shoot stays on track.","dims":{"D03":3,"D13":1},"primaryDim":"D03","secondaryDim":"D13"},{"id":"S1Q011_O06","text":"Spot the pattern in views with a later check of whether people sort the items more accurately.","dims":{"D01":3,"D07":1},"primaryDim":"D01","secondaryDim":"D07"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Short explainer-video project","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q012","level":1,"levelName":"Look for clues","ugCase":"At lunch, the canteen queue blocks the entrance. Students wait a long time even when some serving counters look free.","pgCase":"A cafeteria has long peak-time queues, but staff are unsure whether the main bottleneck is ordering, payment or collection.","prompt":"If you could change one part of the experience, what would you work on?","options":[{"id":"S1Q012_O01","text":"Work out how the steps from joining the line to receiving food and spot unnecessary movement.","dims":{"D03":3,"D01":1},"primaryDim":"D03","secondaryDim":"D01"},{"id":"S1Q012_O02","text":"Time waits at different stages and compare busy periods instead of guessing.","dims":{"D01":3,"D02":1},"primaryDim":"D01","secondaryDim":"D02"},{"id":"S1Q012_O03","text":"Trial digital tokens or advance ordering with a small group before changing the whole system.","dims":{"D05":3,"D16":1},"primaryDim":"D05","secondaryDim":"D16"},{"id":"S1Q012_O04","text":"Move the pickup point or separate two tasks so people do not block one another.","dims":{"D06":3,"D19":1},"primaryDim":"D06","secondaryDim":"D19"},{"id":"S1Q012_O05","text":"Think about how whether the menu, payment setup or crowding creates extra difficulty for some students. affects different people","dims":{"D11":3,"D12":1},"primaryDim":"D11","secondaryDim":"D12"},{"id":"S1Q012_O06","text":"Choose between how much time and food waste each possible change could save.","dims":{"D17":3,"D15":1},"primaryDim":"D17","secondaryDim":"D15"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Canteen queue redesign","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q013","level":1,"levelName":"Look for clues","ugCase":"A dramatic claim is spreading in a class group chat. The post has a chart and a photograph, but gives no clear source.","pgCase":"A widely shared post makes a strong claim with a chart and image, but its original source and context are unclear.","prompt":"Which response would you feel comfortable standing behind?","options":[{"id":"S1Q013_O01","text":"Find useful evidence from the statement to its earliest available source and check its date.","dims":{"D07":3,"D18":1},"primaryDim":"D07","secondaryDim":"D18"},{"id":"S1Q013_O02","text":"Recalculate the figures and check whether the chart supports the headline.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q013_O03","text":"Find useful evidence from independent reports and look for explanations the post leaves out.","dims":{"D07":3,"D18":1},"primaryDim":"D07","secondaryDim":"D18"},{"id":"S1Q013_O04","text":"Redesign how the image, caption and crop might change the impression.","dims":{"D09":3,"D10":1},"primaryDim":"D09","secondaryDim":"D10"},{"id":"S1Q013_O05","text":"Think about who could be unfairly harmed if the claim is wrong and spreads further.","dims":{"D11":3,"D17":1},"primaryDim":"D11","secondaryDim":"D17"},{"id":"S1Q013_O06","text":"Write a short response that clearly separates confirmed facts from uncertainty.","dims":{"D10":3,"D18":1},"primaryDim":"D10","secondaryDim":"D18"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Online-claim verification","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q014","level":2,"levelName":"Try ideas","ugCase":"A student book exchange receives many copies of the same titles but very few books in some subjects students want.","pgCase":"A community book-swap scheme has uneven donations: repeated copies pile up while some requested categories are missing.","prompt":"What would you most like to contribute to the team?","options":[{"id":"S1Q014_O01","text":"Sort donations and compare the collection against the subjects people request.","dims":{"D01":3,"D03":1},"primaryDim":"D01","secondaryDim":"D03"},{"id":"S1Q014_O02","text":"Talk with people about potential borrowers what they actually want to read, not only what they already own.","dims":{"D12":3,"D10":1},"primaryDim":"D12","secondaryDim":"D10"},{"id":"S1Q014_O03","text":"Invent a better version of a swap format that makes useful books easier to discover and encourages new donations.","dims":{"D08":3,"D14":1},"primaryDim":"D08","secondaryDim":"D14"},{"id":"S1Q014_O04","text":"Arrange a simple catalogue and check-out process so titles can be found and returned.","dims":{"D05":3,"D03":1},"primaryDim":"D05","secondaryDim":"D03"},{"id":"S1Q014_O05","text":"Shape a fair approach for students who cannot donate a book but still want to borrow.","dims":{"D11":3,"D17":1},"primaryDim":"D11","secondaryDim":"D17"},{"id":"S1Q014_O06","text":"Map out themed collection days with clear roles, reminders and a closing inventory.","dims":{"D13":3,"D20":1},"primaryDim":"D13","secondaryDim":"D20"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Book-exchange project","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q015","level":2,"levelName":"Try ideas","ugCase":"A bicycle used for a community ride develops a squeak after rain. The organiser wants it checked before anyone rides it again.","pgCase":"A shared bicycle makes an unfamiliar noise after wet weather and must be inspected before being returned to service.","prompt":"Which hands-on or thinking task would suit you best?","options":[{"id":"S1Q015_O01","text":"Build or operate something around the moving parts, identify wear and check each fitting in a safe order.","dims":{"D19":3,"D18":1},"primaryDim":"D19","secondaryDim":"D18"},{"id":"S1Q015_O02","text":"Spot the pattern in when the sound happens and compare it with weather, speed and braking.","dims":{"D01":3,"D03":1},"primaryDim":"D01","secondaryDim":"D03"},{"id":"S1Q015_O03","text":"Work with a safety checklist to decide which issues mean it must not be ridden.","dims":{"D18":3,"D17":1},"primaryDim":"D18","secondaryDim":"D17"},{"id":"S1Q015_O04","text":"Find useful evidence from the rider what changed and exactly when the noise started.","dims":{"D07":3,"D10":1},"primaryDim":"D07","secondaryDim":"D10"},{"id":"S1Q015_O05","text":"Give a small trial to one appropriate adjustment at a time and re-check the result.","dims":{"D20":3,"D06":1},"primaryDim":"D20","secondaryDim":"D06"},{"id":"S1Q015_O06","text":"Draw a simple illustrated guide so the next volunteer can recognise the same warning signs.","dims":{"D09":3,"D10":1},"primaryDim":"D09","secondaryDim":"D10"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Bicycle fault investigation","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q016","level":2,"levelName":"Try ideas","ugCase":"The main performer at a college event cancels on the day. Guests are arriving, and the replacement must fit the time and budget available.","pgCase":"A headline speaker withdraws hours before an event, leaving a gap in the programme and uncertain supplier costs.","prompt":"If the team needed help right now, which role would you take?","options":[{"id":"S1Q016_O01","text":"Choose between realistic replacement choices and decide which keeps the event worthwhile.","dims":{"D17":3,"D14":1},"primaryDim":"D17","secondaryDim":"D14"},{"id":"S1Q016_O02","text":"Rearrange the run sheet and make sure every session has a clear owner.","dims":{"D13":3,"D03":1},"primaryDim":"D13","secondaryDim":"D03"},{"id":"S1Q016_O03","text":"Send an honest update to guests that explains the change and what they can expect.","dims":{"D10":3,"D12":1},"primaryDim":"D10","secondaryDim":"D12"},{"id":"S1Q016_O04","text":"Try a different approach to an interactive backup activity that could work with the people and materials already present.","dims":{"D20":3,"D08":1},"primaryDim":"D20","secondaryDim":"D08"},{"id":"S1Q016_O05","text":"Work out the cost or resource effect of refund, supplier and extra staffing costs before promising an alternative.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"S1Q016_O06","text":"Organise the work around crowd flow, equipment, access needs and responsibilities for the revised plan.","dims":{"D13":3,"D19":1},"primaryDim":"D13","secondaryDim":"D19"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Last-minute event change","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q017","level":2,"levelName":"Try ideas","ugCase":"Students and teachers disagree about a proposed phone rule in a shared study area. Each side gives different reasons for its view.","pgCase":"A workplace is considering a device-use policy, and stakeholders disagree about focus, flexibility and fair exceptions.","prompt":"Which part of the discussion would you be most willing to lead or support?","options":[{"id":"S1Q017_O01","text":"Bring together views from different groups with the same set of neutral questions.","dims":{"D07":3,"D10":1},"primaryDim":"D07","secondaryDim":"D10"},{"id":"S1Q017_O02","text":"Spot the pattern in examples and evidence about how different rules affect focus and participation.","dims":{"D01":3,"D18":1},"primaryDim":"D01","secondaryDim":"D18"},{"id":"S1Q017_O03","text":"Understand how the rule affects people with different responsibilities or access needs.","dims":{"D12":3,"D11":1},"primaryDim":"D12","secondaryDim":"D11"},{"id":"S1Q017_O04","text":"Write a first version of a trial policy with clear exceptions and a date to review the result.","dims":{"D17":3,"D20":1},"primaryDim":"D17","secondaryDim":"D20"},{"id":"S1Q017_O05","text":"Tell the team about a plain-language summary that shows the trade-offs without taking cheap shots at either side.","dims":{"D10":3,"D03":1},"primaryDim":"D10","secondaryDim":"D03"},{"id":"S1Q017_O06","text":"Define simple measures to check whether the new approach improves the space.","dims":{"D07":3,"D02":1},"primaryDim":"D07","secondaryDim":"D02"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Shared-space rule debate","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q018","level":2,"levelName":"Try ideas","ugCase":"Your group wants to sell reusable notebooks at a college event, but it has not confirmed demand, price or how the notebooks should look.","pgCase":"A small team is considering a reusable stationery product and needs to validate the buyer, cost and first batch before committing.","prompt":"If you had to turn this idea into a small trial, what would you enjoy doing?","options":[{"id":"S1Q018_O01","text":"Try a customer-focused change to likely buyers which size, paper style and features they would actually pay for.","dims":{"D14":3,"D12":1},"primaryDim":"D14","secondaryDim":"D12"},{"id":"S1Q018_O02","text":"Use the numbers in unit cost, a sensible price range and how many must sell to cover expenses.","dims":{"D02":3,"D15":1},"primaryDim":"D02","secondaryDim":"D15"},{"id":"S1Q018_O03","text":"Mock up several covers and labels, then compare which one communicates the idea best.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"S1Q018_O04","text":"Draw suppliers, delivery steps and how stock will reach the stall on time.","dims":{"D03":3,"D13":1},"primaryDim":"D03","secondaryDim":"D13"},{"id":"S1Q018_O05","text":"Take pre-orders for a tiny batch to see whether people follow interest with action.","dims":{"D16":3,"D04":1},"primaryDim":"D16","secondaryDim":"D04"},{"id":"S1Q018_O06","text":"Look for a way to reduce packaging while keeping the product affordable and durable.","dims":{"D15":3,"D18":1},"primaryDim":"D15","secondaryDim":"D18"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Reusable-notebook idea","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q019","level":2,"levelName":"Try ideas","ugCase":"A student club launches an online quiz for a campus event. Many people open it, but a lot leave before finishing. The team does not know why.","pgCase":"A service team sees that many users start a short online assessment but few finish. Usage data is incomplete and feedback is mixed.","prompt":"Which part would keep you interested long enough to improve it?","options":[{"id":"S1Q019_O01","text":"Use the numbers in how many people start, finish and leave at each step.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q019_O02","text":"Talk with people about students what confused or discouraged them before they stopped.","dims":{"D12":3,"D07":1},"primaryDim":"D12","secondaryDim":"D07"},{"id":"S1Q019_O03","text":"Give a small trial to the quiz on different phones and inspect any slow or broken steps.","dims":{"D05":3,"D19":1},"primaryDim":"D05","secondaryDim":"D19"},{"id":"S1Q019_O04","text":"Try a small experiment with two instruction layouts and compare which one helps more people finish.","dims":{"D04":3,"D09":1},"primaryDim":"D04","secondaryDim":"D09"},{"id":"S1Q019_O05","text":"Rewrite the instructions in plain language and include one worked example.","dims":{"D10":3,"D08":1},"primaryDim":"D10","secondaryDim":"D08"},{"id":"S1Q019_O06","text":"Trial one small change with a group, collect feedback and revise it.","dims":{"D06":3,"D20":1},"primaryDim":"D06","secondaryDim":"D20"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Online quiz drop-off","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q020","level":2,"levelName":"Try ideas","ugCase":"A team is scoring less in the second half of matches. There are match scores, short video clips and players’ comments.","pgCase":"A performance team notices that results weaken later in competition and has records, video and participant feedback to review.","prompt":"What would you like to learn by doing in this situation?","options":[{"id":"S1Q020_O01","text":"Use the numbers in first-half and second-half results across several matches to spot a consistent pattern.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q020_O02","text":"Spot the pattern in short clips to see whether player positions or movement leave repeated gaps.","dims":{"D01":3,"D05":1},"primaryDim":"D01","secondaryDim":"D05"},{"id":"S1Q020_O03","text":"Tell the team about players how communication, tiredness or confidence changes as the match goes on.","dims":{"D10":3,"D12":1},"primaryDim":"D10","secondaryDim":"D12"},{"id":"S1Q020_O04","text":"Try a small experiment with one change during practice and compare the outcome with the usual approach.","dims":{"D04":3,"D20":1},"primaryDim":"D04","secondaryDim":"D20"},{"id":"S1Q020_O05","text":"Diagram a play so each person can see the role and timing of the next move.","dims":{"D09":3,"D13":1},"primaryDim":"D09","secondaryDim":"D13"},{"id":"S1Q020_O06","text":"Confirm whether whether the score records and match conditions are comparable before interpreting the pattern.","dims":{"D18":3,"D02":1},"primaryDim":"D18","secondaryDim":"D02"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Sports-performance pattern","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q021","level":3,"levelName":"Compare choices","ugCase":"A local animal shelter needs funds for supplies. The group has volunteers but must choose an event that is useful and affordable.","pgCase":"A community organisation needs to raise money for essential supplies without overloading a small volunteer team.","prompt":"Which contribution would make you feel useful to the group?","options":[{"id":"S1Q021_O01","text":"Work out the cost or resource effect of likely donations, event expenses and a realistic target before choosing the format.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"S1Q021_O02","text":"Tell the team about a respectful story about the need, with permission from the people featured.","dims":{"D10":3,"D18":1},"primaryDim":"D10","secondaryDim":"D18"},{"id":"S1Q021_O03","text":"Map out outreach for groups likely to support the cause and tailor the invitation.","dims":{"D14":3,"D12":1},"primaryDim":"D14","secondaryDim":"D12"},{"id":"S1Q021_O04","text":"Run a small pilot of a small activity-and-donation bundle and check whether visitors choose it, rather than only donating.","dims":{"D14":3,"D16":1},"primaryDim":"D14","secondaryDim":"D16"},{"id":"S1Q021_O05","text":"Contact possible partners and coordinate volunteer shifts on the event day.","dims":{"D13":3,"D10":1},"primaryDim":"D13","secondaryDim":"D10"},{"id":"S1Q021_O06","text":"Keep track of pledges, actual payments and follow-up messages so funds are accounted for.","dims":{"D15":3,"D18":1},"primaryDim":"D15","secondaryDim":"D18"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Community fundraiser","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q022","level":3,"levelName":"Compare choices","ugCase":"You have a free weekend and can learn through a small project. No one will grade it, and you can choose your own goal.","pgCase":"You can set aside a weekend for self-directed learning and pick a project based on the kind of progress you enjoy making.","prompt":"If you chose this as a weekend project, what would you want to make or learn?","options":[{"id":"S1Q022_O01","text":"Use a digital tool to a tiny game with rules, choices and feedback that make it fun to try again.","dims":{"D05":3,"D08":1},"primaryDim":"D05","secondaryDim":"D08"},{"id":"S1Q022_O02","text":"Repair or assemble a useful object from parts and materials you can access.","dims":{"D19":3,"D06":1},"primaryDim":"D19","secondaryDim":"D06"},{"id":"S1Q022_O03","text":"Try a small experiment with an unexpected question about the natural world and test what you find.","dims":{"D04":3,"D07":1},"primaryDim":"D04","secondaryDim":"D07"},{"id":"S1Q022_O04","text":"Work out the cost or resource effect of a simple tracker that helps you understand or manage spending.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"S1Q022_O05","text":"Teach a beginner a skill using examples and a way for them to practise.","dims":{"D10":3,"D12":1},"primaryDim":"D10","secondaryDim":"D12"},{"id":"S1Q022_O06","text":"Convert a common annoyance into a tiny service and see whether one person will use it.","dims":{"D16":3,"D14":1},"primaryDim":"D16","secondaryDim":"D14"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Weekend learning challenge","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q023","level":3,"levelName":"Compare choices","ugCase":"The canteen throws away leftovers every day. Staff suspect some portions are too large, but students may also be choosing meals they do not enjoy.","pgCase":"A food service has regular surplus and needs to separate portion-size, menu-choice and storage causes before changing operations.","prompt":"Which direction would you be most excited to explore?","options":[{"id":"S1Q023_O01","text":"Weigh leftovers by meal and time slot to establish where most waste occurs.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q023_O02","text":"Spot the pattern in portion size and menu choices with what people actually finish.","dims":{"D01":3,"D04":1},"primaryDim":"D01","secondaryDim":"D04"},{"id":"S1Q023_O03","text":"Tell the team about diners what made them leave food and which alternative they would choose.","dims":{"D10":3,"D12":1},"primaryDim":"D10","secondaryDim":"D12"},{"id":"S1Q023_O04","text":"Map out a safe surplus-sharing route with clear handling and handover rules.","dims":{"D18":3,"D11":1},"primaryDim":"D18","secondaryDim":"D11"},{"id":"S1Q023_O05","text":"Create a new version of the serving choices so people can select a suitable portion more easily.","dims":{"D08":3,"D09":1},"primaryDim":"D08","secondaryDim":"D09"},{"id":"S1Q023_O06","text":"Trial a small end-of-day meal bundle and check whether diners choose it without adding to waste.","dims":{"D14":3,"D16":1},"primaryDim":"D14","secondaryDim":"D16"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Food-waste check","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q024","level":3,"levelName":"Compare choices","ugCase":"Visitors to a campus event include people with different mobility, hearing, vision and reading needs. Some cannot follow the current instructions easily.","pgCase":"An event team must make arrival instructions usable by visitors with varied access needs and communication preferences.","prompt":"What would you like to take care of for the people using this service?","options":[{"id":"S1Q024_O01","text":"Redesign the route with people who use mobility aids and note where space or directions fail.","dims":{"D09":3,"D11":1},"primaryDim":"D09","secondaryDim":"D11"},{"id":"S1Q024_O02","text":"Rewrite directions in plain language and put the steps in the order visitors need them.","dims":{"D10":3,"D03":1},"primaryDim":"D10","secondaryDim":"D03"},{"id":"S1Q024_O03","text":"Redesign contrast, print size, captions and alternative formats before sending materials out.","dims":{"D09":3,"D18":1},"primaryDim":"D09","secondaryDim":"D18"},{"id":"S1Q024_O04","text":"Organise staff support points so visitors know where to ask and what help is available.","dims":{"D13":3,"D10":1},"primaryDim":"D13","secondaryDim":"D10"},{"id":"S1Q024_O05","text":"Invite an accessibility group to review the plan while changes are still easy to make.","dims":{"D11":3,"D12":1},"primaryDim":"D11","secondaryDim":"D12"},{"id":"S1Q024_O06","text":"Redesign a small sample sign or route card and test whether people can use it unaided.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Accessible event guidance","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q025","level":3,"levelName":"Compare choices","ugCase":"Two online reviews disagree about the same low-cost device. One gives it a glowing rating; the other says it failed quickly.","pgCase":"A purchasing team finds contradictory product reviews and needs a balanced view before recommending a low-cost device.","prompt":"Which approach would help you feel confident about your choice?","options":[{"id":"S1Q025_O01","text":"Find useful evidence from verified feedback over time and see whether the same issue appears repeatedly.","dims":{"D07":3,"D01":1},"primaryDim":"D07","secondaryDim":"D01"},{"id":"S1Q025_O02","text":"Confirm whether whether the reviews explain real use, sponsorship or how the item was tested.","dims":{"D18":3,"D07":1},"primaryDim":"D18","secondaryDim":"D07"},{"id":"S1Q025_O03","text":"Match each review against the conditions in which you would actually use the device.","dims":{"D17":3,"D05":1},"primaryDim":"D17","secondaryDim":"D05"},{"id":"S1Q025_O04","text":"Spot the pattern in a side-by-side comparison of features, trade-offs and what is still unknown.","dims":{"D01":3,"D17":1},"primaryDim":"D01","secondaryDim":"D17"},{"id":"S1Q025_O05","text":"Look for a safe trial, warranty or return policy that could reduce the risk of a decision.","dims":{"D18":3,"D17":1},"primaryDim":"D18","secondaryDim":"D17"},{"id":"S1Q025_O06","text":"Write a balanced summary that separates observed facts from personal preference.","dims":{"D10":3,"D18":1},"primaryDim":"D10","secondaryDim":"D18"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Conflicting product reviews","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q026","level":3,"levelName":"Compare choices","ugCase":"A power cut happens during an evening college event. Some areas are dark, charging equipment has stopped, and guests need clear instructions.","pgCase":"A venue loses power mid-event. The team must protect guests, keep essential communication working and decide what can safely continue.","prompt":"What responsibility would you be happiest to take?","options":[{"id":"S1Q026_O01","text":"Guide people away from dark or crowded areas and keep exits clear.","dims":{"D18":3,"D06":1},"primaryDim":"D18","secondaryDim":"D06"},{"id":"S1Q026_O02","text":"Arrange backup lighting or power for only the equipment needed for safety and communication.","dims":{"D19":3,"D06":1},"primaryDim":"D19","secondaryDim":"D06"},{"id":"S1Q026_O03","text":"Bring people together to headcounts, assigned roles and a check-in process for each area.","dims":{"D13":3,"D03":1},"primaryDim":"D13","secondaryDim":"D03"},{"id":"S1Q026_O04","text":"Send calm updates through more than one channel so people do not rely on the PA system alone.","dims":{"D10":3,"D05":1},"primaryDim":"D10","secondaryDim":"D05"},{"id":"S1Q026_O05","text":"Choose which activities pause by comparing urgency, risk and available support.","dims":{"D17":3,"D20":1},"primaryDim":"D17","secondaryDim":"D20"},{"id":"S1Q026_O06","text":"Spot the pattern in what failed and when so future events can prevent a repeat.","dims":{"D01":3,"D07":1},"primaryDim":"D01","secondaryDim":"D07"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Power-cut response","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q027","level":3,"levelName":"Compare choices","ugCase":"A student group is selling homemade snacks. It wants packaging that protects the food during travel without becoming too costly or wasteful.","pgCase":"A small food producer is comparing package options for protection, usability, cost and material waste.","prompt":"Which part of this trade-off would you enjoy working through?","options":[{"id":"S1Q027_O01","text":"Confirm whether how well each package protects the food after a realistic journey and waiting period.","dims":{"D18":3,"D04":1},"primaryDim":"D18","secondaryDim":"D04"},{"id":"S1Q027_O02","text":"Redesign people to open, carry and store sample packs, then note awkward steps.","dims":{"D09":3,"D12":1},"primaryDim":"D09","secondaryDim":"D12"},{"id":"S1Q027_O03","text":"Work out the cost or resource effect of the per-item price and amount of material each design consumes.","dims":{"D15":3,"D02":1},"primaryDim":"D15","secondaryDim":"D02"},{"id":"S1Q027_O04","text":"Reduce unnecessary wrapping without hiding ingredients or handling information.","dims":{"D08":3,"D09":1},"primaryDim":"D08","secondaryDim":"D09"},{"id":"S1Q027_O05","text":"Talk with people about where buyers keep the snack and how long they need it to remain usable.","dims":{"D12":3,"D14":1},"primaryDim":"D12","secondaryDim":"D14"},{"id":"S1Q027_O06","text":"Offer a reusable-pack return trial and check whether customers bring containers back instead of discarding them.","dims":{"D16":3,"D11":1},"primaryDim":"D16","secondaryDim":"D11"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Packaging trial","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q028","level":4,"levelName":"Make a thoughtful decision","ugCase":"Your group project is falling behind. Two members disagree about priorities, and others are unsure what they should finish next.","pgCase":"A cross-functional project is slipping because priorities differ and several contributors do not know which deliverable they own.","prompt":"How would you like to help the team move forward?","options":[{"id":"S1Q028_O01","text":"Convert the remaining work into a shared timeline with one owner and a due date for each task.","dims":{"D13":3,"D03":1},"primaryDim":"D13","secondaryDim":"D03"},{"id":"S1Q028_O02","text":"Hear each person’s concern separately before deciding what the disagreement is really about.","dims":{"D12":3,"D10":1},"primaryDim":"D12","secondaryDim":"D10"},{"id":"S1Q028_O03","text":"List what is known, what is assumed and what needs checking before choosing a solution.","dims":{"D01":3,"D07":1},"primaryDim":"D01","secondaryDim":"D07"},{"id":"S1Q028_O04","text":"Propose a revised division of work and add a short checkpoint to learn whether it works.","dims":{"D20":3,"D06":1},"primaryDim":"D20","secondaryDim":"D06"},{"id":"S1Q028_O05","text":"Help everyone agree on the shared outcome, even if they prefer different methods.","dims":{"D10":3,"D11":1},"primaryDim":"D10","secondaryDim":"D11"},{"id":"S1Q028_O06","text":"Arrange one source of truth for files, updates and decisions so work is not lost.","dims":{"D03":3,"D05":1},"primaryDim":"D03","secondaryDim":"D05"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Team-project disagreement","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q029","level":4,"levelName":"Make a thoughtful decision","ugCase":"A group wants to create a walking trail that shares local history. It needs interesting stories, a practical route and reliable facts.","pgCase":"A community organisation wants a visitor trail that combines verified local stories with a route that is usable and affordable.","prompt":"Which part of creating this experience would you most enjoy?","options":[{"id":"S1Q029_O01","text":"Find useful evidence from the stories through records and conversations with people who know the area.","dims":{"D07":3,"D18":1},"primaryDim":"D07","secondaryDim":"D18"},{"id":"S1Q029_O02","text":"Walk the possible route and map distance, landmarks, shade and confusing turns.","dims":{"D09":3,"D03":1},"primaryDim":"D09","secondaryDim":"D03"},{"id":"S1Q029_O03","text":"Create the story so visitors can connect the places with people and events.","dims":{"D10":3,"D08":1},"primaryDim":"D10","secondaryDim":"D08"},{"id":"S1Q029_O04","text":"Work out the cost or resource effect of materials and guiding costs and explore a realistic way to fund the trail.","dims":{"D15":3,"D16":1},"primaryDim":"D15","secondaryDim":"D16"},{"id":"S1Q029_O05","text":"Run a small pilot of an audio-guide add-on for a few visitors and see whether they would use or pay for it.","dims":{"D16":3,"D14":1},"primaryDim":"D16","secondaryDim":"D14"},{"id":"S1Q029_O06","text":"Arrange permissions, start times, group sizes and responsibilities for each stop.","dims":{"D13":3,"D17":1},"primaryDim":"D13","secondaryDim":"D17"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Local heritage walk","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."},
  {"id":"S1Q030","level":4,"levelName":"Make a thoughtful decision","ugCase":"A public park near college has areas that stay empty while one path becomes crowded. Residents disagree about what it needs, and the improvement budget is small.","pgCase":"A local park has uneven use across its spaces. Residents have different priorities, the site has practical constraints and the improvement budget is limited.","prompt":"If you could improve one thing in the space, what would you choose?","options":[{"id":"S1Q030_O01","text":"Use the numbers in visitor numbers across times and areas to identify the usage pattern.","dims":{"D02":3,"D01":1},"primaryDim":"D02","secondaryDim":"D01"},{"id":"S1Q030_O02","text":"Talk with people about different visitors what makes them use or avoid particular spaces.","dims":{"D12":3,"D11":1},"primaryDim":"D12","secondaryDim":"D11"},{"id":"S1Q030_O03","text":"Sketch layout changes for seating, shade and movement, then gather feedback.","dims":{"D09":3,"D08":1},"primaryDim":"D09","secondaryDim":"D08"},{"id":"S1Q030_O04","text":"Confirm whether maintenance, safety and access requirements before recommending changes.","dims":{"D18":3,"D19":1},"primaryDim":"D18","secondaryDim":"D19"},{"id":"S1Q030_O05","text":"Put in order possible improvements by community benefit, cost and urgency.","dims":{"D16":3,"D11":1},"primaryDim":"D16","secondaryDim":"D11"},{"id":"S1Q030_O06","text":"Bring people together to a small trial activity and adjust the plan after hearing from visitors.","dims":{"D20":3,"D13":1},"primaryDim":"D20","secondaryDim":"D13"},{"id":"OPT_OUT","text":"None of these options feels right for me at the moment.","dims":{},"optOut":true}],"caseType":"Public-park improvement","responseLimit":3,"instructions":"Select up to three options you would genuinely choose in this situation. You may choose one, two, or three. Choose “None of these” on its own only if none of the options fits you."}
];

export const STAGE2_ACTIVITIES: Record<string, string[]> = {
  "CD001": [
    "Create a small example of how you would look at the differences between two aircraft-performance summaries and identify a change that could improve safe operation.",
    "Work with a teammate to look closely at a mock aircraft component and record measurements against a simple requirement.",
    "Choose how you would suggest an aircraft-system improvement after weighing performance, safety and constraints."
  ],
  "CD002": [
    "Build a simple version where you work with a simple model to explore how lift, drag or engine force changes flight.",
    "Explain your approach to a user or teammate by look at the differences between two flight-system designs under different operating conditions.",
    "Lead the next step by choose what evidence is needed before changing a flying vehicle's design."
  ],
  "CD003": [
    "Sketch a practical idea for how you would draw two aircraft concepts designed for the same purpose.",
    "Help someone understand the task by put together a simple model and test how shape affects performance.",
    "Improve the approach by change an aircraft concept after weighing test feedback, weight and safety."
  ],
  "CD004": [
    "Make a small working model and look at the differences between energy-use and driving-range data from two vehicle designs.",
    "Guide a small team through find out why a mock vehicle fault and propose a test to locate its cause.",
    "Change the plan when pick between vehicle concepts after comparing safety, efficiency and cost."
  ],
  "CD005": [
    "Set up a short activity where you rebuild a mock flight schedule after one delay affects several teams.",
    "Talk with a user or teammate about how you would draw passenger and staff movement through a busy airport terminal.",
    "Take responsibility for deciding how to get ready with a contingency plan for weather, late arrivals or equipment trouble."
  ],
  "CD006": [
    "Turn the task into something you can try by read through a site plan and flag risks in a road, bridge or building layout.",
    "Show someone how you would look at the differences between construction materials for strength, cost and maintenance needs.",
    "Prioritise what should happen next and draw an improvement that makes a public structure safer and more accessible."
  ],
  "CD007": [
    "Shape a first version by sequence workers, materials and tasks for a small building project.",
    "Support a person or team by look at the differences between two project schedules and identify which has fewer avoidable delays.",
    "Adapt the solution after work with a cost tracker to flag budget and timeline risks before work begins."
  ],
  "CD008": [
    "Put together a simple example that lets you draw a useful product from a short user brief.",
    "Present your idea and put together a low-cost prototype and record what fails during a trial.",
    "Launch a small next step by look at the differences between two product designs using performance, ease of use and safety."
  ],
  "CD009": [
    "Start a hands-on project by estimate how battery use changes with route, speed or weather.",
    "Teach a beginner how to look at the differences between charging plans for a small vehicle fleet with time and cost limits.",
    "Respond to the result by propose a battery-range test that does not compromise safety."
  ],
  "CD010": [
    "Make a rough prototype where you follow a fault in a simple circuit diagram and plan a safe check.",
    "Listen to a user and look at the differences between two ways to distribute power to a small facility.",
    "Decide what you would change before write a safety-check sequence before an electrical system restarts."
  ],
  "CD011": [
    "Design a small solution by diagram a sensor-based device that sends a signal to another device.",
    "Coordinate with others to find out why why a signal becomes weak or noisy in a simple setup.",
    "Set a practical next step by look at the differences between communication-device designs for reliability and energy use."
  ],
  "CD012": [
    "Try making a first version where you draw a local water, waste or pollution issue and identify likely sources.",
    "Share a clear example of how you would look at the differences between treatment ideas by impact, practicality and cost.",
    "Revise the approach and map out a small field check to see whether an environmental fix is working."
  ],
  "CD013": [
    "Create a small example of how you would look closely at a mechanism and identify a likely source of friction or vibration.",
    "Work with a teammate to shape a test that compares two machine settings.",
    "Choose how you would propose a machine improvement that raises efficiency while preserving safe operation."
  ],
  "CD014": [
    "Build a simple version where you read a simple power-use chart and identify when demand peaks.",
    "Explain your approach to a user or teammate by look at the differences between backup-power options for a service that must stay available.",
    "Lead the next step by map out checks to investigate an unreliable electricity supply."
  ],
  "CD015": [
    "Sketch a practical idea for how you would split a repeated task into safe steps for a robot to follow.",
    "Help someone understand the task by try how a sensor or control rule changes a robot's response.",
    "Improve the approach by choose what should be automated and where a human should remain in control."
  ],
  "CD016": [
    "Make a small working model and work with a model to explore how a load affects a beam or frame.",
    "Guide a small team through read through an inspection note and identify which structural concerns need checking.",
    "Change the plan when look at the differences between structural solutions using safety, materials and practical limits."
  ],
  "CD017": [
    "Set up a short activity where you work with journey-time data to locate a bottleneck on a transport route.",
    "Talk with a user or teammate about how you would look at the differences between route layouts for safety, travel time and accessibility.",
    "Take responsibility for deciding how to map out a small trial to reduce congestion or make a crossing safer."
  ],
  "CD018": [
    "Turn the task into something you can try by draw a neighbourhood and identify where public services are difficult to reach.",
    "Show someone how you would look at the differences between two land-use plans for access, safety and community needs.",
    "Prioritise what should happen next and turn resident feedback into a practical proposal for a public place."
  ],
  "CD019": [
    "Shape a first version by look at the differences between an AI tool's suggestions with examples reviewed by people.",
    "Support a person or team by find out why why an AI model gives inconsistent answers to similar inputs.",
    "Adapt the solution after prototype an AI-assisted feature and define when a person should review its output."
  ],
  "CD020": [
    "Put together a simple example that lets you look at the differences between customer and operations figures to explain a change in performance.",
    "Present your idea and put together a dashboard that helps a manager choose which issue to fix first.",
    "Launch a small next step by turn a data pattern into a recommendation and state the assumptions behind it."
  ],
  "CD021": [
    "Start a hands-on project by find out why why an online service slows down when more people use it.",
    "Teach a beginner how to draw how a digital service could stay available if one system fails.",
    "Respond to the result by look at the differences between cost and reliability choices for running an online tool."
  ],
  "CD022": [
    "Make a rough prototype where you work with a small mathematical model to compare possible outcomes.",
    "Listen to a user and split a complex problem into variables and equations that can be tested.",
    "Decide what you would change before confirm how a prediction changes when its assumptions or inputs change."
  ],
  "CD023": [
    "Design a small solution by write or improve code for a small task and test unusual inputs.",
    "Coordinate with others to split a requested software feature into steps and define how its parts connect.",
    "Set a practical next step by follow a reproducible program error and propose a tested fix."
  ],
  "CD024": [
    "Try making a first version where you look at a mock security incident and identify a likely entry point.",
    "Share a clear example of how you would try a practice system for weak passwords or exposed settings.",
    "Revise the approach and write a response checklist for protecting users after a suspected attack."
  ],
  "CD025": [
    "Create a small example of how you would organise a messy table and find the pattern that answers a specific question.",
    "Work with a teammate to make a chart that makes an important trend easy to understand.",
    "Choose how you would confirm whether two groups can fairly be compared using the available data."
  ],
  "CD026": [
    "Build a simple version where you put together a small prediction from historical examples and compare it with actual outcomes.",
    "Explain your approach to a user or teammate by confirm which inputs have the strongest influence on a model's predictions.",
    "Lead the next step by try whether a prediction remains reliable on new or unusual examples."
  ],
  "CD027": [
    "Sketch a practical idea for how you would draw a manual workflow and find where a digital tool could remove effort.",
    "Help someone understand the task by look at the differences between ways to introduce a new system without disrupting daily work.",
    "Improve the approach by define before-and-after measures to test whether digitisation really helped."
  ],
  "CD028": [
    "Make a small working model and choose who should be allowed to view different types of private information.",
    "Guide a small team through read through a mock data leak and recommend steps to limit harm.",
    "Change the plan when confirm whether a process protects information from improper viewing or changes."
  ],
  "CD029": [
    "Set up a short activity where you mark example records and compare how a model learns their patterns.",
    "Talk with a user or teammate about how you would try how a model changes when its training examples are changed.",
    "Take responsibility for deciding how to record where a model makes errors and design a better test set."
  ],
  "CD030": [
    "Turn the task into something you can try by split a requested software feature into tasks with clear acceptance checks.",
    "Show someone how you would write tests for a feature before it is released to users.",
    "Prioritise what should happen next and find out why a reported bug and document a reliable correction."
  ],
  "CD031": [
    "Shape a first version by map out a digital simulation that lets a learner explore a place safely.",
    "Support a person or team by draw interaction controls for a virtual environment and test their clarity.",
    "Adapt the solution after prototype a short immersive scene and gather feedback from first-time users."
  ],
  "CD032": [
    "Put together a simple example that lets you read through a set of money records and explain any inconsistencies.",
    "Present your idea and get ready with a clear summary of where funds came from and where they went.",
    "Launch a small next step by confirm a financial report before it is used to make a decision."
  ],
  "CD033": [
    "Start a hands-on project by look at the differences between two savings or borrowing options for a customer with a clear need.",
    "Teach a beginner how to tell someone clearly about a financial product plainly, including its trade-offs.",
    "Respond to the result by read through a customer situation and list the information needed before advising."
  ],
  "CD034": [
    "Make a rough prototype where you work out the cost of a small production run, including overlooked expenses.",
    "Listen to a user and look at the differences between supplier quotes and identify the true total cost.",
    "Decide what you would change before work out how order volume changes the cost of each item."
  ],
  "CD035": [
    "Design a small solution by draw an online service that solves a clear customer problem.",
    "Coordinate with others to draw how an order moves from a web page through payment and delivery.",
    "Set a practical next step by try a small online business idea and define what would signal real demand."
  ],
  "CD036": [
    "Try making a first version where you look at the differences between two online posts and predict which audience each may reach.",
    "Share a clear example of how you would map out a small campaign and choose the measures that should be tracked.",
    "Revise the approach and read through engagement results and adjust the message or channel."
  ],
  "CD037": [
    "Create a small example of how you would talk with potential users to check whether a problem is worth solving.",
    "Work with a teammate to make a simple pricing and delivery plan for a small venture.",
    "Choose how you would run a low-cost test to see whether people would pay for a proposed solution."
  ],
  "CD038": [
    "Build a simple version where you put together a timeline and backup plan for a student event.",
    "Explain your approach to a user or teammate by coordinate venue, suppliers and people when the schedule changes.",
    "Lead the next step by read through an event budget and decide which items are essential."
  ],
  "CD039": [
    "Sketch a practical idea for how you would make a cash plan that covers costs across several months.",
    "Help someone understand the task by look at the differences between spending choices while keeping an emergency reserve.",
    "Improve the approach by suggest how an organisation should allocate a limited budget."
  ],
  "CD040": [
    "Make a small working model and draw a digital payment journey and identify where errors could happen.",
    "Guide a small team through try a financial app flow for usability, privacy and security.",
    "Change the plan when look at the differences between ways to make a digital financial service faster without adding undue risk."
  ],
  "CD041": [
    "Set up a short activity where you map out how teams in different time zones can coordinate a shared project.",
    "Talk with a user or teammate about how you would look at the differences between market and cultural information before entering a new region.",
    "Take responsibility for deciding how to help solve a supply or communication issue involving teams in different locations."
  ],
  "CD042": [
    "Turn the task into something you can try by draw a guest journey from booking to checkout and spot friction points.",
    "Show someone how you would work through a sample service complaint while protecting the guest experience.",
    "Prioritise what should happen next and map out staffing and supplies for a busy period with changing demand."
  ],
  "CD043": [
    "Shape a first version by write a first version of fair interview questions for a role and check for possible bias.",
    "Support a person or team by work with staff feedback to suggest an onboarding or learning improvement.",
    "Adapt the solution after map out how to resolve a team communication issue while respecting confidentiality."
  ],
  "CD044": [
    "Put together a simple example that lets you look at the differences between how a product might need to change for two different markets.",
    "Present your idea and follow a cross-border order and identify delivery or documentation risks.",
    "Launch a small next step by weigh a supplier or market opportunity using demand, cost and uncertainty."
  ],
  "CD045": [
    "Start a hands-on project by look at the differences between two investments by risk, possible return and time horizon.",
    "Teach a beginner how to work with a scenario table to see how assumptions change a projected return.",
    "Respond to the result by tell someone clearly about why spreading risk across investments might matter in a case."
  ],
  "CD046": [
    "Make a rough prototype where you follow a package through a supply chain and locate a delay.",
    "Listen to a user and look at the differences between delivery routes for speed, cost and reliability.",
    "Decide what you would change before choose stock levels that reduce both shortages and excess inventory."
  ],
  "CD047": [
    "Design a small solution by talk with customers to learn what problem a product solves for them.",
    "Coordinate with others to look at the differences between two messages and decide which explains the product's value more clearly.",
    "Set a practical next step by map out a small launch and select evidence to judge whether it worked."
  ],
  "CD048": [
    "Try making a first version where you read through the reasons for a public decision and check whether its process was fair.",
    "Share a clear example of how you would look at the differences between a proposed policy with the rules governing the decision-maker.",
    "Revise the approach and get ready with a plain-language note explaining what a public authority must consider."
  ],
  "CD049": [
    "Create a small example of how you would read through a mock contract and flag unclear duties or risky terms.",
    "Work with a teammate to help an organisation compare two agreements before signing.",
    "Choose how you would summarise practical legal risks in a proposed business arrangement."
  ],
  "CD050": [
    "Build a simple version where you look at the differences between witness statements and evidence without jumping to a conclusion.",
    "Explain your approach to a user or teammate by put together a timeline from case records and list what is still unknown.",
    "Lead the next step by spot which evidence needs verification before a fair finding is made."
  ],
  "CD051": [
    "Sketch a practical idea for how you would find reliable information about a legal question and organise the strongest arguments on both sides.",
    "Help someone understand the task by tell someone clearly about a person's rights and options in clear, accessible language.",
    "Improve the approach by look at the differences between case facts with relevant rules and identify what needs checking."
  ],
  "CD052": [
    "Make a small working model and help two parties separate the facts, needs and positions in a disagreement.",
    "Guide a small team through get ready with questions that could help people reach a workable agreement.",
    "Change the plan when look at the differences between proposed settlements and identify realistic areas for compromise."
  ],
  "CD053": [
    "Set up a short activity where you look at the differences between two designs for a device used in a care setting.",
    "Talk with a user or teammate about how you would try how a sensor or device performs under realistic conditions.",
    "Take responsibility for deciding how to make a device workflow so it is safer and easier for staff to use."
  ],
  "CD054": [
    "Turn the task into something you can try by map out a small experiment using a biological process to solve a problem.",
    "Show someone how you would look at the differences between sample results and identify which needs a repeat test.",
    "Prioritise what should happen next and propose a process change to improve yield or consistency in a biological product."
  ],
  "CD055": [
    "Shape a first version by pick a suitable test to identify the contents of an unknown sample.",
    "Support a person or team by look at the differences between two reaction observations and explain possible causes.",
    "Adapt the solution after map out safe, consistent lab steps for repeating a measurement."
  ],
  "CD056": [
    "Put together a simple example that lets you record a mock scene so each item of evidence can be traced.",
    "Present your idea and look at the differences between sample results without assuming one clue proves the whole story.",
    "Launch a small next step by get ready with an evidence timeline and list what must be confirmed."
  ],
  "CD057": [
    "Start a hands-on project by draw medicine-production steps and spot where consistency could fail.",
    "Teach a beginner how to look at the differences between batch records and flag a quality issue before release.",
    "Respond to the result by propose a process check that could reduce variation during production."
  ],
  "CD058": [
    "Make a rough prototype where you watch a biological system and record changes over time.",
    "Listen to a user and look at the differences between evidence for two explanations of an organism's response.",
    "Decide what you would change before shape a small study that answers a clear question about living things."
  ],
  "CD059": [
    "Design a small solution by pick a mathematical method for a problem and check its assumptions.",
    "Coordinate with others to look at the differences between two models and explain why their results differ.",
    "Set a practical next step by work with a structured calculation or proof to test whether a claim holds."
  ],
  "CD060": [
    "Try making a first version where you map out how to observe samples while reducing the risk of contamination.",
    "Share a clear example of how you would look at the differences between microbial observations and decide which follow-up test is needed.",
    "Revise the approach and maintain records so another person can repeat a microbiology procedure."
  ],
  "CD061": [
    "Create a small example of how you would look at the differences between material properties when working at a very small scale.",
    "Work with a teammate to map out a test of how a small-scale material behaves under different conditions.",
    "Choose how you would link a nanoscale property to a possible real-world application."
  ],
  "CD062": [
    "Build a simple version where you confirm sample batch records against medicine safety and quality requirements.",
    "Explain your approach to a user or teammate by find out why a deviation and recommend how to prevent a repeat.",
    "Lead the next step by make a checklist that makes medicine quality checks consistent."
  ],
  "CD063": [
    "Sketch a practical idea for how you would look at the differences between candidate formulations and decide what evidence is needed next.",
    "Help someone understand the task by read through test results to see whether a medicine candidate meets a target.",
    "Improve the approach by map out development steps from a lab experiment through quality review."
  ],
  "CD064": [
    "Make a small working model and look at the differences between ways to prepare or deliver a medicine for a particular use.",
    "Guide a small team through try how a formulation behaves under different storage or release conditions.",
    "Change the plan when translate formulation requirements into a clear trial-batch process."
  ],
  "CD065": [
    "Set up a short activity where you look at the differences between how two compounds affect a biological response in a controlled study.",
    "Talk with a user or teammate about how you would read through dose-response results and identify questions before drawing a conclusion.",
    "Take responsibility for deciding how to map out an ethical, controlled experiment to investigate a medicine's effects."
  ],
  "CD066": [
    "Turn the task into something you can try by read through a prescription scenario and identify questions to resolve before supply.",
    "Show someone how you would tell someone clearly about safe medicine use to someone with a different level of health knowledge.",
    "Prioritise what should happen next and confirm a medicine record for interactions, instructions or missing information."
  ],
  "CD067": [
    "Shape a first version by choose up a simple experiment to test a prediction about energy or motion.",
    "Support a person or team by work with measurements to explain why a result differs from expectations.",
    "Adapt the solution after look at the differences between two physical models and identify which better explains the observations."
  ],
  "CD068": [
    "Put together a simple example that lets you look at the differences between production records to explain a change in product consistency.",
    "Present your idea and map out a quality test for ingredients or a finished batch.",
    "Launch a small next step by follow how storage or process conditions could affect the final product."
  ],
  "CD069": [
    "Start a hands-on project by map out a safe, personalised service after learning about a client's preferences.",
    "Teach a beginner how to look at the differences between product ingredients and explain practical use or safety considerations.",
    "Respond to the result by make a service menu so people can choose an option that suits their needs."
  ],
  "CD070": [
    "Make a rough prototype where you redesign a confusing poster so its main message stands out.",
    "Listen to a user and pick a layout and visual hierarchy for a defined audience.",
    "Decide what you would change before try two visual concepts and use feedback to improve clarity."
  ],
  "CD071": [
    "Design a small solution by map out a sequence of messages for different audience needs.",
    "Coordinate with others to pick a channel and format for a communication goal and explain why.",
    "Set a practical next step by read through content performance and propose a change for the next release."
  ],
  "CD072": [
    "Try making a first version where you draw a clothing concept and choose materials for its intended use.",
    "Share a clear example of how you would look at the differences between fabrics for durability, fit, comfort and environmental impact.",
    "Revise the approach and change a design after checking customer preferences and production limits."
  ],
  "CD073": [
    "Create a small example of how you would shape a game mechanic that makes a challenge engaging but fair.",
    "Work with a teammate to draw a short player journey and find where players might get stuck.",
    "Choose how you would try a level and revise its rules based on what happens."
  ],
  "CD074": [
    "Build a simple version where you storyboard an immersive scene with a clear purpose for the user.",
    "Explain your approach to a user or teammate by try an interaction concept and observe whether users understand it.",
    "Lead the next step by map out how sound, visuals and movement work together in a digital experience."
  ],
  "CD075": [
    "Sketch a practical idea for how you would map out a room layout so people can move through it easily.",
    "Help someone understand the task by look at the differences between lighting, materials and furniture for a particular space and use.",
    "Improve the approach by change a floor plan after considering accessibility and user feedback."
  ],
  "CD076": [
    "Make a small working model and map out a short video or audio story for a defined audience.",
    "Guide a small team through pick visuals, sound and narrative to communicate an idea clearly.",
    "Change the plan when edit a rough media piece and test whether its message comes across."
  ],
  "CD077": [
    "Set up a short activity where you draw a product around a user need and show how it would work.",
    "Talk with a user or teammate about how you would put together a rough prototype and observe how people handle it.",
    "Take responsibility for deciding how to look at the differences between design revisions for usability, durability and material constraints."
  ],
  "CD078": [
    "Turn the task into something you can try by watch a user completing a task and note points of confusion.",
    "Show someone how you would make a simple wireframe and test its flow with a user.",
    "Prioritise what should happen next and sort user feedback into changes that would make a digital product easier to use."
  ],
  "CD079": [
    "Shape a first version by combine image, layout and short text to make information easy to scan.",
    "Support a person or team by look at the differences between two visual directions for tone, clarity and audience fit.",
    "Adapt the solution after change an infographic after checking whether people understand it quickly."
  ]
};

export const SECTOR_CONTEXTS: Record<string, SectorContext[]> = {
  "Engineering, Infrastructure & Mobility": [
    {
      "caseType": "Engineering trial stations",
      "ug": "Your college engineering showcase has short trial stations covering vehicles, buildings, energy, electronics and machines. Each station offers a different practical mini-project.",
      "pg": "A cross-functional engineering group is running short technical trials across mobility, infrastructure, energy, devices and machines. Each work package has a different specialist focus.",
      "prompt": "Which practical investigation tasks would you volunteer to try?"
    },
    {
      "caseType": "Reliability clinic",
      "ug": "A community service team has reported several problems with transport, structures, electricity and equipment. An engineering clinic invites students to investigate possible causes.",
      "pg": "A client reports reliability issues across transport, structures, electrical supply and equipment. The project office is assigning short diagnostic work packages.",
      "prompt": "Which issue would you most want to diagnose or improve?"
    },
    {
      "caseType": "Prototype review",
      "ug": "A maker challenge gives teams a small budget to improve a physical system. Before the showcase, each team needs a design, test or planning contribution.",
      "pg": "A product-development review is comparing early proposals across mobility, infrastructure, manufacturing and connected devices while balancing performance, safety and constraints.",
      "prompt": "Which design or planning tasks would you choose before the review?"
    }
  ],
  "Computing, AI, Data & Digital": [
    {
      "caseType": "Digital service lab",
      "ug": "The college technology team is hosting mini-projects on apps, data, online services, security and immersive media. Each task improves a different part of how people use technology.",
      "pg": "An organisation is piloting digital work packages across analytics, software, AI, cloud services, security and immersive systems. Each assignment addresses a different technical question.",
      "prompt": "Which digital project tasks would you be keen to try?"
    },
    {
      "caseType": "Digital reliability review",
      "ug": "A student-facing online service has several possible issues: errors, slow performance, confusing results and concerns about private information. The team needs short investigations.",
      "pg": "A digital platform is facing inconsistent results, performance concerns and data-protection questions. Several teams are testing possible causes and controls.",
      "prompt": "Which technical investigation would hold your attention most?"
    },
    {
      "caseType": "Feature improvement sprint",
      "ug": "A campus group wants to add a useful feature to an online service. It needs ideas that are easy to use, dependable and based on real evidence.",
      "pg": "A product team is preparing a digital-service update and needs work on user needs, model reliability, security, deployment and measurable outcomes.",
      "prompt": "Which contribution would you choose before the feature is released?"
    }
  ],
  "Business, Finance & Management": [
    {
      "caseType": "Student service venture",
      "ug": "A student-run service wants to attract customers, manage money, organise people and deliver orders reliably. There are several small work packages to choose from.",
      "pg": "A growing service business is reviewing customer demand, financial records, pricing, staffing, marketing and delivery operations before its next phase.",
      "prompt": "Which business task would you most like to own?"
    },
    {
      "caseType": "Limited-budget planning",
      "ug": "A campus event has a fixed budget, a changing number of visitors and several suppliers. The organisers need to make practical trade-offs about money, people and timing.",
      "pg": "A service organisation must allocate a constrained budget while managing demand, suppliers, staffing, financial exposure and service quality.",
      "prompt": "Which planning or analysis task would you choose to tackle?"
    },
    {
      "caseType": "Launch and growth review",
      "ug": "A small new service is preparing to launch. The team needs to understand its audience, decide how to reach them and work out whether the idea can last.",
      "pg": "A new service concept is approaching launch. The team must test demand, choose channels, plan delivery and set useful measures for commercial sustainability.",
      "prompt": "Which task would you want to try during the launch?"
    }
  ],
  "Law, Governance & Justice": [
    {
      "caseType": "Community legal help desk",
      "ug": "A community help desk receives questions about public rules, agreements, rights, evidence and disagreements. Volunteers can choose a short practice case to work on.",
      "pg": "A legal clinic triages matters involving public decisions, commercial agreements, rights, evidence and conflict resolution. Each file needs a focused preliminary review.",
      "prompt": "Which legal-support task would you be interested in trying?"
    },
    {
      "caseType": "Fair decision review",
      "ug": "A group must decide what to do after a dispute and an incident. It needs to check the facts, understand the rules and listen fairly to people involved.",
      "pg": "A review panel must examine a contested decision involving records, obligations, applicable rules and different accounts of events before recommending next steps.",
      "prompt": "Which part of the review would you choose to work on?"
    },
    {
      "caseType": "Agreement and policy clinic",
      "ug": "A student group is drafting rules for a shared activity and resolving a disagreement with a partner. It needs clear terms and a fair process.",
      "pg": "An organisation is reviewing policy language, contractual responsibilities and a disagreement between stakeholders. The goal is a workable, transparent resolution.",
      "prompt": "Which task would you most want to contribute to?"
    }
  ],
  "Health, Life Science & Forensics": [
    {
      "caseType": "Science and health project sampler",
      "ug": "A science showcase offers short projects using samples, living systems, medicines, devices, measurements and quality checks. Each station investigates a different scientific question.",
      "pg": "A research and health-science unit offers trial assignments across laboratory analysis, biological systems, devices, medicines, measurements and quality assurance.",
      "prompt": "Which science or health-related task would you choose to explore?"
    },
    {
      "caseType": "Unexpected result review",
      "ug": "A lab or care team receives results that do not match expectations. Before making a change, the team must check samples, methods, measurements and safety.",
      "pg": "An unexpected result appears in a laboratory or product-testing workflow. The team must review evidence, repeat checks where appropriate and document quality concerns.",
      "prompt": "Which investigation would you be most interested in doing?"
    },
    {
      "caseType": "Evidence-to-practice challenge",
      "ug": "A science team must turn reliable evidence into a practical next step, whether that means improving a test, a product, a device or a process.",
      "pg": "A science or health project has reached a decision point. It needs a defensible next step based on experimental evidence, safety and repeatability.",
      "prompt": "Which contribution would you choose before the team proceeds?"
    }
  ],
  "Design, Media & Creative Industries": [
    {
      "caseType": "Creative studio sampler",
      "ug": "A campus creative studio has briefs about posters, online content, clothing, games, spaces, products and personal services. Each brief needs a different kind of creative work.",
      "pg": "A multi-disciplinary studio is reviewing briefs across visual communication, content, apparel, interactive media, spaces, products and user experience.",
      "prompt": "Which creative project tasks would you be excited to try?"
    },
    {
      "caseType": "User feedback workshop",
      "ug": "People have tried several new designs and services, but their feedback is mixed. The team wants to find out what is confusing, improve concepts and test revisions.",
      "pg": "A design team has conflicting feedback on prototypes, content and customer experiences. It needs focused user research, concept revision and communication decisions.",
      "prompt": "Which feedback or improvement task would you choose?"
    },
    {
      "caseType": "Showcase production",
      "ug": "A college showcase is preparing final work for visitors. Projects need a clear message, useful layout, engaging experience and attention to how people will use them.",
      "pg": "A creative team is preparing deliverables for public release. It must refine visual systems, stories, products, spaces and interactive experiences for their intended audiences.",
      "prompt": "Which contribution would you most enjoy before the work is presented?"
    }
  ]
};

export const DISCOVERY_CASES: DiscoveryCase[] = [
  {
    "caseType": "Cross-field try-out week",
    "ug": "Your college is running a “Try a Future” week with short project stations from very different fields. You can sign up for a few tasks before committing to a course.",
    "pg": "You can sample short projects outside your current shortlist before making a study or career plan. Each work sample represents a different field.",
    "prompt": "Which unfamiliar project tasks would you give a trial?"
  },
  {
    "caseType": "Community challenge sprint",
    "ug": "A local challenge programme asks students to choose small projects that solve different kinds of community or organisation problems. You have a few sessions to explore.",
    "pg": "A cross-functional innovation sprint offers short assignments from several sectors. You can test a new type of work before choosing a development path.",
    "prompt": "Which alternative work samples would you want to experience?"
  }
];

export const STAGE2_PROMPT_MAP: Record<string, string[]> = {
  "Engineering, Infrastructure & Mobility": [
    "What would you enjoy building, operating or planning in this field?",
    "Which role would you like to try when a real project has a practical problem?",
    "What would you choose to improve when the team is ready for the next step?"
  ],
  "Computing, AI, Data & Digital": [
    "Which digital project would you enjoy creating or working on?",
    "Which role would you like to take when people use the technology?",
    "What would you change, launch or improve before the final release?"
  ],
  "Business, Finance & Management": [
    "Which business activity would you enjoy owning?",
    "Which people, customer or planning role would you like to try?",
    "What would you choose to improve when the team has to act?"
  ],
  "Law, Governance & Justice": [
    "Which role would you enjoy taking in a legal or public matter?",
    "How would you like to help people understand or resolve the issue?",
    "What would you choose to prepare, decide or improve before action is taken?"
  ],
  "Health, Life Science & Forensics": [
    "Which hands-on science, health or evidence task would you enjoy?",
    "Which role would you like to take when working with people or a team?",
    "What would you choose to improve, repeat or decide before the next step?"
  ],
  "Design, Media & Creative Industries": [
    "What would you enjoy creating in this field?",
    "Which audience, user or team role would you like to take?",
    "What would you choose to revise, present or launch?"
  ]
};

export const OPT_OUT_ID = 'OPT_OUT';
export const OPTION_LIMIT = 3;
export const STAGE1_LEVEL_NAMES = ['Explore', 'Look for clues', 'Try ideas', 'Compare choices', 'Make a thoughtful decision'];
