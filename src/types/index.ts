export type SyncStatus = 'pending' | 'synced' | 'failed'

export type EntityType = 'todo' | 'note'

export type SyncAction = 'create' | 'update' | 'delete'

export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
  syncStatus: SyncStatus
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
  syncStatus: SyncStatus
}

export interface SyncQueueItem {
  id?: number
  entityType: EntityType
  entityId: string
  action: SyncAction
  payload: unknown
  createdAt: number
  retries: number
}

export type TabId = 'todos' | 'notes'

export interface SyncDeletion {
  entityType: EntityType
  entityId: string
}

export interface SyncPayload {
  todos: Todo[]
  notes: Note[]
  deletions?: SyncDeletion[]
}
