"use client"
import { useEffect, useState } from 'react'

interface StreakCelebrationProps {
  streak: number
  habitTitle: string
}

export default function StreakCelebration({ streak, habitTitle }: StreakCelebrationProps) {
  const [show, setShow] = useState(false)
  const [celebrationType, setCelebrationType] = useState<'week' | 'month' | 'milestone' | null>(null)

  useEffect(() => {
    // Check for milestone achievements
    if (streak === 7) {
      setCelebrationType('week')
      setShow(true)
    } else if (streak === 30) {
      setCelebrationType('month')
      setShow(true)
    } else if (streak > 0 && streak % 50 === 0) {
      setCelebrationType('milestone')
      setShow(true)
    }

    // Auto-hide after 3 seconds
    if (show) {
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [streak, show])

  if (!show || !celebrationType) return null

  const getCelebrationData = () => {
    switch (celebrationType) {
      case 'week':
        return {
          emoji: '🎯',
          title: 'One Week Strong!',
          message: `You've maintained "${habitTitle}" for 7 days straight!`,
          color: 'bg-green-500'
        }
      case 'month':
        return {
          emoji: '💪',
          title: 'Monthly Master!',
          message: `Incredible! 30 days of "${habitTitle}" - you're unstoppable!`,
          color: 'bg-blue-500'
        }
      case 'milestone':
        return {
          emoji: '🔥',
          title: 'Legendary Streak!',
          message: `${streak} days of "${habitTitle}" - you're a habit legend!`,
          color: 'bg-purple-500'
        }
    }
  }

  const celebration = getCelebrationData()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounce">
        <div className="text-6xl mb-4">{celebration.emoji}</div>
        <h3 className="text-2xl font-bold mb-2">{celebration.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{celebration.message}</p>
        <div className={`inline-block px-4 py-2 ${celebration.color} text-white rounded-full font-bold`}>
          {streak} Day Streak!
        </div>
        <button
          onClick={() => setShow(false)}
          className="mt-4 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  )
}
