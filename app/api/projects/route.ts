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
    const { id, title, description, concepts, connections, thumbnail } = body

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
            thumbnail,
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
        thumbnail,
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

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('id')

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('projects')

    if (projectId) {
      const project = await collection.findOne({
        _id: new ObjectId(projectId),
        userId,
      })

      if (!project) {
        return NextResponse.json({ status: 404 })
      }

      return NextResponse.json({
        id: project._id.toString(),
        title: project.title,
        description: project.description,
        concepts: project.concepts,
        connections: project.connections,
        updatedAt: project.updatedAt,
      })
    }

    const projects = await collection
      .find({ userId })
      .project({ _id: 1, title: 1, description: 1, thumbnail: 1, updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .toArray()

    const formattedProjects = projects.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail,
      updatedAt: p.updatedAt,
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    return NextResponse.json({ status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('id')
    
    if (!projectId) {
      return NextResponse.json({ status: 404 })
    }

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('projects')

    const result = await collection.deleteOne({
      _id: new ObjectId(projectId),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ status: 404 })
    }

    return NextResponse.json({ status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 500 })
  }
}
