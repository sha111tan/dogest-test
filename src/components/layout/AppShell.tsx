import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-dvh pt-[calc(12px+env(safe-area-inset-top))] pr-[calc(6px+env(safe-area-inset-right))] pb-[calc(88px+env(safe-area-inset-bottom))] pl-[calc(6px+env(safe-area-inset-left))]">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-bg-subtle"
        aria-hidden="true"
      />
      <div className="relative z-1 mx-auto max-w-[560px]">{children}</div>
    </div>
  )
}

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <motion.header
      className="mb-3"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="gap-1 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-1 rounded-[14px] border border-slate-900/6 bg-white px-4 py-8 shadow-card backdrop-blur-md">
          <h1 className="m-0 text-[24px] font-[600] ">{title}</h1>
          {subtitle ? <p className=" mb-0 text-[14px] text-muted">{subtitle}</p> : null}
        </div>
      </div>
    </motion.header>
  )
}

interface OfflineBannerProps {
  isOnline: boolean
  isSyncing: boolean
}

export function OfflineBanner({ isOnline, isSyncing }: OfflineBannerProps) {
  return (
    <motion.div
      className={`mb-4 flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-[0.85rem] backdrop-blur-md [transform:translateZ(0)] ${
        isOnline ? 'bg-emerald-500/12 text-emerald-700' : 'bg-amber-500/14 text-amber-700'
      }`}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <span className="size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <span>
        {isSyncing
          ? 'Синхронизация данных...'
          : isOnline
            ? 'Онлайн - данные синхронизируются'
            : 'Оффлайн - изменения сохраняются локально'}
      </span>
    </motion.div>
  )
}
