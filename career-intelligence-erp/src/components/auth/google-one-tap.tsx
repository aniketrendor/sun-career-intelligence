'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { signInWithGoogleOneTap } from '@/lib/actions/auth.actions'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            itp_support?: boolean
            context?: string
          }) => void
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean
            isSkippedMoment: () => boolean
            isDismissedMoment: () => boolean
            getNotDisplayedReason: () => string
            getSkippedReason: () => string
            getDismissedReason: () => string
          }) => void) => void
          cancel: () => void
        }
      }
    }
  }
}

interface GoogleOneTapProps {
  targetRole?: string
}

export function GoogleOneTap({ targetRole = 'STUDENT' }: GoogleOneTapProps) {
  const router = useRouter()
  const initializedRef = useRef(false)
  const isAuthenticatingRef = useRef(false)

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1012527537460-kduqvhts7h0kbfmb0748m57ea12iaal9.apps.googleusercontent.com'

  useEffect(() => {
    if (!clientId) return

    // Prevent duplicate initializations
    if (initializedRef.current) return

    const handleCredentialResponse = async (response: { credential: string }) => {
      if (!response.credential || isAuthenticatingRef.current) return
      isAuthenticatingRef.current = true

      const toastId = toast.loading('Signing in with Google One-Tap...')
      try {
        const res = await signInWithGoogleOneTap(response.credential, targetRole)
        if (res.success && res.redirectUrl) {
          toast.success('Signed in successfully!', { id: toastId })
          window.location.href = res.redirectUrl
        } else {
          toast.error(res.error || 'Failed to authenticate with Google One-Tap.', { id: toastId })
          isAuthenticatingRef.current = false
        }
      } catch (err: any) {
        console.error('One-Tap sign-in error:', err)
        toast.error('An error occurred during Google One-Tap sign-in.', { id: toastId })
        isAuthenticatingRef.current = false
      }
    }

    const initializeOneTap = () => {
      if (!window.google?.accounts?.id) return

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
          context: 'signin',
        })

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            // Can be suppressed if 3rd party cookies blocked or on cooldown - expected behavior
          }
        })

        initializedRef.current = true
      } catch (err) {
        // Fallback gracefully
        console.warn('Google One-Tap initialization warning:', err)
      }
    }

    // Check if script is already present
    if (window.google?.accounts?.id) {
      initializeOneTap()
      return
    }

    // Load Google Identity Services script
    const existingScript = document.getElementById('google-gsi-client')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'google-gsi-client'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeOneTap()
      }
      document.head.appendChild(script)
    } else {
      existingScript.addEventListener('load', initializeOneTap)
    }

    return () => {
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.cancel()
        }
      } catch {}
    }
  }, [clientId, targetRole, router])

  return null
}
