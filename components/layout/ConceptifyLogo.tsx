import Link from 'next/link'

function ConceptifyLogo() {
  return (
    <Link href="/">
      <div className="bg-card hover:bg-accent hover:text-accent-foreground absolute top-4 left-4 z-50 hidden h-[54px] cursor-pointer items-center gap-3 rounded-sm border px-4 shadow-2xl transition-colors xl:flex">
        <svg
          className="h-7 w-7"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="80"
            y="86"
            width="320"
            height="120"
            rx="3"
            fill="currentColor"
          />
          <rect
            x="400"
            y="594"
            width="320"
            height="120"
            rx="3"
            fill="currentColor"
          />
          <line
            x1="242.115"
            y1="144.668"
            x2="562.115"
            y2="652.668"
            stroke="currentColor"
            strokeWidth="5"
          />
          <rect
            x="281"
            y="368"
            width="237"
            height="63"
            rx="31.5"
            fill="currentColor"
          />
        </svg>
        <div className="flex flex-col items-start">
          <span className="text-sm leading-tight font-medium">Conceptify</span>
          <span className="text-muted-foreground text-[11px] leading-tight">
            Concept Mapping Tool
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ConceptifyLogo
