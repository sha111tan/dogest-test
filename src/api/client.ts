import type { SyncPayload } from '../types'

const API_BASE = '/api'

export async function pushSyncPayload(payload: SyncPayload): Promise<void> {
  const response = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Sync failed with status ${response.status}`)
  }
}

export async function pullSyncPayload(): Promise<SyncPayload | null> {
  const response = await fetch(`${API_BASE}/sync`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Pull failed with status ${response.status}`)
  }

  return response.json() as Promise<SyncPayload>
}
