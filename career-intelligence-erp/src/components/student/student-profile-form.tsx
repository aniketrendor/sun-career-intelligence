'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Calendar, Building, BookOpen,
  GraduationCap, CheckCircle2, Save, Sparkles,
  AlertCircle, ShieldCheck, School, Layers, Check, ArrowRight,
  HelpCircle, Compass
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

// Common education backgrounds / streams
const EDUCATION_LEVEL_OPTIONS = [
  'Undergraduate (B.Tech / B.E. / BCA / B.Sc / B.Com / BBA / BA)',
  'Postgraduate (M.Tech / MCA / MBA / M.Sc / M.Com / MA)',
  'Polytechnic / Diploma',
  'Higher Secondary / Junior College (11th / 12th)',
  'Doctorate / Ph.D / Research',
  'Other Educational Background',
]

// Popular / reference universities & colleges
const POPULAR_INSTITUTIONS = [
  'Sandip University',
  'Savitribai Phule Pune University (SPPU)',
  'University of Mumbai',
  'Delhi University (DU)',
  'Anna University',
  'Visvesvaraya Technological University (VTU)',
  'Autonomous Engineering College',
  'Government Polytechnic / College',
  'Other College / University',
]

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

  // Initial PRN / Student ID
  const rawPrn = (initialProfile?.prn || '250102041007').trim()

  // Initial institution / college name
  const rawInstitution = initialProfile?.institution || enrollment?.program?.institution?.name || 'Sandip University'

  // Track field state for live completeness calculation
  const [formData, setFormData] = useState({
    full_name: initialUser?.full_name || 'Harish Chavan',
    institution: rawInstitution,
    education_level: initialProfile?.education_level || 'Undergraduate (B.Tech / B.E. / BCA / B.Sc / B.Com / BBA / BA)',
    prn: rawPrn,
    phone_digits: initial10DigitPhone,
    academic_year: initialProfile?.academic_year || enrollment?.academic_year || '2023 - 2027',
    current_program: initialProfile?.current_program || enrollment?.program?.name || 'B.Tech in Computer Engineering',
    school: initialProfile?.school || 'School of Engineering & Technology',
    current_semester: initialProfile?.current_semester || enrollment?.class?.semester || 5,
  })

  // Flexible validation rules accommodating students from ANY college or background
  const isPrnValid = formData.prn.trim().length >= 2
  const isPhoneValid = /^\d{10}$/.test(formData.phone_digits)
  const isInstitutionValid = formData.institution.trim().length >= 2
  const isProgramValid = formData.current_program.trim().length >= 2
  const isBatchValid = formData.academic_year.trim().length >= 2

  const requirements = [
    { key: 'full_name', label: 'Full Legal Name', value: formData.full_name, valid: formData.full_name.trim().length >= 2 },
    { key: 'institution', label: 'College / University', value: formData.institution, valid: isInstitutionValid },
    { key: 'current_program', label: 'Degree / Program', value: formData.current_program, valid: isProgramValid },
    { key: 'prn', label: 'Student ID / Roll No. / PRN', value: formData.prn, valid: isPrnValid },
    { key: 'academic_year', label: 'Academic Batch / Year', value: formData.academic_year, valid: isBatchValid },
    { key: 'current_semester', label: 'Current Semester / Year', value: formData.current_semester, valid: Number(formData.current_semester) >= 1 },
    { key: 'phone', label: 'Contact Mobile Number', value: formData.phone_digits, valid: isPhoneValid },
  ]

  const completedCount = requirements.filter(r => r.valid).length
  const totalCount = requirements.length
  const completenessPercent = Math.round((completedCount / totalCount) * 100)

  const handlePrnChange = (val: string) => {
    // Allow alphanumeric characters, dashes, and slashes for any university format
    setFormData(prev => ({ ...prev, prn: val }))
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
      toast.error('Please enter your Student ID, Roll No., or University PRN.')
      return
    }

    if (!isPhoneValid) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    if (!isInstitutionValid) {
      toast.error('Please enter your College or University name.')
      return
    }

    const fd = new FormData()
    fd.set('full_name', formData.full_name)
    fd.set('phone', `+91 ${formData.phone_digits}`)
    fd.set('prn', formData.prn)
    fd.set('institution', formData.institution)
    fd.set('school', formData.school || formData.institution)
    fd.set('current_program', formData.current_program)
    fd.set('academic_year', formData.academic_year)
    fd.set('current_semester', String(formData.current_semester))

    startTransition(async () => {
      const res = await updateStudentProfile({ success: false }, fd)
      if (res.success) {
        toast.success('Academic profile saved successfully! Ready for career assessment.')
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
              {formData.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#2C2621]">{formData.full_name || 'Student Member'}</h2>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-xs font-semibold">
                  {formData.institution ? formData.institution : 'Student Member'}
                </Badge>
              </div>
              <p className="text-xs text-[#7A7067] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> {initialUser?.email || 'student@domain.edu'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {completenessPercent === 100 ? (
              <div className="px-4 py-2 rounded-2xl bg-[#FAF6F0] border border-[#77734B]/40 text-[#77734B] text-xs flex items-center gap-2 font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#77734B]" />
                Profile 100% Complete · Assessment Ready
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] text-xs flex items-center gap-2 font-bold shadow-xs">
                <AlertCircle className="w-4 h-4 text-[#A36B40]" />
                {completenessPercent}% Complete ({totalCount - completedCount} field(s) pending)
              </div>
            )}
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="mt-6 pt-5 border-t border-[#DFD7CB] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C2621]">
            <span className="flex items-center gap-2">
              <span>Profile Completeness Progress</span>
              <span className="text-[11px] font-normal text-[#7A7067]">(Universal student onboarding for all colleges & streams)</span>
            </span>
            <span className="text-[#A36B40]">{completenessPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#DFD7CB]">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <User className="w-4 h-4 text-[#A36B40]" /> Academic Profile & Student Records
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                Suitable for students across all universities, autonomous colleges, and educational backgrounds
              </CardDescription>
            </div>
            <Link href={`/student/fresher/test?code=SUN-FRESHERS-2026&name=${encodeURIComponent(formData.full_name || 'Student')}&email=${encodeURIComponent(initialUser?.email || '')}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl border-[#A36B40]/40 text-[#A36B40] hover:bg-[#FAF6F0] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" />
                <span>Start Free Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
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

              {/* College / University Name (Suitable for ANY college or university) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                    College / University / Institution <span className="text-[#A36B40]">*</span>
                  </label>
                  <span className="text-[11px] text-[#7A7067]">Any University</span>
                </div>
                <Input
                  name="institution"
                  list="institution-options"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  required
                  placeholder="e.g. Sandip University, Pune University, Mumbai University, etc."
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] font-medium"
                />
                <datalist id="institution-options">
                  {POPULAR_INSTITUTIONS.map((inst) => (
                    <option key={inst} value={inst} />
                  ))}
                </datalist>
                <p className="text-[11px] text-[#7A7067]">
                  Enter the name of your college, university, polytechnic, or school.
                </p>
              </div>

              {/* Education Background / Stream */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Education Background & Level <span className="text-[#A36B40]">*</span>
                </label>
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={(e) => handleInputChange('education_level', e.target.value)}
                  className="h-11 w-full rounded-2xl border border-[#DFD7CB] bg-white px-3 text-sm text-[#2C2621] font-medium focus:border-[#A36B40] focus:outline-none transition-colors"
                >
                  {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#7A7067]">
                  Select your current degree level or educational stream.
                </p>
              </div>

              {/* Student ID / Roll No. / PRN (Flexible for ANY institution) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                    Student ID / PRN / Roll No. <span className="text-[#A36B40]">*</span>
                  </label>
                  <span className="text-[11px] text-[#7A7067] font-mono">
                    {formData.prn.length} chars
                  </span>
                </div>
                <Input
                  name="prn"
                  value={formData.prn}
                  onChange={(e) => handlePrnChange(e.target.value)}
                  required
                  placeholder="e.g. 250102041007, CS-2023-45, or Roll No."
                  className="h-11 rounded-2xl font-mono font-bold border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] tracking-wider"
                />
                <p className="text-[11px] text-[#7A7067]">
                  Enter your University PRN, College Roll No., or Student Enrollment ID.
                </p>
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
                  placeholder="e.g. B.Tech in Computer Engineering, BCA, B.Com, 12th Science, Diploma"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621] font-semibold"
                />
                <p className="text-[11px] text-[#7A7067]">
                  Your specific degree, course, or standard of study.
                </p>
              </div>

              {/* School / Department / Major */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Department / Specialization / Major
                </label>
                <Input
                  name="school"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  placeholder="e.g. Computer Science, Mechanical, Finance, Commerce, Science"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621]"
                />
                <p className="text-[11px] text-[#7A7067]">
                  Your academic branch, faculty department, or primary subject.
                </p>
              </div>

              {/* Academic Batch / Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Academic Batch / Year <span className="text-[#A36B40]">*</span>
                </label>
                <Input
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => handleInputChange('academic_year', e.target.value)}
                  required
                  placeholder="e.g. 2023 - 2027 or 2024 - 2026"
                  className="h-11 rounded-2xl border-[#DFD7CB] focus:border-[#A36B40] text-sm text-[#2C2621]"
                />
              </div>

              {/* Current Semester / Study Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Current Semester / Year <span className="text-[#A36B40]">*</span>
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
                <p className="text-[11px] text-[#7A7067]">
                  Enter your current semester number (1 to 10) or academic year.
                </p>
              </div>

              {/* Institutional / Personal Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Registered Email Address
                </label>
                <Input
                  value={initialUser?.email || 'student@domain.edu'}
                  disabled
                  className="h-11 rounded-2xl bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-sm"
                />
              </div>

              {/* Contact Phone Number */}
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
                  Enter your 10-digit mobile number for notification and mentorship updates.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFD7CB]">
              <p className="text-xs text-[#7A7067]">
                {completenessPercent === 100
                  ? 'All academic records are complete and verified across institutions.'
                  : 'Complete all required fields to personalize your career intelligence report.'}
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-11 px-7 rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Save className="w-4 h-4" />
                  <span>{isPending ? 'Saving Profile...' : 'Save & Verify Profile'}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
