'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Calendar, Building, BookOpen,
  GraduationCap, CheckCircle2, Save, Sparkles,
  AlertCircle, ShieldCheck, School, Layers, Check, ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateStudentProfile } from '@/lib/actions/student.actions'

interface StudentProfileFormProps {
  initialUser: any
  initialProfile: any
  enrollment: any
}

export function StudentProfileForm({
  initialUser,
  initialProfile,
  enrollment,
}: StudentProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Clean initial phone to raw 10 digits
  const rawPhone = (initialProfile?.phone || initialUser?.phone || '7030430756').replace(/\D/g, '')
  const initial10DigitPhone = rawPhone.length === 12 && rawPhone.startsWith('91')
    ? rawPhone.slice(2)
    : rawPhone.slice(-10)

  // Clean initial PRN to raw 12 digits
  const rawPrn = (initialProfile?.prn || '250102041007').replace(/[\s-]/g, '')

  // Track field state for live completeness calculation
  const [formData, setFormData] = useState({
    full_name: initialUser?.full_name || 'Harish Chavan',
    prn: rawPrn,
    phone_digits: initial10DigitPhone,
    academic_year: initialProfile?.academic_year || enrollment?.academic_year || '2023 - 2027',
    current_program: initialProfile?.current_program || enrollment?.program?.name || 'B.Tech in Computer Engineering',
    school: initialProfile?.school || initialProfile?.institution || 'School of Engineering & Technology',
    current_semester: initialProfile?.current_semester || enrollment?.class?.semester || 5,
  })

  // Mandatory fields checklist with exact validation rules
  const isPrnValid = /^\d{12}$/.test(formData.prn)
  const isPhoneValid = /^\d{10}$/.test(formData.phone_digits)

  const requirements = [
    { key: 'full_name', label: 'Full Legal Name', value: formData.full_name, valid: formData.full_name.trim().length >= 2 },
    { key: 'phone', label: 'Contact Phone (+91 10-digit)', value: formData.phone_digits, valid: isPhoneValid },
    { key: 'prn', label: 'PRN (12 digits)', value: formData.prn, valid: isPrnValid },
    { key: 'academic_year', label: 'Academic Batch', value: formData.academic_year, valid: formData.academic_year.trim().length > 0 },
    { key: 'current_program', label: 'Degree / Program', value: formData.current_program, valid: formData.current_program.trim().length > 0 },
    { key: 'school', label: 'School / Department', value: formData.school, valid: formData.school.trim().length > 0 },
    { key: 'current_semester', label: 'Current Semester', value: formData.current_semester, valid: Number(formData.current_semester) >= 1 },
  ]

  const completedCount = requirements.filter(r => r.valid).length
  const totalCount = requirements.length
  const completenessPercent = Math.round((completedCount / totalCount) * 100)

  const handlePrnChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12)
    setFormData(prev => ({ ...prev, prn: digitsOnly }))
  }

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10)
    setFormData(prev => ({ ...prev, phone_digits: digitsOnly }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isPrnValid) {
      toast.error('PRN must be exactly 12 numeric digits without any spaces or dashes.')
      return
    }

    if (!isPhoneValid) {
      toast.error('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    const fd = new FormData(e.currentTarget)
    // Append formatted phone with default +91 prefix
    fd.set('phone', `+91 ${formData.phone_digits}`)
    fd.set('prn', formData.prn)

    startTransition(async () => {
      const res = await updateStudentProfile({ success: false }, fd)
      if (res.success) {
        toast.success('Profile saved successfully! 100% completion verified.')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update profile.')
      }
    })
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Account Overview Hero Card in Warm Earthy Theme */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#DFD7CB] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#A36B40] text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-[#A36B40]/25">
              {formData.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'HC'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#2C2621]">{formData.full_name || 'Harish Chavan'}</h2>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-xs font-semibold">
                  Sandip Student
                </Badge>
              </div>
              <p className="text-xs text-[#7A7067] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> {initialUser?.email || 'hrchavan0402@gmail.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {completenessPercent === 100 ? (
              <div className="px-4 py-2 rounded-2xl bg-[#FAF6F0] border border-[#77734B]/40 text-[#77734B] text-xs flex items-center gap-2 font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#77734B]" />
                Profile 100% Complete · Assessment Unlocked
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] text-xs flex items-center gap-2 font-bold shadow-xs">
                <AlertCircle className="w-4 h-4 text-[#A36B40]" />
                {completenessPercent}% Complete ({totalCount - completedCount} required fields left)
              </div>
            )}
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="mt-6 pt-5 border-t border-[#DFD7CB] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2621]">
            <span>Profile Completeness Progress</span>
            <span className="text-[#A36B40]">{completenessPercent}%</span>
          </div>
          <div className="h-2 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#DFD7CB]">
            <div
              className="h-full bg-[#A36B40] transition-all rounded-full"
              style={{ width: `${completenessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <Card className="border border-[#DFD7CB] rounded-3xl shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] py-5 px-6 sm:px-8">
          <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
            <User className="w-4 h-4 text-[#A36B40]" /> Academic Profile & Student Records
          </CardTitle>
          <CardDescription className="text-xs text-[#7A7067]">
            Complete all fields (100%) to unlock the career intelligence diagnostic assessment and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Full Legal Name <span className="text-[#A36B40]">*</span>
                </label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                  placeholder="e.g. Harish Chavan"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] font-medium"
                />
              </div>

              {/* PRN - Exactly 12 digits */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                    PRN (Permanent Registration No.) <span className="text-[#A36B40]">*</span>
                  </label>
                  <span className="text-[11px] text-[#7A7067] font-mono">
                    {formData.prn.length}/12 digits
                  </span>
                </div>
                <Input
                  name="prn"
                  value={formData.prn}
                  onChange={(e) => handlePrnChange(e.target.value)}
                  maxLength={12}
                  required
                  placeholder="250102041007"
                  className="h-11 rounded-2xl font-mono font-bold border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] tracking-wider"
                />
                <p className="text-[11px] text-[#7A7067]">
                  Must be exactly 12 numeric digits without any spaces or hyphens.
                </p>
              </div>

              {/* Academic Batch */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Academic Batch / Year <span className="text-[#A36B40]">*</span>
                </label>
                <Input
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => handleInputChange('academic_year', e.target.value)}
                  required
                  placeholder="e.g. 2023 - 2027"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621]"
                />
              </div>

              {/* Degree / Program */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Degree / Program <span className="text-[#A36B40]">*</span>
                </label>
                <Input
                  name="current_program"
                  value={formData.current_program}
                  onChange={(e) => handleInputChange('current_program', e.target.value)}
                  required
                  placeholder="e.g. B.Tech in Computer Engineering"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] font-semibold"
                />
              </div>

              {/* School / Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  School / Department / Specialization <span className="text-[#A36B40]">*</span>
                </label>
                <Input
                  name="school"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  required
                  placeholder="e.g. School of Engineering & Technology"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621]"
                />
              </div>

              {/* Current Semester */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Current Semester <span className="text-[#A36B40]">*</span>
                </label>
                <Input
                  type="number"
                  name="current_semester"
                  value={formData.current_semester}
                  onChange={(e) => handleInputChange('current_semester', Number(e.target.value))}
                  required
                  min={1}
                  max={12}
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621]"
                />
              </div>

              {/* Institutional Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Institutional Email
                </label>
                <Input
                  value={initialUser?.email || 'hrchavan0402@gmail.com'}
                  disabled
                  className="h-11 rounded-2xl bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-sm"
                />
              </div>

              {/* Contact Phone Number with Default +91 Prefix */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                    Contact Phone Number <span className="text-[#A36B40]">*</span>
                  </label>
                  <span className="text-[11px] text-[#7A7067] font-mono">
                    {formData.phone_digits.length}/10 digits
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-11 px-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-xs font-bold text-[#2C2621] flex items-center justify-center shrink-0">
                    +91
                  </span>
                  <Input
                    name="phone_digits_input"
                    value={formData.phone_digits}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    required
                    placeholder="7030430756"
                    className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] font-mono font-medium flex-1 tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-[#7A7067]">
                  Enter your 10-digit mobile number after the +91 country code.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFD7CB]">
              <p className="text-xs text-[#7A7067]">
                {completenessPercent === 100
                  ? 'All mandatory academic records are completed.'
                  : 'Please complete all required fields to unlock your career assessment.'}
              </p>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-11 px-7 rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                <span>{isPending ? 'Saving Profile...' : 'Save & Verify 100% Profile'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
