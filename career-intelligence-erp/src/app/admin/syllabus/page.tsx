import { redirect } from 'next/navigation'

export default function AdminSyllabusPage() {
  redirect('/admin/programs?tab=syllabus')
}
