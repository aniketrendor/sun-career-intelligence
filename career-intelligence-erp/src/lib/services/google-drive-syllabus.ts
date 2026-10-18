/**
 * Google Drive Syllabus Utility
 * Helper functions to parse, convert, and upload syllabus PDFs to Google Drive via Google Apps Script.
 */

export function extractGoogleDriveFileId(urlOrId: string): string | null {
  if (!urlOrId) return null
  const str = urlOrId.trim()

  // If already a raw Google Drive ID (alphanumeric with dashes/underscores, usually ~25-45 chars)
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(str)) {
    return str
  }

  // https://drive.google.com/file/d/{fileId}/view...
  const matchFileD = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1]
  }

  // https://drive.google.com/open?id={fileId} or ?id={fileId}
  const matchIdParam = str.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1]
  }

  return null
}

export function formatGoogleDriveUrls(fileIdOrUrl: string) {
  const fileId = extractGoogleDriveFileId(fileIdOrUrl)
  if (!fileId) {
    return {
      fileId: null,
      previewUrl: fileIdOrUrl,
      downloadUrl: fileIdOrUrl,
      viewUrl: fileIdOrUrl
    }
  }

  return {
    fileId,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`
  }
}

export async function uploadPdfToGoogleDriveViaAppsScript(params: {
  programCode: string
  programName: string
  semesterNumber: string | number
  uploadType: 'full' | 'semester'
  filename: string
  buffer: Buffer
}): Promise<{
  success: boolean
  fileId?: string
  previewUrl?: string
  downloadUrl?: string
  viewUrl?: string
  error?: string
}> {
  const webAppUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

  if (!webAppUrl) {
    return {
      success: false,
      error: 'GOOGLE_APPS_SCRIPT_WEBAPP_URL is not configured in environment variables.'
    }
  }

  try {
    const base64Content = params.buffer.toString('base64')

    const payload = {
      programCode: params.programCode,
      programName: params.programName,
      semesterNumber: params.semesterNumber,
      uploadType: params.uploadType,
      filename: params.filename,
      base64Content,
      mimeType: 'application/pdf'
    }

    const res = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    })

    const text = await res.text()
    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {
      return { success: false, error: `Apps Script response was not JSON: ${text.slice(0, 100)}` }
    }

    if (!data.success) {
      return { success: false, error: data.error || 'Failed to upload file to Google Drive' }
    }

    return {
      success: true,
      fileId: data.fileId,
      previewUrl: data.previewUrl || `https://drive.google.com/file/d/${data.fileId}/preview`,
      downloadUrl: data.downloadUrl || `https://drive.google.com/uc?export=download&id=${data.fileId}`,
      viewUrl: data.viewUrl || `https://drive.google.com/file/d/${data.fileId}/view`
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error communicating with Google Apps Script'
    }
  }
}
