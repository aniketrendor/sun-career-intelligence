'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export async function getUserNotifications(): Promise<{
  success: boolean
  notifications: AppNotification[]
  unreadCount: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, notifications: [], unreadCount: 0, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return { success: false, notifications: [], unreadCount: 0, error: 'User profile not found' }
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, is_read, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(25)

    if (error) {
      return { success: false, notifications: [], unreadCount: 0, error: error.message }
    }

    const notifications: AppNotification[] = data || []
    const unreadCount = notifications.filter((n) => !n.is_read).length

    return { success: true, notifications, unreadCount }
  } catch (err: any) {
    return { success: false, notifications: [], unreadCount: 0, error: err?.message || 'Error fetching notifications' }
  }
}

export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return { success: false, error: 'User profile not found' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', profile.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error marking notification as read' }
  }
}

export async function markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!profile) {
      return { success: false, error: 'User profile not found' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error marking all notifications as read' }
  }
}
