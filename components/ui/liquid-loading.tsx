"use client"

import React, { useState, useEffect } from 'react'

const LiquidLoading = () => {
  const [heights, setHeights] = useState([0, 0, 0, 0, 0, 0, 0])
  const [droplets, setDroplets] = useState([false, false, false, false, false, false, false])

  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-purple-500',
    'from-cyan-400 to-blue-500',
    'from-green-400 to-cyan-400',
    'from-yellow-400 to-green-400',
    'from-orange-400 to-yellow-400',
    'from-red-500 to-orange-400'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(prev => prev.map((height, index) => {
        const maxHeight = 80
        const delay = index * 0.8
        const time = Date.now() * 0.001

        const primaryWave = Math.sin(time + delay)
        const bounceWave = Math.sin(time * 4 + delay) * 0.15
        const ripple = Math.sin(time * 8 + delay) * 0.05
        const combinedWave = primaryWave + bounceWave + ripple

        return maxHeight * combinedWave
      }))

      setDroplets(prev => prev.map((_, index) => {
        const delay = index * 0.8
        const time = Date.now() * 0.001
        const waveValue = Math.sin(time + delay)
        return waveValue > 0.8
      }))
    }, 32)

    return () => clearInterval(interval)
  }, [])

  const glowColor = (colorClass: string) => {
    if (colorClass.includes('purple')) return '#a855f7'
    if (colorClass.includes('blue')) return '#3b82f6'
    if (colorClass.includes('cyan')) return '#06b6d4'
    if (colorClass.includes('green')) return '#10b981'
    if (colorClass.includes('yellow')) return '#eab308'
    if (colorClass.includes('orange')) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <div className="flex items-end space-x-4 p-8">
        {heights.map((height, index) => (
          <div key={index} className="relative flex flex-col items-center">
            {/* Droplet */}
            <div
              className={`w-4 h-4 rounded-full bg-gradient-to-r ${colors[index]} mb-3 transition-all duration-500 ease-out ${
                droplets[index] ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                filter: 'blur(0.5px)',
                transform: droplets[index]
                  ? `translateY(${Math.sin(Date.now() * 0.008 + index * 0.5) * 3}px) scale(${0.8 + Math.sin(Date.now() * 0.006 + index * 0.3) * 0.4})`
                  : 'translateY(10px) scale(0.5)',
                boxShadow: droplets[index] ? `0 0 15px ${glowColor(colors[index])}40` : 'none'
              }}
            />

            {/* Main liquid bar */}
            <div
              className={`w-10 bg-gradient-to-t ${colors[index]} rounded-full transition-all duration-200 ease-out relative overflow-hidden shadow-lg`}
              style={{
                height: `${Math.abs(height)}px`,
                transform: height < 0 ? 'scaleY(-1)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                filter: 'blur(0.3px)',
                boxShadow: `0 0 20px ${glowColor(colors[index])}50, inset 0 0 20px rgba(255,255,255,0.1)`
              }}
            >
              {/* Surface tension */}
              <div
                className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-full"
                style={{
                  transform: `translateY(${Math.sin(Date.now() * 0.003 + index * 0.5) * 1}px) scaleY(${0.8 + Math.sin(Date.now() * 0.004 + index * 0.3) * 0.3})`
                }}
              />
              {/* Wave */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  transform: `translateY(${Math.sin(Date.now() * 0.002 + index * 0.5) * 2}px)`,
                  background: `linear-gradient(0deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
                }}
              />
              {/* Shimmer */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  transform: `translateX(${Math.sin(Date.now() * 0.0015 + index * 0.7) * 8}px)`,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  width: '140%',
                  left: '-20%'
                }}
              />
              {/* Bubble */}
              <div
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  top: `${20 + Math.sin(Date.now() * 0.003 + index * 0.8) * 10}%`,
                  left: `${30 + Math.sin(Date.now() * 0.002 + index * 0.6) * 20}%`,
                  transform: `scale(${0.5 + Math.sin(Date.now() * 0.004 + index * 0.4) * 0.5})`,
                  opacity: Math.sin(Date.now() * 0.005 + index * 0.9) * 0.3 + 0.3
                }}
              />
            </div>

            {/* Base droplet */}
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index]} mt-2 transition-all duration-300`}
              style={{
                opacity: Math.sin(Date.now() * 0.003 + index * 0.9) * 0.4 + 0.6,
                transform: `scale(${0.6 + Math.sin(Date.now() * 0.002 + index * 0.6) * 0.4}) translateY(${Math.sin(Date.now() * 0.004 + index * 0.8) * 1}px)`,
                filter: 'blur(0.2px)',
                boxShadow: `0 2px 8px ${glowColor(colors[index])}40`
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-zinc-400 animate-pulse tracking-wide">Gemini AI가 그림일기를 그리고 있어요...</p>
    </div>
  )
}

export default LiquidLoading
