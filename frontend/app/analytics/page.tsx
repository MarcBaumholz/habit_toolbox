"use client"
import { useEffect, useState } from 'react'
import { api } from '@/app/api'

interface HabitData {
  id: number
  title: string
  current_streak: number
  total_completions: number
  completion_rate: number
  weekly_data: { [key: string]: boolean }
}

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  async function loadAnalytics() {
    try {
      setLoading(true)
      const habitsData = await api('/habits')
      
      // Calculate analytics for each habit
      const analyticsData = await Promise.all(
        habitsData.map(async (habit: any) => {
          const weeklyData = await api(`/habits/${habit.id}/week`)
          const completionRate = calculateCompletionRate(weeklyData)
          
          return {
            ...habit,
            completion_rate: completionRate,
            weekly_data: weeklyData
          }
        })
      )
      
      setHabits(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateCompletionRate(weeklyData: any) {
    if (!weeklyData || !weeklyData.days) return 0
    
    const totalDays = Object.keys(weeklyData.days).length
    const completedDays = Object.values(weeklyData.days).filter(Boolean).length
    
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  }

  function getCompletionRateColor(rate: number) {
    if (rate >= 80) return 'text-green-600 bg-green-100'
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  function getStreakColor(streak: number) {
    if (streak >= 30) return 'text-purple-600 bg-purple-100'
    if (streak >= 14) return 'text-blue-600 bg-blue-100'
    if (streak >= 7) return 'text-green-600 bg-green-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalHabits = habits.length
  const averageCompletionRate = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.completion_rate, 0) / habits.length)
    : 0
  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period === 'week' ? 'Woche' : period === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktive Gewohnheiten</p>
              <p className="text-3xl font-bold">{totalHabits}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Durchschnittliche Erfolgsrate</p>
              <p className="text-3xl font-bold">{averageCompletionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gesamtstreak</p>
              <p className="text-3xl font-bold">{totalStreak}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Analytics */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold mb-6">Gewohnheits-Details</h2>
        
        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Noch keine Gewohnheiten vorhanden. Erstelle deine erste Gewohnheit!
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{habit.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.total_completions} Abschlüsse insgesamt
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStreakColor(habit.current_streak)}`}>
                      🔥 {habit.current_streak} Tage
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionRateColor(habit.completion_rate)}`}>
                      {habit.completion_rate}% Erfolgsrate
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Fortschritt</span>
                    <span>{habit.completion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${habit.completion_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold mb-6">Wöchentliche Aktivität</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="text-center text-sm text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
          {Array.from({ length: 28 }, (_, i) => {
            const isCompleted = Math.random() > 0.3 // Simulated data
            return (
              <div
                key={i}
                className={`h-8 w-8 rounded border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-600' 
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
                title={`Tag ${i + 1}: ${isCompleted ? 'Abgeschlossen' : 'Nicht abgeschlossen'}`}
              ></div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
            <span>Weniger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 border border-green-600 rounded"></div>
            <span>Mehr</span>
          </div>
        </div>
      </div>
    </div>
  )
}
