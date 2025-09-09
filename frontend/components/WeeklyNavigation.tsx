"use client"
import { useState, useEffect, useMemo } from 'react'

interface WeeklyNavigationProps {
  currentWeekStart: string
  onWeekChange: (weekStart: string) => void
  className?: string
}

export default function WeeklyNavigation({ 
  currentWeekStart, 
  onWeekChange, 
  className = "" 
}: WeeklyNavigationProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeekStart)

  // Get current week start (Monday)
  const getCurrentWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().slice(0, 10)
  }

  // Get week number (KW) for a given date
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7)
  }

  // Generate week options (current week and 4 weeks before/after)
  const weekOptions = useMemo(() => {
    const currentWeek = new Date(currentWeekStart)
    const weeks = []
    
    // Add 4 weeks before current week
    for (let i = -4; i <= 4; i++) {
      const weekDate = new Date(currentWeek)
      weekDate.setDate(weekDate.getDate() + (i * 7))
      const weekStart = weekDate.toISOString().slice(0, 10)
      const weekNumber = getWeekNumber(weekDate)
      const year = weekDate.getFullYear()
      
      weeks.push({
        weekStart,
        weekNumber,
        year,
        label: `KW ${weekNumber}`,
        isCurrentWeek: i === 0
      })
    }
    
    return weeks
  }, [currentWeekStart])

  // Update selected week when currentWeekStart changes
  useEffect(() => {
    setSelectedWeek(currentWeekStart)
  }, [currentWeekStart])

  const handleWeekChange = (weekStart: string) => {
    setSelectedWeek(weekStart)
    onWeekChange(weekStart)
  }

  const currentWeekData = weekOptions.find(w => w.weekStart === selectedWeek) || weekOptions[4]

  // Get the date range for the selected week
  const getWeekDateRange = (weekStart: string) => {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 6) // Sunday
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">
          {currentWeekData.label} {currentWeekData.year}
        </h2>
        <span className="text-sm text-gray-600">
          {getWeekDateRange(selectedWeek)}
        </span>
        {currentWeekData.isCurrentWeek && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Current Week
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const currentIndex = weekOptions.findIndex(w => w.weekStart === selectedWeek)
            if (currentIndex > 0) {
              handleWeekChange(weekOptions[currentIndex - 1].weekStart)
            }
          }}
          disabled={weekOptions.findIndex(w => w.weekStart === selectedWeek) === 0}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous week"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-1 min-w-0">
          <input
            type="range"
            min="0"
            max={weekOptions.length - 1}
            value={weekOptions.findIndex(w => w.weekStart === selectedWeek)}
            onChange={(e) => {
              const index = parseInt(e.target.value)
              handleWeekChange(weekOptions[index].weekStart)
            }}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(weekOptions.findIndex(w => w.weekStart === selectedWeek) / (weekOptions.length - 1)) * 100}%, #e5e7eb ${(weekOptions.findIndex(w => w.weekStart === selectedWeek) / (weekOptions.length - 1)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
        
        <button
          onClick={() => {
            const currentIndex = weekOptions.findIndex(w => w.weekStart === selectedWeek)
            if (currentIndex < weekOptions.length - 1) {
              handleWeekChange(weekOptions[currentIndex + 1].weekStart)
            }
          }}
          disabled={weekOptions.findIndex(w => w.weekStart === selectedWeek) === weekOptions.length - 1}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next week"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
