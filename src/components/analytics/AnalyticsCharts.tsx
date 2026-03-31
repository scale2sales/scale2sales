'use client'
// @ts-nocheck
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface DayData {
  date: string
  tokens: number
  messages: number
  cost: number
}

export function AnalyticsCharts({ data }: { data: DayData[] }) {
  const [activeMetric, setActiveMetric] = useState<'tokens' | 'messages' | 'cost'>('messages')

  const metrics = {
    messages: { label: 'Messages', color: '#6366f1', format: (v: number) => v.toString() },
    tokens: { label: 'Tokens', color: '#8b5cf6', format: (v: number) => v.toLocaleString() },
    cost: { label: 'Cost ($)', color: '#10b981', format: (v: number) => `$${v.toFixed(4)}` },
  }

  const maxValue = Math.max(...data.map(d => d[activeMetric]), 1)
  const metric = metrics[activeMetric]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Daily Usage</h2>
          <div className="flex gap-2">
            {Object.entries(metrics).map(([key, m]) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeMetric === key
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No data yet — start chatting to see your usage charts!
          </div>
        ) : (
          <div className="relative">
            {/* Chart */}
            <div className="flex items-end gap-1 h-48 mt-4">
              {data.map((day, i) => {
                const height = maxValue > 0 ? (day[activeMetric] / maxValue) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.date}: {metric.format(day[activeMetric])}
                    </div>
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${Math.max(height, 2)}%`,
                        backgroundColor: metric.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* X axis labels */}
            <div className="flex gap-1 mt-2">
              {data.map((day, i) => (
                <div key={i} className="flex-1 text-center">
                  {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                    <span className="text-xs text-gray-400">{day.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
