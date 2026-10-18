'use client'

import { useState, useTransition } from 'react'
import {
  User, Mail, Phone, MapPin, Clock, Award, ShieldCheck,
  Sparkles, CheckCircle2, Plus, X, Eye, BookOpen, Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateMentorProfile, MentorProfileData } from '@/lib/actions/mentor.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProfileClientProps {
  user: {
    id: string
    full_name: string
    email: string
    phone: string | null
    role: string
  }
  counselorProfile: {
    employee_id: string | null
    title: string
    cabin: string
    expertise: string[]
    consultation_hours: string
    bio: string
  }
  stats: {
    adviseeCount: number
    sessionCount: number
  }
}

const SUGGESTED_DOMAINS = [
  'Artificial Intelligence & ML',
  'Cloud Infrastructure & DevOps',
  'Data Science & Analytics',
  'Cybersecurity & Network Defense',
  'Full-Stack Software Engineering',
  'Fintech & Digital Banking',
  'Corporate Finance & Strategy',
  'Embedded Systems & IoT'
]

export function ProfileClient({
  user,
  counselorProfile,
  stats
}: ProfileClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form states
  const [fullName, setFullName] = useState(user.full_name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [title, setTitle] = useState(counselorProfile.title || 'Career & Faculty Mentor')
  const [employeeId, setEmployeeId] = useState(counselorProfile.employee_id || '')
  const [cabin, setCabin] = useState(counselorProfile.cabin || '')
  const [consultationHours, setConsultationHours] = useState(counselorProfile.consultation_hours || '')
  const [bio, setBio] = useState(counselorProfile.bio || '')
  const [expertise, setExpertise] = useState<string[]>(counselorProfile.expertise || [])
  const [newTagInput, setNewTagInput] = useState('')

  function handleAddTag(tagToAdd?: string) {
    const val = (tagToAdd || newTagInput).trim()
    if (!val) return
    if (!expertise.includes(val)) {
      setExpertise(prev => [...prev, val])
    }
    setNewTagInput('')
  }

  function handleRemoveTag(tagToRemove: string) {
    setExpertise(prev => prev.filter(t => t !== tagToRemove))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload: MentorProfileData = {
        full_name: fullName,
        phone: phone || undefined,
        title: title,
        employee_id: employeeId || undefined,
        cabin: cabin,
        expertise: expertise,
        consultation_hours: consultationHours,
        bio: bio
      }

      const res = await updateMentorProfile(payload)
      if (res.success) {
        toast.success('Faculty profile & advisory credentials updated successfully')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update profile')
      }
    })
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
          <User className="w-3.5 h-3.5 text-[#A36B40]" /> Faculty Identity & Credentials
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Faculty Mentor Profile & Expertise</h1>
        <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
          Configure your academic specializations, cabin office hours, and advisory bio for institutional visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Edit Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
            <div className="h-2 w-full bg-[#A36B40]" />
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-lg font-bold text-[#2C2621]">Edit Mentorship Credentials</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Information saved here directly updates student portal cards and institutional counseling records.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2C2621]">Faculty Full Name *</Label>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="border-[#DFD7CB] rounded-xl text-xs h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2C2621]">Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="border-[#DFD7CB] rounded-xl text-xs h-10"
                    />
                  </div>
                </div>

                {/* Email (Read-only) & Employee ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2C2621]">Institutional Email (Read Only)</Label>
                    <Input
                      value={user.email}
                      disabled
                      className="border-[#DFD7CB] rounded-xl text-xs h-10 bg-[#FAF6F0] text-[#7A7067] cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2C2621]">Faculty / Employee Code</Label>
                    <Input
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      placeholder="e.g. FAC-CSE-2024"
                      className="border-[#DFD7CB] rounded-xl text-xs h-10 font-mono"
                    />
                  </div>
                </div>

                {/* Designation / Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2C2621]">Designation & Academic Rank *</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Associate Professor & Career Mentor, Computer Engineering"
                    className="border-[#DFD7CB] rounded-xl text-xs h-10"
                    required
                  />
                </div>

                {/* Cabin Office & Consultation Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2C2621]">Cabin Office Location *</Label>
                    <Input
                      value={cabin}
                      onChange={e => setCabin(e.target.value)}
                      placeholder="e.g. Cabin 304, Academic Block 2, Sandip University"
                      className="border-[#DFD7CB] rounded-xl text-xs h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2C2621]">Student Advisory Hours *</Label>
                    <Input
                      value={consultationHours}
                      onChange={e => setConsultationHours(e.target.value)}
                      placeholder="e.g. Mon & Wed: 02:00 PM - 04:30 PM"
                      className="border-[#DFD7CB] rounded-xl text-xs h-10"
                      required
                    />
                  </div>
                </div>

                {/* Domain Specializations */}
                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-semibold text-[#2C2621]">Domain Expertise & Advisory Focus Areas</Label>
                  <p className="text-xs text-[#7A7067]">
                    Add industry domains and technical tracks you specialize in advising.
                  </p>

                  {/* Active tags */}
                  <div className="flex flex-wrap gap-2 p-3 bg-[#FAF6F0]/60 rounded-xl border border-[#DFD7CB]">
                    {expertise.length === 0 ? (
                      <span className="text-xs text-[#7A7067] italic">No specialization tags added yet.</span>
                    ) : (
                      expertise.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 bg-white text-[#2C2621] border border-[#DFD7CB] text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-[#7A7067] hover:text-red-600 focus:outline-hidden"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add tag input */}
                  <div className="flex gap-2">
                    <Input
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="Type custom specialization tag and press Add..."
                      className="border-[#DFD7CB] rounded-xl text-xs h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTag()}
                      className="border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] rounded-xl text-xs h-9 px-3"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="space-y-1 pt-1">
                    <p className="text-xs text-[#7A7067] font-semibold">Quick Suggestions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_DOMAINS.map(sug => {
                        const isAdded = expertise.includes(sug)
                        return (
                          <button
                            key={sug}
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddTag(sug)}
                            className={`text-xs px-2 py-0.5 rounded-md border text-left transition-colors ${
                              isAdded
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white hover:bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border-[#DFD7CB]'
                            }`}
                          >
                            + {sug}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-semibold text-[#2C2621]">Advisory Bio & Guidance Philosophy</Label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Brief introductory bio, research interests, and mentoring approach for students..."
                    rows={4}
                    className="border-[#DFD7CB] rounded-xl text-xs"
                  />
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-11 shadow-xs"
                  >
                    {isPending ? 'Saving Credentials...' : 'Save Faculty Profile Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Student Portal Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A7067] uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#A36B40]" /> Student Portal Card Preview
            </span>
            <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs rounded-full font-bold">
              Live Preview
            </Badge>
          </div>

          {/* Student Counselor Card Replica */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="h-3 w-full bg-[#A36B40]" />
            <CardContent className="p-6 md:p-7 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-xl border border-[#DFD7CB] shadow-xs shrink-0">
                  {fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'FA'}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-[#2C2621] truncate">{fullName || 'Faculty Mentor'}</h3>
                    <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs rounded-full px-2 py-0.5 font-bold">
                      Assigned Advisor
                    </Badge>
                  </div>
                  <p className="text-xs text-[#7A7067] font-medium leading-tight">
                    {title || 'Career & Faculty Mentor'}
                  </p>
                  {employeeId && (
                    <p className="text-xs text-[#7A7067] font-mono">
                      ID: {employeeId}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio quote */}
              {bio ? (
                <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] text-xs text-[#7A7067] italic leading-relaxed">
                  &quot;{bio}&quot;
                </div>
              ) : null}

              {/* Contact & Location Details */}
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 text-[#2C2621]">
                  <Mail className="w-4 h-4 text-[#A36B40] shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2 text-[#2C2621]">
                    <Phone className="w-4 h-4 text-[#A36B40] shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#2C2621]">
                  <MapPin className="w-4 h-4 text-[#77734B] shrink-0" />
                  <span className="truncate">{cabin || 'Location not configured'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#2C2621]">
                  <Clock className="w-4 h-4 text-[#77734B] shrink-0" />
                  <span className="truncate">{consultationHours || 'Advisory hours not configured'}</span>
                </div>
              </div>

              {/* Specialization Tags in Preview */}
              {expertise.length > 0 && (
                <div className="pt-2 border-t border-[#DFD7CB] space-y-2">
                  <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">
                    Advisory Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {expertise.map(tag => (
                      <Badge
                        key={tag}
                        className="bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] text-xs font-semibold rounded-md px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutional Mentorship Status Pill */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Active Faculty Mentor • Available for Advisee Scheduling</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-[#DFD7CB] bg-white rounded-2xl p-4 text-center">
              <p className="text-xs text-[#7A7067] uppercase font-bold tracking-wider">Assigned Advisees</p>
              <h4 className="text-2xl font-bold text-[#2C2621] mt-1">{stats.adviseeCount}</h4>
              <p className="text-xs text-[#77734B] mt-0.5">Active students</p>
            </Card>

            <Card className="border-[#DFD7CB] bg-white rounded-2xl p-4 text-center">
              <p className="text-xs text-[#7A7067] uppercase font-bold tracking-wider">Logged Sessions</p>
              <h4 className="text-2xl font-bold text-[#A36B40] mt-1">{stats.sessionCount}</h4>
              <p className="text-xs text-[#77734B] mt-0.5">Advisory meetings</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
