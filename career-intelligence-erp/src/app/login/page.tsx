'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  GraduationCap, Users, Shield,
  Mail, KeyRound, RotateCcw, ArrowRight
} from 'lucide-react'
import { signInWithGoogle, sendOtpCode, verifyOtpCode } from '@/lib/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type PortalRole = 'student' | 'mentor' | 'admin'

const BOY_BLUR_DATA =
  'data:image/webp;base64,UklGRuoEAABXRUJQVlA4WAoAAAAQAAAAHwAALwAAQUxQSLcCAAABoLRtmyHJntH7RTTGPLZ9drZt27bPWdm2raVt1pnVsW3bVRXxfV+8i8zqzBMREwBEwcq7zIe11wcQUZUYY8DACJxi/OZp8tGpEdWAqtRF7P4mqaQXfvXRyTFIwNSj9lxtbgzcpktzdy1uJFdAwOWfkOwsAqmsy6LuXoqXYslvHsKJZNbM6xEq22b1MsA98+CJv3hyT7wCsTLn98W8UkrxknnUSszuVj6ZKVJZhVQvpbh7sWQvzj/1G6obv5sUakbP/YE0d8umZOfGzqQln3c1/jIdoSJY9u0fSSXJn+9ZdpF97xt6huqW318CQwAQMTTtzC5/ffjzZ5YBgGl3UN1d+XKAAEAAsNBac2MUiDKM7dj3auazi0gAAJEAIEACIrb9O1uN9/kMagCEKBBAZMpPVK83+3dOSN3AKGsz+2DluohNcB2Tu9UlnoGhsQUs9p/bmI5ptnRydzdzc/fMzZpErNo1q6lmHtdsNU0+xswOwtggeIO5xqzyKGKDIMu/VHRQKrdhqAEEuInJ63vlnGYYwop/mtUYuThCIwheo1bUZm0NQWPBpG9pFStLI6KNKT/QvLgr14vtzPsvrfS0JJ6OoRYCli+ufO0HZr6I0ELEWtTMuzvM/H0GpI3NqIlnXs1kXA2xja2ZE4/YnynxUAy1sTotca9VS068pA3BhC/Y57ZzsCRe3gYCHmWX++JF9ngXYguCWezyDBzGHl+BNBMMfcIez8dd7PPrCZAWZvzKPk/BS0zsLYDQwpx/sc8TcSOTcUXEFiZ8yT6fxD7MmRu3AOADZv47sjxNuWYLEYeWrPxYDmUyX7GFIdzBlHnL0HfUxGcQGgWZ46eSyquT36NqOTbEZljoR+3zHOykXeXqGGoSZXUnyy9bYX3S9IM1pUnAmg+99sKaU4E5z7ovk4/jf11p+9VmAwBWUDggDAIAAHALAJ0BKiAAMAA+zVaiTKelIyI1SADwGYlmAMrnJKSxz22vu13eUF+CtBlmaVn4B0EOc16j9gLpG+iB+qpTDZXqLIUzrP7//QMxDDkvH8ghp3/PSmCjT0zVNSj/8uF8Q/mkAAAA/uDwuinU+GlQtY3ryWX6y6FCZbCvxSclIJ5ySK5MqDI9jaS5VBe8RXmQkAloIyGnEGrGGzYQfHknCvxE4fL5BvNyTjfFp9kkQg4SVzUpHdQ4hh8rZX9iDjHA5grDEui/vkzXgri79djAt+Lx+ZFxpUKZBrLRKpldACxylDwJ50o1OwBypE+bRVeGfLbH89bcfNlsTEqCDZHQBkNIApRUY7j82Xe0ilQdO/ilQ15vDncQbTgSlSpD6VbosSwGYRYCj/8+t+O4Uiv/hDPu85nvw6tcntHGe0HsyerZAE+BzDYp7/XaWXKl0PIJ2jIxsvx8seDn61zlQHvTgU53smsi3rZtCOpcD4GqR0YSopKMf9nWuMitvz95B79/u11CyUzukUEeZK6saKjPMe4rGUi2SW/+XqPT1sm0DocRWy71ab1J+H5T7gh2xIut6NmiYRlNvO5JftVfxBlnXwLE2opJV6Bp5jJYzVI+21VJusvkPVsGjklJSkBudKPAGt7d8a8rpGNoZSqKVlrmjwrmOGBtnQg7LHTwsB8gDOBwwEqt0/Svw9uaZgAA'

const GIRL_BLUR_DATA =
  'data:image/webp;base64,UklGRtwEAABXRUJQVlA4WAoAAAAQAAAAHwAALwAAQUxQSLACAAABoGzblmHbmivi2tazbdu2jZJtu2Tbtm3btm2/t3dErLVmYSPyEyJiAlAfAKxx96uXzLnYmmMwAP1KjAJEzH/Eef+T/Ok/vr0wQh8BAELE6v+SLKqk8sONpVfA0GWXHw8s/QnbWc1c1Qq5W4+Ihd4jP1hgrhaLu5mZm3nyh7sJRn/KXPjNBczuZu7eUXh6Fwkj7mMyS3z4Q1czdzcz96x3dAmY8x9Xs+IPHMuk5m4dSl7ULSz8F9VM+fXmf9FzVis5F/5x1eQOAU70YmamnHeHz/4m6ST50mzoFAw6WlXNTK21+xFnrP/I3R/55yecftB4BAFERt9Bte7/nrQMAExYfAIABACI2JqpR+F7M8UoAiDGKOgMg/bUYj0zL5UASBD0DoMvYO7Dj0BE/wK5tsO7FN47VqQ/BOxZ1Hoqf1kAoWrl31x7ZJ4kAZUR5zGZm7mZqd4/EtKfYOCXLGZdlH9tNQSVguHfUjvMTO2yAZCqqX/2Uj8wDkCtYOiXJXezPDNCFQLuJ7tl304G1IlMd9k32iXxBsS6zp2ZzNwK3xI0OTCewuTlfy/8cgikgYBHmPjTR8z8cnATggEfMfGpR5n4njQz9R+2ec7tbPEZCOojlqIm7nkj/+etiA0MwI5MmWvfwf95LgY0EAY8zmy+4Ats8egmAuaiK3+d6Qu2uW8zs2fPfHvsj2xz7yYGYBfmzLvlZ7a5axMBjzInHjOba+J2DQhG/0zNXHMnpsx1EasCFnVT1ylXMBkXQagaIJszF34QPmHmn5MgdTiMKfkpC5hmvh1QLTLsYy+Faz3MnHkDYtUAHMFc+N52LJZ4EQZUBXnGc+Kea2nbsu2EWDUAx7FVvhgc/+B/dj0iqsOU50qLzyEc+hHJJRCqcDHply4nEWOufPTaeZvY8NK79gaAiIYBVlA4IAYCAADwCQCdASogADAAPs1OnkynpCKiNUgA8BmJbACpFVf2VXy/2ApAdgQZSqbGdeNb6l9gPpT+hQTgG4zalESXi8evsXV76LCVTK6l9Zgu4kprTZazCr/+geJAAP7i53/yek7QG28Ay6SgFXxV+QXV5dN6A4gwAPZCoOpmbK9o+xIQr9qL96IZaAkK++HFgTdvQLbp4oSYdy14lHIz/iZYHSwW9vOldNMsfDAjHu1xemnp3qUSUrU1ygASfDI6Y70azdqfDYbGG1hL88AToWCddB8kREIYKE4E1aXVO02K/T4Yck3jeF9N5vVpEqKbhAxFy2LS2UQjGk15//hvxq9bczc6pgndqJFIdPyAf4YvKf4jkWBZsoO6e4D9x+MhHTUNOfq5gMWpNeA/ztuOHicWeM/jT2RDSN9o6ypn7JqdR0CyFXjNi3ESSWDk9TqDi3A2vr+Gf3CuSNPoyGihV41IpC05tCsXQr9jA8jVYIf+GCyMPLT9PGh/fxuAPZM8G55M8jMF3zHAcieXe8//90C8U1j/Akc+K2g7VDlqvnSRDlNzztetyH5lnmaBqKFg2VwAAIGMNqKgJ5Y9ttnqVQQfqo0wKAorNrCj6ULK7D7PSXoKHqG9uDCH8nKcYxmD6AOMI8vq5kkn9eaR/tY6a7gZgL/4i7VJn1OtnMsaT/aG734czl8/tgAAAA=='

export default function LoginPage() {
  const router = useRouter()
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>('student')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Safety fallback: Reset loading state if redirect does not happen within 7 seconds
  useEffect(() => {
    if (isGoogleLoading) {
      const timer = setTimeout(() => {
        setIsGoogleLoading(false)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [isGoogleLoading])

  // Catch OAuth redirect code if landed on /login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        toast.loading('Completing Google authentication...')
        window.location.href = `/auth/callback?${params.toString()}`
        return
      }
      if (params.get('error')) {
        toast.error('Authentication failed. Please try signing in again.')
        setIsGoogleLoading(false)
      }
    }
  }, [])

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    try {
      const targetRole = selectedPortal === 'mentor' ? 'COUNSELOR' : selectedPortal === 'admin' ? 'DEAN_HOD' : 'STUDENT'
      const res = await signInWithGoogle(targetRole)
      if (res.success && res.url) {
        window.location.href = res.url
      } else {
        toast.error(res.error || 'Failed to initiate Google sign-in.')
        setIsGoogleLoading(false)
      }
    } catch (err: any) {
      console.error('Google sign in error:', err)
      toast.error('An error occurred during Google sign-in.')
      setIsGoogleLoading(false)
    }
  }

  const portalConfigs = {
    student: {
      label: 'Student',
      icon: GraduationCap,
      googleText: 'Continue with Google as Student',
      emailPlaceholder: 'student@university.edu or personal email',
      defaultRedirect: '/student/dashboard',
      activeBg: 'bg-[#FF6B3D] text-white shadow-md shadow-[#FF6B3D]/30 scale-[1.02]',
      inactiveBg: 'bg-[#FFF0EB] hover:bg-[#FFE5DC] text-[#FF6B3D]',
      iconColor: 'text-[#FF6B3D]',
    },
    mentor: {
      label: 'Mentor',
      icon: Users,
      googleText: 'Continue with Google as Mentor',
      emailPlaceholder: 'mentor@university.edu',
      defaultRedirect: '/mentor/dashboard',
      activeBg: 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30 scale-[1.02]',
      inactiveBg: 'bg-[#E6F8F0] hover:bg-[#D5F3E4] text-[#059669]',
      iconColor: 'text-[#059669]',
    },
    admin: {
      label: 'Admin',
      icon: Shield,
      googleText: 'Continue with Google as Admin',
      emailPlaceholder: 'admin@university.edu',
      defaultRedirect: '/admin/dashboard',
      activeBg: 'bg-[#7B61FF] text-white shadow-md shadow-[#7B61FF]/30 scale-[1.02]',
      inactiveBg: 'bg-[#F0EDFF] hover:bg-[#E3DEFF] text-[#7B61FF]',
      iconColor: 'text-[#7B61FF]',
    },
  }

  const currentConfig = portalConfigs[selectedPortal]

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid institutional email address.')
      return
    }

    startTransition(async () => {
      const res = await sendOtpCode(email)
      if (res.success) {
        setOtpSent(true)
        toast.success('6-digit OTP verification code sent to your email!')
      } else {
        toast.error(res.error || 'Failed to send OTP code.')
      }
    })
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length < 6) {
      toast.error('Please enter the full 6-digit OTP code.')
      return
    }

    startTransition(async () => {
      const targetRole = selectedPortal === 'mentor' ? 'COUNSELOR' : selectedPortal === 'admin' ? 'DEAN_HOD' : 'STUDENT'
      const res = await verifyOtpCode(email, otpCode.trim(), targetRole)
      if (res.success) {
        toast.success('Verification successful! Access granted.')
        router.push(currentConfig.defaultRedirect)
        router.refresh()
      } else {
        toast.error(res.error || 'Invalid or expired OTP code.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F7EEDB] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none font-sans overflow-hidden relative">
      
      {/* Background Decorative Dotted Curves Passing Behind Characters */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 50 480 Q 260 380 440 440 T 840 420 Q 1060 360 1350 460"
          fill="none"
          stroke="#D5C2A7"
          strokeWidth="1.25"
          strokeDasharray="5,6"
        />
        <path
          d="M 20 290 Q 200 350 340 300 T 720 330"
          fill="none"
          stroke="#D5C2A7"
          strokeWidth="1.25"
          strokeDasharray="4,5"
        />
      </svg>

      {/* Main Content Layout Container */}
      <div className="w-full max-w-[1240px] flex flex-col items-center relative z-10 mx-auto space-y-4">
        
        {/* Top Header Typography with Exact Floating Color Pills / Sprinkles */}
        <div className="text-center relative select-none">
          {/* Top Left Floating Blue/Purple Pills */}
          <div className="hidden sm:flex flex-col gap-1.5 absolute -left-8 -top-1 pointer-events-none">
            <span className="w-2 h-5 bg-[#6366F1] rounded-full rotate-[-45deg] inline-block" />
            <span className="w-2 h-4 bg-[#6366F1] rounded-full rotate-[30deg] -ml-1 inline-block" />
          </div>

          {/* Top Right Floating Orange/Coral Pills */}
          <div className="hidden sm:flex flex-col gap-1.5 absolute -right-8 -top-1 items-end pointer-events-none">
            <span className="w-2 h-5 bg-[#FF6B3D] rounded-full rotate-[45deg] inline-block" />
            <span className="w-2 h-4 bg-[#FF6B3D] rounded-full rotate-[-30deg] mr-1 inline-block" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#1C1C1C] tracking-tight leading-tight">
            Welcome to <br />
            <span className="text-[#FF6B3D]">Career </span>
            <span className="text-[#6366F1]">Intelligence</span>
          </h1>
        </div>

        {/* 3-Column Center Stage: Left Avatar + Center Card + Right Avatar */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 xl:gap-12 relative">
          
          {/* Left Avatar (Boy with Thoughts & Pattern Backdrop) */}
          <div className="hidden lg:flex flex-col items-center justify-end relative select-none pointer-events-none max-w-[280px] xl:max-w-[320px] shrink-0 self-end">
            
            {/* Smooth Soft Circle Backdrop */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[290px] h-[290px] bg-[#EFE0CB]/90 rounded-full -z-10" />

            {/* Orange Pills next to Thought Bubble */}
            <div className="absolute top-16 -left-2 flex flex-col gap-1 z-10 pointer-events-none">
              <span className="w-2 h-4 bg-[#FF6B3D] rounded-full rotate-[40deg]" />
              <span className="w-2 h-4 bg-[#FF6B3D] rounded-full rotate-[-25deg] ml-1.5" />
            </div>

            {/* Boy Character Image - Instant 0.1ms load with inline blur, WebP & eager sync decoding */}
            <div
              className="w-full h-auto max-h-[500px] xl:max-h-[540px] relative z-0 flex items-end justify-center"
              style={{
                backgroundImage: `url("${BOY_BLUR_DATA}")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'bottom center',
              }}
            >
              <img
                src="/student-thinking-boy-opt.webp"
                alt="Student pondering career decisions"
                width={480}
                height={720}
                loading="eager"
                decoding="sync"
                // @ts-ignore
                fetchPriority="high"
                className="w-full h-auto max-h-[500px] xl:max-h-[540px] object-contain drop-shadow-sm relative z-0"
              />
            </div>
          </div>

          {/* Center Card: Main Login Container */}
          <div className="w-full max-w-[440px] bg-white rounded-[32px] p-6 sm:p-7 shadow-[0_20px_50px_-10px_rgba(28,28,28,0.07),0_2px_8px_rgba(28,28,28,0.02)] border border-[#EADECB] space-y-4 shrink-0 relative z-20">
            
            {/* 3 Main Portals Grid: Student, Mentor, Admin */}
            <div className="grid grid-cols-3 gap-2.5">
              {(['student', 'mentor', 'admin'] as PortalRole[]).map((portal) => {
                const config = portalConfigs[portal]
                const Icon = config.icon
                const isSelected = selectedPortal === portal

                return (
                  <button
                    key={portal}
                    type="button"
                    onClick={() => {
                      setSelectedPortal(portal)
                      setOtpSent(false)
                      setOtpCode('')
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                      isSelected ? config.activeBg : config.inactiveBg
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : config.iconColor}`} />
                    <span className="text-[12px] font-semibold">{config.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full h-11 bg-white hover:bg-[#FAF5EC] text-[#1C1C1C] text-xs font-semibold rounded-2xl border border-[#EADECB] shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-[#FF6B3D]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{currentConfig.googleText}</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-[#EADECB] w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-[#A89D8F] tracking-wider whitespace-nowrap">
                OR VERIFY WITH EMAIL & OTP
              </span>
              <div className="border-t border-[#EADECB] w-full" />
            </div>

            {/* Email Form */}
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div className="space-y-1.5 text-center">
                  <label className="text-xs font-bold text-[#1C1C1C] block text-center">
                    Personal / Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A89D8F] absolute left-3.5 top-3.5" />
                    <Input
                      type="email"
                      required
                      placeholder={currentConfig.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-10 h-11 rounded-2xl bg-white border-[#EADECB] text-xs text-[#1C1C1C] text-center placeholder:text-[#A89D8F] focus:border-[#FF6B3D] focus:ring-1 focus:ring-[#FF6B3D]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#1C1C1C] hover:bg-black text-white font-semibold text-xs rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  {isPending ? 'Sending OTP Code...' : 'Send 6-Digit OTP Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 animate-in fade-in-50">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1C1C1C]">
                      Enter 6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode('') }}
                      className="text-[11px] text-[#A89D8F] hover:text-[#1C1C1C] underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#A89D8F] absolute left-3.5 top-3.5" />
                    <Input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.trim())}
                      className="pl-10 h-11 rounded-2xl font-mono text-center tracking-[0.4em] font-bold text-base bg-white border-[#EADECB] text-[#1C1C1C] focus:border-[#FF6B3D] focus:ring-1 focus:ring-[#FF6B3D]"
                    />
                  </div>
                  <p className="text-[11px] text-[#A89D8F] text-center pt-0.5">
                    Sent to <span className="font-semibold text-[#1C1C1C]">{email}</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className={`w-full h-11 text-white font-semibold text-xs rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                    selectedPortal === 'mentor'
                      ? 'bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/25'
                      : selectedPortal === 'admin'
                      ? 'bg-[#7B61FF] hover:bg-[#684DEC] shadow-[#7B61FF]/25'
                      : 'bg-[#FF6B3D] hover:bg-[#E8592E] shadow-[#FF6B3D]/25'
                  }`}
                >
                  {isPending ? 'Verifying Code...' : 'Verify & Enter Portal'}
                </Button>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSendOtp}
                    className="text-xs text-[#A89D8F] hover:text-[#1C1C1C] font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Resend 6-Digit Code
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Avatar (Girl with Thoughts & Pattern Backdrop) */}
          <div className="hidden md:flex flex-col items-center justify-end relative select-none pointer-events-none max-w-[280px] xl:max-w-[320px] shrink-0 self-end">
            
            {/* Smooth Soft Lavender Circle Backdrop */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[290px] h-[290px] bg-[#E5DCF8]/85 rounded-full -z-10" />

            {/* Purple Floating Pills near Thought Bubble */}
            <div className="absolute top-14 -right-2 flex flex-col gap-1 z-10 items-end pointer-events-none">
              <span className="w-2 h-4 bg-[#7B61FF] rounded-full rotate-[40deg]" />
              <span className="w-2 h-4 bg-[#7B61FF] rounded-full rotate-[15deg] mr-1.5" />
            </div>

            {/* Girl Character Image - Instant 0.1ms load with inline blur, WebP & eager sync decoding */}
            <div
              className="w-full h-auto max-h-[500px] xl:max-h-[540px] relative z-0 flex items-end justify-center"
              style={{
                backgroundImage: `url("${GIRL_BLUR_DATA}")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'bottom center',
              }}
            >
              <img
                src="/student-thinking-opt.webp"
                alt="Student Career Intelligence Illustration"
                width={480}
                height={720}
                loading="eager"
                decoding="sync"
                // @ts-ignore
                fetchPriority="high"
                className="w-full h-auto max-h-[500px] xl:max-h-[540px] object-contain drop-shadow-sm relative z-0"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
