import Dexie, { type EntityTable } from 'dexie'
import type { Note, SyncQueueItem, Todo } from '../types'

export class DogestDatabase extends Dexie {
  todos!: EntityTable<Todo, 'id'>

  notes!: EntityTable<Note, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('DogestApp')

    this.version(1).stores({
      todos: 'id, syncStatus, createdAt, updatedAt',
      notes: 'id, syncStatus, updatedAt, *tags',
      syncQueue: '++id, entityType, entityId, createdAt',
    })
  }
}

export const db = new DogestDatabase()
