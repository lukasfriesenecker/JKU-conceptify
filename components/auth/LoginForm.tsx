'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { AuthKeyboard } from '@/components/keyboard/AuthKeyboard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeInput, setActiveInput] = useState<'email' | 'password' | null>(
    null
  )

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveInput(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { data, error: signinError } = await authClient.signIn.email({
      email,
      password,
    })

    setIsLoading(false)

    if (signinError) {
      setError('Ungültige E-Mail oder Passwort.')
    } else {
      router.push('/')
    }
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
      ref={containerRef}
    >
      <Card>
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>
            Geben Sie Ihre E-Mail-Adresse ein, um sich mit Ihrem Konto
            anzumelden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="text-destructive text-sm font-medium">
                  {error}
                </div>
              )}
              <Field className="relative">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@mustermann.at"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveInput('email')}
                  ref={emailInputRef}
                />

                {activeInput === 'email' && (
                  <AuthKeyboard
                    value={email}
                    onChange={setEmail}
                    onKeyPress={(btn) => {
                      if (btn === '{enter}') setActiveInput(null)
                    }}
                    onSave={() => setActiveInput(null)}
                    inputRef={emailInputRef}
                  />
                )}
              </Field>
              <Field className="relative">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Passwort</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveInput('password')}
                  ref={passwordInputRef}
                />

                {activeInput === 'password' && (
                  <AuthKeyboard
                    value={password}
                    onChange={setPassword}
                    onKeyPress={(btn) => {
                      if (btn === '{enter}') setActiveInput(null)
                    }}
                    onSave={() => setActiveInput(null)}
                    inputRef={passwordInputRef}
                  />
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Anmelden...' : 'Anmelden'}
                </Button>
                <FieldDescription className="text-center">
                  Noch kein Konto?{' '}
                  <Link href="/signup" className="text-primary hover:underline">
                    Registrieren
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
