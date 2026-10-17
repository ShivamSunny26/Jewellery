import { useEffect, useState } from 'react'

const WISHLIST_KEY = 'soj.wishlist'
const RECENT_KEY = 'soj.recent'
const MAX_RECENT = 8

const listeners = new Set()

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((fn) => fn())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getWishlist() {
  return read(WISHLIST_KEY, [])
}

export function isWishlisted(id) {
  return getWishlist().some((w) => w.id === id)
}

export function toggleWishlist(item) {
  const list = getWishlist()
  const exists = list.some((w) => w.id === item.id)
  const next = exists ? list.filter((w) => w.id !== item.id) : [{ ...item }, ...list]
  write(WISHLIST_KEY, next.slice(0, 100))
  return !exists
}

export function getRecent() {
  return read(RECENT_KEY, [])
}

export function pushRecent(item) {
  const next = [{ ...item, seen_at: Date.now() }, ...getRecent().filter((r) => r.id !== item.id)]
  write(RECENT_KEY, next.slice(0, MAX_RECENT))
}

export function useWishlist() {
  const [list, setList] = useState(getWishlist)
  useEffect(() => subscribe(() => setList(getWishlist())), [])
  return {
    list,
    has: (id) => list.some((w) => w.id === id),
    toggle: (item) => toggleWishlist(item)
  }
}
