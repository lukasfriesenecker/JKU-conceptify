import { LoginForm } from '@/components/auth/LoginForm'

export default function Page() {
  return (
    <div className="bg-dot-pattern flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
