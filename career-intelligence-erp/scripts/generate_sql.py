import json
import os

json_path = r'D:\Portfolio\Creations\Projects\Career Intelligence System\career-intelligence-erp\src\lib\data\sandip-programs.json'
with open(json_path, 'r', encoding='utf-8') as f:
    programs = json.load(f)

sql_statements = [
    """-- Sandip University 114 Master Programs Seed
INSERT INTO institutions (id, name, code, is_active)
VALUES ('a1000000-0000-0000-0000-000000000003', 'Sandip University', 'SUN', true)
ON CONFLICT (code) DO NOTHING;"""
]

for p in programs:
    name_escaped = p['name'].replace("'", "''")
    code = p['code']
    school_escaped = p['school'].replace("'", "''")
    level = p['level']
    course_degree = p['course_degree'].replace("'", "''")
    specialization = p['specialization'].replace("'", "''")
    suitable_stream = p['suitable_stream'].replace("'", "''")
    notes = p['notes'].replace("'", "''")
    
    if p['career_domains']:
        items = ["'" + d.replace("'", "''") + "'" for d in p['career_domains']]
        domains_arr = "ARRAY[" + ", ".join(items) + "]::TEXT[]"
    else:
        domains_arr = "'{}'::TEXT[]"

    sql = f"""INSERT INTO programs (
    institution_id, name, code, description, school, level, 
    course_degree, specialization, suitable_stream, career_domains, 
    notes, academic_year, duration_years, total_semesters, status
) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    '{name_escaped}',
    '{code}',
    '{specialization or name_escaped} program offered by Sandip University {school_escaped}. Suitable for {suitable_stream} stream.',
    '{school_escaped}',
    '{level}',
    '{course_degree}',
    '{specialization}',
    '{suitable_stream}',
    {domains_arr},
    '{notes}',
    '{p["academic_year"]}',
    {p["duration_years"]},
    {p["total_semesters"]},
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
    updated_at = NOW();"""
    sql_statements.append(sql)

full_sql = '\n\n'.join(sql_statements)
out_sql_path = r'D:\Portfolio\Creations\Projects\Career Intelligence System\career-intelligence-erp\supabase\migrations\003_sandip_master_programs.sql'
os.makedirs(os.path.dirname(out_sql_path), exist_ok=True)
with open(out_sql_path, 'w', encoding='utf-8') as f:
    f.write(full_sql)

print(f'Successfully generated SQL migration with {len(programs)} programs at: {out_sql_path}')
