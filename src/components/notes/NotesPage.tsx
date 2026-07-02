import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNotes } from '../../hooks/useNotes'
import type { Note } from '../../types'

const cardClass =
  'rounded-[14px] border border-slate-900/6 bg-surface shadow-card'
const inputClass =
  'w-full rounded-[14px] border border-slate-900/6 bg-white px-4 py-3.5 text-inherit outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary/55 focus:shadow-[0_0_0_4px] focus:shadow-primary/12'

function NoteEditor({
  note,
  onClose,
  onSave,
  onDelete,
}: {
  note?: Note
  onClose: () => void
  onSave: (input: { id?: string; title: string; content: string; tags: string[] }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') ?? '')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    await onSave({ id: note?.id, title, content, tags })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-30 grid place-items-end bg-slate-900/42 p-4 pt-4 pr-[calc(16px+env(safe-area-inset-right))] pb-[calc(16px+env(safe-area-inset-bottom))] pl-[calc(16px+env(safe-area-inset-left))] sm:place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        className={`${cardClass} flex w-full max-w-[560px] flex-col gap-3 rounded-t-3xl rounded-b-[18px] p-4.5 sm:rounded-3xl`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[1.05rem]">{note ? 'Редактировать заметку' : 'Новая заметка'}</h2>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border-none bg-slate-900/5 text-inherit"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <input
          className={inputClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Заголовок"
        />
        <textarea
          className={`${inputClass} min-h-[140px] resize-y`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Описание..."
          rows={6}
        />
        <input
          className={inputClass}
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          placeholder="Теги через запятую"
        />

        <div className="flex justify-end gap-2.5">
          {note && onDelete ? (
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] border-none bg-accent px-4.5 font-semibold text-white"
              onClick={() => void onDelete(note.id).then(onClose)}
            >
              Удалить
            </button>
          ) : null}
          <motion.button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-[14px] border-none bg-primary px-4.5 font-semibold text-on-accent shadow-soft"
            whileTap={{ scale: 0.97 }}
          >
            Сохранить
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  )
}

export function NotesPage() {
  const {
    notes,
    allNotes,
    tags,
    search,
    setSearch,
    activeTag,
    setActiveTag,
    saveNote,
    deleteNote,
  } = useNotes()

  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | undefined>()

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    allNotes.forEach((note) => {
      note.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      })
    })
    return counts
  }, [allNotes])

  const openCreate = () => {
    setSelectedNote(undefined)
    setEditorOpen(true)
  }

  const openEdit = (note: Note) => {
    setSelectedNote(note)
    setEditorOpen(true)
  }

  return (
    <section className="flex flex-col gap-3">
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-stretch gap-1">
          <input
            className={`${inputClass} min-w-0 flex-1`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск заметок..."
            enterKeyHint="search"
          />
          <motion.button
            type="button"
            className="grid size-[50px] shrink-0 place-items-center rounded-[14px] border-none bg-primary text-[1.75rem] leading-none text-on-accent shadow-soft"
            whileTap={{ scale: 0.94 }}
            onClick={openCreate}
            aria-label="Создать заметку"
          >
            +
          </motion.button>
        </div>
      </motion.div>

      {tags.length > 0 ? (
        <motion.div
          className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="toolbar"
          aria-label="Фильтр по тегам"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            type="button"
            className={`flex shrink-0 min-h-9 items-center gap-2 rounded-full border border-slate-900/6 bg-white px-3.5 whitespace-nowrap text-slate-700 ${
              activeTag === null ? 'border-primary/35 bg-primary/14 text-primary' : ''
            }`}
            onClick={() => setActiveTag(null)}
          >
            Все
            <span
              className={`grid size-6 min-w-6 place-items-center rounded-full text-[0.72rem] font-semibold tabular-nums ${
                activeTag === null ? 'bg-primary text-on-accent' : 'bg-slate-900/6 text-slate-600'
              }`}
            >
              {allNotes.length}
            </span>
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`flex shrink-0 min-h-9 items-center gap-2 rounded-full border border-slate-900/6 bg-white px-3.5 whitespace-nowrap text-slate-700 ${
                activeTag === tag ? 'border-primary/35 bg-primary/14 text-primary' : ''
              }`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
              <span
                className={`grid size-6 min-w-6 place-items-center rounded-full text-[0.72rem] font-semibold tabular-nums ${
                  activeTag === tag ? 'bg-primary text-on-accent' : 'bg-slate-900/6 text-slate-600'
                }`}
              >
                {tagCounts.get(tag) ?? 0}
              </span>
            </button>
          ))}
        </motion.div>
      ) : null}

      <motion.div
        className="flex flex-col gap-1.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: tags.length > 0 ? 0.3 : 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {notes.length === 0 ? (
            <motion.div
              key="empty-notes"
              className={`${cardClass} flex flex-col items-center gap-2.5 px-5 py-7 text-center text-muted`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-[2rem]" aria-hidden="true">
                📒
              </span>
              <p>Добавьте первую заметку - например "совет ветеринара"</p>
            </motion.div>
          ) : (
            notes.map((note) => (
              <motion.button
                key={note.id}
                type="button"
                layout
                className={`${cardClass} w-full p-4 text-left`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => openEdit(note)}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="m-0 font-[400] text-[16px]">{note.title}</h3>
                  
                </div>
                <p className="pt-1 pb-2 line-clamp-3 text-muted font-[300] text-[12px]">{note.content || 'Пустая заметка'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="pointer-events-none min-h-6 rounded-full border border-slate-900/6 bg-accent p-1 px-2.5 text-[10px] text-on-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {editorOpen ? (
          <NoteEditor
            note={selectedNote}
            onClose={() => setEditorOpen(false)}
            onSave={async (input) => {
              await saveNote(input)
            }}
            onDelete={deleteNote}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
