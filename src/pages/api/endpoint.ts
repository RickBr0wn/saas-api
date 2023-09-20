import { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient } from '@prisma/client'
import { stripe } from '~/lib/stripe'
import { randomUUID } from 'crypto'

// create an instance of the Prisma client
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: send the api_key in the header (Bearer token) instead of the query string
  const { api_key } = req.query

  // return a 401 if the api_key is not provided
  if (!api_key) {
    return res.status(401).json({ status: 401, message: 'Unauthorized' })
  }

  // get the user from the database using the api_key
  const user = await prisma.user.findFirst({
    where: {
      api_key: String(api_key),
    },
  })

  // retrieve the customer from Stripe using the stripe_customer_id
  const customer = await stripe.customers.retrieve(
    String(user?.stripe_customer_id)
  )

  // get the user's subscriptions from Stripe
  const subscription = await stripe.subscriptions.list({
    customer: String(user?.stripe_customer_id),
  })

  // get the user's subscription item
  const item = subscription.data.at(0)?.items.data.at(0)

  // return a 403 if the user has no subscription
  if (!item) {
    return res
      .status(403)
      .json({ status: 403, message: 'You have no subscription.' })
  }

  // create a usage record for the subscription item
  const result = await stripe.subscriptionItems.createUsageRecord(item.id, {
    quantity: 1,
    timestamp: Math.floor(Date.now() / 1000),
  })

  const data = randomUUID()

  // return the result
  return res.status(200).json({ status: 200, data })
}

// Path: src/pages/api/auth/endpoint.ts
// Created at: 18:36:54 - 19/09/2023
// Language: Typescript
// Framework: React/Next.js
