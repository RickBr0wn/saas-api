import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '~/pages/api/auth/[...nextauth]'

import { randomUUID } from 'crypto'
import { PrismaClient } from '@prisma/client'

// create a new instance of the Prisma client
const prisma = new PrismaClient()

// create a new instance of the Stripe API client
export const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: '2023-08-16',
})

// price id: price_1Ns6BHFPzMEjf1H9WxDm3wot

// create a checkout link
export async function createCheckoutLink(customer: string) {
  const checkout = await stripe.checkout.sessions.create({
    success_url: 'http://localhost:3000/dashboard/billing?success=true',
    cancel_url: 'http://localhost:3000/dashboard/billing?success=true',
    customer,
    line_items: [
      {
        price: 'price_1Ns6BHFPzMEjf1H9WxDm3wot',
      },
    ],
    mode: 'subscription',
  })

  return checkout.url
}

// verify that the user has a subscription
export async function hasSubscription() {
  // get the user's session
  const session = await getServerSession(authOptions)

  if (session) {
    // get the user from the database using their email address
    const user = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
      },
    })

    // get the user's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    })

    // return true if the user has subscriptions
    return subscriptions.data.length > 0
  }

  // return false if the user doesn't have a session
  return false
}

export async function createCustomerIfNull() {
  // get the user's session
  const session = await getServerSession(authOptions)

  if (session) {
    // get the user from the database using their email address
    const user = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
      },
    })

    // if the user doesn't have an api_key, create one
    if (!user?.api_key) {
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          api_key: 'secret_' + randomUUID(),
        },
      })
    }

    // if the user doesn't have a stripe_customer_id, create one
    if (!user?.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: String(user?.email),
      })

      // update the user in the database with the new stripe_customer_id
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          stripe_customer_id: customer.id,
        },
      })
    }

    // re-fetch the user from the database with the new stripe_customer_id
    const updatedUser = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
      },
    })

    // return the user's stripe_customer_id
    return updatedUser?.stripe_customer_id
  }
}
