import { PROGRAMS, SandipMasterProgram } from './su-career-data'

export interface SyllabusCourse {
  code: string
  title: string
  type: 'Core' | 'Elective' | 'Laboratory' | 'Studio' | 'Foundation' | 'Project' | 'Humanities'
  credits: number
  ltp: string // Lecture-Tutorial-Practical, e.g. "3-0-2"
  units: string[]
  learningOutcome: string
}

export interface SyllabusSemester {
  semesterNumber: number
  title: string
  credits: number
  courses: SyllabusCourse[]
}

export interface ProgramSyllabus {
  programId: string
  name: string
  school: string
  level: string
  durationYears: number
  totalSemesters: number
  totalCredits: number
  academicFramework: string
  overview: string
  semesters: SyllabusSemester[]
  specializationTracks?: {
    name: string
    description: string
    subjects: string[]
  }[]
  careerOutcomes: string[]
  accreditationNotes: string
}

// ---------------------------------------------------------------------------
// Discipline-Specific Semester Blueprints
// ---------------------------------------------------------------------------

function getCSESyllabus(p: SandipMasterProgram): SyllabusSemester[] {
  const isBCA = p.course.includes('BCA')
  const isPG = p.level === 'PG'
  const isMCA = p.course.includes('MCA')
  const spec = p.specialization

  if (isPG || isMCA) {
    return [
      {
        semesterNumber: 1,
        title: 'Semester I · Advanced Computing Foundations',
        credits: 22,
        courses: [
          {
            code: 'CS601',
            title: 'Advanced Data Structures & Algorithmic Analysis',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Amortized Complexity Analysis & Asymptotic Bounds',
              'Unit 2: Advanced Balanced Trees (Red-Black, B-Trees, Splay)',
              'Unit 3: Graph Algorithms, Network Flow & Residual Capacity',
              'Unit 4: Dynamic Programming & Greedy Heuristics',
              'Unit 5: NP-Completeness, Approximation Algorithms & Cryptographic Primitives'
            ],
            learningOutcome: 'Analyze and implement high-efficiency data models for scalable enterprise computing.'
          },
          {
            code: 'CS602',
            title: `Advanced ${spec === 'General' ? 'Software Architecture' : spec} Systems`,
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Distributed Architectures & Microservices Patterns',
              'Unit 2: Concurrency, Thread Safety & Memory Models',
              'Unit 3: Containerization & Cloud Native Orchestration (Kubernetes)',
              'Unit 4: High-Throughput Message Queues & Event-Driven Pipelines',
              'Unit 5: Fault-Tolerance, Circuit Breaking & Disaster Recovery'
            ],
            learningOutcome: 'Architect fault-tolerant systems using modern containerized microservices.'
          },
          {
            code: 'CS603',
            title: 'Applied Machine Learning & Deep Neural Models',
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Statistical Learning, Regularization & Convex Optimization',
              'Unit 2: Supervised Classifiers & Support Vector Machines',
              'Unit 3: Neural Networks & Backpropagation Dynamics',
              'Unit 4: Convolutional & Recurrent Architectures (Transformers)',
              'Unit 5: Model Deployment, Quantization & MLOps Pipelines'
            ],
            learningOutcome: 'Train, fine-tune, and deploy predictive and deep learning models.'
          },
          {
            code: 'CS604L',
            title: 'Advanced Computing Lab & Systems Simulation',
            type: 'Laboratory',
            credits: 2,
            ltp: '0-0-4',
            units: [
              'Lab 1: Memory-efficient graph processing engines',
              'Lab 2: Microservice deployment with Istio Service Mesh',
              'Lab 3: Tensor processing with PyTorch on GPU clusters',
              'Lab 4: Automated CI/CD pipelines with security scanning'
            ],
            learningOutcome: 'Build production-ready code repositories with automated benchmarking.'
          }
        ]
      },
      {
        semesterNumber: 2,
        title: 'Semester II · Cloud Infrastructure, Big Data & Security',
        credits: 22,
        courses: [
          {
            code: 'CS605',
            title: 'Distributed Cloud Computing & DevOps Automation',
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Cloud Service Models (IaaS, PaaS, Serverless)',
              'Unit 2: Infrastructure as Code (Terraform, Ansible)',
              'Unit 3: Distributed Storage (Ceph, S3 object models)',
              'Unit 4: Serverless Event Processing & Edge Computing',
              'Unit 5: Cloud Cost Optimization & Multi-Region Resiliency'
            ],
            learningOutcome: 'Provision, monitor, and scale multi-tenant cloud architectures.'
          },
          {
            code: 'CS606',
            title: 'Big Data Engineering & Distributed Stream Processing',
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Apache Spark Ecosystem & RDD Transformations',
              'Unit 2: Kafka Streaming Architecture & Consumer Groups',
              'Unit 3: Data Warehousing, OLAP Schemas & Delta Lake',
              'Unit 4: Vector Databases & High-Dimensional Search (Pinecone/Milvus)',
              'Unit 5: Real-time Analytics & Anomaly Detection'
            ],
            learningOutcome: 'Process massive streaming and batch datasets with sub-second latency.'
          },
          {
            code: 'CS607E',
            title: 'Domain Elective: Zero Trust & Information Security',
            type: 'Elective',
            credits: 3,
            ltp: '3-0-0',
            units: [
              'Unit 1: Identity and Access Management (OAuth2, OIDC)',
              'Unit 2: Cryptographic Protocols, TLS 1.3 & PKI Infrastructure',
              'Unit 3: Threat Modeling & Threat Surface Reduction',
              'Unit 4: Vulnerability Assessment & Pen Testing Frameworks',
              'Unit 5: Compliance Frameworks (GDPR, ISO 27001, SOC2)'
            ],
            learningOutcome: 'Implement defensive security postures across corporate enterprise infrastructure.'
          },
          {
            code: 'CS608P',
            title: 'Graduate Capstone Research Project - Phase I',
            type: 'Project',
            credits: 4,
            ltp: '0-0-8',
            units: [
              'Milestone 1: Literature review and problem formulation',
              'Milestone 2: System design, architecture diagrams and data schema',
              'Milestone 3: Prototype implementation and initial validation'
            ],
            learningOutcome: 'Conduct independent computational research targeting peer-reviewed outcomes.'
          }
        ]
      },
      {
        semesterNumber: 3,
        title: 'Semester III · Industry Internship & Advanced Electives',
        credits: 20,
        courses: [
          {
            code: 'CS701',
            title: 'Domain Specialization Capstone Seminar',
            type: 'Core',
            credits: 4,
            ltp: '2-0-4',
            units: ['Cutting-edge research topics, industry guest masterclasses, and system evaluation.'],
            learningOutcome: 'Synthesize academic literature with practical engineering constraints.'
          },
          {
            code: 'CS702I',
            title: 'Six-Month Industrial Internship & Corporate Practicum',
            type: 'Project',
            credits: 12,
            ltp: '0-0-24',
            units: ['Full-time enterprise internship under joint academic and corporate mentorship.'],
            learningOutcome: 'Deliver commercial software or research output in a corporate environment.'
          }
        ]
      },
      {
        semesterNumber: 4,
        title: 'Semester IV · Master Thesis & Dissertation Defense',
        credits: 18,
        courses: [
          {
            code: 'CS703T',
            title: 'Master Thesis Defense & Open-Source Publication',
            type: 'Project',
            credits: 18,
            ltp: '0-0-36',
            units: [
              'Final thesis dissertation, code audit, benchmark validation, and public defense before academic committee.'
            ],
            learningOutcome: 'Defend novel engineering solutions in an academic and professional setting.'
          }
        ]
      }
    ]
  }

  // UG: B.Tech CSE or BCA (8 or 6 semesters)
  const totalSems = isBCA ? 6 : 8
  const sems: SyllabusSemester[] = [
    {
      semesterNumber: 1,
      title: 'Semester I · Computing & Engineering Sciences',
      credits: 21,
      courses: [
        {
          code: 'MA101',
          title: 'Engineering Mathematics I: Calculus & Linear Algebra',
          type: 'Foundation',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Differential Calculus, Taylor Series & Multivariable Derivatives',
            'Unit 2: Matrices, Eigenvalues, Eigenvectors & Diagonalization',
            'Unit 3: Vector Spaces, Linear Independence & Orthogonal Projections',
            'Unit 4: Multiple Integrals & Coordinate Transformations',
            'Unit 5: Applications in Computer Graphics and Optimization'
          ],
          learningOutcome: 'Apply linear algebraic and vector methods to algorithmic computing and graphics.'
        },
        {
          code: 'CS102',
          title: 'Problem Solving & Programming in Python & C',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Algorithms, Flowcharts & Computational Thinking',
            'Unit 2: Data Types, Operators, Conditional Logic & Iteration',
            'Unit 3: Modular Programming, Recursion & Scope Rules',
            'Unit 4: Arrays, Pointers, Memory Allocation & Structures in C',
            'Unit 5: Pythonic Paradigms, Lists, Dictionaries & File Handling'
          ],
          learningOutcome: 'Write clean, structured programs solving diverse numerical and algorithmic tasks.'
        },
        {
          code: 'PH103',
          title: 'Physics for Information Technology & Quantum Foundations',
          type: 'Foundation',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Wave Mechanics & Semiconductor Fundamentals',
            'Unit 2: Optoelectronic Devices & Fibre Optic Communication',
            'Unit 3: Quantum Principles & Quantum Bit Fundamentals',
            'Unit 4: Magnetic Storage & Nanotechnology Sensors',
            'Unit 5: Laboratory Measurements & Error Analysis'
          ],
          learningOutcome: 'Understand physical properties of semiconductor materials and modern sensors.'
        },
        {
          code: 'HU104',
          title: 'Professional Communication & Technical Report Writing',
          type: 'Humanities',
          credits: 3,
          ltp: '2-0-2',
          units: [
            'Unit 1: Effective Verbal Communication & Presentations',
            'Unit 2: Technical Writing, Documentation & Style Guides',
            'Unit 3: Resume Building & Mock Interview Practicum',
            'Unit 4: Cross-cultural Professional Etiquette'
          ],
          learningOutcome: 'Present technical concepts clearly to both technical and managerial audiences.'
        },
        {
          code: 'CS105L',
          title: 'Programming Laboratory & Git Version Control',
          type: 'Laboratory',
          credits: 2,
          ltp: '0-0-4',
          units: [
            'Git commit flows, branch workflows, debugging, profiling, and command-line automation.'
          ],
          learningOutcome: 'Collaborate on multi-developer code repositories using modern version control.'
        }
      ]
    },
    {
      semesterNumber: 2,
      title: 'Semester II · Data Structures, Hardware & Discrete Math',
      credits: 22,
      courses: [
        {
          code: 'MA201',
          title: 'Discrete Mathematics & Graph Theory',
          type: 'Foundation',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Propositional & Predicate Logic, Proof Techniques',
            'Unit 2: Sets, Relations, Functions & Pigeonhole Principle',
            'Unit 3: Combinatorics, Generating Functions & Recurrence Relations',
            'Unit 4: Graph Theory: Trees, Eulerian/Hamiltonian Circuits, Coloring',
            'Unit 5: Algebraic Structures: Groups, Rings, Monoids'
          ],
          learningOutcome: 'Formulate formal mathematical arguments for computational algorithms.'
        },
        {
          code: 'CS202',
          title: 'Data Structures & Algorithmic Foundations',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Stacks, Queues, Circular Buffers & Linked Lists',
            'Unit 2: Binary Trees, Binary Search Trees & AVL Balancing',
            'Unit 3: Heaps, Priority Queues & Disjoint-Set Data Structures',
            'Unit 4: Hash Tables, Collision Resolution & Bloom Filters',
            'Unit 5: Graph Traversal (BFS, DFS, Dijkstra, Prim, Kruskal)'
          ],
          learningOutcome: 'Select optimal data structures for memory and execution constraints.'
        },
        {
          code: 'CS203',
          title: 'Digital Electronics & Computer Organization',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Boolean Algebra, Logic Gates & Karnaugh Maps',
            'Unit 2: Combinational & Sequential Circuits (Flip-Flops, Registers)',
            'Unit 3: ALU Design, Instruction Formats & Addressing Modes',
            'Unit 4: CPU Pipelining, Hazard Resolution & Cache Hierarchy',
            'Unit 5: Memory Management Units, Virtual Memory & I/O Subsystems'
          ],
          learningOutcome: 'Understand how software translates into low-level CPU machine cycles.'
        },
        {
          code: 'CS204',
          title: 'Object-Oriented Programming with Java / C++',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Encapsulation, Inheritance & Polymorphism',
            'Unit 2: Abstract Classes, Interfaces & Design Principles (SOLID)',
            'Unit 3: Exception Handling, Generics & Collections Framework',
            'Unit 4: Concurrency, Threads & Thread Synchronization',
            'Unit 5: Stream APIs, Lambda Expressions & Event-Driven GUI'
          ],
          learningOutcome: 'Develop modular, maintainable enterprise software applications.'
        },
        {
          code: 'CS205L',
          title: 'Data Structures & Hardware Prototyping Lab',
          type: 'Laboratory',
          credits: 2,
          ltp: '0-0-4',
          units: [
            'Hands-on tree balancing algorithms, hash benchmark suites, and logic circuit breadboard simulation.'
          ],
          learningOutcome: 'Implement high-performance data structures and verify logic gate designs.'
        }
      ]
    },
    {
      semesterNumber: 3,
      title: 'Semester III · Core Systems & Database Architectures',
      credits: 22,
      courses: [
        {
          code: 'CS301',
          title: 'Design & Analysis of Algorithms',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Divide and Conquer (MergeSort, QuickSort, Matrix Multiplication)',
            'Unit 2: Greedy Strategy (Fractional Knapsack, Huffman Coding)',
            'Unit 3: Dynamic Programming (LCS, 0/1 Knapsack, Bellman-Ford)',
            'Unit 4: Backtracking & Branch and Bound (N-Queens, Traveling Salesperson)',
            'Unit 5: String Matching (KMP, Rabin-Karp) & Intractable Problems'
          ],
          learningOutcome: 'Prove asymptotic correctness and bound execution efficiency for algorithms.'
        },
        {
          code: 'CS302',
          title: 'Database Management Systems & SQL/NoSQL',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Relational Model, ER Diagrams & Relational Algebra',
            'Unit 2: Advanced SQL: Window Functions, Joins, Triggers & Stored Procedures',
            'Unit 3: Normalization (1NF through BCNF, 4NF)',
            'Unit 4: Transaction Management, ACID Properties & Concurrency Control',
            'Unit 5: NoSQL Databases: Document (MongoDB), Key-Value (Redis), Graph (Neo4j)'
          ],
          learningOutcome: 'Design normalized transactional databases and modern NoSQL datastores.'
        },
        {
          code: 'CS303',
          title: 'Operating Systems & Kernel Architecture',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Process Management, Inter-Process Communication & POSIX Threads',
            'Unit 2: CPU Scheduling Algorithms (Round-Robin, Priority, CFS)',
            'Unit 3: Deadlocks: Detection, Prevention & Banker’s Algorithm',
            'Unit 4: Memory Management: Paging, Segmentation & Page Replacement (LRU)',
            'Unit 5: File Systems, Journaling & Linux Kernel Internals'
          ],
          learningOutcome: 'Write system calls and multi-threaded kernel-level software in C/C++.'
        },
        {
          code: 'CS304L',
          title: 'Database & OS Systems Engineering Lab',
          type: 'Laboratory',
          credits: 2,
          ltp: '0-0-4',
          units: [
            'Complex SQL querying, lock contention simulation, kernel module development and process schedulers.'
          ],
          learningOutcome: 'Debug database bottlenecks and configure system daemon services.'
        }
      ]
    },
    {
      semesterNumber: 4,
      title: 'Semester IV · Computer Networks & Web Architectures',
      credits: 21,
      courses: [
        {
          code: 'CS401',
          title: 'Computer Networks & Internet Protocols',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: OSI & TCP/IP Reference Models, Physical Layer Transmission',
            'Unit 2: Data Link Layer: Framing, Error Detection (CRC), MAC Protocols',
            'Unit 3: Network Layer: IPv4/IPv6, Subnetting, Routing (OSPF, BGP)',
            'Unit 4: Transport Layer: TCP Flow Control, Congestion Control, UDP',
            'Unit 5: Application Protocols: HTTP/3, DNS, WebSocket, TLS Security'
          ],
          learningOutcome: 'Configure routers, subnets, and diagnose network packet flows using Wireshark.'
        },
        {
          code: 'CS402',
          title: 'Theory of Computation & Compiler Principles',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Deterministic & Nondeterministic Finite Automata (DFA/NFA)',
            'Unit 2: Regular Expressions & Pumping Lemma for Regular Languages',
            'Unit 3: Context-Free Grammars & Pushdown Automata (PDA)',
            'Unit 4: Turing Machines & Church-Turing Thesis',
            'Unit 5: Lexical Analysis, Parsing (LL/LR) & Intermediate Code Generation'
          ],
          learningOutcome: 'Understand limits of computation and build domain-specific language parsers.'
        },
        {
          code: 'CS403',
          title: 'Full-Stack Web Development & Modern Frameworks',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Unit 1: Modern JavaScript (ESNext), TypeScript & DOM Manipulation',
            'Unit 2: Component Architecture with React / Next.js',
            'Unit 3: Backend REST & GraphQL APIs with Node.js / Express / Fastify',
            'Unit 4: State Management, SSR, Hydration & Performance Optimization',
            'Unit 5: Authentication, Security Headers & Production Deployment'
          ],
          learningOutcome: 'Develop responsive, full-stack web applications with end-to-end type safety.'
        },
        {
          code: 'CS404P',
          title: 'Intermediate Industry Software Capstone',
          type: 'Project',
          credits: 3,
          ltp: '0-0-6',
          units: [
            'Build an end-to-end functional cloud web service with authenticated users and a persistent database.'
          ],
          learningOutcome: 'Deliver a finished full-stack application following industry Agile workflows.'
        }
      ]
    }
  ]

  if (totalSems >= 6) {
    sems.push(
      {
        semesterNumber: 5,
        title: 'Semester V · AI Foundations, Cyber Security & Specialization',
        credits: 22,
        courses: [
          {
            code: 'CS501',
            title: `Specialization Focus: ${spec}`,
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              `Unit 1: Fundamental principles and architecture of ${spec}`,
              `Unit 2: Core algorithms, mathematical models and frameworks`,
              `Unit 3: Real-world industry case studies and production standards`,
              `Unit 4: Integration with enterprise systems and security concerns`,
              `Unit 5: Emerging advancements and research frontiers`
            ],
            learningOutcome: `Master practical methodologies and design patterns in ${spec}.`
          },
          {
            code: 'CS502',
            title: 'Artificial Intelligence & Intelligent Agents',
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Search Strategies: A*, Minimax, Alpha-Beta Pruning',
              'Unit 2: Knowledge Representation, First-Order Logic & Ontologies',
              'Unit 3: Probabilistic Reasoning & Bayesian Networks',
              'Unit 4: Reinforcement Learning: Markov Decision Processes & Q-Learning',
              'Unit 5: Ethical AI, Bias Mitigation & Explainability'
            ],
            learningOutcome: 'Design heuristic agents capable of automated reasoning and problem solving.'
          },
          {
            code: 'CS503',
            title: 'Cybersecurity Principles & Applied Cryptography',
            type: 'Core',
            credits: 4,
            ltp: '3-0-0',
            units: [
              'Unit 1: Symmetric Encryption (AES) & Asymmetric Cryptosystems (RSA, ECC)',
              'Unit 2: Hash Functions (SHA-3), Digital Signatures & HMAC',
              'Unit 3: Network Attacks (MITM, DDoS, ARP spoofing) & Firewalls',
              'Unit 4: Web Application Vulnerabilities (OWASP Top 10) & Mitigation',
              'Unit 5: Digital Forensics & Incident Response Workflows'
            ],
            learningOutcome: 'Perform vulnerability scans and secure application endpoints against cyber intrusions.'
          }
        ]
      },
      {
        semesterNumber: 6,
        title: 'Semester VI · Cloud DevOps, Big Data & Industry Project',
        credits: 20,
        courses: [
          {
            code: 'CS601',
            title: 'Cloud Computing Infrastructure & Containerization',
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Virtualization Technologies & Docker Containers',
              'Unit 2: Kubernetes Cluster Architecture & Pod Management',
              'Unit 3: Cloud Storage & Multi-Zone Database Replication',
              'Unit 4: Serverless Computing with AWS Lambda / GCP Functions',
              'Unit 5: Monitoring, Logging & Observability (Prometheus, Grafana)'
            ],
            learningOutcome: 'Containerize, orchestrate, and monitor cloud-native enterprise services.'
          },
          {
            code: 'CS602E',
            title: 'Professional Elective Track I',
            type: 'Elective',
            credits: 3,
            ltp: '3-0-0',
            units: [
              'Choice of: Natural Language Processing, Blockchain Architecture, or Embedded IoT Systems.'
            ],
            learningOutcome: 'Gain deep competency in specialized emerging computer science fields.'
          },
          {
            code: 'CS603P',
            title: 'Industry Capstone Project - Phase I',
            type: 'Project',
            credits: 4,
            ltp: '0-0-8',
            units: [
              'Problem formulation, requirement specification, design documentation, and minimum viable product demo.'
            ],
            learningOutcome: 'Build complex software systems under faculty and industry mentor supervision.'
          }
        ]
      }
    )
  }

  if (totalSems >= 8) {
    sems.push(
      {
        semesterNumber: 7,
        title: 'Semester VII · Advanced Electives & Research Practicum',
        credits: 18,
        courses: [
          {
            code: 'CS701E',
            title: 'Professional Elective Track II: Distributed Systems & MLOps',
            type: 'Elective',
            credits: 3,
            ltp: '3-0-0',
            units: [
              'Unit 1: Consensus Protocols (Raft, Paxos), CAP Theorem',
              'Unit 2: Feature Stores, Model Registry & Continuous Training Pipelines',
              'Unit 3: High-Performance GPU Computing (CUDA)',
              'Unit 4: Edge AI Inference Optimization'
            ],
            learningOutcome: 'Deploy automated machine learning lifecycle systems at scale.'
          },
          {
            code: 'CS702',
            title: 'Intellectual Property Rights & Software Licensing',
            type: 'Humanities',
            credits: 2,
            ltp: '2-0-0',
            units: [
              'Patents, copyrights, open-source licenses (MIT, Apache, GPL), trade secrets, and cyber ethics.'
            ],
            learningOutcome: 'Evaluate IP implications and navigate software licensing agreements.'
          },
          {
            code: 'CS703P',
            title: 'Senior Capstone Project - Phase II',
            type: 'Project',
            credits: 6,
            ltp: '0-0-12',
            units: [
              'Final production system implementation, rigorous testing, code audit, deployment and thesis defense.'
            ],
            learningOutcome: 'Deliver a production-ready engineering product with complete documentation.'
          }
        ]
      },
      {
        semesterNumber: 8,
        title: 'Semester VIII · Full-Semester Industry Internship / Research',
        credits: 16,
        courses: [
          {
            code: 'CS801I',
            title: 'Full-Semester Corporate Industry Internship',
            type: 'Project',
            credits: 16,
            ltp: '0-0-32',
            units: [
              'Six-month immersive placement in leading technology companies, startups, or research laboratories.'
            ],
            learningOutcome: 'Transition smoothly from university coursework to professional engineering practice.'
          }
        ]
      }
    )
  }

  return sems
}

function getManagementSyllabus(p: SandipMasterProgram): SyllabusSemester[] {
  const isMBA = p.course.includes('MBA')
  const spec = p.specialization

  if (isMBA) {
    return [
      {
        semesterNumber: 1,
        title: 'Semester I · Management Foundations & Analytical Tools',
        credits: 24,
        courses: [
          {
            code: 'MB101',
            title: 'Managerial Economics & Decision Making',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Demand Analysis, Elasticity & Market Forecasting',
              'Unit 2: Production Functions, Cost Concepts & Scale Economies',
              'Unit 3: Market Structures: Perfect Competition, Monopoly, Oligopoly',
              'Unit 4: Pricing Strategies in Digital & Platform Economies',
              'Unit 5: Macroeconomic Indicators, Inflation & Monetary Policy'
            ],
            learningOutcome: 'Apply micro and macroeconomic principles to corporate pricing and market strategies.'
          },
          {
            code: 'MB102',
            title: 'Financial Accounting & Reporting for Executives',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Financial Statements: Balance Sheet, Income Statement & Cash Flows',
              'Unit 2: Ratio Analysis, Working Capital & Liquidity Assessment',
              'Unit 3: Cost Accounting, Break-Even Analysis & Margin of Safety',
              'Unit 4: Corporate Governance & Financial Statement Quality',
              'Unit 5: Indian Accounting Standards (Ind-AS) and IFRS'
            ],
            learningOutcome: 'Interpret corporate financial statements to guide investment and operational choices.'
          },
          {
            code: 'MB103',
            title: 'Organizational Behavior & Human Capital Dynamics',
            type: 'Core',
            credits: 4,
            ltp: '3-0-0',
            units: [
              'Unit 1: Personality, Perception, Emotional Intelligence & Values',
              'Unit 2: Motivation Theories & Workplace Performance Drivers',
              'Unit 3: Group Dynamics, High-Performance Teams & Conflict Resolution',
              'Unit 4: Leadership Paradigms & Transformational Leadership',
              'Unit 5: Organizational Culture, Change Management & Agility'
            ],
            learningOutcome: 'Lead cross-functional teams and steer organizational change effectively.'
          },
          {
            code: 'MB104',
            title: 'Marketing Management & Consumer Insights',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Market Segmentation, Targeting & Brand Positioning (STP)',
              'Unit 2: Consumer Decision Journey & Behavioral Economics',
              'Unit 3: Product Lifecycle, Innovation & Portfolio Management',
              'Unit 4: Pricing, Omnichannel Distribution & Supply Linkages',
              'Unit 5: Integrated Marketing Communications & Digital Media Mix'
            ],
            learningOutcome: 'Formulate go-to-market strategies tailored to evolving consumer behaviors.'
          },
          {
            code: 'MB105',
            title: 'Business Statistics & Predictive Data Analytics',
            type: 'Core',
            credits: 4,
            ltp: '3-0-2',
            units: [
              'Unit 1: Descriptive Analytics, Probability Distributions & Sampling',
              'Unit 2: Hypothesis Testing, ANOVA & Chi-Square Analysis',
              'Unit 3: Multiple Regression & Time Series Forecasting in Excel/R',
              'Unit 4: Business Dashboarding with Power BI & Tableau',
              'Unit 5: Data-Driven Decision Frameworks'
            ],
            learningOutcome: 'Build quantitative models to forecast business outcomes and inform strategy.'
          }
        ]
      },
      {
        semesterNumber: 2,
        title: 'Semester II · Operations, Corporate Finance & Strategic Leadership',
        credits: 24,
        courses: [
          {
            code: 'MB201',
            title: 'Corporate Finance & Valuation Strategies',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Time Value of Money, NPV, IRR & Capital Budgeting',
              'Unit 2: Cost of Capital (WACC) & Capital Structure Decisions',
              'Unit 3: Dividend Policy & Working Capital Financing',
              'Unit 4: Corporate Valuation: Discounted Cash Flow (DCF) & Multiples',
              'Unit 5: Mergers, Acquisitions & Corporate Restructuring'
            ],
            learningOutcome: 'Value businesses and evaluate capital investment projects for shareholder wealth.'
          },
          {
            code: 'MB202',
            title: 'Operations & Supply Chain Management',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Process Design, Capacity Planning & Layout Strategies',
              'Unit 2: Quality Management: Six Sigma, Lean Operations & TQM',
              'Unit 3: Inventory Control Models (EOQ, JIT, Safety Stock)',
              'Unit 4: Global Supply Chain Logistics, Warehousing & Procurement',
              'Unit 5: Industry 4.0 in Operations & Smart Manufacturing'
            ],
            learningOutcome: 'Streamline operational workflows and optimize supply chains for maximum efficiency.'
          },
          {
            code: 'MB203',
            title: `Specialization Core: Advanced ${spec}`,
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              `Unit 1: Strategic Foundations of ${spec}`,
              `Unit 2: Practical Methodologies, Metrics and KPIs`,
              `Unit 3: Regulatory Compliance and Industry Frameworks`,
              `Unit 4: Global Best Practices and Disruptive Trends`,
              `Unit 5: Capstone Business Case Studies and Simulations`
            ],
            learningOutcome: `Apply advanced domain knowledge in ${spec} to complex business situations.`
          },
          {
            code: 'MB204',
            title: 'Legal Environment of Business & Corporate Governance',
            type: 'Core',
            credits: 3,
            ltp: '3-0-0',
            units: [
              'Unit 1: Indian Contract Act & Commercial Contracts',
              'Unit 2: Companies Act 2013: Director Duties, ESG & Compliance',
              'Unit 3: Intellectual Property Rights & Consumer Protection Act',
              'Unit 4: Information Technology Act, Cyber Security & Data Privacy',
              'Unit 5: Corporate Governance & Business Ethics'
            ],
            learningOutcome: 'Mitigate legal and regulatory risks in commercial operations.'
          },
          {
            code: 'MB205P',
            title: 'Summer Internship Project & Corporate Fieldwork',
            type: 'Project',
            credits: 4,
            ltp: '0-0-8',
            units: [
              '8-week intensive corporate summer project investigating an active business challenge.'
            ],
            learningOutcome: 'Deliver actionable managerial recommendations based on live company data.'
          }
        ]
      },
      {
        semesterNumber: 3,
        title: 'Semester III · Advanced Specializations & Strategy',
        credits: 22,
        courses: [
          {
            code: 'MB301',
            title: 'Strategic Management & Global Business Competitive Advantage',
            type: 'Core',
            credits: 4,
            ltp: '3-1-0',
            units: [
              'Unit 1: Industry Analysis, Five Forces & Resource-Based View (RBV)',
              'Unit 2: Business-Level & Corporate-Level Strategies',
              'Unit 3: Global Expansion Strategies & Cross-Border Entry Modes',
              'Unit 4: Strategy Execution, Balanced Scorecard & Governance',
              'Unit 5: Digital Disruption, Platform Strategies & Ecosystems'
            ],
            learningOutcome: 'Craft competitive corporate strategy in volatile, globalized business environments.'
          },
          {
            code: 'MB302E',
            title: `Elective Track I: ${spec} In-Depth Specialization`,
            type: 'Elective',
            credits: 4,
            ltp: '3-0-0',
            units: [
              'Focused domain electives addressing state-of-the-art tools, technologies, and market frameworks.'
            ],
            learningOutcome: 'Demonstrate subject-matter mastery in specialized management domains.'
          },
          {
            code: 'MB303E',
            title: 'Elective Track II: Emerging Business Models & FinTech',
            type: 'Elective',
            credits: 4,
            ltp: '3-0-0',
            units: [
              'Fintech ecosystems, digital payments, venture capital, and subscription economy mechanics.'
            ],
            learningOutcome: 'Analyze and commercialize digital-first business innovations.'
          }
        ]
      },
      {
        semesterNumber: 4,
        title: 'Semester IV · Master Capstone & Industry Dissertation',
        credits: 16,
        courses: [
          {
            code: 'MB401',
            title: 'Entrepreneurship, Venture Creation & Pitching',
            type: 'Core',
            credits: 4,
            ltp: '3-0-0',
            units: [
              'Unit 1: Opportunity Identification & Lean Startup Methodology',
              'Unit 2: Business Model Canvas & Customer Discovery',
              'Unit 3: Venture Financing, Pitch Decks & Term Sheets',
              'Unit 4: Scaling the Enterprise & Exit Strategies'
            ],
            learningOutcome: 'Build an investor-grade pitch deck and venture launch roadmap.'
          },
          {
            code: 'MB402D',
            title: 'Executive Capstone Research Dissertation',
            type: 'Project',
            credits: 12,
            ltp: '0-0-24',
            units: [
              'Comprehensive corporate research project, empirical investigation, and defense before expert panel.'
            ],
            learningOutcome: 'Synthesize managerial theory to solve complex organizational dilemmas.'
          }
        ]
      }
    ]
  }

  // UG: BBA or B.Com (6 Semesters)
  return [
    {
      semesterNumber: 1,
      title: 'Semester I · Business Fundamentals & Quantitative Skills',
      credits: 20,
      courses: [
        {
          code: 'BB101',
          title: 'Principles & Practices of Modern Management',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Evolution of Management Thought (Classical, Human Relations, Modern)',
            'Unit 2: Planning, Decision Making & Strategic Objectives',
            'Unit 3: Organizing, Departmentation & Span of Control',
            'Unit 4: Directing, Motivation & Interpersonal Communication',
            'Unit 5: Controlling Systems & Performance Benchmarking'
          ],
          learningOutcome: 'Understand foundational principles governing organizational productivity.'
        },
        {
          code: 'BB102',
          title: 'Financial Accounting & Bookkeeping',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Double-Entry Bookkeeping & Journalizing Transactions',
            'Unit 2: Trial Balance, Bank Reconciliation & Ledger Posting',
            'Unit 3: Depreciation Accounting (SLM and WDV Methods)',
            'Unit 4: Preparation of Final Accounts (Trading, P&L, Balance Sheet)',
            'Unit 5: Computerized Accounting Systems (Tally Prime / Zoho Books)'
          ],
          learningOutcome: 'Prepare final financial accounts adhering to standard accounting principles.'
        },
        {
          code: 'BB103',
          title: 'Business Economics & Market Dynamics',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Demand, Supply, Market Equilibrium & Elasticities',
            'Unit 2: Consumer Behavior: Utility Analysis & Indifference Curves',
            'Unit 3: Theory of Cost and Revenue Curves',
            'Unit 4: Market Forms: Perfect Competition, Monopoly & Monopolistic Competition',
            'Unit 5: National Income Concepts and Business Cycles'
          ],
          learningOutcome: 'Evaluate market equilibrium and price changes using economic tools.'
        },
        {
          code: 'BB104',
          title: 'Business Communication & Presentation Skills',
          type: 'Humanities',
          credits: 3,
          ltp: '2-0-2',
          units: [
            'Business correspondence, executive emails, boardroom presentations, and active listening.'
          ],
          learningOutcome: 'Communicate with clarity and confidence in executive corporate settings.'
        },
        {
          code: 'BB105',
          title: 'Computer Applications in Business & Excel Analytics',
          type: 'Laboratory',
          credits: 3,
          ltp: '1-0-4',
          units: [
            'Spreadsheet functions (VLOOKUP, INDEX-MATCH, XLOOKUP), Pivot Tables, and visual dashboards.'
          ],
          learningOutcome: 'Analyze business numbers quickly using advanced spreadsheet modeling.'
        }
      ]
    },
    {
      semesterNumber: 2,
      title: 'Semester II · Marketing, Organizational Behavior & Business Law',
      credits: 20,
      courses: [
        {
          code: 'BB201',
          title: 'Marketing Management & Consumer Behavior',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Marketing Concept & Customer Value Proposition',
            'Unit 2: Consumer Buying Process & Psychological Influences',
            'Unit 3: Product Strategy, Branding & Packaging',
            'Unit 4: Pricing Methods & Promotional Mix Planning',
            'Unit 5: Distribution Channels, Retailing & E-Commerce'
          ],
          learningOutcome: 'Develop practical marketing campaigns targeting verified consumer segments.'
        },
        {
          code: 'BB202',
          title: 'Business Mathematics & Statistics',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Commercial Arithmetic: Simple & Compound Interest, Annuities',
            'Unit 2: Measures of Central Tendency & Dispersion',
            'Unit 3: Correlation & Simple Linear Regression',
            'Unit 4: Index Numbers & Time Series Trends',
            'Unit 5: Basic Probability & Binomial Distribution'
          ],
          learningOutcome: 'Apply statistical analysis to evaluate operational and sales data.'
        },
        {
          code: 'BB203',
          title: 'Mercantile & Business Law',
          type: 'Core',
          credits: 4,
          ltp: '3-0-0',
          units: [
            'Unit 1: Indian Contract Act 1872: Formation, Consideration & Breach',
            'Unit 2: Sale of Goods Act 1930: Conditions, Warranties & Passing of Title',
            'Unit 3: Negotiable Instruments Act 1881: Cheques, Bills & Notes',
            'Unit 4: Consumer Protection Act 2019 & E-Commerce Rules',
            'Unit 5: Partnership Act & Limited Liability Partnerships (LLP)'
          ],
          learningOutcome: 'Draft enforceable agreements and ensure regulatory compliance in trade.'
        },
        {
          code: 'BB204',
          title: 'Human Resource Management & Workplace Culture',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: HR Planning, Job Analysis & Job Description Design',
            'Unit 2: Recruitment Strategies, Selection Tests & Interviews',
            'Unit 3: Training Needs Analysis & Employee Development',
            'Unit 4: Performance Appraisal Systems (360-degree, KPI, OKRs)',
            'Unit 5: Compensation, Employee Welfare & Industrial Relations'
          ],
          learningOutcome: 'Design effective recruitment and performance appraisal pipelines.'
        }
      ]
    },
    {
      semesterNumber: 3,
      title: 'Semester III · Corporate Accounting & Cost Management',
      credits: 20,
      courses: [
        {
          code: 'BB301',
          title: 'Cost & Management Accounting',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Elements of Cost: Materials, Labor & Overhead Allocation',
            'Unit 2: Marginal Costing & Cost-Volume-Profit (CVP) Analysis',
            'Unit 3: Budgetary Control & Variance Analysis',
            'Unit 4: Standard Costing Systems',
            'Unit 5: Activity-Based Costing (ABC) and Target Costing'
          ],
          learningOutcome: 'Identify cost drivers and optimize product margins.'
        },
        {
          code: 'BB302',
          title: `Specialization Focus I: ${spec}`,
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            `Comprehensive grounding in principles, frameworks, and methodologies of ${spec}.`
          ],
          learningOutcome: `Apply domain practices in ${spec} to company problems.`
        },
        {
          code: 'BB303',
          title: 'Financial Management Fundamentals',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Unit 1: Objectives of Financial Management: Profit vs Wealth Maximization',
            'Unit 2: Time Value of Money & Valuation of Securities',
            'Unit 3: Capital Budgeting: Payback Period, NPV & IRR',
            'Unit 4: Leverage: Operating, Financial & Combined Leverage',
            'Unit 5: Working Capital Management'
          ],
          learningOutcome: 'Determine optimal capital structure and budget financial outlays.'
        }
      ]
    },
    {
      semesterNumber: 4,
      title: 'Semester IV · Corporate Governance, Taxation & Research',
      credits: 20,
      courses: [
        {
          code: 'BB401',
          title: 'Direct & Indirect Taxes (GST)',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Income tax provisions for individuals and corporates, GST computation, input tax credit, and filing.'
          ],
          learningOutcome: 'Calculate tax obligations and file standard compliance returns.'
        },
        {
          code: 'BB402',
          title: `Specialization Focus II: Advanced ${spec}`,
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            `In-depth exploration of tools, contemporary case studies, and practical workflows in ${spec}.`
          ],
          learningOutcome: `Formulate operational solutions aligned with ${spec} standards.`
        },
        {
          code: 'BB403',
          title: 'Business Research Methodology & Data Analysis',
          type: 'Core',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Research design, questionnaire drafting, sampling methods, and hypothesis testing in SPSS/Excel.'
          ],
          learningOutcome: 'Conduct empirical research to solve business inquiries.'
        }
      ]
    },
    {
      semesterNumber: 5,
      title: 'Semester V · Strategic Management & Industry Specialization',
      credits: 20,
      courses: [
        {
          code: 'BB501',
          title: 'Strategic Management & Business Policy',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Environmental scanning, SWOT/PESTEL analysis, competitive advantage, and strategy implementation.'
          ],
          learningOutcome: 'Synthesize cross-functional business strategies for market resilience.'
        },
        {
          code: 'BB502',
          title: `Specialization Elective: ${spec} Practicum`,
          type: 'Elective',
          credits: 4,
          ltp: '3-0-2',
          units: [
            'Real-world simulation, live project analysis, and guest executive case studies.'
          ],
          learningOutcome: 'Deliver consulting-level recommendations for corporate scenarios.'
        },
        {
          code: 'BB503P',
          title: 'Summer Internship Project & Viva Voce',
          type: 'Project',
          credits: 4,
          ltp: '0-0-8',
          units: [
            'Summer internship completed in corporate organization with detailed field report and viva defense.'
          ],
          learningOutcome: 'Gain authentic professional exposure in a commercial organization.'
        }
      ]
    },
    {
      semesterNumber: 6,
      title: 'Semester VI · Global Business, Entrepreneurship & Capstone',
      credits: 20,
      courses: [
        {
          code: 'BB601',
          title: 'Entrepreneurship & Start-up Management',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Venture idea validation, business model design, seed funding, marketing for startups, and pitch deck.'
          ],
          learningOutcome: 'Build and present a viable startup business proposal.'
        },
        {
          code: 'BB602',
          title: 'International Business & Global Logistics',
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            'Cross-border trade mechanics, export documentation, foreign exchange risks, and global sourcing.'
          ],
          learningOutcome: 'Understand international trade regulations and supply procedures.'
        },
        {
          code: 'BB603P',
          title: 'Final Undergraduate Capstone Dissertation',
          type: 'Project',
          credits: 6,
          ltp: '0-0-12',
          units: [
            'Original primary/secondary research dissertation on a chosen business theme with committee defense.'
          ],
          learningOutcome: 'Produce a comprehensive business study demonstrating academic and analytical mastery.'
        }
      ]
    }
  ]
}

function getGenericSyllabus(p: SandipMasterProgram): SyllabusSemester[] {
  const isUG = p.level === 'UG' || p.level === 'Diploma'
  const semsCount = p.level === 'Diploma' ? 4 : (isUG ? (p.course.includes('LL.B') && p.course.includes('B.A') ? 10 : (p.course.includes('B.Tech') || p.course.includes('B.Des') ? 8 : 6)) : (p.level === 'PhD' ? 2 : 4))
  const sems: SyllabusSemester[] = []

  for (let s = 1; s <= semsCount; s++) {
    sems.push({
      semesterNumber: s,
      title: `Semester ${s} · ${p.specialization} Curricular Modules`,
      credits: 20,
      courses: [
        {
          code: `${p.course.replace(/[^A-Z]/g, '')}${s}01`,
          title: `Core Principles of ${p.specialization} - Module ${s}`,
          type: 'Core',
          credits: 4,
          ltp: '3-1-0',
          units: [
            `Unit 1: Theoretical foundations and structural principles of ${p.specialization}`,
            `Unit 2: Analytical methods, computational models, and measurement benchmarks`,
            `Unit 3: Applied domain workflows, standard operating procedures, and industry protocols`,
            `Unit 4: Quality assurance, compliance standards, and risk mitigation strategies`,
            `Unit 5: Case studies, contemporary industry practices, and future technology trends`
          ],
          learningOutcome: `Gain mastery of essential methodologies and regulatory frameworks in ${p.specialization}.`
        },
        {
          code: `${p.course.replace(/[^A-Z]/g, '')}${s}02`,
          title: `${p.specialization}: Practical Laboratory & Studio Practicum`,
          type: 'Laboratory',
          credits: 3,
          ltp: '1-0-4',
          units: [
            `Hands-on experimental setups, laboratory testing protocols, and design studio assignments.`
          ],
          learningOutcome: `Execute practical investigations with rigorous adherence to academic and safety norms.`
        },
        {
          code: `${p.course.replace(/[^A-Z]/g, '')}${s}03`,
          title: `Interdisciplinary Elective & Professional Ethics`,
          type: 'Elective',
          credits: 3,
          ltp: '3-0-0',
          units: [
            `Choice of specialized modern electives, ethical guidelines, and professional responsibility.`
          ],
          learningOutcome: `Evaluate ethical considerations and cross-disciplinary applications in professional practice.`
        }
      ]
    })
  }

  return sems
}

// ---------------------------------------------------------------------------
// Master Program Syllabus Resolver
// ---------------------------------------------------------------------------

export function getProgramSyllabus(programId: string): ProgramSyllabus | null {
  const p = PROGRAMS.find((x) => x.id === programId)
  if (!p) return null

  let semesters: SyllabusSemester[]
  let durationYears = 4
  let totalSemesters = 8
  let totalCredits = 160

  if (p.school === 'Computer Science & Engineering') {
    semesters = getCSESyllabus(p)
    durationYears = p.level === 'PG' ? 2 : (p.course.includes('BCA') || p.course.includes('B.Sc') ? 3 : 4)
    totalSemesters = semesters.length
    totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0)
  } else if (p.school === 'Commerce & Management Studies') {
    semesters = getManagementSyllabus(p)
    durationYears = p.level === 'PG' ? 2 : 3
    totalSemesters = semesters.length
    totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0)
  } else {
    semesters = getGenericSyllabus(p)
    durationYears = p.level === 'PG' ? 2 : (p.course.includes('B.Des') || p.course.includes('B.Tech') ? 4 : (p.course.includes('LL.B') && p.course.includes('B.A') ? 5 : 3))
    totalSemesters = semesters.length
    totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0)
  }

  const overview = `${p.name} at Sandip University (${p.school}) is an outcome-based academic curriculum designed under the Choice Based Credit System (CBCS) aligned with the National Education Policy (NEP 2020). The curriculum balances rigorous academic theory with laboratory experimentation, industrial internships, and multidisciplinary electives.`

  const careerOutcomes = (p.careerSource || 'Industry practitioner, researcher, academician')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    programId: p.id,
    name: p.name,
    school: p.school,
    level: p.level,
    durationYears,
    totalSemesters,
    totalCredits,
    academicFramework: 'NEP 2020 & Choice Based Credit System (CBCS)',
    overview,
    semesters,
    specializationTracks: [
      {
        name: 'Industry Core & Technological Foundations',
        description: 'Core subject modules providing fundamental engineering, analytical, and managerial competency.',
        subjects: semesters[0]?.courses.map((c) => c.title) || []
      },
      {
        name: 'Advanced Discipline Specialization',
        description: 'Advanced elective courses tailored to industry expectations and contemporary research frontiers.',
        subjects: semesters[semesters.length - 1]?.courses.map((c) => c.title) || []
      }
    ],
    careerOutcomes,
    accreditationNotes: 'UGC Recognized · Approved by Regulatory Bodies (AICTE / BCI / PCI where applicable) · ISO Certified Campus'
  }
}
