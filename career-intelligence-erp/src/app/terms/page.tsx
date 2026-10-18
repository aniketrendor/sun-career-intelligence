import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText, ArrowLeft, Scale, CheckCircle2, AlertTriangle,
  GraduationCap, Users, Shield, Mail, Phone, MapPin,
  ExternalLink, Ban, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms & Conditions | SUN Career Intelligence Platform – Sandip University',
  description: 'Detailed Terms and Conditions governing user access, psychometric assessments, mentor counseling sessions, and intellectual property on the Sandip University Career Intelligence Platform.',
}

export default function TermsAndConditionsPage() {
  const lastUpdated = 'October 18, 2026'
  const effectiveDate = 'November 1, 2026'

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C2621] font-sans flex flex-col selection:bg-[#A36B40]/20 selection:text-[#2C2621]">
      {/* ─── TOP INSTITUTIONAL BAR ────────────────────────────────────── */}
      <div className="bg-[#211D19] text-[#EFE2D0] py-2 px-4 border-b border-[#332D27] text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[11px] text-[#C6A18D]">
            <span>Sandip University · UGC Approved & NAAC 'A' Grade</span>
            <span className="hidden sm:inline text-[#554C42]">|</span>
            <span className="hidden sm:inline">Career Intelligence ERP v2.01</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#C6A18D]">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Home
            </Link>
            <span className="text-[#554C42]">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* ─── MAIN HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#DFD7CB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 shadow-xs ring-1 ring-[#DFD7CB] bg-white group-hover:scale-105 transition-transform">
                <Image
                  src="/sun-career-intelligence-logo.png"
                  alt="SUN Career Intelligence Logo"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-extrabold text-[#2C2621] tracking-tight leading-none">
                  SUN Career Intelligence
                </span>
                <span className="text-[10px] text-[#A36B40] font-semibold mt-0.5">
                  Sandip University
                </span>
              </div>
            </Link>

            <span className="text-xs text-[#DFD7CB] hidden sm:inline">|</span>

            <a
              href="https://sandipuniversity.edu.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center hover:opacity-90 transition-opacity shrink-0"
              title="Sandip University - NAAC Grade A"
            >
              <div className="relative h-8 w-32">
                <Image
                  src="/sandip-university-logo.png"
                  alt="Sandip University"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" className="bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-xl shadow-xs px-3.5 h-8.5">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO INTRO BANNER ────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#2C2621] to-[#211D19] text-white py-12 sm:py-16 px-4 border-b border-[#3D352E] relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#A36B40]/30 text-[#C6A18D] border border-[#A36B40]/40">
            <Scale className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic User Agreement & Governance Framework</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#FAF6F0] tracking-tight">
            Terms & Conditions
          </h1>

          <p className="text-xs sm:text-sm text-[#C6A18D] max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before utilizing our psychometric assessments, booking mentor consultations, or accessing university ERP services.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#A89D8F]">
            <span>Effective Date: <strong className="text-white">{effectiveDate}</strong></span>
            <span>•</span>
            <span>Last Updated: <strong className="text-white">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Version: <strong className="text-white">v2.01</strong></span>
          </div>
        </div>
      </section>

      {/* ─── MAIN TERMS CONTENT ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Binding Agreement Callout */}
        <div className="bg-[#FAF6F0] border border-[#DFD7CB] rounded-2xl p-5 sm:p-6 mb-10 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#A36B40]/10 flex items-center justify-center text-[#A36B40] shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-[#7A7067] leading-relaxed">
            <h3 className="text-sm font-bold text-[#2C2621]">Legally Binding Academic Agreement</h3>
            <p>
              By accessing, browsing, registering for, or completing any diagnostic assessment on the <strong>SUN Career Intelligence Platform</strong>, you affirm that you are at least 15 years old (or possess parental/guardian consent if a minor) and explicitly agree to be legally bound by these Terms and our companion Privacy Policy. If you do not accept these terms, you must refrain from using the platform.
            </p>
          </div>
        </div>

        <div className="space-y-12 text-[#2C2621]">

          {/* Section 1 */}
          <section id="institutional-scope" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 1</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Institutional Scope & Entities</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                The <strong>SUN Career Intelligence Platform</strong> is developed and operated by <strong>Sandip University</strong>, Mahiravani, Trimbak Road, Nashik, Maharashtra 422213, in technological collaboration with <strong>MindSaar</strong> (<a href="https://mindsaar.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-[#A36B40] font-semibold underline">mindsaar.onrender.com</a>).
              </p>
              <p>
                Throughout these terms, "University", "We", "Us", or "Our" refers to Sandip University and its technology partners. "Student", "User", "Candidate", or "You" refers to any individual accessing our diagnostic evaluations, portal dashboards, or advisory sessions.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="eligibility-accounts" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 2</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">User Eligibility & Account Security</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              Our platform serves distinct tiers of authenticated users with specific operational obligations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4 text-emerald-600" /> Prospective Candidates
                </div>
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  Students completing 10th, 12th, Polytechnic Diploma, or Bachelor's degrees seeking diagnostic career guidance. Candidates must provide accurate contact and academic details during assessment registration.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <Shield className="w-4 h-4 text-amber-600" /> Enrolled Students (PRN)
                </div>
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  Enrolled students must use their assigned University PRN credentials. You are responsible for preserving account secrecy and are strictly prohibited from sharing login keys with unauthorized third parties.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <Users className="w-4 h-4 text-sky-600" /> Faculty & Industry Mentors
                </div>
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  Subject matter experts and faculty advisory staff vetted by the University to conduct 1-on-1 counseling, configure availability slots, and submit academic feedback ratings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="assessment-nature" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 3</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Diagnostic Nature of Career Assessments</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                The 30-MCQ and calibrated 250-question psychometric tests are engineered as <strong>formative, diagnostic guidance tools</strong>.
              </p>
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#DFD7CB] space-y-1.5">
                <span className="font-bold text-xs text-[#2C2621] block">Important Advisory Disclaimer:</span>
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  Assessment results, archetype recommendations, domain match rankings, and predicted career roadmaps reflect statistical patterns in stated preferences and cognitive self-reporting. <strong>They do not constitute a formal guarantee of university admission, statutory eligibility, degree conferral, or future corporate job placement.</strong> Admissions decisions are subject to official university entrance exams, eligibility criteria, and regulatory mandates.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="mentor-code-of-conduct" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 4</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">1-on-1 Mentor Counseling & Code of Conduct</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              All 1-on-1 advisory sessions scheduled between students and university mentors are governed by strict institutional decorum:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-white border border-[#DFD7CB] rounded-xl space-y-1">
                <span className="font-bold text-xs text-[#2C2621] block">Punctuality & Slot Etiquette</span>
                <p className="text-xs text-[#7A7067] leading-relaxed">Both candidates and faculty mentors must join the scheduled Google Meet conference on time. If a candidate cannot attend, they must cancel or reschedule at least 4 hours in advance to release the blocked slot.</p>
              </div>
              <div className="p-4 bg-white border border-[#DFD7CB] rounded-xl space-y-1">
                <span className="font-bold text-xs text-[#2C2621] block">Zero-Tolerance Harassment Policy</span>
                <p className="text-xs text-[#7A7067] leading-relaxed">Verbal abuse, harassment, inappropriate language, or discriminatory behavior by any party will result in immediate session termination and permanent banning from the portal.</p>
              </div>
              <div className="p-4 bg-white border border-[#DFD7CB] rounded-xl space-y-1">
                <span className="font-bold text-xs text-[#2C2621] block">Recording Restrictions</span>
                <p className="text-xs text-[#7A7067] leading-relaxed">Recording or publishing video or audio from 1-on-1 mentor sessions without explicit mutual written consent is strictly prohibited under institutional privacy guidelines.</p>
              </div>
              <div className="p-4 bg-white border border-[#DFD7CB] rounded-xl space-y-1">
                <span className="font-bold text-xs text-[#2C2621] block">Advisory Scope</span>
                <p className="text-xs text-[#7A7067] leading-relaxed">Faculty mentors provide academic, domain, and syllabus insights in good faith. Ultimate curriculum decisions, entrance examination choices, and enrollment commitments rest solely with the candidate.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="intellectual-property" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 5</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Intellectual Property Rights</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                All proprietary algorithms, question taxonomies, psychometric scoring matrices, report visual design, logos (including the SUN Career Intelligence emblem, Sandip University trademarks, and MindSaar branding), software source code, and syllabus databases are the exclusive intellectual property of <strong>Sandip University</strong> and <strong>MindSaar</strong>.
              </p>
              <p>
                Users are granted a limited, personal, non-transferable, revocable license to access the portal and download their individual Career Diagnostic Reports for personal academic use. You may not reproduce, redistribute, republish, or commercialize any test questions, scoring matrices, or platform content.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="prohibited-conduct" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 6</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Prohibited Platform Activities</h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>Users must refrain from any of the following unauthorized actions:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Deploying web scrapers, bots, automated scripts, or crawler tools to harvest test questions or user records.</li>
                <li>Attempting to bypass authentication firewalls, probe security vulnerabilities, or inject malicious payloads.</li>
                <li>Submitting fraudulent test responses, engaging in proxy assessment completions, or tampering with PRN credentials.</li>
                <li>Overloading, flooding, or performing Denial of Service (DoS) attacks against our ERP infrastructure.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="limitation-liability" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 7</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Warranty Disclaimers & Limitation of Liability</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                The platform and all diagnostic materials are provided on an <strong>"AS-IS" and "AS-AVAILABLE"</strong> basis without warranties of any kind, whether express or implied.
              </p>
              <p>
                To the fullest extent permissible by applicable law, Sandip University and MindSaar shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from platform downtime, assessment diagnostic interpretations, scheduled mentor session rescheduling, or third-party video conferencing failures.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="governing-law" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 8</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Governing Law & Jurisdiction</h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, arbitration, or statutory claim arising under these terms shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Nashik, Maharashtra, India</strong>.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="contact-info" className="space-y-4 scroll-mt-20 pt-4 border-t border-[#DFD7CB]">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 9</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Institutional Contact & Legal Inquiries</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              If you have any questions or require clarification regarding these Terms and Conditions, please contact our Institutional Legal & Admissions Cell:
            </p>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DFD7CB] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#A89D8F] uppercase tracking-wider block">Office of the Registrar</span>
                <p className="text-xs text-[#2C2621] font-semibold flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#A36B40] shrink-0 mt-0.5" />
                  <span>Sandip University, Mahiravani, Trimbak Road, Nashik, Maharashtra 422213, India</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#A89D8F] uppercase tracking-wider block">Official Inquiries</span>
                <p className="text-xs text-[#2C2621] font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#A36B40] shrink-0" />
                  <a href="mailto:admissions@sandipuniversity.edu.in" className="hover:underline text-[#A36B40]">
                    admissions@sandipuniversity.edu.in
                  </a>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#A89D8F] uppercase tracking-wider block">Admissions Helpline</span>
                <p className="text-xs text-[#2C2621] font-semibold flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#A36B40] shrink-0" />
                  <a href="tel:18002122714" className="hover:underline">
                    1800-212-2714 (Toll-Free)
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-[#211D19] text-[#EFE2D0] py-8 sm:py-10 border-t border-[#332D27] text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-white text-xs">Sandip University Career Intelligence Platform</p>
            <p className="text-[11px] text-[#A89D8F]">© {new Date().getFullYear()} Sandip University. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#C6A18D]">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <a
                href="https://mindsaar.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-[#A36B40] underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                MindSaar <ExternalLink className="w-2.5 h-2.5 text-[#C6A18D]" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
