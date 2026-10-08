import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Compass, BarChart2, BookOpen, ArrowRight, CheckCircle2,
  TrendingUp, Sparkles, Layers, Briefcase, ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export default async function CareerDomainsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch all domains with their role counts and trait weights
  const { data: domains } = await supabase
    .from('career_domains')
    .select(`
      *,
      roles:career_roles(id, name),
      domain_traits:domain_trait_weights(
        weight,
        trait:traits(id, name, category)
      )
    `)
    .order('name', { ascending: true })

  // Fetch student domain scores if assessment completed
  const { data: latestAttempt } = await supabase
    .from('assessment_attempts')
    .select('id')
    .eq('student_id', profile.id)
    .eq('status', 'COMPLETED')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  const studentScoresMap: Record<string, { score: number; rank: number }> = {}
  if (latestAttempt) {
    const { data: dScores } = await supabase
      .from('domain_scores')
      .select('domain_id, score, rank')
      .eq('attempt_id', latestAttempt.id)

    dScores?.forEach((s) => {
      studentScoresMap[s.domain_id] = { score: Math.round(s.score), rank: s.rank }
    })
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[#A36B40] bg-[#FAF6F0] border-[#DFD7CB] rounded-full text-xs font-semibold px-3 py-0.5">
              Institutional Taxonomy
            </Badge>
            {latestAttempt && (
              <Badge variant="outline" className="text-[#77734B] bg-[#77734B]/10 border-[#77734B]/30 rounded-full text-xs font-semibold px-3 py-0.5">
                Personalized Scores Active
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Domains Library</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Explore major industry career tracks, psychometric trait weightings, and associated career roles.
          </p>
        </div>

        {!latestAttempt && (
          <Link href="/student/assessment">
            <Button size="sm" className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl h-10 px-5 shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold">
              <Sparkles className="w-4 h-4" /> Calculate My Alignment
            </Button>
          </Link>
        )}
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(domains || []).map((domain: any) => {
          const studentScore = studentScoresMap[domain.id]
          const topTraits = (domain.domain_traits || [])
            .sort((a: any, b: any) => b.weight - a.weight)
            .slice(0, 4)

          return (
            <Card key={domain.id} className="border-[#DFD7CB] bg-white rounded-3xl hover:border-[#A36B40] hover:shadow-lg transition-all flex flex-col justify-between group shadow-xs">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-sm border border-[#DFD7CB] group-hover:bg-[#A36B40] group-hover:text-white transition-colors">
                      <Compass className="w-5 h-5" />
                    </div>
                    {studentScore ? (
                      <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 rounded-full text-xs font-bold px-2.5 py-0.5">
                        #{studentScore.rank} Match ({studentScore.score}%)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-[#7A7067] bg-[#FAF6F0] border-[#DFD7CB] rounded-full px-2.5 py-0.5">
                        {domain.roles?.length || 0} Roles
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                    {domain.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#7A7067] line-clamp-3 mt-1 leading-relaxed">
                    {domain.description || 'Specialized career track with structured growth paths across global industries.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {studentScore && (
                    <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#DFD7CB]">
                      <div className="flex justify-between text-xs font-medium text-[#7A7067] mb-1">
                        <span>Your Alignment Score</span>
                        <span className="font-bold text-[#A36B40]">{studentScore.score}/100</span>
                      </div>
                      <Progress value={studentScore.score} className="h-1.5 bg-[#DFD7CB]" />
                    </div>
                  )}

                  {/* Key Trait Competencies */}
                  <div>
                    <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider block mb-2">
                      Key Trait Weightings
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topTraits.map((dt: any, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-1 rounded-xl bg-[#FAF6F0] text-[#2C2621] border border-[#DFD7CB] font-medium"
                        >
                          {dt.trait?.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Career Roles in this Domain */}
                  {domain.roles && domain.roles.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1.5">
                        Sample Roles ({domain.roles.length})
                      </span>
                      <ul className="text-xs text-[#7A7067] space-y-1">
                        {domain.roles.slice(0, 3).map((r: any) => (
                          <li key={r.id} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A36B40]" />
                            <span className="truncate text-[#2C2621] font-medium">{r.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 border-t border-[#DFD7CB] bg-[#FAF6F0]/50 rounded-b-3xl flex items-center justify-between">
                <Link
                  href={`/student/roles?domain=${domain.id}`}
                  className="text-xs font-bold text-[#A36B40] hover:text-[#8E5B34] flex items-center gap-1"
                >
                  Explore Roles <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/student/counselor"
                  className="text-xs text-[#7A7067] hover:text-[#2C2621] font-semibold"
                >
                  Counselor
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
