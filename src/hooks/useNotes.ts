import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { enqueueSync } from '../sync/syncService'
import type { Note } from '../types'
import { createId } from '../utils/id'

export function useNotes() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [], [])

  const tags = useMemo(() => {
    const tagSet = new Set<string>()
    ;(notes ?? []).forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)))
    return [...tagSet].sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (notes ?? []).filter((note) => {
      const matchesTag = activeTag ? note.tags.includes(activeTag) : true
      const matchesSearch =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))

      return matchesTag && matchesSearch
    })
  }, [notes, search, activeTag])

  const saveNote = async (input: { id?: string; title: string; content: string; tags: string[] }) => {
    const now = Date.now()
    const normalizedTags = [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]

    if (input.id) {
      const existing = await db.notes.get(input.id)
      if (!existing) return

      const updated: Note = {
        ...existing,
        title: input.title.trim() || 'Без названия',
        content: input.content.trim(),
        tags: normalizedTags,
        updatedAt: now,
        syncStatus: 'pending',
      }

      await db.notes.put(updated)
      await enqueueSync('note', updated.id, 'update', updated)
      return updated
    }

    const note: Note = {
      id: createId(),
      title: input.title.trim() || 'Без названия',
      content: input.content.trim(),
      tags: normalizedTags,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    }

    await db.notes.add(note)
    await enqueueSync('note', note.id, 'create', note)
    return note
  }

  const deleteNote = async (id: string) => {
    await db.notes.delete(id)
    await enqueueSync('note', id, 'delete', { id })
  }

  return {
    notes: filteredNotes,
    allNotes: notes ?? [],
    tags,
    search,
    setSearch,
    activeTag,
    setActiveTag,
    saveNote,
    deleteNote,
  }
}
