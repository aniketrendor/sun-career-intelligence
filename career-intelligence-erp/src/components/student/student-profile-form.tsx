'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Calendar, School, BookOpen,
  GraduationCap, Save, Sparkles, Layers,
  ChevronDown, Shield, Contact, ArrowRight,
  UserCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateStudentProfile } from '@/lib/actions/student.actions'

interface StudentProfileFormProps {
  initialUser: any
  initialProfile: any
  enrollment: any
}

// Universal education level options matching image-2
const EDUCATION_LEVEL_OPTIONS = [
  'Undergraduate (UG)',
  'School (Class 9th–12th)',
  'Diploma / Polytechnic',
  'Postgraduate (PG)',
  'Doctoral / PhD',
  'Other',
]

// Student status options
const STUDENT_STATUS_OPTIONS = [
  'Currently studying',
  'Recently graduated',
  'Looking for admission / career switch',
  'Working professional / Upskilling',
  'Gap year / Exploring options',
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
  const rawPrn = (initialProfile?.prn || '').trim()

  // Initial institution / college name
  const rawInstitution = initialProfile?.institution || enrollment?.program?.institution?.name || ''

  // Form state holding all fields from Image 2
  const [formData, setFormData] = useState({
    full_name: initialUser?.full_name || '',
    institution: rawInstitution,
    education_level: initialProfile?.education_level || 'Undergraduate (UG)',
    current_qualification: initialProfile?.current_program || enrollment?.program?.name || '',
    prn: rawPrn,
    stream_department: initialProfile?.stream_department || initialProfile?.school || '',
    current_class_semester: initialProfile?.current_class_semester || (initialProfile?.current_semester ? `Semester ${initialProfile?.current_semester}` : (enrollment?.class?.semester ? `Semester ${enrollment.class.semester}` : '')),
    academic_year: initialProfile?.academic_year || enrollment?.academic_year || '',
    student_status: initialProfile?.student_status || 'Currently studying',
    email: initialUser?.email || '',
    phone_digits: initial10DigitPhone,
  })

  // Core Required Fields for Assessment Readiness (marked with * on form)
  const isNameValid = formData.full_name.trim().length >= 2
  const isInstitutionValid = formData.institution.trim().length >= 2
  const isEducationLevelValid = Boolean(formData.education_level)
  const isProgramValid = formData.current_qualification.trim().length >= 2
  const isClassValid = formData.current_class_semester.trim().length >= 1
  const isStatusValid = Boolean(formData.student_status)
  const isPhoneValid = /^\d{10}$/.test(formData.phone_digits)

  // Optional Fields
  const isStreamValid = formData.stream_department.trim().length >= 1
  const isBatchValid = formData.academic_year.trim().length >= 1
  const isPrnValid = formData.prn.trim().length >= 1

  const requiredFields = [
    { key: 'full_name', label: 'Full Name *', valid: isNameValid },
    { key: 'institution', label: 'Educational Institution *', valid: isInstitutionValid },
    { key: 'education_level', label: 'Education Level *', valid: isEducationLevelValid },
    { key: 'current_qualification', label: 'Current Qualification / Program *', valid: isProgramValid },
    { key: 'current_class_semester', label: 'Current Class / Semester *', valid: isClassValid },
    { key: 'student_status', label: 'Student Status *', valid: isStatusValid },
    { key: 'phone', label: 'Contact Mobile Number *', valid: isPhoneValid },
  ]

  const optionalFields = [
    { key: 'prn', label: 'Student ID / Roll No.', valid: isPrnValid },
    { key: 'stream_department', label: 'Stream / Department', valid: isStreamValid },
    { key: 'academic_year', label: 'Academic Session / Batch', valid: isBatchValid },
  ]

  const completedRequiredCount = requiredFields.filter(r => r.valid).length
  const totalRequiredCount = requiredFields.length
  const isAssessmentReady = completedRequiredCount === totalRequiredCount

  const allFields = [...requiredFields, ...optionalFields]
  const totalCompletedCount = allFields.filter(r => r.valid).length
  const totalFieldsCount = allFields.length
  const completenessPercent = Math.round((totalCompletedCount / totalFieldsCount) * 100)

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10)
    setFormData(prev => ({ ...prev, phone_digits: digitsOnly }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      toast.error('Please enter your full legal name.')
      return
    }

    if (!formData.institution.trim()) {
      toast.error('Please enter your educational institution.')
      return
    }

    if (!formData.current_qualification.trim()) {
      toast.error('Please enter your current qualification / program.')
      return
    }

    if (formData.phone_digits.length !== 10) {
      toast.error('Please enter a valid 10-digit contact mobile number.')
      return
    }

    const fd = new FormData()
    fd.set('full_name', formData.full_name)
    fd.set('institution', formData.institution)
    fd.set('education_level', formData.education_level)
    fd.set('current_program', formData.current_qualification)
    fd.set('prn', formData.prn)
    fd.set('stream_department', formData.stream_department)
    fd.set('current_class_semester', formData.current_class_semester)
    fd.set('academic_year', formData.academic_year)
    fd.set('student_status', formData.student_status)
    fd.set('phone', `+91 ${formData.phone_digits}`)

    startTransition(async () => {
      const res = await updateStudentProfile({ success: false }, fd)
      if (res.success) {
        toast.success('Academic profile saved successfully! Ready for assessment.')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update profile.')
      }
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card className="border border-[#EBE4D8] rounded-3xl shadow-sm bg-white overflow-hidden p-6 sm:p-9">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#EBE2D7] text-[#8C4E2D] flex items-center justify-center shrink-0 shadow-inner">
              <User className="w-6 h-6 fill-[#8C4E2D] text-[#8C4E2D]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#142033] tracking-tight">
                Academic Profile & Student Records
              </h1>
              <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5">
                One profile for every learner, across schools, colleges, universities and professional programs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isAssessmentReady ? (
              <Link href="/student/assessment?start=true&track=UG">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-[#8C4E2D] bg-[#F5ECE2] hover:bg-[#8C4E2D] hover:text-white text-[#8C4E2D] font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8C4E2D]" />
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const missingRequired = requiredFields.filter(r => !r.valid).map(r => r.label).join(', ')
                  toast.error(`Please fill all required fields (${missingRequired}) and save your profile to start assessment.`)
                }}
                className="h-10 px-4 rounded-xl border-[#DFD7CB] bg-white text-[#7A7067] hover:text-[#8C4E2D] hover:border-[#8C4E2D] font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap opacity-85"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" />
                <span>Start Free Assessment</span>
                <span className="text-[10px] bg-[#FAF6F0] text-[#8C4E2D] px-1.5 py-0.5 rounded border border-[#DFD7CB]">
                  {completedRequiredCount}/{totalRequiredCount} Required
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Universal Student Profile Pill Banner & Assessment Readiness Status */}
        <div className="py-4 border-b border-[#F0EAE1] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5ECE2] text-[#8C4E2D] text-xs font-bold border border-[#E9DDD0] shrink-0 self-start sm:self-auto">
                <GraduationCap className="w-4 h-4 text-[#8C4E2D]" />
                <span>Universal student profile</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Fill the required fields (marked with *) to unlock the career diagnostic assessment. Optional fields enrich longitudinal tracking.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                isAssessmentReady
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-[#8C4E2D] bg-[#F5ECE2] border-[#E9DDD0]/80'
              }`}>
                {isAssessmentReady ? '✓ Ready for Assessment' : `${completedRequiredCount} of ${totalRequiredCount} Required Fields`}
              </span>
            </div>
          </div>

          {/* Assessment Readiness Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#7A7067]">
              <span>Assessment Readiness ({isAssessmentReady ? 'Complete' : `${totalRequiredCount - completedRequiredCount} required field(s) remaining`})</span>
              <span>{completedRequiredCount} of {totalRequiredCount} required fields</span>
            </div>
            <div className="h-2 w-full bg-[#F5ECE2] rounded-full overflow-hidden border border-[#E9DDD0]/70">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out shadow-xs ${
                  isAssessmentReady
                    ? 'bg-emerald-600'
                    : 'bg-gradient-to-r from-[#A36B40] to-[#8C4E2D]'
                }`}
                style={{ width: `${Math.round((completedRequiredCount / totalRequiredCount) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Body matching Image 2 */}
        <form onSubmit={handleSubmitProfile} className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* ROW 1 */}
            {/* Field 1: Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                FULL NAME <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                  placeholder="e.g. Alex Johnson (Enter your full legal name)"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors"
                />
              </div>
            </div>

            {/* Field 2: Educational Institution */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                EDUCATIONAL INSTITUTION <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="institution"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  required
                  placeholder="e.g. Sandip University, Oxford, SPPU, State College"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors"
                />
              </div>
            </div>

            {/* ROW 2 */}
            {/* Field 3: Education Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                EDUCATION LEVEL <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  name="education_level"
                  value={formData.education_level}
                  onChange={(e) => handleInputChange('education_level', e.target.value)}
                  className="w-full pl-10 pr-9 h-11 rounded-xl border border-[#DFD7CB] bg-white focus:border-[#8C4E2D] focus:outline-none text-sm text-[#142033] font-normal transition-colors appearance-none cursor-pointer"
                >
                  {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#7A7067] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#8A7E73] font-medium pt-0.5">
                School • Diploma • UG • PG • Doctoral • Other
              </p>
            </div>

            {/* Field 4: Current Qualification / Program */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                CURRENT QUALIFICATION / PROGRAM <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="current_qualification"
                  value={formData.current_qualification}
                  onChange={(e) => handleInputChange('current_qualification', e.target.value)}
                  required
                  placeholder="e.g. Class 12, B.Tech, B.Com, MBA, BCA, Diploma, PhD"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors"
                />
              </div>
            </div>

            {/* Sub-banner across both columns */}
            <div className="md:col-span-2 -mt-1 -mb-1">
              <p className="text-xs text-[#7A7067] leading-relaxed">
                Fields may adjust based on your education level, but all information is captured in this single form for a complete profile.
              </p>
            </div>

            {/* ROW 3 */}
            {/* Field 5: Student ID / Roll No. */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                STUDENT ID / ROLL NO.
              </label>
              <div className="relative">
                <Contact className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="prn"
                  value={formData.prn}
                  onChange={(e) => handleInputChange('prn', e.target.value)}
                  placeholder="e.g. 250102041007, Roll No., PRN, or Student ID"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors font-sans"
                />
              </div>
            </div>

            {/* Field 6: Stream / Department / Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                STREAM / DEPARTMENT / SUBJECT
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="stream_department"
                  value={formData.stream_department}
                  onChange={(e) => handleInputChange('stream_department', e.target.value)}
                  placeholder="e.g. Computer Science, Mechanical, Commerce, Arts, Science"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors"
                />
              </div>
            </div>

            {/* ROW 4 */}
            {/* Field 7: Current Class / Year / Semester */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                CURRENT CLASS / YEAR / SEMESTER <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="current_class_semester"
                  value={formData.current_class_semester}
                  onChange={(e) => handleInputChange('current_class_semester', e.target.value)}
                  required
                  placeholder="e.g. Semester 3, Year 2, Class 12"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors"
                />
              </div>
            </div>

            {/* Field 8: Academic Session / Batch */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                ACADEMIC SESSION / BATCH
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => handleInputChange('academic_year', e.target.value)}
                  placeholder="e.g. 2024 – 2028, 2025 – 2027"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] placeholder:text-[#9C9388] transition-colors"
                />
              </div>
            </div>

            {/* ROW 5 */}
            {/* Field 9: Student Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                STUDENT STATUS <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  name="student_status"
                  value={formData.student_status}
                  onChange={(e) => handleInputChange('student_status', e.target.value)}
                  className="w-full pl-10 pr-9 h-11 rounded-xl border border-[#DFD7CB] bg-white focus:border-[#8C4E2D] focus:outline-none text-sm text-[#142033] font-normal transition-colors appearance-none cursor-pointer"
                >
                  {STUDENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#7A7067] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 10: Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C4E2D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={formData.email}
                  disabled
                  placeholder="e.g. student@institution.edu"
                  className="pl-10 h-11 rounded-xl border-[#DFD7CB] bg-[#FAF8F5] text-sm text-[#142033] placeholder:text-[#9C9388]"
                />
              </div>
            </div>

            {/* ROW 6 */}
            {/* Field 11: Contact Number */}
            <div className="space-y-1.5 md:col-span-2 sm:max-w-md">
              <label className="text-xs font-bold text-[#142033] uppercase tracking-wider block">
                CONTACT NUMBER <span className="text-[#8C4E2D]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="h-11 px-3 rounded-xl border border-[#DFD7CB] bg-white flex items-center gap-1.5 text-xs font-bold text-[#142033] shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#8C4E2D]" />
                  <span>+91</span>
                  <ChevronDown className="w-3 h-3 text-[#7A7067] ml-0.5" />
                </div>
                <Input
                  name="phone_digits_input"
                  value={formData.phone_digits}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={10}
                  required
                  placeholder="10-digit mobile number"
                  className="h-11 rounded-xl border-[#DFD7CB] bg-white focus:border-[#8C4E2D] text-sm text-[#142033] font-mono placeholder:text-[#9C9388] flex-1"
                />
              </div>
            </div>
          </div>

          {/* Footer Row matching Image 2 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#F0EAE1]">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Shield className="w-4 h-4 text-[#8C4E2D] shrink-0" />
              <span>Your details help us personalize your academic assessment.</span>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-[#8C4E2D] hover:bg-[#783E22] text-white font-bold text-xs shadow-md shadow-[#8C4E2D]/20 flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Saving Profile...' : 'Save & Verify Profile'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
