"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.")
      return
    }

    setIsLoading(true)

    const { data, error: signupError } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    setIsLoading(false)

    if (signupError) {
      setError("Bei der Registrierung ist ein Fehler aufgetreten.")
    } else {
      router.push("/")
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Registrieren</CardTitle>
        <CardDescription>
          Geben Sie Ihre Daten ein, um ein Konto zu erstellen
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
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input 
                id="name" 
                type="text" 
                placeholder="Max Mustermann" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="max@mustermann.at"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Passwort</FieldLabel>
              <Input 
                id="password" 
                type="password" 
                placeholder="********"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription>
                Mindestens 8 Zeichen lang.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Passwort bestätigen
              </FieldLabel>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="********"
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FieldDescription>Bitte bestätigen Sie Ihr Passwort.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Account wird erstellt..." : "Account erstellen"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Sie haben bereits einen Account? <Link href="/login" className="hover:underline text-primary">Anmelden</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
