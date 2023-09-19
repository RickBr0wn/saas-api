import Link from 'next/link'

export default function Header() {
  return (
    <nav className="max-w-5xl m-auto w-full px-4">
      <div className="flex items-center justify-between gap-8 py-4">
        <Link href="/">
          <div className="text-2xl font-bold text-black hover:opacity-70">
            LOGO
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/#features">
            <div className="font-medium text-sm text-black hover:opacity-70">
              Features
            </div>
          </Link>
          <Link href="/#pricing">
            <div className="font-medium text-sm text-black hover:opacity-70">
              Pricing
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="font-medium text-sm text-white bg-black px-4 py-2 rounded-full hover:opacity-70">
              Dashboard
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// Path: src/components/header.tsx
// Created at: 15:30:02 - 19/09/2023
// Language: Typescript
// Framework: React/Next.js
