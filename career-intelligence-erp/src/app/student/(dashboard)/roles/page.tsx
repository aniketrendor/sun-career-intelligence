import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, Target, ArrowRight, Search, Layers,
  ChevronRight, Sparkles, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function CareerRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all career domains
  const { data: domains } = await supabase
    .from('career_domains')
    .select('id, name, code')
    .order('name', { ascending: true })

  // Query career roles
  let query = supabase
    .from('career_roles')
    .select(`
      id,
      name,
      description,
      domain_id,
      domain:career_domains(id, name),
      role_skills(
        required_proficiency,
        importance,
        skill:skills(name, category)
      )
    `)
    .order('name', { ascending: true })

  if (params.domain) {
    query = query.eq('domain_id', params.domain)
  }

  const { data: roles } = await query

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <Briefcase className="w-3.5 h-3.5 text-[#A36B40]" /> Career Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Roles & Competencies</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Browse industry positions, essential skill requirements, and required proficiency benchmarks.
          </p>
        </div>

        <Link href="/student/career-profile">
          <Button size="sm" className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl h-10 px-5 shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold">
            <Target className="w-4 h-4" /> My Career Profile
          </Button>
        </Link>
      </div>

      {/* Filter by domain */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Link href="/student/roles">
          <Badge
            variant={!params.domain ? 'default' : 'outline'}
            className={`cursor-pointer px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all ${
              !params.domain
                ? 'bg-[#A36B40] text-white border-0 shadow-xs'
                : 'bg-white hover:bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB]'
            }`}
          >
            All Domains
          </Badge>
        </Link>
        {(domains || []).map((d: any) => (
          <Link key={d.id} href={`/student/roles?domain=${d.id}`}>
            <Badge
              variant={params.domain === d.id ? 'default' : 'outline'}
              className={`cursor-pointer px-3.5 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap transition-all ${
                params.domain === d.id
                  ? 'bg-[#A36B40] text-white border-0 shadow-xs'
                  : 'bg-white hover:bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB]'
              }`}
            >
              {d.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(roles || []).map((role: any) => {
          const topSkills = (role.role_skills || []).slice(0, 4)

          return (
            <Card key={role.id} className="border-[#DFD7CB] bg-white rounded-3xl hover:border-[#A36B40] hover:shadow-lg transition-all flex flex-col justify-between group shadow-xs">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-2.5 py-0.5 font-medium">
                      {(role.domain as any)?.name || 'Domain'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                    {role.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#7A7067] line-clamp-3 mt-1 leading-relaxed">
                    {role.description || 'Specialized role focused on business outcomes, execution, and team leadership.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div>
                    <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider block mb-2">
                      Required Core Skills ({role.role_skills?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topSkills.map((rs: any, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[11px] font-medium bg-[#FAF6F0] text-[#2C2621] border border-[#DFD7CB] rounded-xl px-2.5 py-0.5"
                        >
                          {rs.skill?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t border-[#DFD7CB] bg-[#FAF6F0]/50 rounded-b-3xl flex items-center justify-between">
                <Link
                  href={`/student/career-domains`}
                  className="text-xs font-bold text-[#A36B40] hover:text-[#8E5B34] flex items-center gap-1"
                >
                  Domain Info <ArrowRight className="w-3.5 h-3.5" />
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
