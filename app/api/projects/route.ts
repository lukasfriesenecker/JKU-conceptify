import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { id, title, description, concepts, connections } = body

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('projects')

    const now = new Date()

    if (id) {
      const result = await collection.updateOne(
        { _id: new ObjectId(id), userId },
        {
          $set: {
            title,
            description,
            concepts,
            connections,
            updatedAt: now,
          },
        }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ status: 404 })
      }

      return NextResponse.json({ id, title, description, updatedAt: now })
    } else {
      const result = await collection.insertOne({
        userId,
        title,
        description,
        concepts,
        connections,
        createdAt: now,
        updatedAt: now,
      })

      return NextResponse.json({
        id: result.insertedId.toString(),
        title,
        description,
        createdAt: now,
        updatedAt: now,
      })
    }
  } catch (error) {
    return NextResponse.json({ status: 500 })
  }
}
