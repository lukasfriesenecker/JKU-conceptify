import { SignupForm } from '@/components/Signup'

export default function Page() {
  return (
    <div className="bg-dot-pattern flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
