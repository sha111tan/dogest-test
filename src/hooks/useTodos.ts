import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { enqueueSync } from '../sync/syncService'
import type { Todo } from '../types'
import { createId } from '../utils/id'

export function useTodos() {
  const todos = useLiveQuery(() => db.todos.orderBy('createdAt').reverse().toArray(), [], [])

  const addTodo = async (title: string) => {
    const now = Date.now()
    const todo: Todo = {
      id: createId(),
      title: title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    }

    await db.todos.add(todo)
    await enqueueSync('todo', todo.id, 'create', todo)
  }

  const toggleTodo = async (id: string) => {
    const todo = await db.todos.get(id)
    if (!todo) return

    const updated: Todo = {
      ...todo,
      completed: !todo.completed,
      updatedAt: Date.now(),
      syncStatus: 'pending',
    }

    await db.todos.put(updated)
    await enqueueSync('todo', id, 'update', updated)
  }

  const deleteTodo = async (id: string) => {
    await db.todos.delete(id)
    await enqueueSync('todo', id, 'delete', { id })
  }

  return {
    todos: todos ?? [],
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
