'use client'

import { useState } from 'react'
import {
  FileText, Download, ExternalLink, X,
  Maximize2, Minimize2, Eye, Printer, Sparkles, AlertCircle, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SyllabusPdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  program: {
    id?: string
    code: string
    name: string
    school?: string
    level?: string
    notes?: string
    total_semesters?: number
  } | null
  onOpenUpload?: (prog: any) => void
}

export function SyllabusPdfPreviewModal({
  isOpen,
  onClose,
  program,
  onOpenUpload
}: SyllabusPdfPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeSem, setActiveSem] = useState<string>('full')

  if (!isOpen || !program) return null

  let syllabusMeta: any = null
  if (program.notes) {
    try {
      syllabusMeta = JSON.parse(program.notes)
    } catch {}
  }

  const semestersMap = syllabusMeta?.semesters || {}
  const totalSems = program.total_semesters || 8

  // Determine current active PDF URL
  let currentPdfUrl = ''
  if (activeSem === 'full') {
    currentPdfUrl = syllabusMeta?.preview_url || syllabusMeta?.syllabus_url || ''
  } else if (semestersMap[activeSem]?.preview_url || semestersMap[activeSem]?.url) {
    currentPdfUrl = semestersMap[activeSem].preview_url || semestersMap[activeSem].url
  }

  const hasAnyPdf = Boolean(syllabusMeta?.syllabus_url || syllabusMeta?.preview_url || Object.values(semestersMap).some((s: any) => s?.preview_url || s?.url))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl w-full overflow-hidden flex flex-col font-sans transition-all duration-200 animate-in fade-in-50 zoom-in-95 ${
        isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-5xl h-[86vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-[#FAF6F0] border-b border-[#DFD7CB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#DFD7CB] flex items-center justify-center text-[#A36B40] shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-[#A36B40] bg-white px-2 py-0.5 rounded border border-[#DFD7CB]">
                  {program.code}
                </span>
                {program.level && (
                  <Badge variant="outline" className="text-[10px] font-bold border-[#DFD7CB] bg-white text-[#7A7067]">
                    {program.level}
                  </Badge>
                )}
                <span className="text-[11px] font-semibold text-[#7A7067]">
                  {syllabusMeta?.academic_framework || 'NEP 2020 / CBCS'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#2C2621] line-clamp-1 mt-0.5">
                {program.name} — Approved Curriculum Syllabus
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentPdfUrl && (
              <>
                <a href={currentPdfUrl} download={`Sandip_University_${program.code}_${activeSem === 'full' ? 'Full' : `Sem${activeSem}`}_Syllabus.pdf`} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#F2EAE0] h-9 px-3 rounded-xl gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#A36B40]" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </a>

                <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#F2EAE0] h-9 px-3 rounded-xl gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#7A7067]" />
                    <span className="hidden sm:inline">Drive Tab</span>
                  </Button>
                </a>
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-9 w-9 p-0 text-[#7A7067] hover:text-[#2C2621] hover:bg-white rounded-xl"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-[#7A7067] hover:text-[#2C2621] hover:bg-white transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Semester Selection Tabs */}
        {hasAnyPdf && (
          <div className="bg-[#FAF8F5] border-b border-[#DFD7CB] px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
            <span className="text-[11px] font-bold text-[#7A7067] uppercase mr-1">Scope:</span>
            
            <button
              type="button"
              onClick={() => setActiveSem('full')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                activeSem === 'full'
                  ? 'bg-[#A36B40] text-white border-[#A36B40]'
                  : (syllabusMeta?.syllabus_url || syllabusMeta?.preview_url)
                  ? 'bg-white text-[#2C2621] border-[#DFD7CB]'
                  : 'bg-white/40 text-[#A0988F] border-[#DFD7CB]/50'
              }`}
            >
              Full Program PDF {(syllabusMeta?.syllabus_url || syllabusMeta?.preview_url) ? '✓' : '(Pending)'}
            </button>

            {Array.from({ length: totalSems }, (_, i) => String(i + 1)).map((s) => {
              const semHasPdf = Boolean(semestersMap[s]?.preview_url || semestersMap[s]?.url)
              const isSelected = activeSem === s

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveSem(s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2C2621] text-white border-[#2C2621]'
                      : semHasPdf
                      ? 'bg-white text-[#2C2621] border-[#DFD7CB]'
                      : 'bg-white/40 text-[#A0988F] border-[#DFD7CB]/50'
                  }`}
                >
                  Sem {s} {semHasPdf ? '✓' : ''}
                </button>
              )
            })}
          </div>
        )}

        {/* Embedded PDF Viewer or Empty State */}
        <div className="flex-1 w-full bg-[#2C2621]/5 relative overflow-hidden flex items-center justify-center">
          {currentPdfUrl ? (
            <iframe
              key={currentPdfUrl}
              src={currentPdfUrl}
              className="w-full h-full border-0"
              title={`${program.name} Syllabus Preview`}
              allow="autoplay"
            />
          ) : (
            <div className="text-center p-8 max-w-md space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#DFD7CB] flex items-center justify-center text-[#A36B40] mx-auto shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-[#2C2621] text-base">
                {activeSem === 'full'
                  ? 'Full Program Approved PDF Pending'
                  : `Semester ${activeSem} Approved PDF Pending`}
              </h4>
              <p className="text-xs text-[#7A7067] leading-relaxed">
                The department administration has not yet attached an approved Google Drive PDF document for {activeSem === 'full' ? 'the full curriculum' : `Semester ${activeSem}`}.
              </p>
              {onOpenUpload && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose()
                      onOpenUpload(program)
                    }}
                    className="bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-xl h-9 px-4 shadow-sm cursor-pointer"
                  >
                    Upload Approved PDF Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
