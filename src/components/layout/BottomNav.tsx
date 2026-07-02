import { motion } from 'framer-motion'
import type { TabId } from '../../types'

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'todos', label: '', icon: '✓' },
  { id: 'notes', label: '', icon: '📝' },
]

interface BottomNavProps {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-[calc(10px+env(safe-area-inset-bottom))] z-25 mx-auto grid w-[min(calc(100%-24px),160px)] grid-cols-2 gap-1.5 rounded-[22px] border border-slate-900/6 bg-white/92  shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      aria-label="Основная навигация"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            type="button"
            className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border-none bg-transparent ${
              isActive ? 'text-on-accent' : 'text-muted'
            }`}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive ? (
              <motion.span
                layoutId="nav-indicator"
                className="absolute inset-1 -z-1 rounded-[20px] border-2 border-slate-900/6 bg-accent"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="text-base" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="text-[0.72rem] font-semibold">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
