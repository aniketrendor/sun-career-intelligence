import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envConfig = {}
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) envConfig[k.trim()] = v.join('=').trim()
})

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const programsPath = path.resolve(process.cwd(), 'src/lib/data/sandip-programs.json')
const programs = JSON.parse(fs.readFileSync(programsPath, 'utf8'))

async function seed() {
  console.log(`Starting upsert of ${programs.length} Sandip University programs...`)

  // 1. Ensure institution exists
  const { error: instErr } = await supabase.from('institutions').upsert({
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Sandip University',
    code: 'SUN',
    is_active: true
  }, { onConflict: 'code' })

  if (instErr) {
    console.warn('Institution upsert notice:', instErr.message)
  }

  // 2. Prepare program payloads
  const payload = programs.map(p => ({
    institution_id: 'a1000000-0000-0000-0000-000000000003',
    name: p.name,
    code: p.code,
    description: `${p.specialization || p.name} program offered by Sandip University ${p.school}. Suitable for ${p.suitable_stream} stream.`,
    school: p.school,
    level: p.level,
    course_degree: p.course_degree,
    specialization: p.specialization || '',
    suitable_stream: p.suitable_stream || 'Any',
    career_domains: p.career_domains || [],
    notes: p.notes || '',
    academic_year: p.academic_year || '2026-2027',
    duration_years: p.duration_years || 4,
    total_semesters: p.total_semesters || 8,
    status: 'ACTIVE'
  }))

  // Upsert in batches of 25
  const batchSize = 25
  let inserted = 0
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize)
    const { data, error } = await supabase.from('programs').upsert(batch, { onConflict: 'code' }).select('id')
    if (error) {
      console.error(`Error in batch ${i / batchSize + 1}:`, error)
    } else {
      inserted += data?.length || batch.length
      console.log(`Upserted batch ${i / batchSize + 1} (${inserted}/${payload.length} programs)`)
    }
  }

  console.log(`\n🎉 Successfully synced all ${inserted} Sandip University programs to Supabase!`)
}

seed().catch(err => {
  console.error('Fatal seed error:', err)
  process.exit(1)
})
