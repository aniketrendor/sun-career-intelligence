import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const programId = searchParams.get('id')
    const sem = searchParams.get('sem') // optional semester number

    const supabase = await createAdminClient()
    let dbProgram = null

    if (programId) {
      const { data } = await supabase.from('programs').select('*').eq('id', programId).maybeSingle()
      dbProgram = data
    } else if (code) {
      const { data } = await supabase.from('programs').select('*').eq('code', code).maybeSingle()
      dbProgram = data
    }

    if (!dbProgram) {
      return NextResponse.json({ error: 'Program not found in institutional catalog' }, { status: 404 })
    }

    // Check if approved PDF exists in notes
    if (dbProgram.notes) {
      try {
        const parsed = JSON.parse(dbProgram.notes)

        // If specific semester PDF is requested
        if (sem && parsed.semesters && parsed.semesters[sem]?.url) {
          return NextResponse.redirect(parsed.semesters[sem].url)
        }

        // Program-wide approved syllabus PDF
        if (parsed.syllabus_url) {
          return NextResponse.redirect(parsed.syllabus_url)
        }
      } catch {
        // notes is not JSON
      }
    }

    return NextResponse.json({
      error: 'No university approved syllabus PDF has been uploaded for this program yet.',
      programCode: dbProgram.code,
      programName: dbProgram.name,
      status: 'PENDING_ADMIN_UPLOAD'
    }, { status: 404 })
  } catch (err: any) {
    console.error('Error fetching approved syllabus PDF:', err)
    return NextResponse.json({ error: 'Failed to retrieve approved syllabus PDF', details: err.message }, { status: 500 })
  }
}
