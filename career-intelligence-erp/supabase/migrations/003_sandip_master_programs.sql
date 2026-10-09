-- Sandip University 114 Master Programs Seed
INSERT INTO institutions (id, name, code, is_active)
VALUES ('a1000000-0000-0000-0000-000000000003', 'Sandip University', 'SUN', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Aerospace Engineering',
    'SUN-001',
    'Aerospace Engineering program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Aerospace Engineering',
    'PCM',
    ARRAY['Aerospace engineering', 'aviation', 'design', 'manufacturing']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Aeronautical Engineering',
    'SUN-002',
    'Aeronautical Engineering program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Aeronautical Engineering',
    'PCM',
    ARRAY['Aircraft design', 'aerospace', 'aviation', 'manufacturing']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Civil Engineering',
    'SUN-003',
    'Civil Engineering program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Civil Engineering',
    'PCM',
    ARRAY['Construction', 'infrastructure', 'structural engineering', 'project management']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Electrical Engineering',
    'SUN-004',
    'Electrical Engineering program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Electrical Engineering',
    'PCM',
    ARRAY['Power systems', 'electrical design', 'automation', 'energy']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Electronics & Telecommunication Engineering',
    'SUN-005',
    'Electronics & Telecommunication Engineering program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Electronics & Telecommunication Engineering',
    'PCM',
    ARRAY['Telecom', 'embedded systems', 'electronics', 'networking']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Mechanical Engineering',
    'SUN-006',
    'Mechanical Engineering program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Mechanical Engineering',
    'PCM',
    ARRAY['Manufacturing', 'automotive', 'design', 'production', 'robotics']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Biotechnology',
    'SUN-007',
    'Biotechnology program offered by Sandip University Engineering & Technology. Suitable for PCB/PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Biotechnology',
    'PCB/PCM',
    ARRAY['Biotech', 'pharmaceuticals', 'research', 'food and life sciences']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech in Biomedical Engineering',
    'SUN-008',
    'Biomedical Engineering program offered by Sandip University Engineering & Technology. Suitable for PCB/PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Tech',
    'Biomedical Engineering',
    'PCB/PCM',
    ARRAY['Medical devices', 'healthcare technology', 'biomedical research']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Plan in Planning',
    'SUN-009',
    'Planning program offered by Sandip University Engineering & Technology. Suitable for PCM stream.',
    'Engineering & Technology',
    'UG',
    'B.Plan',
    'Planning',
    'PCM',
    ARRAY['Urban planning', 'regional planning', 'infrastructure', 'public policy']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Construction Management',
    'SUN-010',
    'Construction Management program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Construction Management',
    'Relevant engineering',
    ARRAY['Construction management', 'project management', 'infrastructure']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Structural Engineering',
    'SUN-011',
    'Structural Engineering program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Structural Engineering',
    'Relevant engineering',
    ARRAY['Structural design', 'civil engineering', 'construction']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Transportation Engineering & Planning',
    'SUN-012',
    'Transportation Engineering & Planning program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Transportation Engineering & Planning',
    'Relevant engineering',
    ARRAY['Transport planning', 'highways', 'infrastructure']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Power System',
    'SUN-013',
    'Power System program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Power System',
    'Relevant engineering',
    ARRAY['Power systems', 'electrical utilities', 'energy']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Design Engineering',
    'SUN-014',
    'Design Engineering program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Design Engineering',
    'Relevant engineering',
    ARRAY['Product design', 'CAD', 'mechanical design', 'manufacturing']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Mechanical Engineering',
    'SUN-015',
    'Mechanical Engineering program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Mechanical Engineering',
    'Relevant engineering',
    ARRAY['Mechanical design', 'manufacturing', 'production']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Environmental Engineering',
    'SUN-016',
    'Environmental Engineering program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering/science stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Environmental Engineering',
    'Relevant engineering/science',
    ARRAY['Environmental consulting', 'sustainability', 'water and waste management']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Valuation - Land & Building',
    'SUN-017',
    'Valuation - Land & Building program offered by Sandip University Engineering & Technology. Suitable for Civil/Architecture stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Valuation - Land & Building',
    'Civil/Architecture',
    ARRAY['Property valuation', 'real estate', 'infrastructure']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech in Electrical Vehicles',
    'SUN-018',
    'Electrical Vehicles program offered by Sandip University Engineering & Technology. Suitable for Relevant engineering stream.',
    'Engineering & Technology',
    'PG',
    'M.Tech',
    'Electrical Vehicles',
    'Relevant engineering',
    ARRAY['EV systems', 'automotive', 'battery and mobility technology']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Master of Planning (Town & Country Planning)',
    'SUN-019',
    'Town & Country Planning program offered by Sandip University Engineering & Technology. Suitable for Relevant degree stream.',
    'Engineering & Technology',
    'PG',
    'Master of Planning',
    'Town & Country Planning',
    'Relevant degree',
    ARRAY['Urban planning', 'regional planning', 'public policy']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in General',
    'SUN-020',
    'General program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'General',
    'PCM',
    ARRAY['Software development', 'IT', 'technology consulting']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Cloud Technology & Information Security',
    'SUN-021',
    'Cloud Technology & Information Security program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Cloud Technology & Information Security',
    'PCM',
    ARRAY['Cloud computing', 'cybersecurity', 'IT infrastructure']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Cyber Security & Forensic',
    'SUN-022',
    'Cyber Security & Forensic program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Cyber Security & Forensic',
    'PCM',
    ARRAY['Cybersecurity', 'digital forensics', 'information security']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Artificial Intelligence & Machine Learning',
    'SUN-023',
    'Artificial Intelligence & Machine Learning program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Artificial Intelligence & Machine Learning',
    'PCM',
    ARRAY['AI', 'ML', 'data science', 'software']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Artificial Intelligence & Data Science',
    'SUN-024',
    'Artificial Intelligence & Data Science program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Artificial Intelligence & Data Science',
    'PCM',
    ARRAY['AI', 'data science', 'analytics', 'software']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Full Stack Development & Testing with AI & ML',
    'SUN-025',
    'Full Stack Development & Testing with AI & ML program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Full Stack Development & Testing with AI & ML',
    'PCM',
    ARRAY['Software development', 'testing', 'AI', 'web technology']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Robotics Process Automation',
    'SUN-026',
    'Robotics Process Automation program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Robotics Process Automation',
    'PCM',
    ARRAY['RPA', 'automation', 'business technology']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Artificial Intelligence',
    'SUN-027',
    'Artificial Intelligence program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Artificial Intelligence',
    'PCM',
    ARRAY['AI', 'machine learning', 'intelligent systems']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Cyber Forensic & Information Security',
    'SUN-028',
    'Cyber Forensic & Information Security program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Cyber Forensic & Information Security',
    'PCM',
    ARRAY['Cyber forensics', 'cybersecurity', 'information security']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Tech CSE in Virtual & Augmented Reality',
    'SUN-029',
    'Virtual & Augmented Reality program offered by Sandip University Computer Science & Engineering. Suitable for PCM stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Tech CSE',
    'Virtual & Augmented Reality',
    'PCM',
    ARRAY['AR/VR', 'immersive technology', 'gaming', 'simulation']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc Computer Science in General',
    'SUN-030',
    'General program offered by Sandip University Computer Science & Engineering. Suitable for Science + Mathematics stream.',
    'Computer Science & Engineering',
    'UG',
    'B.Sc Computer Science',
    'General',
    'Science + Mathematics',
    ARRAY['Software', 'IT', 'programming', 'data']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BCA in General',
    'SUN-031',
    'General program offered by Sandip University Computer Science & Engineering. Suitable for Any stream stream.',
    'Computer Science & Engineering',
    'UG',
    'BCA',
    'General',
    'Any stream',
    ARRAY['Software', 'application development', 'IT support', 'web development']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech CSE in Cloud Technology & Information Security',
    'SUN-032',
    'Cloud Technology & Information Security program offered by Sandip University Computer Science & Engineering. Suitable for Relevant degree stream.',
    'Computer Science & Engineering',
    'PG',
    'M.Tech CSE',
    'Cloud Technology & Information Security',
    'Relevant degree',
    ARRAY['Cloud', 'cybersecurity', 'IT infrastructure']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech CSE in Software Development with AI & ML',
    'SUN-033',
    'Software Development with AI & ML program offered by Sandip University Computer Science & Engineering. Suitable for Relevant degree stream.',
    'Computer Science & Engineering',
    'PG',
    'M.Tech CSE',
    'Software Development with AI & ML',
    'Relevant degree',
    ARRAY['Software engineering', 'AI', 'ML']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Tech CSE in Robotics & Process Automation with AI & ML',
    'SUN-034',
    'Robotics & Process Automation with AI & ML program offered by Sandip University Computer Science & Engineering. Suitable for Relevant degree stream.',
    'Computer Science & Engineering',
    'PG',
    'M.Tech CSE',
    'Robotics & Process Automation with AI & ML',
    'Relevant degree',
    ARRAY['Robotics', 'RPA', 'AI', 'automation']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MCA in General',
    'SUN-035',
    'General program offered by Sandip University Computer Science & Engineering. Suitable for Any graduation, preferably Mathematics stream.',
    'Computer Science & Engineering',
    'PG',
    'MCA',
    'General',
    'Any graduation, preferably Mathematics',
    ARRAY['Software', 'IT', 'application development', 'data']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Financial Management',
    'SUN-036',
    'Financial Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Financial Management',
    'Any stream',
    ARRAY['Finance', 'banking', 'investment', 'corporate finance']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Marketing Management',
    'SUN-037',
    'Marketing Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Marketing Management',
    'Any stream',
    ARRAY['Marketing', 'sales', 'brand management', 'digital marketing']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Human Resource Management',
    'SUN-038',
    'Human Resource Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Human Resource Management',
    'Any stream',
    ARRAY['HR', 'recruitment', 'talent management', 'learning and development']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in International Business',
    'SUN-039',
    'International Business program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'International Business',
    'Any stream',
    ARRAY['International trade', 'global business', 'export-import']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Business Analytics',
    'SUN-040',
    'Business Analytics program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Business Analytics',
    'Any stream',
    ARRAY['Business analytics', 'data analytics', 'consulting', 'decision support']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA Hons in Financial Services',
    'SUN-041',
    'Financial Services program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA Hons',
    'Financial Services',
    'Any stream',
    ARRAY['Banking', 'financial services', 'investment', 'insurance']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA Hons in Entrepreneurship',
    'SUN-042',
    'Entrepreneurship program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA Hons',
    'Entrepreneurship',
    'Any stream',
    ARRAY['Startups', 'entrepreneurship', 'business development']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Digital Marketing',
    'SUN-043',
    'Digital Marketing program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Digital Marketing',
    'Any stream',
    ARRAY['Digital marketing', 'social media', 'performance marketing']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in International Accounting & Finance, ACCA-UK',
    'SUN-044',
    'International Accounting & Finance, ACCA-UK program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'International Accounting & Finance, ACCA-UK',
    'Any stream',
    ARRAY['Accounting', 'audit', 'taxation', 'finance']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Aviation Management',
    'SUN-045',
    'Aviation Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Aviation Management',
    'Any stream',
    ARRAY['Airports', 'airlines', 'aviation operations']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Logistics & Supply Chain Management',
    'SUN-046',
    'Logistics & Supply Chain Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Logistics & Supply Chain Management',
    'Any stream',
    ARRAY['Logistics', 'procurement', 'supply chain', 'operations']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Event Management & User Experience',
    'SUN-047',
    'Event Management & User Experience program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Event Management & User Experience',
    'Any stream',
    ARRAY['Events', 'experience design', 'customer experience']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Global Management',
    'SUN-048',
    'Global Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Global Management',
    'Any stream',
    ARRAY['International business', 'management', 'consulting']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'BBA in Hospitality Management',
    'SUN-049',
    'Hospitality Management program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'BBA',
    'Hospitality Management',
    'Any stream',
    ARRAY['Hotels', 'hospitality', 'tourism', 'service management']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Com in Accounting & Finance',
    'SUN-050',
    'Accounting & Finance program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'B.Com',
    'Accounting & Finance',
    'Any stream',
    ARRAY['Accounting', 'finance', 'taxation', 'audit']::TEXT[],
    'Tally certification',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Com in Costing',
    'SUN-051',
    'Costing program offered by Sandip University Commerce & Management Studies. Suitable for Any stream stream.',
    'Commerce & Management Studies',
    'UG',
    'B.Com',
    'Costing',
    'Any stream',
    ARRAY['Accounting', 'finance', 'taxation', 'audit']::TEXT[],
    'Tally certification',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'New Age MBA in Business Analytics',
    'SUN-052',
    'Business Analytics program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'New Age MBA',
    'Business Analytics',
    'Any graduation',
    ARRAY['Business analytics', 'data analytics', 'consulting']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'New Age MBA in Banking & Financial Services',
    'SUN-053',
    'Banking & Financial Services program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'New Age MBA',
    'Banking & Financial Services',
    'Any graduation',
    ARRAY['Banking', 'finance', 'insurance', 'financial services']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Human Resource Management',
    'SUN-054',
    'Human Resource Management program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Human Resource Management',
    'Any graduation',
    ARRAY['HR', 'talent management', 'people analytics']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Financial Management',
    'SUN-055',
    'Financial Management program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Financial Management',
    'Any graduation',
    ARRAY['Corporate finance', 'investment', 'financial planning']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Marketing Management',
    'SUN-056',
    'Marketing Management program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Marketing Management',
    'Any graduation',
    ARRAY['Marketing', 'sales', 'brand management']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in International Business',
    'SUN-057',
    'International Business program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'International Business',
    'Any graduation',
    ARRAY['Global business', 'export-import', 'international trade']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Information Technology',
    'SUN-058',
    'Information Technology program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Information Technology',
    'Any graduation',
    ARRAY['IT management', 'technology consulting', 'digital systems']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Fintech & Data Analytics',
    'SUN-059',
    'Fintech & Data Analytics program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Fintech & Data Analytics',
    'Any graduation',
    ARRAY['Fintech', 'financial analytics', 'data analytics']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Logistics & Supply Chain Management',
    'SUN-060',
    'Logistics & Supply Chain Management program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Logistics & Supply Chain Management',
    'Any graduation',
    ARRAY['Supply chain', 'procurement', 'logistics', 'operations']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA in Entrepreneurship & Startup Management',
    'SUN-061',
    'Entrepreneurship & Startup Management program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA',
    'Entrepreneurship & Startup Management',
    'Any graduation',
    ARRAY['Entrepreneurship', 'startups', 'business development']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA 4.0 in Artificial Intelligence',
    'SUN-062',
    'Artificial Intelligence program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA 4.0',
    'Artificial Intelligence',
    'Any graduation',
    ARRAY['AI strategy', 'intelligent systems', 'business technology']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA 4.0 in Content Strategy',
    'SUN-063',
    'Content Strategy program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA 4.0',
    'Content Strategy',
    'Any graduation',
    ARRAY['Content', 'digital media', 'brand strategy', 'communications']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'MBA 4.0 in Digital Transformation',
    'SUN-064',
    'Digital Transformation program offered by Sandip University Commerce & Management Studies. Suitable for Any graduation stream.',
    'Commerce & Management Studies',
    'PG',
    'MBA 4.0',
    'Digital Transformation',
    'Any graduation',
    ARRAY['Digital strategy', 'transformation', 'technology consulting']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'D.Pharm in General',
    'SUN-065',
    'General program offered by Sandip University Pharmaceutical Sciences. Suitable for PCB/PCM stream.',
    'Pharmaceutical Sciences',
    'Diploma',
    'D.Pharm',
    'General',
    'PCB/PCM',
    ARRAY['Pharmacy', 'dispensing', 'pharmacy operations']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Pharm in General',
    'SUN-066',
    'General program offered by Sandip University Pharmaceutical Sciences. Suitable for PCB/PCM stream.',
    'Pharmaceutical Sciences',
    'UG',
    'B.Pharm',
    'General',
    'PCB/PCM',
    ARRAY['Pharmacy', 'pharmaceutical industry', 'clinical research']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Pharm in Pharmaceutics',
    'SUN-067',
    'Pharmaceutics program offered by Sandip University Pharmaceutical Sciences. Suitable for B.Pharm stream.',
    'Pharmaceutical Sciences',
    'PG',
    'M.Pharm',
    'Pharmaceutics',
    'B.Pharm',
    ARRAY['Drug formulation', 'manufacturing', 'pharmaceutical R&D']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Pharm in Pharmacology',
    'SUN-068',
    'Pharmacology program offered by Sandip University Pharmaceutical Sciences. Suitable for B.Pharm stream.',
    'Pharmaceutical Sciences',
    'PG',
    'M.Pharm',
    'Pharmacology',
    'B.Pharm',
    ARRAY['Drug research', 'clinical research', 'pharmacovigilance']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Pharm in Pharmaceutical Quality Assurance',
    'SUN-069',
    'Pharmaceutical Quality Assurance program offered by Sandip University Pharmaceutical Sciences. Suitable for B.Pharm stream.',
    'Pharmaceutical Sciences',
    'PG',
    'M.Pharm',
    'Pharmaceutical Quality Assurance',
    'B.Pharm',
    ARRAY['Quality assurance', 'quality control', 'regulatory affairs']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Pharm in Industrial Pharmacy',
    'SUN-070',
    'Industrial Pharmacy program offered by Sandip University Pharmaceutical Sciences. Suitable for B.Pharm stream.',
    'Pharmaceutical Sciences',
    'PG',
    'M.Pharm',
    'Industrial Pharmacy',
    'B.Pharm',
    ARRAY['Pharmaceutical manufacturing', 'production', 'quality']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.A. LL.B. (Hons.) in General',
    'SUN-071',
    'General program offered by Sandip University Law. Suitable for Any stream stream.',
    'Law',
    'UG',
    'B.A. LL.B. (Hons.)',
    'General',
    'Any stream',
    ARRAY['Law', 'litigation', 'legal research', 'public policy']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.B.A. LL.B. (Hons.) in General',
    'SUN-072',
    'General program offered by Sandip University Law. Suitable for Any stream stream.',
    'Law',
    'UG',
    'B.B.A. LL.B. (Hons.)',
    'General',
    'Any stream',
    ARRAY['Corporate law', 'business law', 'compliance']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'LL.B. (Hons.) in General',
    'SUN-073',
    'General program offered by Sandip University Law. Suitable for Any graduation stream.',
    'Law',
    'UG',
    'LL.B. (Hons.)',
    'General',
    'Any graduation',
    ARRAY['Legal practice', 'litigation', 'corporate legal']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'LL.M. in Criminal Law',
    'SUN-074',
    'Criminal Law program offered by Sandip University Law. Suitable for Law degree stream.',
    'Law',
    'PG',
    'LL.M.',
    'Criminal Law',
    'Law degree',
    ARRAY['Criminal litigation', 'prosecution', 'legal research']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'LL.M. in Constitutional & Administrative Law',
    'SUN-075',
    'Constitutional & Administrative Law program offered by Sandip University Law. Suitable for Law degree stream.',
    'Law',
    'PG',
    'LL.M.',
    'Constitutional & Administrative Law',
    'Law degree',
    ARRAY['Constitutional law', 'public policy', 'government/legal practice']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'LL.M. in Corporate & Commercial Law',
    'SUN-076',
    'Corporate & Commercial Law program offered by Sandip University Law. Suitable for Law degree stream.',
    'Law',
    'PG',
    'LL.M.',
    'Corporate & Commercial Law',
    'Law degree',
    ARRAY['Corporate law', 'commercial contracts', 'compliance']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'LL.M. in Mediation Law',
    'SUN-077',
    'Mediation Law program offered by Sandip University Law. Suitable for Law degree stream.',
    'Law',
    'PG',
    'LL.M.',
    'Mediation Law',
    'Law degree',
    ARRAY['Mediation', 'dispute resolution', 'legal practice']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Wine Technology',
    'SUN-078',
    'Wine Technology program offered by Sandip University Science. Suitable for Science stream.',
    'Science',
    'UG',
    'B.Sc',
    'Wine Technology',
    'Science',
    ARRAY['Wine production', 'food technology', 'quality control']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Nanoscience & Nanotechnology',
    'SUN-079',
    'Nanoscience & Nanotechnology program offered by Sandip University Science. Suitable for Science stream.',
    'Science',
    'UG',
    'B.Sc',
    'Nanoscience & Nanotechnology',
    'Science',
    ARRAY['Nanotechnology', 'materials science', 'research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Microbiology',
    'SUN-080',
    'Microbiology program offered by Sandip University Science. Suitable for Science stream.',
    'Science',
    'UG',
    'B.Sc',
    'Microbiology',
    'Science',
    ARRAY['Microbiology', 'biotech', 'pharmaceuticals', 'research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Forensic Science',
    'SUN-081',
    'Forensic Science program offered by Sandip University Science. Suitable for Science stream.',
    'Science',
    'UG',
    'B.Sc',
    'Forensic Science',
    'Science',
    ARRAY['Forensics', 'crime labs', 'investigation support']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Computational Mathematics & Data Science',
    'SUN-082',
    'Computational Mathematics & Data Science program offered by Sandip University Science. Suitable for Science + Mathematics stream.',
    'Science',
    'UG',
    'B.Sc',
    'Computational Mathematics & Data Science',
    'Science + Mathematics',
    ARRAY['Data science', 'analytics', 'mathematical modelling']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Chemistry',
    'SUN-083',
    'Chemistry program offered by Sandip University Science. Suitable for Science + Chemistry stream.',
    'Science',
    'UG',
    'B.Sc',
    'Chemistry',
    'Science + Chemistry',
    ARRAY['Chemistry', 'laboratories', 'pharmaceuticals', 'research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Physics',
    'SUN-084',
    'Physics program offered by Sandip University Science. Suitable for Science + Physics & Mathematics stream.',
    'Science',
    'UG',
    'B.Sc',
    'Physics',
    'Science + Physics & Mathematics',
    ARRAY['Physics', 'research', 'electronics', 'scientific computing']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Forensic Science & Criminology',
    'SUN-085',
    'Forensic Science & Criminology program offered by Sandip University Science. Suitable for Science stream.',
    'Science',
    'UG',
    'B.Sc',
    'Forensic Science & Criminology',
    'Science',
    ARRAY['Forensics', 'criminology', 'investigation support']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Chemistry, Organic/Analytical',
    'SUN-086',
    'Chemistry, Organic/Analytical program offered by Sandip University Science. Suitable for Relevant science degree stream.',
    'Science',
    'PG',
    'M.Sc',
    'Chemistry, Organic/Analytical',
    'Relevant science degree',
    ARRAY['Chemical analysis', 'pharmaceuticals', 'research']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Physics',
    'SUN-087',
    'Physics program offered by Sandip University Science. Suitable for Relevant science degree stream.',
    'Science',
    'PG',
    'M.Sc',
    'Physics',
    'Relevant science degree',
    ARRAY['Physics', 'research', 'scientific computing']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Microbiology',
    'SUN-088',
    'Microbiology program offered by Sandip University Science. Suitable for Relevant science degree stream.',
    'Science',
    'PG',
    'M.Sc',
    'Microbiology',
    'Relevant science degree',
    ARRAY['Microbiology', 'biotech', 'pharmaceuticals']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Life Science',
    'SUN-089',
    'Life Science program offered by Sandip University Science. Suitable for Relevant science degree stream.',
    'Science',
    'PG',
    'M.Sc',
    'Life Science',
    'Relevant science degree',
    ARRAY['Life sciences', 'research', 'biotech']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Mathematics',
    'SUN-090',
    'Mathematics program offered by Sandip University Science. Suitable for Relevant science degree stream.',
    'Science',
    'PG',
    'M.Sc',
    'Mathematics',
    'Relevant science degree',
    ARRAY['Mathematics', 'analytics', 'education', 'quantitative research']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Forensic Science',
    'SUN-091',
    'Forensic Science program offered by Sandip University Science. Suitable for Relevant science degree stream.',
    'Science',
    'PG',
    'M.Sc',
    'Forensic Science',
    'Relevant science degree',
    ARRAY['Forensic laboratories', 'investigation', 'research']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Fashion & Apparel Design',
    'SUN-092',
    'Fashion & Apparel Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Sc',
    'Fashion & Apparel Design',
    'Any stream',
    ARRAY['Fashion', 'apparel', 'merchandising']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Beauty Cosmetology',
    'SUN-093',
    'Beauty Cosmetology program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Sc',
    'Beauty Cosmetology',
    'Any stream',
    ARRAY['Beauty', 'cosmetology', 'wellness services']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Sc in Interior Design & Decoration',
    'SUN-094',
    'Interior Design & Decoration program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Sc',
    'Interior Design & Decoration',
    'Any stream',
    ARRAY['Interior design', 'space planning', 'decoration']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Des in Communication Design',
    'SUN-095',
    'Communication Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Des',
    'Communication Design',
    'Any stream',
    ARRAY['Graphic design', 'communication', 'branding', 'UI/visual design']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Des in Product Design',
    'SUN-096',
    'Product Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Des',
    'Product Design',
    'Any stream',
    ARRAY['Product design', 'industrial design', 'innovation']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Des in Fashion & Lifestyle Design',
    'SUN-097',
    'Fashion & Lifestyle Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Des',
    'Fashion & Lifestyle Design',
    'Any stream',
    ARRAY['Fashion', 'lifestyle', 'apparel', 'merchandising']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Des in Space & Interior Design',
    'SUN-098',
    'Space & Interior Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Des',
    'Space & Interior Design',
    'Any stream',
    ARRAY['Interior design', 'spatial design', 'architecture support']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Des in AI & Intelligent Product Media Design',
    'SUN-099',
    'AI & Intelligent Product Media Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Des',
    'AI & Intelligent Product Media Design',
    'Any stream',
    ARRAY['AI-enabled design', 'product/media design']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'B.Des in Immersive Media & Game Design',
    'SUN-100',
    'Immersive Media & Game Design program offered by Sandip University Design. Suitable for Any stream stream.',
    'Design',
    'UG',
    'B.Des',
    'Immersive Media & Game Design',
    'Any stream',
    ARRAY['Game design', 'immersive media', 'AR/VR']::TEXT[],
    '',
    '2026-2027',
    4,
    8,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Fashion & Apparel Design',
    'SUN-101',
    'Fashion & Apparel Design program offered by Sandip University Design. Suitable for Graduation stream.',
    'Design',
    'PG',
    'M.Sc',
    'Fashion & Apparel Design',
    'Graduation',
    ARRAY['Fashion', 'apparel', 'design management']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Sc in Beauty Cosmetology',
    'SUN-102',
    'Beauty Cosmetology program offered by Sandip University Design. Suitable for Graduation stream.',
    'Design',
    'PG',
    'M.Sc',
    'Beauty Cosmetology',
    'Graduation',
    ARRAY['Beauty', 'cosmetology', 'wellness']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Des in User Experience Design',
    'SUN-103',
    'User Experience Design program offered by Sandip University Design. Suitable for Graduation stream.',
    'Design',
    'PG',
    'M.Des',
    'User Experience Design',
    'Graduation',
    ARRAY['UX', 'UI', 'product design', 'digital experiences']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Des in Visual Communication Design',
    'SUN-104',
    'Visual Communication Design program offered by Sandip University Design. Suitable for Graduation stream.',
    'Design',
    'PG',
    'M.Des',
    'Visual Communication Design',
    'Graduation',
    ARRAY['Visual communication', 'branding', 'graphic design']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'M.Des in Game Design',
    'SUN-105',
    'Game Design program offered by Sandip University Design. Suitable for Graduation stream.',
    'Design',
    'PG',
    'M.Des',
    'Game Design',
    'Graduation',
    ARRAY['Game design', 'immersive media', 'gaming']::TEXT[],
    '',
    '2026-2027',
    2,
    4,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Engineering & Applications',
    'SUN-106',
    'Engineering & Applications program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Engineering & Applications',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Pharmacy',
    'SUN-107',
    'Pharmacy program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Pharmacy',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Management',
    'SUN-108',
    'Management program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Management',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Commerce',
    'SUN-109',
    'Commerce program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Commerce',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Law',
    'SUN-110',
    'Law program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Law',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Sciences',
    'SUN-111',
    'Sciences program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Sciences',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in English',
    'SUN-112',
    'English program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'English',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Fashion & Apparel Design',
    'SUN-113',
    'Fashion & Apparel Design program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Fashion & Apparel Design',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Ph.D. in Beauty Cosmetology',
    'SUN-114',
    'Beauty Cosmetology program offered by Sandip University Doctoral. Suitable for Relevant Master''s degree stream.',
    'Doctoral',
    'PhD',
    'Ph.D.',
    'Beauty Cosmetology',
    'Relevant Master''s degree',
    ARRAY['Research', 'academia', 'specialized professional research']::TEXT[],
    '',
    '2026-2027',
    3,
    6,
    'ACTIVE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    school = EXCLUDED.school,
    level = EXCLUDED.level,
    course_degree = EXCLUDED.course_degree,
    specialization = EXCLUDED.specialization,
    suitable_stream = EXCLUDED.suitable_stream,
    career_domains = EXCLUDED.career_domains,
    notes = EXCLUDED.notes,
    duration_years = EXCLUDED.duration_years,
    total_semesters = EXCLUDED.total_semesters,
    status = EXCLUDED.status,
    updated_at = NOW();