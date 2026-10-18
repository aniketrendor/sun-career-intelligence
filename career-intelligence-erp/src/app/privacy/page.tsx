import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield, ArrowLeft, Lock, FileText, CheckCircle2,
  Users, Server, AlertCircle, Mail, Phone, MapPin,
  ExternalLink, ChevronRight, Eye, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Privacy Policy | SUN Career Intelligence Platform – Sandip University',
  description: 'Detailed Privacy Policy outlining the collection, psychometric analysis, security, and governance of student data on the Sandip University Career Intelligence Platform.',
}

export default function PrivacyPolicyPage() {
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
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
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
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Data Governance & DPDP Act 2023 Compliance</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#FAF6F0] tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-[#C6A18D] max-w-2xl mx-auto leading-relaxed">
            How Sandip University and MindSaar collect, process, safeguard, and respect your diagnostic evaluations, academic history, and consultation data.
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

      {/* ─── POLICY BODY CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Important Notice Box */}
        <div className="bg-[#FAF6F0] border border-[#DFD7CB] rounded-2xl p-5 sm:p-6 mb-10 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#A36B40]/10 flex items-center justify-center text-[#A36B40] shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-[#7A7067] leading-relaxed">
            <h3 className="text-sm font-bold text-[#2C2621]">Our Core Privacy Pledge to Students</h3>
            <p>
              The Sandip University Career Intelligence Platform is engineered exclusively to help students discover their optimal academic disciplines, cognitive archetypes, and professional career paths. <strong>We do not sell, rent, monetize, or trade your personal or psychometric assessment records to external commercial advertisers or third-party marketers.</strong>
            </p>
          </div>
        </div>

        <div className="space-y-12 text-[#2C2621]">

          {/* Section 1 */}
          <section id="introduction" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 1</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Introduction & Institutional Scope</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                This Privacy Policy governs the collection, use, retention, disclosure, and protection of information obtained through the <strong>SUN Career Intelligence Platform</strong> (available via web, mobile viewports, and ERP subdomains), operated by <strong>Sandip University</strong> (a private university established under the Maharashtra Act No. XXXVIII of 2015, recognized by UGC and accredited with NAAC Grade ‘A’), in technological partnership with <strong>MindSaar</strong> (<a href="https://mindsaar.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-[#A36B40] font-semibold underline">mindsaar.onrender.com</a>).
              </p>
              <p>
                This policy applies to all candidates, prospective admissions applicants (10th, 12th, Diploma, and Undergraduate streams), currently enrolled students using Permanent Registration Numbers (PRN), faculty mentors, academic counselors, and administrative reviewers.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="information-collected" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 2</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Categories of Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              Depending on whether you access the free diagnostic assessment or sign into an authorized student/mentor portal, we collect the following categories of data:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Personal Identifiers
                </div>
                <ul className="text-xs text-[#7A7067] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Full legal name, email address, mobile number, and parental contact (optional).</li>
                  <li>Academic PRN (Permanent Registration Number) for enrolled students.</li>
                  <li>Educational institution, current grade/degree, graduation year, and academic stream (Science, Commerce, Arts, Diploma, Engineering, etc.).</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Psychometric & Test Data
                </div>
                <ul className="text-xs text-[#7A7067] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Individual responses to the 30-item or 250-item calibrated diagnostic questions.</li>
                  <li>Time taken per question item, completion timestamps, and response consistency indicators.</li>
                  <li>Computed scores across 10 psychometric dimensions (e.g., Analytical, Creative, Spatial, Social, Technical).</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mentor & Session Records
                </div>
                <ul className="text-xs text-[#7A7067] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>1-on-1 mentor booking appointments, scheduled timeslots, and selected topic preferences.</li>
                  <li>Google Meet conference links, meeting timestamps, and attendance statuses.</li>
                  <li>Mentor evaluation notes, academic recommendations, suggested career roadmaps, and scholarship ratings.</li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#A36B40] font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Device & Technical Telemetry
                </div>
                <ul className="text-xs text-[#7A7067] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>IP address, browser type and version, operating system, and viewport resolution.</li>
                  <li>Session authentication tokens, sign-in timestamps, and security audit logs.</li>
                  <li>Functional cookies required to maintain authenticated portal sessions.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="processing-purposes" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 3</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Purposes of Data Processing</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>We process your data strictly under valid lawful bases, including student consent and legitimate institutional interests, to provide the following academic services:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-white border border-[#DFD7CB] rounded-xl">
                  <span className="font-bold text-[#2C2621] block mb-1">1. Diagnostic Report Generation</span>
                  <span>Generating your individualized Career Archetype, compatibility ratings for Sandip University academic schools, and tailored course suggestions.</span>
                </div>
                <div className="p-3.5 bg-white border border-[#DFD7CB] rounded-xl">
                  <span className="font-bold text-[#2C2621] block mb-1">2. Faculty & Mentor Matching</span>
                  <span>Pairing students with specialized subject faculty for tailored 1-on-1 counseling, syllabus walkthroughs, and career guidance.</span>
                </div>
                <div className="p-3.5 bg-white border border-[#DFD7CB] rounded-xl">
                  <span className="font-bold text-[#2C2621] block mb-1">3. Direct Admissions Counseling</span>
                  <span>Assisting eligible candidates with university program prerequisites, entrance test exemptions, and merit-based scholarship eligibility.</span>
                </div>
                <div className="p-3.5 bg-white border border-[#DFD7CB] rounded-xl">
                  <span className="font-bold text-[#2C2621] block mb-1">4. Academic Integrity & Platform Security</span>
                  <span>Preventing duplicate test fraud, authenticating PRN credentials, monitoring platform uptime, and complying with statutory accreditation audits.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="ai-algorithms" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 4</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Psychometric AI Processing & MindSaar Integration</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>
                Our diagnostic engine utilizes psychological scoring models and algorithmic calibration hosted in coordination with <strong>MindSaar</strong>.
              </p>
              <p>
                Assessment algorithms are purely diagnostic and advisory. They evaluate patterns in your stated aptitudes and interests to recommend suitable academic disciplines. <strong>No fully automated exclusion or adverse admission decisions are made based solely on automated assessment scoring.</strong> Every applicant retains the freedom to apply for any academic program of their choice, subject to university statutory eligibility standards.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="disclosure" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 5</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Data Sharing & Third-Party Disclosure</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>We do not share your personal data with third parties except under the following strictly defined conditions:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Sandip University Academic Departments:</strong> Admissions counselors, school deans, and designated faculty mentors assigned to your consultation.</li>
                <li><strong>MindSaar Technology Infrastructure:</strong> Secured cloud infrastructure providers and database hosting services operating under strict non-disclosure and processing agreements.</li>
                <li><strong>Video Conferencing Services (Google Meet):</strong> For facilitating online mentor consultation sessions requested by the student.</li>
                <li><strong>Statutory & Regulatory Authorities:</strong> When required by Indian law, court subpoenas, or UGC/NAAC statutory compliance mandates.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="security" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 6</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Data Security & Encryption Safeguards</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>We implement enterprise-grade technical and organizational security measures to protect student records:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-4 rounded-xl border border-[#DFD7CB]">
                  <Server className="w-5 h-5 text-[#A36B40] mb-2" />
                  <h4 className="font-bold text-xs text-[#2C2621]">Data Encryption</h4>
                  <p className="text-[11px] text-[#7A7067] mt-1">All communications are encrypted in transit via TLS 1.3/HTTPS, and sensitive assessment responses are encrypted at rest with AES-256.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#DFD7CB]">
                  <Lock className="w-5 h-5 text-[#A36B40] mb-2" />
                  <h4 className="font-bold text-xs text-[#2C2621]">Role-Based Access (RBAC)</h4>
                  <p className="text-[11px] text-[#7A7067] mt-1">Granular access controls enforce strict barriers between student portfolios, mentor review consoles, and university admin dashboards.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#DFD7CB]">
                  <Shield className="w-5 h-5 text-[#A36B40] mb-2" />
                  <h4 className="font-bold text-xs text-[#2C2621]">Continuous Audits</h4>
                  <p className="text-[11px] text-[#7A7067] mt-1">Automated rate-limiting, anomaly detection, and session timeouts protect accounts against credential abuse and scraping.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="retention" className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 7</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Data Retention & Student Rights</h2>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              <p>Under India's Digital Personal Data Protection Act (DPDP Act, 2023) and IT Act 2000, students and registered users possess explicit statutory rights:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Right to Access:</strong> You may view and download your full diagnostic report and test history from your student dashboard at any time.</li>
                <li><strong>Right to Rectification:</strong> You may request correction of inaccurate personal demographic or academic information.</li>
                <li><strong>Right to Erasure:</strong> Prospective candidates who do not proceed to enrollment may submit a data deletion request by contacting our Grievance Officer. Enrolled student academic records must be retained in accordance with university accreditation regulations.</li>
                <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for prospective admissions outreach at any time.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="contact-grievance" className="space-y-4 scroll-mt-20 pt-4 border-t border-[#DFD7CB]">
            <div className="flex items-center gap-2.5 text-[#A36B40]">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">Section 8</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621]">Grievance Officer & Institutional Contact</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed pl-1">
              For any privacy concerns, data inquiries, or statutory requests under Indian data protection laws, please reach out directly to the designated Institutional Grievance Officer:
            </p>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DFD7CB] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#A89D8F] uppercase tracking-wider block">Campus Address</span>
                <p className="text-xs text-[#2C2621] font-semibold flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#A36B40] shrink-0 mt-0.5" />
                  <span>Sandip University, Mahiravani, Trimbak Road, Nashik, Maharashtra 422213, India</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#A89D8F] uppercase tracking-wider block">Email Inquiries</span>
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
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
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
