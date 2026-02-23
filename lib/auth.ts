import { betterAuth } from 'better-auth'
import clientPromise from './mongodb'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'

const client = await clientPromise
const db = client.db()

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
})
