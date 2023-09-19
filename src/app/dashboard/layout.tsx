type DashboardLayoutProps = {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <div className="max-w-5xl m-auto w-full px-4">{children}</div>
}

// Path: src/app/dashboard/layout.tsx
// Created at: 15:42:06 - 19/09/2023
// Language: Typescript
// Framework: React/Next.js
