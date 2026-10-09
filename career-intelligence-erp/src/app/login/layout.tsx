import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Career Intelligence System',
  description: 'Sign in to access your Career Intelligence student, mentor, or admin portal.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* High-priority preload links in HTML head for instant 0.1ms network start */}
      <link
        rel="preload"
        as="image"
        href="/student-thinking-boy-opt.webp"
        type="image/webp"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/student-thinking-opt.webp"
        type="image/webp"
        fetchPriority="high"
      />
      {children}
    </>
  )
}
