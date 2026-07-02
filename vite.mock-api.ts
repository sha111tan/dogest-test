import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect } from 'vite'
import type { Plugin } from 'vite'
import type { SyncDeletion, SyncPayload } from './src/types/index.ts'

const emptyPayload = (): SyncPayload => ({
  todos: [],
  notes: [],
})

function applyDeletions(current: SyncPayload, deletions: SyncDeletion[]): SyncPayload {
  const deletedTodos = new Set(deletions.filter((item) => item.entityType === 'todo').map((item) => item.entityId))
  const deletedNotes = new Set(deletions.filter((item) => item.entityType === 'note').map((item) => item.entityId))

  return {
    todos: current.todos.filter((item) => !deletedTodos.has(item.id)),
    notes: current.notes.filter((item) => !deletedNotes.has(item.id)),
  }
}

function mergePayload(current: SyncPayload, incoming: SyncPayload): SyncPayload {
  const base = incoming.deletions?.length ? applyDeletions(current, incoming.deletions) : current

  const mergeById = <T extends { id: string; updatedAt?: number; createdAt?: number }>(
    existing: T[],
    items: T[],
    getTimestamp: (item: T) => number,
  ) => {
    const map = new Map(existing.map((item) => [item.id, item]))

    items.forEach((item) => {
      const local = map.get(item.id)
      if (!local || getTimestamp(local) <= getTimestamp(item)) {
        map.set(item.id, item)
      }
    })

    return [...map.values()]
  }

  return {
    todos: mergeById(base.todos, incoming.todos ?? [], (item) => item.updatedAt ?? item.createdAt ?? 0),
    notes: mergeById(base.notes, incoming.notes ?? [], (item) => item.updatedAt ?? item.createdAt ?? 0),
  }
}

function attachMockApi(
  server: { middlewares: Connect.Server },
  storage: SyncPayload,
) {
  server.middlewares.use('/api/sync', (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(storage))
      return
    }

    if (req.method === 'POST') {
      let body = ''

      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })

      req.on('end', () => {
        try {
          const payload = JSON.parse(body) as SyncPayload
          Object.assign(storage, mergePayload(storage, payload))
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, syncedAt: Date.now() }))
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid payload' }))
        }
      })

      return
    }

    res.statusCode = 405
    res.end()
  })
}

export function mockSyncApiPlugin(): Plugin {
  const storage = emptyPayload()

  return {
    name: 'mock-sync-api',
    configureServer(server) {
      attachMockApi(server, storage)
    },
    configurePreviewServer(server) {
      attachMockApi(server, storage)
    },
  }
}
