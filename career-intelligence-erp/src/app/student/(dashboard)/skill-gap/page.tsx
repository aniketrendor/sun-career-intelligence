import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart2, Target, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, Layers, BookOpen, ChevronRight, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export default async function SkillGapPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; domain?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch student's completed assessment attempt
  const { data: latestAttempt } = await supabase
    .from('assessment_attempts')
    .select('id, completed_at')
    .eq('student_id', profile.id)
    .eq('status', 'COMPLETED')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch all career roles for selection
  const { data: allRoles } = await supabase
    .from('career_roles')
    .select(`id, name, description, domain:career_domains(id, name)`)
    .order('name', { ascending: true })

  // Determine active target role
  const selectedRoleId = params.role || allRoles?.[0]?.id
  const activeRole = allRoles?.find(r => r.id === selectedRoleId) || allRoles?.[0]

  // Fetch role skills for active role
  const { data: roleSkills } = await supabase
    .from('role_skills')
    .select(`
      required_proficiency,
      importance,
      skill:skills(id, name, category, description)
    `)
    .eq('role_id', activeRole?.id || '')
    .order('importance', { ascending: false })

  // Fetch student's documented skills
  const { data: studentSkills } = await supabase
    .from('student_skills')
    .select('skill_id, proficiency_level, verified')
    .eq('student_id', profile.id)

  const studentSkillMap = new Map<string, number>()
  studentSkills?.forEach(s => {
    studentSkillMap.set(s.skill_id, s.proficiency_level)
  })

  // Calculate gaps
  const skillAnalysis = (roleSkills || []).map((rs: any) => {
    const current = studentSkillMap.get(rs.skill?.id) || 1 // default baseline 1
    const required = rs.required_proficiency || 3
    const gap = Math.max(0, required - current)
    const matchPercentage = Math.min(100, Math.round((current / required) * 100))

    return {
      skill: rs.skill,
      importance: rs.importance || 'MEDIUM',
      required,
      current,
      gap,
      matchPercentage,
    }
  })

  const totalRequiredSkills = skillAnalysis.length
  const masteredSkills = skillAnalysis.filter(s => s.gap === 0).length
  const overallReadiness = totalRequiredSkills > 0
    ? Math.round((skillAnalysis.reduce((acc, s) => acc + s.matchPercentage, 0) / (totalRequiredSkills * 100)) * 100)
    : 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 mb-2 gap-1">
            <Target className="w-3.5 h-3.5" /> Skill Gap Matrix
          </Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Competency & Skill Gap Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare your current skill competencies against target industry roles and pinpoint development priorities.
          </p>
        </div>

        <Link href="/student/roadmap">
          <Button size="sm" className="h-9 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 transition-all flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4" /> Generate Learning Roadmap
          </Button>
        </Link>
      </div>

      {/* Target Role Selector Bar */}
      <Card className="border-[#DFD7CB] shadow-xs bg-white rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">Select Target Role:</span>
            <div className="flex flex-wrap gap-2">
              {(allRoles || []).slice(0, 5).map((r: any) => (
                <Link key={r.id} href={`/student/skill-gap?role=${r.id}`}>
                  <Badge
                    variant={r.id === activeRole?.id ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1 text-xs transition-all ${
                      r.id === activeRole?.id
                        ? 'bg-[#A36B40] hover:bg-[#8E5B33] text-white border-transparent'
                        : 'bg-[#FAF6F0] hover:bg-[#F1E8DC] text-[#2C2621] border-[#DFD7CB]'
                    }`}
                  >
                    {r.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Overall Role Readiness</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-700">{overallReadiness}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallReadiness} className="h-2 mb-2" />
            <p className="text-xs text-slate-500">
              Target: <span className="font-semibold text-slate-800">{activeRole?.name}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Competency Coverage</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {masteredSkills} / {totalRequiredSkills}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Skills met at or above required proficiency level
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Development Gaps</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">
              {totalRequiredSkills - masteredSkills}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Identified competencies requiring training or coursework
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Breakdown Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Required Competencies for {activeRole?.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Detailed evaluation of technical, analytical, and domain skills
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {(activeRole as any)?.domain?.name || 'General Domain'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {skillAnalysis.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No specific skill mappings defined for this role yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {skillAnalysis.map((item, index) => {
                const importanceBadge = {
                  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
                  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
                  LOW: 'bg-slate-50 text-slate-700 border-slate-200',
                }[item.importance as string] || 'bg-slate-50 text-slate-700'

                return (
                  <div key={item.skill?.id || index} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 md:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{item.skill?.name}</span>
                        <Badge variant="outline" className={`text-[10px] uppercase ${importanceBadge}`}>
                          {item.importance} Importance
                        </Badge>
                        <span className="text-xs text-slate-400">({item.skill?.category || 'Technical'})</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.skill?.description || 'Core technical qualification for career progression.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Required vs Current</span>
                        <span className="text-xs font-bold text-slate-700">
                          Lvl {item.current} / Lvl {item.required}
                        </span>
                      </div>

                      <div className="w-32">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>Match</span>
                          <span className="font-bold">{item.matchPercentage}%</span>
                        </div>
                        <Progress value={item.matchPercentage} className="h-2" />
                      </div>

                      <div className="w-24 text-right">
                        {item.gap === 0 ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1">
                            <AlertTriangle className="w-3 h-3" /> -{item.gap} Lvl Gap
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
