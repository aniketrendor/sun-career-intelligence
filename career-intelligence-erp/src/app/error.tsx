'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (
      error.message === 'NEXT_REDIRECT' ||
      error.digest?.includes('NEXT_REDIRECT') ||
      error.message?.includes('NEXT_REDIRECT') ||
      error.message === 'NEXT_NOT_FOUND' ||
      error.digest?.includes('NEXT_NOT_FOUND')
    ) {
      return
    }
    console.error('Global Application Error:', error)
  }, [error])

  // Don't show error modal if it's an internal Next.js navigation signal
  if (
    error.message === 'NEXT_REDIRECT' ||
    error.digest?.includes('NEXT_REDIRECT') ||
    error.message?.includes('NEXT_REDIRECT') ||
    error.message === 'NEXT_NOT_FOUND' ||
    error.digest?.includes('NEXT_NOT_FOUND')
  ) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD7CB] shadow-lg max-w-lg w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#A36B40]/15 text-[#A36B40] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#2C2621]">Application Notice</h2>
          <p className="text-xs text-[#7A7067]">
            {error?.message && !error.message.includes('Server Components render')
              ? error.message
              : 'Please refresh the page to reload the latest session state.'}
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-[#A36B40] pt-1">Reference: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-2 justify-center pt-2 flex-wrap">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              } else {
                reset()
              }
            }}
            className="bg-[#A36B40] hover:bg-[#8E5B33] text-white text-xs font-bold rounded-xl px-5 h-10 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Page</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/student/dashboard'
              }
            }}
            className="border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#FAF6F0] text-xs font-bold rounded-xl px-5 h-10 flex items-center gap-2 cursor-pointer"
          >
            <span>Go to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
