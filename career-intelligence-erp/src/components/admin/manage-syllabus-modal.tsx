'use client'

import { useState } from 'react'
import {
  FileText, Upload, Link as LinkIcon, CheckCircle2,
  AlertCircle, Sparkles, X, Eye, Download, Save, Layers,
  ExternalLink, Copy, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { extractGoogleDriveFileId, formatGoogleDriveUrls } from '@/lib/services/google-drive-syllabus'

interface ManageSyllabusModalProps {
  isOpen: boolean
  onClose: () => void
  program: {
    id: string
    code: string
    name: string
    school?: string
    level?: string
    notes?: string
    total_semesters?: number
    academic_year?: string
  } | null
  onSuccess?: () => void
}

export function ManageSyllabusModal({
  isOpen,
  onClose,
  program,
  onSuccess
}: ManageSyllabusModalProps) {
  const [uploadType, setUploadType] = useState<'full' | 'semester'>('full')
  const [selectedSem, setSelectedSem] = useState<number>(1)
  const [method, setMethod] = useState<'link' | 'upload'>('link')
  const [driveLink, setDriveLink] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [academicFramework, setAcademicFramework] = useState('NEP 2020 / CBCS Scheme')
  const [totalCredits, setTotalCredits] = useState('160')
  const [academicYear, setAcademicYear] = useState('2026-2027')
  const [approvedBy, setApprovedBy] = useState('Sandip University Academic Council')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false)

  if (!isOpen || !program) return null

  // Check existing syllabus metadata in notes
  let existingSyllabus: any = null
  if (program.notes) {
    try {
      existingSyllabus = JSON.parse(program.notes)
    } catch {}
  }

  const existingSemesters: Record<string, any> = existingSyllabus?.semesters || {}
  const totalSems = program.total_semesters || 8

  // Real-time Google Drive link check
  const parsedDriveId = extractGoogleDriveFileId(driveLink)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf') {
        setErrorMsg('Please select a valid PDF document.')
        return
      }
      setSelectedFile(file)
      setErrorMsg('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (method === 'upload') {
        if (!selectedFile) {
          throw new Error('Please choose a PDF file to upload')
        }

        const formData = new FormData()
        formData.append('programId', program.id)
        formData.append('uploadType', uploadType)
        formData.append('semesterNumber', String(selectedSem))
        formData.append('title', title || (uploadType === 'semester' ? `Semester ${selectedSem} Syllabus` : `${program.name} Full Syllabus`))
        formData.append('academicFramework', academicFramework)
        formData.append('totalCredits', totalCredits)
        formData.append('academicYear', academicYear)
        formData.append('approvedBy', approvedBy)
        formData.append('file', selectedFile)

        const res = await fetch('/api/syllabus/manage', {
          method: 'POST',
          body: formData
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to upload PDF via Google Apps Script')
        setSuccessMsg(uploadType === 'semester'
          ? `Semester ${selectedSem} approved PDF uploaded to Google Drive!`
          : 'Full program approved PDF uploaded to Google Drive!')
      } else {
        if (!driveLink.trim()) {
          throw new Error('Please enter a Google Drive shareable link or file ID')
        }

        const res = await fetch('/api/syllabus/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: program.id,
            uploadType,
            semesterNumber: selectedSem,
            title: title || `${program.name} Syllabus`,
            academicFramework,
            totalCredits,
            academicYear,
            approvedBy,
            driveLink: driveLink.trim()
          })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update syllabus')
        setSuccessMsg(uploadType === 'semester'
          ? `Semester ${selectedSem} Google Drive syllabus link successfully connected!`
          : 'Full program Google Drive syllabus link successfully connected!')
      }

      if (onSuccess) onSuccess()
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving syllabus')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto font-sans animate-in fade-in-50 zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DFD7CB] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#A36B40] bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#DFD7CB]">
                {program.code}
              </span>
              <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-xs font-bold">
                {program.level || 'Degree'}
              </Badge>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                Google Drive Storage
              </Badge>
            </div>
            <h3 className="text-xl font-extrabold text-[#2C2621]">
              Attach Approved Syllabus PDF (Google Drive)
            </h3>
            <p className="text-xs text-[#7A7067]">
              Connect university approved PDF documents for {program.name} hosted on Google Drive.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Uploads Summary */}
        <div className="px-6 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A7067]">
            <span>Current Google Drive Attachments</span>
            <button
              type="button"
              onClick={() => setShowAppsScriptGuide(!showAppsScriptGuide)}
              className="text-[11px] text-[#A36B40] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Apps Script Setup Guide
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {existingSyllabus?.preview_url && (
              <a href={existingSyllabus.preview_url} target="_blank" rel="noopener noreferrer">
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold gap-1.5 py-1 px-2.5 cursor-pointer hover:bg-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Full Program Drive PDF
                </Badge>
              </a>
            )}

            {Array.from({ length: totalSems }, (_, i) => i + 1).map((sNum) => {
              const semData = existingSemesters[sNum]
              return semData?.preview_url ? (
                <a key={sNum} href={semData.preview_url} target="_blank" rel="noopener noreferrer">
                  <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-xs font-semibold gap-1.5 py-1 px-2.5 cursor-pointer hover:bg-blue-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Sem {sNum} Drive PDF
                  </Badge>
                </a>
              ) : (
                <Badge key={sNum} variant="outline" className="text-[10px] text-[#7A7067] border-[#DFD7CB] bg-[#FAF6F0]">
                  Sem {sNum} Pending
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Apps Script Guide Callout */}
        {showAppsScriptGuide && (
          <div className="mx-6 mt-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#DFD7CB] space-y-2 text-xs">
            <h4 className="font-bold text-[#2C2621] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#A36B40]" /> Automated Google Apps Script Upload Instructions
            </h4>
            <p className="text-[#5C544D] leading-relaxed text-[11px]">
              Deploy the provided script at <code className="bg-white px-1.5 py-0.5 rounded border border-[#DFD7CB] font-mono">scripts/google-apps-script-syllabus-drive.gs</code> in Google Apps Script (<a href="https://script.google.com" target="_blank" className="text-[#A36B40] underline font-bold">script.google.com</a>) as a Web App with access set to &ldquo;Anyone&rdquo;. Add the Web App URL to your environment as <code className="font-mono bg-white px-1.5 py-0.5 rounded">GOOGLE_APPS_SCRIPT_WEBAPP_URL</code>.
            </p>
            <p className="text-[#5C544D] leading-relaxed text-[11px]">
              Alternatively, simply copy any shareable Google Drive link from your Drive folder and paste it into the box below!
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Syllabus Scope */}
          <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB] space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#2C2621]">Target Syllabus Scope</Label>
              <span className="text-[11px] text-[#7A7067]">
                Choose full program curriculum or individual semester
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUploadType('full')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  uploadType === 'full'
                    ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs'
                    : 'bg-white text-[#7A7067] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Program Syllabus</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadType('semester')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  uploadType === 'semester'
                    ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs'
                    : 'bg-white text-[#7A7067] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Semester-wise PDF</span>
              </button>
            </div>

            {uploadType === 'semester' && (
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#2C2621]">Select Semester:</span>
                {Array.from({ length: totalSems }, (_, i) => i + 1).map((sNum) => (
                  <button
                    key={sNum}
                    type="button"
                    onClick={() => setSelectedSem(sNum)}
                    className={`h-7 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedSem === sNum
                        ? 'bg-[#2C2621] text-white border-[#2C2621]'
                        : 'bg-white text-[#7A7067] border-[#DFD7CB] hover:bg-white'
                    }`}
                  >
                    Sem {sNum}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Integration Mode Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#2C2621]">Google Drive Attachment Method</Label>
              <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#DFD7CB]">
                <button
                  type="button"
                  onClick={() => setMethod('link')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    method === 'link' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067]'
                  }`}
                >
                  Paste Drive Link
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upload')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    method === 'upload' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067]'
                  }`}
                >
                  Upload via Apps Script
                </button>
              </div>
            </div>

            {method === 'link' ? (
              <div className="space-y-2">
                <Input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                  className="text-xs rounded-xl border-[#DFD7CB] h-10 font-mono"
                />
                <div className="flex items-center justify-between text-[11px] text-[#7A7067]">
                  <span>Paste any shareable Google Drive link from your Drive folder</span>
                  {parsedDriveId ? (
                    <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid File ID: {parsedDriveId.slice(0, 10)}...
                    </span>
                  ) : driveLink.length > 0 ? (
                    <span className="text-amber-700 font-medium">Please enter a valid Google Drive file URL</span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#DFD7CB] hover:border-[#A36B40] rounded-2xl p-5 text-center bg-[#FAF6F0]/40 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-7 h-7 mx-auto text-[#A36B40] mb-2" />
                <p className="text-xs font-bold text-[#2C2621]">
                  {selectedFile ? selectedFile.name : `Select PDF to upload via Google Apps Script to Drive`}
                </p>
                <p className="text-[11px] text-[#7A7067] mt-0.5">
                  {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB · Ready for Apps Script transfer` : 'Automatically stored in Google Drive folder: Sandip_University_Approved_Syllabi'}
                </p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2C2621]">
                Academic Approval Authority
              </Label>
              <Input
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Sandip University Academic Council"
                className="text-xs rounded-xl border-[#DFD7CB] h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2C2621]">
                Curriculum Framework
              </Label>
              <Input
                value={academicFramework}
                onChange={(e) => setAcademicFramework(e.target.value)}
                placeholder="NEP 2020 / CBCS Scheme"
                className="text-xs rounded-xl border-[#DFD7CB] h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2C2621]">
                Academic Year
              </Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                className="text-xs rounded-xl border-[#DFD7CB] h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#2C2621]">
                Total Degree Credits
              </Label>
              <Input
                type="number"
                value={totalCredits}
                onChange={(e) => setTotalCredits(e.target.value)}
                placeholder="160"
                className="text-xs rounded-xl border-[#DFD7CB] h-9"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DFD7CB]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold rounded-xl border-[#DFD7CB] h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-bold rounded-xl bg-[#A36B40] hover:bg-[#8E5B34] text-white h-9 px-5 gap-1.5 shadow-md shadow-[#A36B40]/25 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Connecting to Drive...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Attach Approved Drive PDF</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
