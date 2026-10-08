'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, BarChart2, Target, Map,
  MessageSquare, User, Users, ClipboardList, Building2,
  QrCode, GraduationCap, X, Sparkles, ShieldCheck,
  ChevronRight, Compass, UserCheck, KeyRound, Award
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: string | number
}

interface SidebarProps {
  navItems: NavItem[]
  userRole: string
  userName: string
  userEmail: string
  isOpen: boolean
  onClose: () => void
}

const iconMap: Record<string, any> = {
  // Student
  '/student/dashboard': LayoutDashboard,
  '/student/assessment': BookOpen,
  '/student/career-profile': Target,
  '/student/test-history': ClipboardList,
  '/student/skill-gap': BarChart2,
  '/student/roadmap': Map,
  '/student/counselor': MessageSquare,
  '/student/profile': User,

  // Mentor
  '/mentor/dashboard': LayoutDashboard,
  '/mentor/students': Users,
  '/mentor/assessments': BookOpen,
  '/mentor/programs': Building2,
  '/mentor/referral-codes': KeyRound,
  '/mentor/analytics': BarChart2,
  '/mentor/approvals': ClipboardList,

  // Admin
  '/admin/dashboard': LayoutDashboard,
  '/admin/users': Users,
  '/admin/mentors': Award,
  '/admin/assignments': UserCheck,
  '/admin/programs': Building2,
  '/admin/classes': ClipboardList,
  '/admin/referral-codes': KeyRound,
  '/admin/students': GraduationCap,
  '/admin/analytics': BarChart2,

  // Legacy fallback mapping
  '/counselor/dashboard': LayoutDashboard,
  '/counselor/referral-codes': KeyRound,
  '/counselor/students': Users,
  '/counselor/approvals': ClipboardList,
  '/counselor/assessments': BookOpen,
  '/counselor/programs': Building2,
  '/counselor/analytics': BarChart2,

  '/dean/dashboard': LayoutDashboard,
  '/dean/users': Users,
  '/dean/assignments': UserCheck,
  '/dean/students': GraduationCap,
  '/dean/analytics': BarChart2,
  '/dean/programs': Building2,
  '/dean/classes': ClipboardList,
  '/dean/referral-codes': KeyRound,
  '/dean/counselors': Award,
}

export function Sidebar({ navItems, userRole, userName, userEmail, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const roleStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    STUDENT: {
      bg: 'bg-[#FF6B3D]/15',
      text: 'text-[#FF6B3D]',
      border: 'border-[#FF6B3D]/30',
      label: 'Student',
    },
    MENTOR: {
      bg: 'bg-[#2ECC71]/15',
      text: 'text-[#2ECC71]',
      border: 'border-[#2ECC71]/30',
      label: 'Mentor',
    },
    COUNSELOR: {
      bg: 'bg-[#2ECC71]/15',
      text: 'text-[#2ECC71]',
      border: 'border-[#2ECC71]/30',
      label: 'Mentor',
    },
    ADMIN: {
      bg: 'bg-[#7B61FF]/15',
      text: 'text-[#7B61FF]',
      border: 'border-[#7B61FF]/30',
      label: 'Admin',
    },
    DEAN_HOD: {
      bg: 'bg-[#7B61FF]/15',
      text: 'text-[#7B61FF]',
      border: 'border-[#7B61FF]/30',
      label: 'Admin',
    },
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-[#211D19] text-[#DFD7CB] border-r border-[#332D27] z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl',
          'lg:relative lg:translate-x-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Logo / Brand Header */}
        <div className="px-5 py-4 border-b border-[#332D27] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#A36B40] via-[#C6A18D] to-[#77734B] p-[1.5px] shadow-lg shadow-[#A36B40]/20">
              <div className="w-full h-full bg-[#211D19] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-all">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white tracking-tight">Career Intelligence</p>
              </div>
              <p className="text-[10px] font-semibold text-[#8C8276] tracking-wider uppercase">
                ERP System
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-[#2C2621] text-[#8C8276] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 pt-4 pb-1">
          <p className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider px-3">
            Main Navigation
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1.5 dark-scroll">
          {navItems.map((item) => {
            const Icon = iconMap[item.href] || LayoutDashboard
            const isActive = pathname === item.href || (
              item.href !== '/student/dashboard' &&
              item.href !== '/mentor/dashboard' &&
              item.href !== '/admin/dashboard' &&
              item.href !== '/counselor/dashboard' &&
              item.href !== '/dean/dashboard' &&
              pathname.startsWith(item.href)
            )

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 relative overflow-hidden cursor-pointer',
                  isActive
                    ? 'bg-[#A36B40] text-white font-semibold shadow-md shadow-[#A36B40]/25'
                    : 'text-[#DFD7CB] hover:text-white hover:bg-[#2C2621]'
                )}
              >
                <div className="flex items-center gap-3 z-10">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-[#8C8276] group-hover:text-white'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#C6A18D] text-white">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/90" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#332D27] bg-[#1A1613]">
          <div className="flex items-center justify-between px-2 text-[11px] text-[#8C8276]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#77734B] animate-pulse" />
              Institutional System v2.4
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C8276]" />
          </div>
        </div>
      </aside>
    </>
  )
}
