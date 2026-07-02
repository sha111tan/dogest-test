import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AppShell, Header, OfflineBanner } from './components/layout/AppShell'
import { BottomNav } from './components/layout/BottomNav'
import { NotesPage } from './components/notes/NotesPage'
import { TodosPage } from './components/todos/TodosPage'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { useSyncStatus } from './hooks/useSyncStatus'
import { initSyncListeners } from './sync/syncService'
import type { TabId } from './types'

const tabMeta: Record<TabId, { title: string; subtitle: string }> = {
  todos: {
    title: 'Список задач',
    subtitle: 'Задачи по уходу за питомцем',
  },
  notes: {
    title: 'Заметки',
    subtitle: 'Записи о вашем питомце',
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('todos')
  const isOnline = useNetworkStatus()
  const isSyncing = useSyncStatus()

  useEffect(() => initSyncListeners(), [])

  const meta = tabMeta[activeTab]

  return (
    <AppShell>
      <Header title={meta.title} subtitle={meta.subtitle} />
      <OfflineBanner isOnline={isOnline} isSyncing={isSyncing} />

      <main className="min-h-[calc(100dvh-220px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {activeTab === 'todos' ? <TodosPage /> : null}
            {activeTab === 'notes' ? <NotesPage /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </AppShell>
  )
}

export default App
