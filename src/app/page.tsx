// app/page.tsx - Redirect Root to Borrow Step 1
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/equipment/borrow/step1')
}
