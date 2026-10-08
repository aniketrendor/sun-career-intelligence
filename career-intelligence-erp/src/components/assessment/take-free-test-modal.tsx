'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, GraduationCap, Award, ArrowRight, X, CheckCircle2, ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TakeFreeTestModalProps {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  candidateCollege?: string
  candidateQualification?: string
  defaultTrack?: 'UG' | 'PG'
  buttonText?: string
  buttonClassName?: string
  variant?: 'primary' | 'outline' | 'default'
}

export function TakeFreeTestModal({
  candidateName,
  candidateEmail,
  candidatePhone = '',
  candidateCollege = '',
  candidateQualification = '',
  defaultTrack = 'UG',
  buttonText = 'Take Free Test',
  buttonClassName,
  variant = 'primary',
}: TakeFreeTestModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLaunchTrack = (level: 'UG' | 'PG') => {
    setIsOpen(false)
    router.push(`/student/assessment?start=true&track=${level}`)
  }

  const triggerClasses = buttonClassName || (
    variant === 'outline'
      ? "h-11 px-6 rounded-2xl border border-[#A36B40]/40 text-[#A36B40] hover:bg-[#FAF6F0] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
      : "gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center"
  )

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClasses}
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>{buttonText}</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white border border-[#DFD7CB] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" /> Free Diagnostic Assessment
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2621] tracking-tight">
                Select Your Academic Level
              </h2>
              <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
                Choose your degree level to launch the 30-adaptive question diagnostic engine tailored for your educational background.
              </p>
            </div>

            {/* Track Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Undergraduate Track */}
              <div
                onClick={() => handleLaunchTrack('UG')}
                className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  defaultTrack === 'UG'
                    ? 'bg-[#FAF6F0]/70 border-[#A36B40] shadow-md shadow-[#A36B40]/15 ring-2 ring-[#A36B40]/20'
                    : 'bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:bg-[#FAF6F0]/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#A36B40] flex items-center justify-center border border-[#DFD7CB] shadow-xs group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    {defaultTrack === 'UG' && (
                      <Badge className="bg-[#A36B40] text-white text-[10px] font-bold rounded-full px-2 py-0.5 border-0">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                      Undergraduate (UG)
                    </h3>
                    <p className="text-[11px] text-[#7A7067] font-medium mt-0.5 leading-snug">
                      For 12th, B.Tech, BCA, B.Sc, BBA, B.Com, and Diploma students.
                    </p>
                  </div>

                  <p className="text-[11px] text-[#7A7067] leading-relaxed pt-1">
                    Evaluates foundational problem-solving, cognitive aptitude, and early career domain mapping.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#DFD7CB]/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#77734B] bg-[#77734B]/10 px-2 py-0.5 rounded-full">
                    30 Adaptive MCQs
                  </span>
                  <span className="text-xs font-bold text-[#A36B40] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Start UG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Postgraduate Track */}
              <div
                onClick={() => handleLaunchTrack('PG')}
                className={`p-5 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  defaultTrack === 'PG'
                    ? 'bg-[#FAF6F0]/70 border-[#77734B] shadow-md shadow-[#77734B]/15 ring-2 ring-[#77734B]/20'
                    : 'bg-white border-[#DFD7CB] hover:border-[#77734B] hover:bg-[#FAF6F0]/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#77734B] flex items-center justify-center border border-[#DFD7CB] shadow-xs group-hover:scale-105 transition-transform">
                      <Award className="w-6 h-6" />
                    </div>
                    {defaultTrack === 'PG' && (
                      <Badge className="bg-[#77734B] text-white text-[10px] font-bold rounded-full px-2 py-0.5 border-0">
                        Recommended
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#2C2621] group-hover:text-[#77734B] transition-colors">
                      Postgraduate (PG)
                    </h3>
                    <p className="text-[11px] text-[#7A7067] font-medium mt-0.5 leading-snug">
                      For M.Tech, MBA, MCA, M.Sc, M.Com, and Master's graduates.
                    </p>
                  </div>

                  <p className="text-[11px] text-[#7A7067] leading-relaxed pt-1">
                    Evaluates strategic decision trade-offs, system architectures, and managerial leadership.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#DFD7CB]/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#77734B] bg-[#77734B]/10 px-2 py-0.5 rounded-full">
                    30 Adaptive MCQs
                  </span>
                  <span className="text-xs font-bold text-[#77734B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Start PG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Note */}
            <div className="pt-2 border-t border-[#DFD7CB] flex items-center justify-between text-xs text-[#7A7067]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#77734B]" />
                Full 30-question diagnostic evaluation with instant career report
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[#7A7067] hover:text-[#2C2621] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
