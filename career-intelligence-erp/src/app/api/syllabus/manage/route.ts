import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  extractGoogleDriveFileId,
  formatGoogleDriveUrls,
  uploadPdfToGoogleDriveViaAppsScript
} from '@/lib/services/google-drive-syllabus'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const admin = await createAdminClient()
    const contentType = request.headers.get('content-type') || ''

    let programId = ''
    let uploadType = 'full' // 'full' or 'semester'
    let semesterNumber = '1'
    let title = ''
    let academicFramework = 'NEP 2020 / CBCS Scheme'
    let totalCredits = 160
    let academicYear = '2026-2027'
    let driveLink = ''
    let filename = ''
    let approvedBy = 'Sandip University Academic Council'

    let driveResult: {
      fileId?: string | null
      previewUrl?: string
      downloadUrl?: string
      viewUrl?: string
    } = {}

    // 1. Retrieve Program info first
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      programId = formData.get('programId') as string
      uploadType = (formData.get('uploadType') as string) || 'full'
      semesterNumber = (formData.get('semesterNumber') as string) || '1'
      title = (formData.get('title') as string) || ''
      academicFramework = (formData.get('academicFramework') as string) || 'NEP 2020 / CBCS Scheme'
      totalCredits = Number(formData.get('totalCredits')) || 160
      academicYear = (formData.get('academicYear') as string) || '2026-2027'
      driveLink = (formData.get('driveLink') as string) || (formData.get('customUrl') as string) || ''
      approvedBy = (formData.get('approvedBy') as string) || 'Sandip University Academic Council'

      const file = formData.get('file') as File | null

      // If a file was uploaded, upload to Google Drive via Apps Script
      if (file && file.size > 0) {
        filename = file.name
        const buffer = Buffer.from(await file.arrayBuffer())

        const { data: programData } = await admin
          .from('programs')
          .select('code, name')
          .eq('id', programId)
          .single()

        const uploadRes = await uploadPdfToGoogleDriveViaAppsScript({
          programCode: programData?.code || 'PROGRAM',
          programName: programData?.name || 'Curriculum',
          semesterNumber,
          uploadType: uploadType as any,
          filename: file.name,
          buffer
        })

        if (!uploadRes.success) {
          return NextResponse.json({
            error: uploadRes.error || 'Failed to upload PDF to Google Drive via Google Apps Script'
          }, { status: 500 })
        }

        driveResult = {
          fileId: uploadRes.fileId,
          previewUrl: uploadRes.previewUrl,
          downloadUrl: uploadRes.downloadUrl,
          viewUrl: uploadRes.viewUrl
        }
      } else if (driveLink) {
        // Format direct Google Drive link
        const formatted = formatGoogleDriveUrls(driveLink)
        driveResult = formatted
        filename = `Google_Drive_${formatted.fileId || 'Document'}.pdf`
      }
    } else {
      const body = await request.json()
      programId = body.programId
      uploadType = body.uploadType || 'full'
      semesterNumber = String(body.semesterNumber || '1')
      title = body.title || ''
      academicFramework = body.academicFramework || 'NEP 2020 / CBCS Scheme'
      totalCredits = Number(body.totalCredits) || 160
      academicYear = body.academicYear || '2026-2027'
      driveLink = body.driveLink || body.customUrl || ''
      filename = body.filename || ''
      approvedBy = body.approvedBy || 'Sandip University Academic Council'

      if (driveLink) {
        const formatted = formatGoogleDriveUrls(driveLink)
        driveResult = formatted
        if (!filename) filename = `Google_Drive_${formatted.fileId || 'Document'}.pdf`
      }
    }

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 })
    }

    // Retrieve existing program record to merge syllabus notes
    const { data: existingProgram } = await admin
      .from('programs')
      .select('id, notes')
      .eq('id', programId)
      .single()

    let existingNotes: any = {}
    if (existingProgram?.notes) {
      try {
        existingNotes = JSON.parse(existingProgram.notes)
      } catch {
        existingNotes = {}
      }
    }

    const semestersMap = existingNotes.semesters || {}

    if (uploadType === 'semester') {
      semestersMap[semesterNumber] = {
        semesterNumber: Number(semesterNumber),
        storage_provider: 'google_drive',
        drive_file_id: driveResult.fileId || semestersMap[semesterNumber]?.drive_file_id || null,
        preview_url: driveResult.previewUrl || semestersMap[semesterNumber]?.preview_url || '',
        download_url: driveResult.downloadUrl || semestersMap[semesterNumber]?.download_url || '',
        url: driveResult.viewUrl || semestersMap[semesterNumber]?.url || '',
        filename: filename || semestersMap[semesterNumber]?.filename || `Semester_${semesterNumber}_Approved.pdf`,
        uploaded_at: new Date().toISOString(),
        uploaded_by: profile.id
      }
    }

    const updatedSyllabusMetadata = {
      ...existingNotes,
      storage_provider: 'google_drive',
      drive_file_id: uploadType === 'full' && driveResult.fileId ? driveResult.fileId : (existingNotes.drive_file_id || driveResult.fileId || null),
      preview_url: uploadType === 'full' && driveResult.previewUrl ? driveResult.previewUrl : (existingNotes.preview_url || driveResult.previewUrl || null),
      download_url: uploadType === 'full' && driveResult.downloadUrl ? driveResult.downloadUrl : (existingNotes.download_url || driveResult.downloadUrl || null),
      syllabus_url: uploadType === 'full' && driveResult.viewUrl ? driveResult.viewUrl : (existingNotes.syllabus_url || driveResult.viewUrl || null),
      filename: uploadType === 'full' && filename ? filename : (existingNotes.filename || filename || null),
      title: title || existingNotes.title || 'University Approved Curriculum Syllabus',
      academic_framework: academicFramework,
      total_credits: totalCredits,
      academic_year: academicYear,
      approved_by: approvedBy,
      updated_at: new Date().toISOString(),
      updated_by: profile.id,
      semesters: semestersMap
    }

    const { data: updatedProgram, error: updateError } = await admin
      .from('programs')
      .update({
        notes: JSON.stringify(updatedSyllabusMetadata),
        academic_year: academicYear,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update program syllabus', details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      program: updatedProgram,
      syllabus: updatedSyllabusMetadata
    })
  } catch (err: any) {
    console.error('Error in Google Drive syllabus manage API:', err)
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
  }
}
