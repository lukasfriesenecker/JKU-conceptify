"use client";

import { useState, useEffect } from "react";
import Canvas from "@/components/Canvas";
import { ThemeProvider } from "@/components/ThemeProvider";

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-medium">
          Lade Conceptify...
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Canvas />
    </ThemeProvider>
  );
}

export default App;
