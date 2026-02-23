'use client'

import { useState, useEffect } from 'react'
import Canvas from '@/components/Canvas'
import Image from 'next/image'

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-background text-foreground flex h-screen w-screen items-center justify-center transition-colors duration-300">
        <div className="animate-in fade-in flex flex-col items-center gap-4 duration-500">
          <Image
            src="/logo.svg"
            alt="Conceptify Logo"
            width={80}
            height={80}
            className="animate-bounce"
            priority
          />
          <div className="text-muted-foreground text-sm font-medium tracking-wide">
            Lade Conceptify...
          </div>
        </div>
      </div>
    )
  }

  return <Canvas />
}

export default App
