-- ============================================================
-- Career Intelligence ERP - Seed Data
-- Migration: 002_seed_data.sql
-- ============================================================

-- ============================================================
-- INSTITUTIONS
-- ============================================================
INSERT INTO institutions (id, name, code, address, website) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Global Business School', 'GBS', '123 University Ave, Mumbai', 'https://gbs.example.com'),
  ('a1000000-0000-0000-0000-000000000002', 'Tech University', 'TU', '456 Innovation Road, Pune', 'https://tu.example.com');

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, institution_id, name, code) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'School of Business', 'SOB'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'School of Technology', 'SOT'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Department of Computer Science', 'DCS');

-- ============================================================
-- TRAITS (15 psychometric traits)
-- ============================================================
INSERT INTO traits (id, name, description, category) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Analytical Thinking', 'Ability to break down complex problems into components and reason logically', 'COGNITIVE'),
  ('c0000000-0000-0000-0000-000000000002', 'Quantitative Thinking', 'Comfort with numbers, data and quantitative reasoning', 'COGNITIVE'),
  ('c0000000-0000-0000-0000-000000000003', 'Problem Solving', 'Ability to identify, analyze, and find solutions to problems', 'COGNITIVE'),
  ('c0000000-0000-0000-0000-000000000004', 'Creativity', 'Tendency to generate novel ideas and think outside conventional boundaries', 'PERSONALITY'),
  ('c0000000-0000-0000-0000-000000000005', 'Communication', 'Effectiveness in conveying information and ideas to others', 'BEHAVIORAL'),
  ('c0000000-0000-0000-0000-000000000006', 'Leadership', 'Tendency to take charge, motivate others, and drive outcomes', 'BEHAVIORAL'),
  ('c0000000-0000-0000-0000-000000000007', 'Persuasion', 'Ability to influence others and build compelling arguments', 'BEHAVIORAL'),
  ('c0000000-0000-0000-0000-000000000008', 'People Orientation', 'Enjoyment of working with, helping, and understanding people', 'PERSONALITY'),
  ('c0000000-0000-0000-0000-000000000009', 'Technology Orientation', 'Interest in and comfort with technology, tools and systems', 'PERSONALITY'),
  ('c0000000-0000-0000-0000-000000000010', 'Planning', 'Preference for structured, organized, goal-oriented approaches', 'BEHAVIORAL'),
  ('c0000000-0000-0000-0000-000000000011', 'Risk Orientation', 'Comfort with ambiguity, calculated risk-taking, and uncertainty', 'PERSONALITY'),
  ('c0000000-0000-0000-0000-000000000012', 'Attention to Detail', 'Thoroughness, accuracy, and precision in tasks', 'BEHAVIORAL'),
  ('c0000000-0000-0000-0000-000000000013', 'Business Thinking', 'Understanding of business dynamics, market forces and commercial strategy', 'COGNITIVE'),
  ('c0000000-0000-0000-0000-000000000014', 'Adaptability', 'Flexibility to adjust to change and new circumstances', 'PERSONALITY'),
  ('c0000000-0000-0000-0000-000000000015', 'Structured Thinking', 'Preference for frameworks, processes and systematic approaches', 'COGNITIVE');

-- ============================================================
-- CAREER DOMAINS (12 domains)
-- ============================================================
INSERT INTO career_domains (id, name, description, icon) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Data Analytics', 'Extracting insights from data to drive business decisions', 'BarChart2'),
  ('d0000000-0000-0000-0000-000000000002', 'Business Intelligence', 'Building systems to transform raw data into actionable intelligence', 'TrendingUp'),
  ('d0000000-0000-0000-0000-000000000003', 'Finance', 'Financial analysis, planning, and value management', 'DollarSign'),
  ('d0000000-0000-0000-0000-000000000004', 'Marketing', 'Brand building, customer acquisition and market analysis', 'Megaphone'),
  ('d0000000-0000-0000-0000-000000000005', 'Human Resources', 'Talent acquisition, employee development and organizational culture', 'Users'),
  ('d0000000-0000-0000-0000-000000000006', 'Operations', 'Process optimization, supply chain, and operational efficiency', 'Settings'),
  ('d0000000-0000-0000-0000-000000000007', 'Product Management', 'Defining, building and launching products that solve user problems', 'Package'),
  ('d0000000-0000-0000-0000-000000000008', 'Strategy & Consulting', 'High-level business problem solving and strategic advisory', 'Lightbulb'),
  ('d0000000-0000-0000-0000-000000000009', 'Entrepreneurship', 'Identifying opportunities and building ventures from scratch', 'Rocket'),
  ('d0000000-0000-0000-0000-000000000010', 'Technology', 'Software development, systems design, and technical innovation', 'Code'),
  ('d0000000-0000-0000-0000-000000000011', 'Risk Analytics', 'Quantifying, modeling and managing business and financial risk', 'ShieldAlert'),
  ('d0000000-0000-0000-0000-000000000012', 'Research', 'Systematic investigation and knowledge creation', 'Search');

-- ============================================================
-- DOMAIN TRAIT WEIGHTS (configurable mappings)
-- ============================================================
-- Data Analytics
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1.0), -- Analytical: High
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 1.0), -- Quantitative: High
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 1.0), -- Problem Solving: High
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 0.8), -- Technology: High
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000012', 1.0), -- Attention to Detail: High
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 0.6), -- Communication: Medium
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000015', 0.8); -- Structured Thinking: High

-- Business Intelligence
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 1.0),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 0.8),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', 0.8),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000009', 0.8),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015', 0.8),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000012', 0.8);

-- Finance
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 1.0),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 1.0),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000012', 1.0),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 0.6),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000013', 1.0),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000015', 0.8);

-- Marketing
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 1.0),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 1.0),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', 1.0),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', 1.0),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000013', 0.8),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000014', 0.6);

-- Human Resources
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000008', 1.0),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 1.0),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 0.6),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000014', 0.8),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000010', 0.6);

-- Operations
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 1.0),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000010', 1.0),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000015', 1.0),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000012', 0.8),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000013', 0.6);

-- Product Management
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 1.0),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005', 1.0),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000013', 1.0),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 0.6),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000009', 0.6),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000014', 0.8);

-- Strategy & Consulting
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 1.0),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 1.0),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000013', 1.0),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000005', 1.0),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000015', 0.8),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000006', 0.8);

-- Entrepreneurship
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000011', 1.0),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', 1.0),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000006', 1.0),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000014', 1.0),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000013', 0.8),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 0.8);

-- Technology
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000009', 1.0),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 1.0),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 1.0),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000015', 0.8),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000012', 0.8),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000014', 0.6);

-- Risk Analytics
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 1.0),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 1.0),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000011', 1.0),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000012', 0.8),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000015', 0.8);

-- Research
INSERT INTO domain_trait_weights (domain_id, trait_id, weight) VALUES
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000001', 1.0),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000012', 1.0),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000015', 1.0),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 0.8),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 0.8);

-- ============================================================
-- CAREER ROLES (25+ roles across domains)
-- ============================================================
INSERT INTO career_roles (id, domain_id, name, description) VALUES
  -- Data Analytics
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Data Analyst', 'Analyze data to generate business insights and reports'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Business Analyst', 'Bridge between business needs and data solutions'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'BI Analyst', 'Build dashboards and reporting systems'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Operations Analyst', 'Analyze operational data to improve processes'),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Marketing Analyst', 'Analyze marketing campaigns and customer data'),
  -- Finance
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'Financial Analyst', 'Evaluate financial data and prepare reports'),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'Risk Analyst', 'Identify and quantify financial risks'),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 'FP&A Analyst', 'Financial planning and analysis'),
  ('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000003', 'Investment Analyst', 'Evaluate investment opportunities'),
  -- Marketing
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000004', 'Marketing Manager', 'Lead marketing strategy and campaigns'),
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000004', 'Digital Marketing Analyst', 'Analyze digital marketing performance'),
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000004', 'Market Research Analyst', 'Conduct market research and competitive analysis'),
  -- HR
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000005', 'HR Business Partner', 'Strategic HR support for business units'),
  ('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000005', 'Talent Acquisition Specialist', 'Recruit and hire top talent'),
  ('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000005', 'Learning & Development Specialist', 'Design training programs'),
  -- Product
  ('e0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000007', 'Associate Product Manager', 'Support product development and roadmap'),
  ('e0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000007', 'Product Analyst', 'Analyze product usage and user behavior'),
  -- Strategy & Consulting
  ('e0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000008', 'Strategy Analyst', 'Support strategy consulting engagements'),
  ('e0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000008', 'Consulting Analyst', 'Solve complex business problems for clients'),
  -- Operations
  ('e0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000006', 'Operations Manager', 'Oversee day-to-day operational activities'),
  ('e0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000006', 'Supply Chain Analyst', 'Optimize supply chain processes'),
  -- Technology
  ('e0000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000010', 'Software Engineer', 'Design and build software systems'),
  ('e0000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000010', 'Data Engineer', 'Build data pipelines and infrastructure'),
  -- Risk Analytics
  ('e0000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000011', 'Credit Risk Analyst', 'Model and manage credit risk'),
  ('e0000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000011', 'Quantitative Analyst', 'Develop quantitative models for risk management');

-- ============================================================
-- SKILLS (35+ skills)
-- ============================================================
INSERT INTO skills (id, name, category) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Microsoft Excel', 'Tools'),
  ('f0000000-0000-0000-0000-000000000002', 'SQL', 'Technical'),
  ('f0000000-0000-0000-0000-000000000003', 'Power BI', 'Tools'),
  ('f0000000-0000-0000-0000-000000000004', 'Tableau', 'Tools'),
  ('f0000000-0000-0000-0000-000000000005', 'Python', 'Technical'),
  ('f0000000-0000-0000-0000-000000000006', 'Statistics', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000007', 'Business Communication', 'Soft Skills'),
  ('f0000000-0000-0000-0000-000000000008', 'Requirements Analysis', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000009', 'Data Visualization', 'Technical'),
  ('f0000000-0000-0000-0000-000000000010', 'Financial Modeling', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000011', 'Accounting', 'Domain'),
  ('f0000000-0000-0000-0000-000000000012', 'Valuation', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000013', 'Market Research', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000014', 'Digital Marketing', 'Domain'),
  ('f0000000-0000-0000-0000-000000000015', 'SEO/SEM', 'Technical'),
  ('f0000000-0000-0000-0000-000000000016', 'Project Management', 'Soft Skills'),
  ('f0000000-0000-0000-0000-000000000017', 'Problem Solving', 'Soft Skills'),
  ('f0000000-0000-0000-0000-000000000018', 'Presentation Skills', 'Soft Skills'),
  ('f0000000-0000-0000-0000-000000000019', 'Stakeholder Management', 'Soft Skills'),
  ('f0000000-0000-0000-0000-000000000020', 'Product Roadmapping', 'Domain'),
  ('f0000000-0000-0000-0000-000000000021', 'Agile Methodology', 'Domain'),
  ('f0000000-0000-0000-0000-000000000022', 'Supply Chain Management', 'Domain'),
  ('f0000000-0000-0000-0000-000000000023', 'Risk Management', 'Domain'),
  ('f0000000-0000-0000-0000-000000000024', 'Machine Learning', 'Technical'),
  ('f0000000-0000-0000-0000-000000000025', 'R Programming', 'Technical'),
  ('f0000000-0000-0000-0000-000000000026', 'Business Case Analysis', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000027', 'Strategic Thinking', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000028', 'Negotiation', 'Soft Skills'),
  ('f0000000-0000-0000-0000-000000000029', 'HR Analytics', 'Domain'),
  ('f0000000-0000-0000-0000-000000000030', 'Talent Management', 'Domain'),
  ('f0000000-0000-0000-0000-000000000031', 'Portfolio Management', 'Domain'),
  ('f0000000-0000-0000-0000-000000000032', 'Quantitative Analysis', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000033', 'Process Improvement', 'Domain'),
  ('f0000000-0000-0000-0000-000000000034', 'Customer Analytics', 'Analytical'),
  ('f0000000-0000-0000-0000-000000000035', 'Leadership', 'Soft Skills');

-- ============================================================
-- ROLE-SKILL MAPPINGS (Business Analyst example)
-- ============================================================
INSERT INTO role_skills (role_id, skill_id, required_level, is_mandatory) VALUES
  -- Business Analyst
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 3, true),  -- Excel: Intermediate
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 3, true),  -- SQL: Intermediate
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000003', 3, true),  -- Power BI: Intermediate
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000006', 2, true),  -- Statistics: Elementary
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000007', 3, true),  -- Business Comm: Intermediate
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000008', 3, true),  -- Requirements Analysis
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000017', 3, true),  -- Problem Solving
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000009', 3, true),  -- Data Visualization
  -- Data Analyst
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 4, true),  -- SQL: Advanced
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000005', 3, true),  -- Python
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000006', 3, true),  -- Statistics
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000009', 4, true),  -- Data Viz
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 3, true),  -- Excel
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000004', 3, false), -- Tableau
  -- Financial Analyst
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 4, true),  -- Excel: Advanced
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000010', 4, true),  -- Financial Modeling
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000011', 3, true),  -- Accounting
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000012', 3, true),  -- Valuation
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000007', 3, true);  -- Business Comm

-- ============================================================
-- ASSESSMENT TEMPLATE & VERSION (Psychometric MVP)
-- ============================================================
INSERT INTO assessment_templates (id, name, description, assessment_type) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Career Alignment Assessment', 'Comprehensive psychometric, interest, behavioral and work preference assessment', 'PSYCHOMETRIC');

INSERT INTO assessment_versions (id, template_id, version_number, description, status, time_limit_minutes, is_resumable) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '1.0', 'Initial MVP version - 60 questions across 4 sections', 'ACTIVE', 90, true);

-- Assessment Sections
INSERT INTO assessment_sections (id, version_id, title, description, order_index) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Psychometric Profile', 'Understanding your cognitive and personality traits', 0),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Interest Inventory', 'Discovering your professional interests and passions', 1),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Behavioral Tendencies', 'Understanding how you work and interact with others', 2),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Work Preferences', 'Discovering your preferred work style and environment', 3);

-- ============================================================
-- QUESTIONS (20 sample Likert questions)
-- ============================================================
-- Section 1: Psychometric
INSERT INTO questions (id, section_id, question_text, question_type, weight, order_index, is_required, is_reverse_scored, max_scale) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'When solving a business problem, I prefer to examine data before forming a conclusion.', 'LIKERT_SCALE', 1.0, 1, true, false, 5),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'I find working with numbers and quantitative information energizing.', 'LIKERT_SCALE', 1.0, 2, true, false, 5),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'I enjoy breaking complex problems into smaller, manageable components.', 'LIKERT_SCALE', 1.0, 3, true, false, 5),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'I often come up with novel solutions that others have not considered.', 'LIKERT_SCALE', 1.0, 4, true, false, 5),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'I am comfortable presenting my ideas clearly to a group of people.', 'LIKERT_SCALE', 1.0, 5, true, false, 5),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', 'I naturally take charge when a group needs direction.', 'LIKERT_SCALE', 1.0, 6, true, false, 5),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000001', 'I can usually convince others to see my perspective.', 'LIKERT_SCALE', 1.0, 7, true, false, 5),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000001', 'I genuinely enjoy working with and helping other people.', 'LIKERT_SCALE', 1.0, 8, true, false, 5),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000001', 'I am curious about how technology can be applied to solve real problems.', 'LIKERT_SCALE', 1.0, 9, true, false, 5),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001', 'I rarely complete tasks without a clear plan or structure.', 'LIKERT_SCALE', 1.0, 10, true, false, 5),
  -- Section 2: Interest
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000002', 'I find financial markets and investment strategies genuinely fascinating.', 'LIKERT_SCALE', 1.0, 1, true, false, 5),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', 'I enjoy understanding what motivates people to make purchase decisions.', 'LIKERT_SCALE', 1.0, 2, true, false, 5),
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000002', 'I am drawn to roles where I can build and lead a team.', 'LIKERT_SCALE', 1.0, 3, true, false, 5),
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000002', 'I enjoy understanding organizational processes and making them more efficient.', 'LIKERT_SCALE', 1.0, 4, true, false, 5),
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000002', 'I enjoy exploring data to find hidden patterns or trends.', 'LIKERT_SCALE', 1.0, 5, true, false, 5),
  -- Section 3: Behavioral
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000003', 'When faced with conflict, I prefer to address it directly rather than avoid it.', 'LIKERT_SCALE', 1.0, 1, true, false, 5),
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000003', 'I tend to pay very close attention to the quality and accuracy of my work.', 'LIKERT_SCALE', 1.0, 2, true, false, 5),
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000003', 'I become energized when given a challenging problem with no clear solution.', 'LIKERT_SCALE', 1.0, 3, true, false, 5),
  -- Section 4: Work Preferences
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000004', 'I prefer working in a fast-paced environment over a predictable routine.', 'LIKERT_SCALE', 1.0, 1, true, false, 5),
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000004', 'I prefer roles that involve building systems and structured frameworks.', 'LIKERT_SCALE', 1.0, 2, true, false, 5);

-- ============================================================
-- QUESTION-TRAIT WEIGHTS
-- ============================================================
INSERT INTO question_trait_weights (question_id, trait_id, weight) VALUES
  ('40000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 0.8), -- Analytical
  ('40000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000015', 0.6), -- Structured
  ('40000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 1.0), -- Quantitative
  ('40000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 0.9), -- Problem Solving
  ('40000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 0.5), -- Analytical
  ('40000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 1.0), -- Creativity
  ('40000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 1.0), -- Communication
  ('40000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 1.0), -- Leadership
  ('40000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000007', 1.0), -- Persuasion
  ('40000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 1.0), -- People Orientation
  ('40000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000009', 1.0), -- Technology
  ('40000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000010', 0.8), -- Planning
  ('40000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000015', 0.6), -- Structured
  ('40000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', 0.6), -- Quantitative
  ('40000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000013', 0.8), -- Business
  ('40000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000007', 0.6), -- Persuasion
  ('40000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000008', 0.8), -- People
  ('40000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000006', 0.8), -- Leadership
  ('40000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000015', 0.8), -- Structured
  ('40000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000010', 0.6), -- Planning
  ('40000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000001', 0.8), -- Analytical
  ('40000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000003', 0.6), -- Problem Solving
  ('40000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000006', 0.6), -- Leadership
  ('40000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000005', 0.6), -- Communication
  ('40000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000012', 1.0), -- Attention to Detail
  ('40000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000003', 0.8), -- Problem Solving
  ('40000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000011', 0.6), -- Risk Orientation
  ('40000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000011', 0.8), -- Risk
  ('40000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000014', 0.8), -- Adaptability
  ('40000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000015', 1.0), -- Structured
  ('40000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000010', 0.8); -- Planning
