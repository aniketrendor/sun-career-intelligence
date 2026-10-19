'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, LogOut, Search, Sparkles, ChevronRight, User } from 'lucide-react'
import { signOut } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar, type NavItem } from './sidebar'
import { NotificationPopover } from './notification-popover'

interface AppShellProps {
  children: React.ReactNode
  navItems: NavItem[]
  userRole: string
  userName: string
  userEmail: string
  pageTitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  unreadCount?: number
}

export function AppShell({
  children,
  navItems,
  userRole,
  userName,
  userEmail,
  pageTitle,
  breadcrumbs,
  unreadCount = 0,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#EFE2D0] text-[#2C2621] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#DFD7CB] flex items-center justify-between px-3 sm:px-6 md:px-8 z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#EFE2D0]/60 text-[#2C2621] transition-colors cursor-pointer active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Sandip University Official Logo */}
            <a
              href="https://sandipuniversity.edu.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-90 transition-opacity shrink-0"
              title="Sandip University - NAAC Grade A"
            >
              <div className="relative h-7 sm:h-9 w-28 sm:w-40">
                <Image
                  src="/sandip-university-logo.png"
                  alt="Sandip University - NAAC Grade A"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </a>

            {breadcrumbs && breadcrumbs.length > 0 && (
              <>
                <span className="text-xs text-[#DFD7CB] hidden sm:inline">/</span>
                <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#7A7067] truncate">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="w-3 h-3 text-[#7A7067] shrink-0" />}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-[#A36B40] transition-colors truncate">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-[#2C2621] font-semibold truncate">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell Popover */}
            <NotificationPopover initialUnreadCount={unreadCount} />

            {/* User Profile Pill & Sign Out */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#DFD7CB]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#2C2621] leading-tight">{userName}</span>
                <span className="text-[10px] text-[#7A7067] truncate max-w-[140px]">{userEmail}</span>
              </div>

              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-2.5 sm:px-3 text-xs font-medium gap-1.5 text-[#2C2621] border-[#DFD7CB] hover:text-[#A36B40] hover:border-[#A36B40] hover:bg-[#F7EFEA] rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

