'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  KeyRound, ShieldCheck, Clock, ArrowRight, Sparkles,
  GraduationCap, CheckCircle2, AlertCircle, LogOut, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redeemAccessKey } from '@/lib/actions/key.actions'
import { signOut } from '@/lib/actions/auth.actions'

interface WaitingRoomCardProps {
  userEmail: string
  userName: string
  userRole: string
}

export function WaitingRoomCard({ userEmail, userName, userRole }: WaitingRoomCardProps) {
  const router = useRouter()
  const [accessKey, setAccessKey] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessKey.trim()) {
      toast.error('Please enter the Access Key issued by your Administrator or Mentor.')
      return
    }

    startTransition(async () => {
      const res = await redeemAccessKey(accessKey)
      if (res.success) {
        toast.success(res.message || 'Access verified! Redirecting to your dashboard...')
        if (res.redirectTo) {
          router.push(res.redirectTo)
        } else {
          router.push('/student/dashboard')
        }
      } else {
        toast.error(res.error || 'Invalid or expired access key.')
      }
    })
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    router.push('/login')
  }

  const isStudent = userRole === 'STUDENT'
  const isMentor = ['MENTOR', 'COUNSELOR'].includes(userRole)

  return (
    <div className="w-full max-w-lg space-y-6 font-sans">
      {/* Top University Branding Badge */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] border border-[#DFD7CB] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#A36B40] animate-ping" />
          <span className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
            Sandip University Access Verification
          </span>
        </div>
      </div>

      {/* Main Waiting Room Card */}
      <Card className="bg-white border-[#DFD7CB] shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#211D19] via-[#2C2621] to-[#1A1613] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A36B40]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#A36B40] flex items-center justify-center shadow-lg shadow-[#A36B40]/30 mb-3">
            {isMentor ? (
              <ShieldCheck className="w-7 h-7 text-white" />
            ) : (
              <GraduationCap className="w-7 h-7 text-white" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Institutional Waiting Room
          </h1>
          <p className="text-xs text-[#DFD7CB]/80 mt-1 max-w-sm mx-auto">
            Welcome, <span className="text-white font-semibold">{userName || userEmail}</span>. Your account is verified in the system queue.
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Method 1: Instant Activation Key (Primary) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Instant Unlock with Access Key
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] bg-[#FAF6F0] text-[#77734B] border-[#77734B]/30 font-semibold">
                Fast-Track
              </Badge>
            </div>

            <p className="text-xs text-[#7A7067] leading-relaxed">
              If an Administrator or Mentor gave you an approval key (e.g. <span className="font-mono font-bold text-[#2C2621]">STU-PASS-XXXXX</span> or <span className="font-mono font-bold text-[#2C2621]">SUN-FRESHERS-2026</span>), enter it below for instant activation:
            </p>

            <form onSubmit={handleRedeem} className="space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. STU-PASS-9K2L4"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                  disabled={isPending}
                  className="h-12 text-sm font-mono font-bold tracking-wider uppercase px-4 bg-[#FAF6F0] border-[#DFD7CB] focus-visible:ring-[#A36B40] text-[#2C2621] rounded-2xl shadow-inner placeholder:text-[#8C8276]/60"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending || !accessKey.trim()}
                className="w-full h-11 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying Key & Activating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Verify Key & Enter Portal <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#DFD7CB]" />
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#8C8276] bg-white px-2">
              OR AWAIT DIRECT APPROVAL
            </span>
            <div className="flex-grow border-t border-[#DFD7CB]" />
          </div>

          {/* Method 2: Administrator Direct Review Queue */}
          <div className="bg-[#FAF6F0] border border-[#DFD7CB] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#77734B]" />
              <h4 className="text-xs font-bold text-[#2C2621]">Automatic Review Queue</h4>
            </div>
            <p className="text-[11px] text-[#7A7067] leading-relaxed">
              Don&apos;t have an access key yet? Your department administrator or mentor can directly activate your account from their user management panel.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#77734B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#77734B] animate-pulse" />
              <span>Registered Email: {userEmail}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#DFD7CB] text-xs">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-[#7A7067] hover:text-rose-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>

            <span className="text-[11px] text-[#8C8276]">
              Sandip University ERP · v2.4
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
