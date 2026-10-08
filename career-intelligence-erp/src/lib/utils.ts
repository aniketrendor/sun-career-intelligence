import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAlignmentColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 65) return 'text-blue-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-gray-500'
}

export function getAlignmentBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200'
  if (score >= 65) return 'bg-blue-50 border-blue-200'
  if (score >= 50) return 'bg-amber-50 border-amber-200'
  return 'bg-gray-50 border-gray-200'
}

export function getSkillLevelLabel(level: number): string {
  const labels = ['Not Assessed', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert']
  return labels[level] || 'Not Assessed'
}

export function getRoadmapStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'text-emerald-600 bg-emerald-50'
    case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getCounselingStatusColor(status: string): string {
  switch (status) {
    case 'OPEN': return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'FOLLOW_UP': return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'RESOLVED': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    default: return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

export function getUserStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'text-emerald-700 bg-emerald-50'
    case 'PENDING': return 'text-amber-700 bg-amber-50'
    case 'SUSPENDED': return 'text-red-700 bg-red-50'
    case 'INACTIVE': return 'text-gray-700 bg-gray-50'
    default: return 'text-gray-700 bg-gray-50'
  }
}

export function getReferralStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'text-emerald-700 bg-emerald-50'
    case 'DISABLED': return 'text-gray-700 bg-gray-50'
    case 'EXPIRED': return 'text-red-700 bg-red-50'
    case 'FULL': return 'text-amber-700 bg-amber-50'
    default: return 'text-gray-700 bg-gray-50'
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function generateAcademicYears(): string[] {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => `${currentYear + i - 1}-${String(currentYear + i).slice(-2)}`)
}
