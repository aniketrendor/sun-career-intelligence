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
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD7CB] shadow-lg max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#A36B40]/15 text-[#A36B40] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#2C2621]">Application Notice</h2>
          <p className="text-xs text-[#7A7067]">
            Please refresh the page to load the latest session state.
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              } else {
                reset()
              }
            }}
            className="bg-[#A36B40] hover:bg-[#8E5B33] text-white text-xs font-bold rounded-xl px-5 h-10 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
