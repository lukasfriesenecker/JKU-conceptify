"use client";

import { useState, useEffect } from "react";
import Canvas from "@/components/Canvas";
import Image from "next/image";

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <Image
            src="/logo.svg"
            alt="Conceptify Logo"
            width={80}
            height={80}
            className="animate-bounce"
            priority
          />
          <div className="text-muted-foreground font-medium text-sm tracking-wide">
            Lade Conceptify...
          </div>
        </div>
      </div>
    );
  }

  return <Canvas />;
}

export default App;
