import { pullSyncPayload, pushSyncPayload } from '../api/client'
import { db } from '../db/database'
import type { EntityType, SyncAction, SyncDeletion, SyncPayload, SyncQueueItem } from '../types'

let syncInProgress = false
let syncListeners: Array<(syncing: boolean) => void> = []

function notifySyncing(syncing: boolean) {
  syncListeners.forEach((listener) => listener(syncing))
}

export function subscribeSyncStatus(listener: (syncing: boolean) => void): () => void {
  syncListeners.push(listener)
  return () => {
    syncListeners = syncListeners.filter((item) => item !== listener)
  }
}

export async function enqueueSync(
  entityType: EntityType,
  entityId: string,
  action: SyncAction,
  payload: unknown,
): Promise<void> {
  await db.syncQueue.add({
    entityType,
    entityId,
    action,
    payload,
    createdAt: Date.now(),
    retries: 0,
  })

  if (navigator.onLine) {
    void runSync()
  }
}

export async function runSync(): Promise<void> {
  if (syncInProgress || !navigator.onLine) {
    return
  }

  syncInProgress = true
  notifySyncing(true)

  try {
    const pendingItems = await db.syncQueue.orderBy('createdAt').toArray()

    const pushedDeletions: SyncDeletion[] = []

    if (pendingItems.length > 0) {
      pushedDeletions.push(
        ...pendingItems
          .filter((item) => item.action === 'delete')
          .map((item) => ({ entityType: item.entityType, entityId: item.entityId })),
      )

      const payload = await buildSyncPayload(pendingItems)
      if (pushedDeletions.length > 0) {
        payload.deletions = pushedDeletions
      }

      await pushSyncPayload(payload)
      await markEntitiesSynced(pendingItems)
      await db.syncQueue.bulkDelete(pendingItems.map((item) => item.id!).filter(Boolean))
    }

    const remote = await pullSyncPayload()
    if (remote) {
      await mergeRemoteData(remote, pushedDeletions)
    }
  } catch {
    // Keep queue intact; retry on next online event
  } finally {
    syncInProgress = false
    notifySyncing(false)
  }
}

async function buildSyncPayload(items: SyncQueueItem[]): Promise<SyncPayload> {
  const todoIds = new Set<string>()
  const noteIds = new Set<string>()

  items.forEach((item) => {
    if (item.action === 'delete') return

    if (item.entityType === 'todo') todoIds.add(item.entityId)
    if (item.entityType === 'note') noteIds.add(item.entityId)
  })

  const [todos,  notes] = await Promise.all([
    todoIds.size ? db.todos.where('id').anyOf([...todoIds]).toArray() : [],
    
    noteIds.size ? db.notes.where('id').anyOf([...noteIds]).toArray() : [],
  ])

  return { todos, notes }
}

async function markEntitiesSynced(items: SyncQueueItem[]) {
  await Promise.all(
    items.map(async (item) => {
      if (item.action === 'delete') return

      switch (item.entityType) {
        case 'todo':
          await db.todos.update(item.entityId, { syncStatus: 'synced' })
          break
        case 'note':
          await db.notes.update(item.entityId, { syncStatus: 'synced' })
          break
      }
    }),
  )
}

async function collectPendingDeletionIds(pushedDeletions: SyncDeletion[]) {
  const pendingDeletes = await db.syncQueue.filter((item) => item.action === 'delete').toArray()

  const allDeletions = [...pushedDeletions, ...pendingDeletes.map((item) => ({
    entityType: item.entityType,
    entityId: item.entityId,
  }))]

  return {
    todos: new Set(allDeletions.filter((item) => item.entityType === 'todo').map((item) => item.entityId)),

    notes: new Set(allDeletions.filter((item) => item.entityType === 'note').map((item) => item.entityId)),
  }
}

async function mergeRemoteData(
  remote: Awaited<ReturnType<typeof pullSyncPayload>>,
  pushedDeletions: SyncDeletion[] = [],
) {
  if (!remote) return

  const deletedIds = await collectPendingDeletionIds(pushedDeletions)

  await db.transaction('rw', db.todos, db.notes, async () => {
    for (const todo of remote.todos) {
      if (deletedIds.todos.has(todo.id)) continue

      const local = await db.todos.get(todo.id)
      if (!local || local.updatedAt <= todo.updatedAt) {
        await db.todos.put({ ...todo, syncStatus: 'synced' })
      }
    }

    
    for (const note of remote.notes) {
      if (deletedIds.notes.has(note.id)) continue

      const local = await db.notes.get(note.id)
      if (!local || local.updatedAt <= note.updatedAt) {
        await db.notes.put({ ...note, syncStatus: 'synced' })
      }
    }
  })
}

export function initSyncListeners(): () => void {
  const handleOnline = () => {
    void runSync()
  }

  window.addEventListener('online', handleOnline)

  if (navigator.onLine) {
    void runSync()
  }

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}
