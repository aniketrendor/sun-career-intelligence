import { redirect } from 'next/navigation'

export default function FresherPage() {
  redirect('/login?portal=student')
}
