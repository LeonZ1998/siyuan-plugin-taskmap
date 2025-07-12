export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'monthly'
  targetDays: number
  currentStreak?: number
  longestStreak?: number
  totalCheckIns?: number
  checkInHistory?: { date: string; timestamp: number }[]
  lastCheckIn?: string
  description?: string
  createdAt?: number
  updatedAt?: number
} 