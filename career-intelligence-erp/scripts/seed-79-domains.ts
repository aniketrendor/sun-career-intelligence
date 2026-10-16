import { createClient } from '@supabase/supabase-js'
import { DOMAINS } from '../src/lib/data/su-career-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed79Domains() {
  console.log(`Starting upsert of ${DOMAINS.length} career domains into Supabase...`)

  const domainPayloads = DOMAINS.map(d => ({
    name: d.name,
    description: d.task,
    icon: d.sector,
    is_active: true,
  }))

  const { data, error } = await supabase
    .from('career_domains')
    .upsert(domainPayloads, { onConflict: 'name' })
    .select('id, name')

  if (error) {
    console.error('Failed to upsert domains:', error)
    process.exit(1)
  }

  console.log(`Successfully upserted ${data?.length} domains!`)

  // Verify total count in career_domains
  const { count, error: countErr } = await supabase
    .from('career_domains')
    .select('*', { count: 'exact', head: true })

  if (countErr) {
    console.error('Error fetching total domain count:', countErr)
  } else {
    console.log(`Total active career_domains in database now: ${count}`)
  }
}

seed79Domains().catch(err => {
  console.error('Fatal error during domain seeding:', err)
  process.exit(1)
})
