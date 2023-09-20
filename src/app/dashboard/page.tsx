import Link from 'next/link'
import {
  createCheckoutLink,
  createCustomerIfNull,
  hasSubscription,
  stripe,
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

  const topTenRecentLogs = await prisma.log.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  let current_usage = 0

  if (hasSub) {
    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    })

    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptions.data.at(0)?.id,
    })

    current_usage = invoice.amount_due / 100
  }

  return (
    <>
      {hasSub ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="px-4 py-2 rounded-md text-xs bg-emerald-400 font-medium text-white">
              You have a subscription!
            </div>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4">CURRENT USAGE</p>
              <p className="text-sm text-mono text-zinc-800 py-6 px-4">
                {current_usage}
              </p>
            </div>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4">API KEY</p>
              <p className="text-sm text-mono text-zinc-800 py-6 px-4">
                {user?.api_key}
              </p>
            </div>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4">RECENT LOGS</p>

              <ul className="text-sm text-mono text-zinc-800 py-6 px-4">
                {topTenRecentLogs.map((log: any) => (
                  <li key={log.id} className="flex gap-4">
                    <p>{log.method}</p>
                    <p> {log.status}</p>
                    <p> {log.createdAt.toDateString()}</p>
                  </li>
                ))}
              </ul>
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
