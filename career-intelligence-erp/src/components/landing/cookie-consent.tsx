'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COOKIE_STORAGE_KEY = 'sun_career_cookie_consent'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_STORAGE_KEY)
      if (!consent) {
        // Small delay for smooth entry after initial page paint
        const timer = setTimeout(() => setIsVisible(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // LocalStorage access restricted
    }
  }, [])

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: true,
          timestamp: new Date().toISOString(),
          choice: 'all',
        })
      )
    } catch {}
    setIsVisible(false)
  }

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: false,
          timestamp: new Date().toISOString(),
          choice: 'essential',
        })
      )
    } catch {}
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: analyticsEnabled,
          timestamp: new Date().toISOString(),
          choice: 'custom',
        })
      )
    } catch {}
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-18 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[60] transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-[#211D19]/95 backdrop-blur-xl border border-[#443C34] text-[#FAF6F0] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/60 relative overflow-hidden ring-1 ring-white/10">
        
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#A36B40]/15 rounded-full blur-2xl pointer-events-none -z-0" />

        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#A36B40]/25 border border-[#A36B40]/40 flex items-center justify-center text-[#C6A18D] shrink-0">
              <Cookie className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#FAF6F0] tracking-tight leading-tight flex items-center gap-1.5">
                <span>Cookie & Privacy Preferences</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-2.5 h-2.5" /> DPDP
                </span>
              </h3>
              <p className="text-[10px] text-[#A89D8F]">Sandip University & MindSaar</p>
            </div>
          </div>

          <button
            onClick={handleAcceptEssential}
            className="p-1 text-[#8C8276] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Text */}
        <div className="mt-2.5 space-y-1.5 relative z-10">
          <p className="text-[11px] sm:text-xs text-[#C6A18D] leading-relaxed">
            We use essential cookies to maintain secure authentication and preserve your 30-MCQ diagnostic progress. Optional analytics help us calibrate archetype recommendations.
          </p>
          <p className="text-[10px] text-[#8C8276]">
            We never sell or commercialize student data.{' '}
            <Link
              href="/privacy"
              className="text-[#EFE2D0] hover:text-white underline underline-offset-2 transition-colors font-medium"
            >
              Read our Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Detailed Preferences Collapsible */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-[#332D27] space-y-2 text-[11px] relative z-10 animate-in fade-in duration-300">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#2A241F] border border-[#3E362F]">
              <div className="space-y-0.5 pr-2">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <span>Essential System Cookies</span>
                  <span className="text-[9px] text-[#A89D8F] bg-[#1E1A16] px-1.5 py-0.5 rounded">Always On</span>
                </span>
                <p className="text-[10px] text-[#A89D8F] leading-tight">
                  PRN login sessions, CSRF token security, and test progress state.
                </p>
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#2A241F] border border-[#3E362F]">
              <div className="space-y-0.5 pr-2">
                <span className="font-bold text-white text-[11px]">Diagnostic Analytics</span>
                <p className="text-[10px] text-[#A89D8F] leading-tight">
                  Anonymous response calibration to improve recommendation match accuracy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  analyticsEnabled ? 'bg-[#A36B40]' : 'bg-[#443C34]'
                }`}
                aria-label="Toggle analytics cookies"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    analyticsEnabled ? 'left-4.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3.5 pt-2 border-t border-[#332D27] flex flex-wrap items-center justify-between gap-2 relative z-10">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[10px] text-[#C6A18D] hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>{showDetails ? 'Hide details' : 'Customize preferences'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            {showDetails ? (
              <Button
                size="sm"
                onClick={handleSavePreferences}
                className="h-8 px-3 text-[11px] font-bold bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl shadow-xs cursor-pointer"
              >
                Save Preferences
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAcceptEssential}
                  className="h-7.5 px-2.5 text-[10px] font-semibold border-[#443C34] bg-[#2A241F] text-[#C6A18D] hover:text-white hover:bg-[#332D27] rounded-xl cursor-pointer"
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="h-7.5 px-3 text-[10px] font-bold bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl shadow-xs shadow-[#A36B40]/30 cursor-pointer"
                >
                  Accept All
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
