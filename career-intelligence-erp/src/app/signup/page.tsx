'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GraduationCap, Mail, Lock, User, Globe, Building2 } from 'lucide-react'
import { signUpWithEmail, type AuthActionResult } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" isLoading={pending}>
      {!pending && label}
    </Button>
  )
}

const initialState: AuthActionResult = { success: false }

export default function SignUpPage() {
  const router = useRouter()
  const [role, setRole] = useState<'STUDENT' | 'DEAN_HOD'>('STUDENT')
  const [state, formAction] = useActionState(signUpWithEmail, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success('Account created successfully!')
      if (state.redirectTo) {
        router.push(state.redirectTo)
      } else {
        router.push('/onboarding')
      }
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Career Intelligence ERP</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-center text-gray-800">I am registering as a</h2>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Role Selection: Student, Mentor, Admin */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  role === 'STUDENT'
                    ? 'border-blue-600 bg-blue-50/70'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className={`w-4 h-4 mb-1 ${role === 'STUDENT' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="font-bold text-xs">Student</div>
                <div className="text-[10px] text-gray-500 leading-tight">Career tests & PRN</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('COUNSELOR' as any)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  (role as any) === 'COUNSELOR'
                    ? 'border-emerald-600 bg-emerald-50/70'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className={`w-4 h-4 mb-1 ${(role as any) === 'COUNSELOR' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div className="font-bold text-xs">Mentor</div>
                <div className="text-[10px] text-gray-500 leading-tight">Referrals & reports</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('DEAN_HOD')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  role === 'DEAN_HOD'
                    ? 'border-purple-600 bg-purple-50/70'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className={`w-4 h-4 mb-1 ${role === 'DEAN_HOD' ? 'text-purple-600' : 'text-gray-400'}`} />
                <div className="font-bold text-xs">Admin</div>
                <div className="text-[10px] text-gray-500 leading-tight">Assign & convert</div>
              </button>
            </div>

            {role === 'DEAN_HOD' && (
              <div className="text-xs bg-purple-50 border border-purple-200 rounded-lg p-3 text-purple-700">
                <strong>Admin Access:</strong> Institutional administrative permissions will be configured upon account verification.
              </div>
            )}

            {/* Google */}
            <form action={async (_formData: FormData) => { const { signInWithGoogle } = await import('@/lib/actions/auth.actions'); await signInWithGoogle() }}>
              <Button type="submit" variant="outline" className="w-full gap-3 h-11">
                <Globe className="w-5 h-5 text-blue-500" />
                Continue with Google
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or with email</span>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="role" value={role} />

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="full_name" name="full_name" placeholder="Dr. Priya Sharma" className="pl-10" required />
                </div>
              </div>

              {role === 'DEAN_HOD' && (
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="designation" name="designation" placeholder="Head of Department / Dean" className="pl-10" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" name="email" type="email" placeholder="you@university.edu" className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" name="password" type="password" placeholder="Min. 8 characters" className="pl-10" required minLength={8} />
                </div>
              </div>

              <SubmitButton label={role === 'DEAN_HOD' ? 'Request Dean/HOD Access' : 'Create Student Account'} />
            </form>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
