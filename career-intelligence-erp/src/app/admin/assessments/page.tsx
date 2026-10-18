'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, Plus, Layers, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Copy, Edit3, BarChart3, Eye, FileText,
  Building2, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface AssessmentItem {
  id: string
  name: string
  slug: string
  purpose: string
  targetGroup: string
  version: string
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  totalQuestions: number
  stages: string
  timeLimitMinutes: number | null
  attemptLimit: number
  totalResponses: number
  completionRate: number
  lastUpdated: string
}

const BASE_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'sun-career-2stage',
    name: 'SUN Two-Stage Career Exploration Assessment',
    slug: 'sun-career-2stage',
    purpose: 'Holistic 20-dimensional broad psychometric profiling followed by 20 personalized domain task evaluations.',
    targetGroup: 'UG Class 12 & PG Graduates',
    version: 'V1.0 (Audited)',
    status: 'PUBLISHED',
    totalQuestions: 50,
    stages: 'Stage 1 (30 cases) + Stage 2 (20 cases)',
    timeLimitMinutes: 45,
    attemptLimit: 1,
    totalResponses: 0,
    completionRate: 0,
    lastUpdated: 'Live Active'
  },
  {
    id: 'sun-engineering-readiness',
    name: 'Engineering & Technology Specialized Assessment',
    slug: 'sun-engineering-readiness',
    purpose: 'Deep evaluation of mathematical, algorithmic, systems thinking, and robotics competencies.',
    targetGroup: 'STEM Prospects',
    version: 'V1.2 Draft',
    status: 'DRAFT',
    totalQuestions: 30,
    stages: 'Single Stage Specialized',
    timeLimitMinutes: 30,
    attemptLimit: 2,
    totalResponses: 0,
    completionRate: 0,
    lastUpdated: 'In Draft'
  },
  {
    id: 'sun-mgmt-commerce',
    name: 'Management, Commerce & Entrepreneurship Discovery',
    slug: 'sun-mgmt-commerce',
    purpose: 'Evaluates commercial acumen, negotiation, organizational psychology, and financial orientation.',
    targetGroup: 'Commerce & BBA/MBA',
    version: 'V1.0 Draft',
    status: 'DRAFT',
    totalQuestions: 25,
    stages: 'Single Stage',
    timeLimitMinutes: 25,
    attemptLimit: 1,
    totalResponses: 0,
    completionRate: 0,
    lastUpdated: 'In Draft'
  }
]

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>(BASE_ASSESSMENTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLiveAttemptMetrics() {
      try {
        const supabase = createClient()
        const { data: attempts, error } = await supabase
          .from('assessment_attempts')
          .select('id, status, created_at')

        if (error) {
          console.error('Error fetching live assessment attempts:', error)
          setLoading(false)
          return
        }

        if (attempts) {
          const totalAttempts = attempts.length
          const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED').length
          const completionRate = totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0

          setAssessments((prev) =>
            prev.map((item) => {
              if (item.id === 'sun-career-2stage') {
                return {
                  ...item,
                  totalResponses: completedAttempts,
                  completionRate: completionRate,
                  lastUpdated: attempts.length > 0 ? 'Live Stream' : 'Live Active'
                }
              }
              return item
            })
          )
        }
      } catch (err) {
        console.error('Unexpected error loading assessment stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveAttemptMetrics()
  }, [])

  const handleDuplicate = (item: AssessmentItem) => {
    const copy: AssessmentItem = {
      ...item,
      id: `${item.id}-copy-${Date.now().toString().slice(-4)}`,
      name: `${item.name} (Copy)`,
      version: 'V1.0 Draft',
      status: 'DRAFT',
      totalResponses: 0,
      completionRate: 0,
      lastUpdated: 'Just now'
    }
    setAssessments([copy, ...assessments])
  }

  const publishedCount = assessments.filter((a) => a.status === 'PUBLISHED').length
  const totalCompletedResponses = assessments.reduce((acc, a) => acc + a.totalResponses, 0)
  const publishedAssessments = assessments.filter((a) => a.status === 'PUBLISHED')
  const avgCompletionRate = publishedAssessments.length > 0
    ? Math.round(publishedAssessments.reduce((acc, a) => acc + a.completionRate, 0) / publishedAssessments.length)
    : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] gap-1.5 font-bold text-xs px-3 py-1">
            <BookOpen className="w-3.5 h-3.5" /> Assessment Orchestrator
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Assessments & Diagnostic Tools
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Create, calibrate, and publish specialized assessments using our psychometric snapshot engine.
            Live response metrics reflect real-time database attempts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link href="/admin/questions">
            <Button variant="outline" className="h-11 px-4 rounded-2xl border-[#DFD7CB] text-xs font-bold text-[#2C2621] hover:bg-[#FAF6F0]">
              <Layers className="w-4 h-4 mr-1.5 text-[#A36B40]" /> Open Question Bank
            </Button>
          </Link>
          <Link href="/admin/assessments/sun-career-2stage/builder">
            <Button className="h-11 px-5 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer">
              <Edit3 className="w-4 h-4" /> Open Assessment Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Active Assessments</p>
          <p className="text-2xl font-black text-[#2C2621]">{publishedCount}</p>
          <p className="text-[11px] text-[#77734B]">Live in Student Portal</p>
        </Card>

        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Responses</p>
          <p className="text-2xl font-black text-[#A36B40]">{totalCompletedResponses}</p>
          <p className="text-[11px] text-[#7A7067]">Verified completed attempts</p>
        </Card>

        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Avg Completion Rate</p>
          <p className="text-2xl font-black text-[#77734B]">{avgCompletionRate}%</p>
          <p className="text-[11px] text-[#7A7067]">Live funnel conversion</p>
        </Card>

        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Scoring Architecture</p>
          <p className="text-2xl font-black text-[#2C2621]">20-D Vectors</p>
          <p className="text-[11px] text-[#7A7067]">Multi-Stage Snapshot Engine</p>
        </Card>
      </div>

      {/* Assessment Cards List */}
      <div className="space-y-4">
        {assessments.map((item) => (
          <Card key={item.id} className="p-6 sm:p-8 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#2C2621]">{item.name}</h3>
                  <Badge
                    className={`text-[10px] font-extrabold ${
                      item.status === 'PUBLISHED'
                        ? 'bg-[#F1F1EB] text-[#77734B] border-[#DFD7CB]'
                        : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB]'
                    }`}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-xs font-bold text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-2 py-0.5 rounded-full">
                    {item.version}
                  </span>
                </div>
                <p className="text-xs text-[#7A7067] max-w-2xl">{item.purpose}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-bold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                  onClick={() => handleDuplicate(item)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Duplicate
                </Button>

                <Link href={`/admin/assessments/${item.id}/builder`}>
                  <Button
                    size="sm"
                    className="h-10 text-xs font-bold rounded-xl bg-[#A36B40] hover:bg-[#8E5B33] text-white px-4"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit in Builder
                  </Button>
                </Link>
              </div>
            </div>

            {/* Assessment Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#DFD7CB]/70 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Structure</span>
                <p className="font-bold text-[#2C2621] mt-0.5">{item.stages}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Target Group</span>
                <p className="font-bold text-[#2C2621] mt-0.5">{item.targetGroup}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Time Limit</span>
                <p className="font-bold text-[#2C2621] mt-0.5">
                  {item.timeLimitMinutes ? `${item.timeLimitMinutes} minutes` : 'Untimed'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Total Responses</span>
                <p className="font-bold text-[#A36B40] mt-0.5">{item.totalResponses} submissions</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Completion Rate</span>
                <p className="font-bold text-[#77734B] mt-0.5">{item.completionRate}%</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
