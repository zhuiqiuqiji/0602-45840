import type { LeaderboardEntry } from '@/types/game'

const LEADERBOARD_KEY = 'slow_bike_leaderboard'

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load leaderboard:', e)
  }
  return []
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries))
  } catch (e) {
    console.error('Failed to save leaderboard:', e)
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0],
  }

  const leaderboard = getLeaderboard()
  leaderboard.push(newEntry)
  leaderboard.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? -1 : 1
    }
    return b.time - a.time
  })

  const topEntries = leaderboard.slice(0, 10)
  saveLeaderboard(topEntries)

  return newEntry
}

export function clearLeaderboard(): void {
  localStorage.removeItem(LEADERBOARD_KEY)
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
