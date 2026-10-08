import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Map, CheckCircle2, Circle, Clock, Award, BookOpen,
  ArrowRight, Sparkles, Target, Layers, ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export default async function StudentRoadmapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch active learning roadmap with items
  const { data: roadmap } = await supabase
    .from('learning_roadmaps')
    .select(`
      *,
      role:career_roles(id, name, description, domain:career_domains(name)),
      items:roadmap_items(
        id,
        title,
        description,
        item_type,
        resource_url,
        estimated_hours,
        order_index,
        is_completed,
        completed_at,
        phase,
        skill:skills(name)
      )
    `)
    .eq('student_id', profile.id)
    .eq('is_active', true)
    .single()

  // Default sample roadmap items if database generated roadmap items are empty
  const rawItems = roadmap?.items || []
  const sortedItems = [...rawItems].sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))

  const phases = ['FOUNDATION', 'INTERMEDIATE', 'ADVANCED', 'CAPSTONE']
  const itemsByPhase = phases.map(phase => ({
    phase,
    items: sortedItems.filter(i => (i.phase || 'FOUNDATION') === phase),
  })).filter(p => p.items.length > 0)

  const totalItems = sortedItems.length
  const completedCount = sortedItems.filter(i => i.is_completed).length
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-2 gap-1">
            <Map className="w-3.5 h-3.5" /> Career Trajectory
          </Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personalized Learning Roadmap</h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured competency milestones, projects, and certifications tailored to your target career role.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student/skill-gap">
            <Button variant="outline" size="sm" className="gap-2">
              <Target className="w-4 h-4" /> Skill Gap Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress & Target Role Card */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Target Role Pathway
              </span>
              <h2 className="text-2xl font-bold text-white">
                {(roadmap as any)?.role?.name || 'Data Analytics & Business Intelligence Specialist'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {(roadmap as any)?.role?.description || 'Curated roadmap addressing critical skill gaps and practical project portfolio deliverables.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 shrink-0 min-w-[240px]">
              <div className="flex justify-between text-xs font-medium text-slate-200 mb-2">
                <span>Overall Completion</span>
                <span className="font-bold text-white">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5 bg-white/20" />
              <p className="text-[11px] text-slate-300 mt-2 text-right">
                {completedCount} of {totalItems || 8} Milestones Completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Timeline */}
      <div className="space-y-6">
        {(itemsByPhase.length > 0 ? itemsByPhase : [
          {
            phase: 'FOUNDATION',
            items: [
              { id: '1', title: 'SQL & Relational Database Mastery', description: 'Complete advanced query exercises, joins, CTEs and indexing.', item_type: 'COURSE', estimated_hours: 20, is_completed: true, skill: { name: 'SQL' } },
              { id: '2', title: 'Data Cleaning & Wrangling in Python / Excel', description: 'Practical exercises dealing with missing values, normalization, and outliers.', item_type: 'PRACTICE', estimated_hours: 15, is_completed: true, skill: { name: 'Data Wrangling' } },
            ]
          },
          {
            phase: 'INTERMEDIATE',
            items: [
              { id: '3', title: 'Interactive Dashboard Design (Tableau / PowerBI)', description: 'Build enterprise BI dashboards with executive KPI tracking.', item_type: 'PROJECT', estimated_hours: 25, is_completed: false, skill: { name: 'PowerBI' } },
              { id: '4', title: 'Business Problem Framing & Statistical Thinking', description: 'Analyze business case studies and translate hypotheses into analytical models.', item_type: 'READING', estimated_hours: 12, is_completed: false, skill: { name: 'Statistical Thinking' } },
            ]
          },
          {
            phase: 'ADVANCED',
            items: [
              { id: '5', title: 'End-to-End Business Intelligence Portfolio Project', description: 'Full pipeline from raw operational DB to automated reporting and stakeholder presentation deck.', item_type: 'PROJECT', estimated_hours: 35, is_completed: false, skill: { name: 'Portfolio Development' } },
              { id: '6', title: 'Mock Technical Interview & Case Presentation', description: 'Schedule simulation session with assigned institutional counselor.', item_type: 'ASSESSMENT', estimated_hours: 4, is_completed: false, skill: { name: 'Communication' } },
            ]
          }
        ]).map((phaseGroup, pIdx) => (
          <div key={pIdx} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-slate-900 text-white text-xs px-3 py-1 font-semibold uppercase tracking-wider">
                Phase {pIdx + 1}: {phaseGroup.phase}
              </Badge>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phaseGroup.items.map((item: any) => {
                const typeColor = {
                  COURSE: 'bg-blue-50 text-blue-700 border-blue-200',
                  PROJECT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  PRACTICE: 'bg-purple-50 text-purple-700 border-purple-200',
                  READING: 'bg-amber-50 text-amber-700 border-amber-200',
                  ASSESSMENT: 'bg-rose-50 text-rose-700 border-rose-200',
                }[item.item_type as string] || 'bg-slate-50 text-slate-700 border-slate-200'

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all ${
                      item.is_completed
                        ? 'border-emerald-200 bg-emerald-50/20 shadow-none'
                        : 'border-slate-200 hover:shadow-md bg-white'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] font-semibold uppercase ${typeColor}`}>
                            {item.item_type}
                          </Badge>
                          {item.skill?.name && (
                            <span className="text-xs text-slate-500 font-medium">
                              Skill: {item.skill.name}
                            </span>
                          )}
                        </div>
                        {item.is_completed ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-slate-400 gap-1">
                            <Circle className="w-3.5 h-3.5" /> In Progress
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 mt-2">
                        {item.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{item.estimated_hours || 10} hours
                        </span>
                        {item.resource_url && (
                          <a
                            href={item.resource_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            Resource <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
