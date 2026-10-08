import { redirect } from 'next/navigation'

export default function FresherTestPage() {
  redirect('/student/assessment?start=true&track=UG')
}
