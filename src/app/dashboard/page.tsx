import Link from 'next/link'
import {
  createCheckoutLink,
  createCustomerIfNull,
  hasSubscription,
} from '~/lib/stripe'

import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '~/pages/api/auth/[...nextauth]'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const hasSub = await hasSubscription()
  const customerId = await createCustomerIfNull()
  const checkoutLink = await createCheckoutLink(String(customerId))

  const user = await prisma.user.findFirst({
    where: { email: session?.user?.email },
  })

  return (
    <>
      {hasSub ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="px-4 py-2 rounded-md text-xs bg-emerald-400 font-medium text-white">
              You have a subscription!
            </div>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4">API KEY</p>
              <p className="text-sm text-mono text-zinc-800 py-6 px-4">
                {user?.api_key}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[60vh] grid place-items-center rounded-lg px-6 py-10 bg-slate-100">
            <Link
              href={String(checkoutLink)}
              className="font-medium text-base hover:underline"
            >
              You have no subscription. Checkout now!
            </Link>
          </div>
        </>
      )}
    </>
  )
}

// Path: src/app/dashboard/page.tsx
// Created at: 15:44:10 - 19/09/2023
// Language: Typescript
// Framework: React/Next.js
