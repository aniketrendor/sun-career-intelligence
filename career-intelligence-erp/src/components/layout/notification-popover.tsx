'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bell, CheckCheck, Calendar, CheckCircle2,
  Award, Video, Sparkles, MessageSquare, Clock,
  X, AlertCircle
} from 'lucide-react'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AppNotification
} from '@/lib/actions/notification.actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface NotificationPopoverProps {
  initialUnreadCount?: number
}

export function NotificationPopover({ initialUnreadCount = 0 }: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUnreadCount(initialUnreadCount)
  }, [initialUnreadCount])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fetch notifications when opened
  const loadNotifications = async () => {
    setIsLoading(true)
    const res = await getUserNotifications()
    if (res.success) {
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
      setHasFetched(true)
    }
    setIsLoading(false)
  }

  const toggleOpen = () => {
    if (!isOpen && !hasFetched) {
      loadNotifications()
    }
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    await markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)

    const res = await markAllNotificationsAsRead()
    if (res.success) {
      toast.success('All notifications marked as read')
    } else {
      toast.error('Failed to mark all as read')
      loadNotifications()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COUNSELING_SCHEDULED':
      case 'MEET_LINK_CREATED':
        return <Video className="w-4 h-4 text-emerald-600" />
      case 'DEAN_HOD_APPROVAL':
      case 'COUNSELOR_APPROVAL':
        return <CheckCircle2 className="w-4 h-4 text-[#A36B40]" />
      case 'ASSESSMENT_COMPLETED':
      case 'EVALUATION_SUBMITTED':
        return <Award className="w-4 h-4 text-amber-600" />
      default:
        return <Sparkles className="w-4 h-4 text-[#C6A18D]" />
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date()
      const past = new Date(dateStr)
      const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))

      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`
      return past.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#EFE2D0] text-[#A36B40] shadow-xs'
            : 'hover:bg-[#EFE2D0]/60 text-[#2C2621]'
        }`}
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A36B40] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A36B40] ring-2 ring-white" />
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 px-4 bg-[#211D19] text-white flex items-center justify-between border-b border-[#3D352E]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#A36B40]/25 flex items-center justify-center text-[#C6A18D]">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#A36B40] text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-semibold text-[#C6A18D] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#8C8276] hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-[#EFE2D0]">
            {isLoading && !hasFetched ? (
              <div className="p-8 text-center text-xs text-[#7A7067] space-y-2">
                <div className="w-6 h-6 border-2 border-[#A36B40] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#EFE2D0]/60 flex items-center justify-center text-[#A36B40] mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2C2621]">All caught up!</h4>
                  <p className="text-[11px] text-[#7A7067] mt-0.5">
                    No notifications right now. We’ll notify you when an advisory slot or evaluation is updated.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => !item.is_read && handleMarkAsRead(item.id, e)}
                  className={`p-3.5 sm:p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    item.is_read
                      ? 'bg-transparent hover:bg-white/60 opacity-80'
                      : 'bg-white hover:bg-[#FDFBF7]'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          item.is_read ? 'text-[#5A5046]' : 'text-[#2C2621]'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[#A89D8F] whitespace-nowrap shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#7A7067] leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!item.is_read && (
                    <span
                      className="w-2 h-2 rounded-full bg-[#A36B40] shrink-0 mt-1.5"
                      title="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 px-4 bg-[#F5EDE1] border-t border-[#DFD7CB] flex items-center justify-between text-[11px] text-[#7A7067]">
            <span>{notifications.length} total notifications</span>
            <span className="font-semibold text-[#A36B40]">Career Intelligence ERP</span>
          </div>
        </div>
      )}
    </div>
  )
}
