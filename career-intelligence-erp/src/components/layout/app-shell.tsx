'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, Bell, LogOut, Search, Sparkles, ChevronRight, User } from 'lucide-react'
import { signOut } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sidebar, type NavItem } from './sidebar'

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
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#DFD7CB] flex items-center justify-between px-4 md:px-8 z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#EFE2D0]/60 text-[#2C2621] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Image
                  src="/sandip-university-logo.png"
                  alt="Sandip University - NAAC Grade A"
                  width={220}
                  height={48}
                  className="h-8 sm:h-9.5 w-auto object-contain"
                  priority
                />
              </Link>

              {breadcrumbs && breadcrumbs.length > 0 && (
                <>
                  <span className="text-xs text-[#DFD7CB] hidden sm:inline">/</span>
                  <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#7A7067]">
                    {breadcrumbs.map((crumb, index) => (
                      <span key={index} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight className="w-3 h-3 text-[#7A7067]" />}
                        {crumb.href ? (
                          <Link href={crumb.href} className="hover:text-[#A36B40] transition-colors">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-[#2C2621] font-semibold">{crumb.label}</span>
                        )}
                      </span>
                    ))}
                  </nav>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                className="relative p-2 rounded-xl hover:bg-[#EFE2D0]/60 text-[#2C2621] transition-colors cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A36B40] rounded-full ring-2 ring-white" />
                )}
              </button>
            </div>

            {/* User Profile Pill & Sign Out */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#DFD7CB]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#2C2621] leading-tight">{userName}</span>
                <span className="text-[10px] text-[#7A7067] truncate max-w-[140px]">{userEmail}</span>
              </div>

              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium gap-1.5 text-[#2C2621] border-[#DFD7CB] hover:text-[#A36B40] hover:border-[#A36B40] hover:bg-[#F7EFEA] rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

