import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTodos } from '../../hooks/useTodos'

const cardClass =
  'rounded-[14px] border border-slate-900/6 bg-surface shadow-card'
const inputClass =
  'w-full rounded-[14px] border border-slate-900/6 bg-white px-4 py-3.5 text-inherit outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary/55 focus:shadow-[0_0_0_4px] focus:shadow-primary/12'

function TodoProgressRing({ percentage }: { percentage: number }) {
  const radius = 25
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg className="size-14 shrink-0" viewBox="0 0 56 56" aria-hidden="true">
      <circle className="fill-none stroke-slate-900/6 stroke-[5]" cx="28" cy="28" r={radius} />
      <motion.circle
        className="origin-center -rotate-90 fill-none stroke-primary stroke-[5] [stroke-linecap:round]"
        cx="28"
        cy="28"
        r={radius}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <text x="28" y="32" textAnchor="middle" className="fill-slate-700 text-[10px] font-bold">
        {percentage}%
      </text>
    </svg>
  )
}

export function TodosPage() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos()
  const [title, setTitle] = useState('')

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

    return { total, completed, percentage }
  }, [todos])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    await addTodo(title)
    setTitle('')
  }

  return (
    <section className="flex flex-col gap-1.5">
      <article
        className="flex items-center gap-1.5"
        
      >
        <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }} className={`${cardClass} min-w-0 flex-1 p-3.5`}>
          <p className="m-0 text-[0.85rem] text-muted">Прогресс задач</p>
          <p className="m-0 mt-1 text-[1.05rem] font-semibold">
            {stats.completed} из {stats.total} выполнено
          </p>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-900/6">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary to-primary-light"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }} className={`${cardClass} p-5`}>
        <TodoProgressRing  percentage={stats.percentage} />
        </motion.div>
        
      </article>

      <motion.form
        className={`${cardClass} flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center`}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <input
          className={inputClass}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Введите название..."
          enterKeyHint="done"
          autoComplete="off"
        />
        <motion.button
          type="submit"
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[14px] border-none bg-primary px-4.5 font-semibold text-on-accent shadow-soft transition-[transform,opacity,background] duration-150 disabled:cursor-not-allowed disabled:opacity-55"
          whileTap={{ scale: 0.96 }}
          disabled={!title.trim()}
        >
          Добавить
        </motion.button>
      </motion.form>

      <motion.div
        className="flex flex-col gap-1.5 pt-1.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <AnimatePresence mode="popLayout">
          {todos.length === 0 ? (
            <motion.div
              key="empty"
              className={`${cardClass} flex flex-col items-center gap-2.5 px-5 py-7 text-center text-muted`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <span className="text-[2rem]" aria-hidden="true">
                🐕
              </span>
              <p>Добавьте свою первую задачу - например "записаться к ветеринару"</p>
            </motion.div>
          ) : (
            todos.map((todo) => (
              <motion.article
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className={`${cardClass} flex items-center gap-3 p-3.5 ${todo.completed ? 'opacity-72' : ''}`}
              >
                <button
                  type="button"
                  className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${
                    todo.completed
                      ? 'border-primary bg-primary text-on-accent'
                      : 'border-primary/45 bg-white'
                  }`}
                  onClick={() => void toggleTodo(todo.id)}
                  aria-label={todo.completed ? 'Отметить невыполненной' : 'Отметить выполненной'}
                >
                  <motion.span initial={false} animate={{ scale: todo.completed ? 1 : 0.85 }}>
                    {todo.completed ? '✓' : ''}
                  </motion.span>
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`m-0 break-words ${todo.completed ? 'line-through' : ''}`}>
                    {todo.title}
                  </p>
                  
                </div>

                <motion.button
                  type="button"
                  className="grid size-10 place-items-center rounded-xl border-none bg-slate-900/5 text-inherit"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => void deleteTodo(todo.id)}
                  aria-label="Удалить задачу"
                >
                  ✕
                </motion.button>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
