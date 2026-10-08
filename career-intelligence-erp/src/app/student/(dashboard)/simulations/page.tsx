import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles, Play, CheckCircle2, Clock, Award,
  ArrowRight, Compass, Target, HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function CareerSimulationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch career simulations
  const { data: simulations } = await supabase
    .from('career_simulations')
    .select(`
      id,
      title,
      description,
      scenario_text,
      estimated_minutes,
      domain:career_domains(name),
      role:career_roles(name)
    `)
    .limit(10)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 mb-2 gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Situational Judgment
        </Badge>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Career Simulations & Scenarios</h1>
        <p className="text-sm text-slate-500 mt-1">
          Experience real-world workplace dilemmas and test your problem-solving, stakeholder communication, and decision-making skills.
        </p>
      </div>

      {/* Simulation Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(simulations && simulations.length > 0 ? simulations : [
          {
            id: '1',
            title: 'Q3 Enterprise BI Metric Discrepancy',
            domain: { name: 'Data Analytics' },
            role: { name: 'Senior Data Analyst' },
            description: 'The VP of Marketing identifies a 12% revenue reporting discrepancy between Salesforce and Snowflake prior to the board meeting.',
            estimated_minutes: 15,
          },
          {
            id: '2',
            title: 'Critical Product Feature Scope Negotiation',
            domain: { name: 'Product Management' },
            role: { name: 'Associate Product Manager' },
            description: 'Engineering estimates a 4-week sprint delay on the flagship mobile release unless two tier-1 features are cut or deferred.',
            estimated_minutes: 20,
          },
          {
            id: '3',
            title: 'Strategic Portfolio Capital Allocation',
            domain: { name: 'Financial Analysis' },
            role: { name: 'Financial Analyst' },
            description: 'Evaluate three competing capital expenditure proposals under macroeconomic interest rate fluctuations and scenario stress-testing.',
            estimated_minutes: 25,
          }
        ]).map((sim: any) => (
          <Card key={sim.id} className="border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between group">
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                    {sim.domain?.name || 'Business Domain'}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{sim.estimated_minutes || 15} min
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {sim.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 line-clamp-3 mt-1 leading-relaxed">
                  {sim.description}
                </CardDescription>
              </CardHeader>
            </div>

            <div className="p-4 border-t border-[#DFD7CB] bg-[#FAF6F0]/50 rounded-b-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A7067]">
                {sim.role?.name || 'Target Role'}
              </span>
              <Button size="sm" className="h-8 px-3 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-xs shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer">
                <Play className="w-3.5 h-3.5" /> Start Simulation
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
