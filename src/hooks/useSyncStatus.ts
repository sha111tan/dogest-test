import { useEffect, useState } from 'react'
import { subscribeSyncStatus } from '../sync/syncService'

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => subscribeSyncStatus(setIsSyncing), [])

  return isSyncing
}
