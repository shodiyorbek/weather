"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sunrise, Sun, Sunset, Moon } from "lucide-react"

interface DynamicGreetingProps {
  className?: string,
  timeZone:number
}

export default function DynamicGreeting({ className = "",timeZone }: DynamicGreetingProps) {
  const [greeting, setGreeting] = useState("")
  const [timeIcon, setTimeIcon] = useState<React.ReactNode>(null)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date()
      const hour = now.getHours()
      const offsetHours = timeZone / 3600;
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: `Etc/GMT${offsetHours <= 0 ? '+' + Math.abs(offsetHours) : '-' + offsetHours}`,
      })

      setCurrentTime(timeString)

      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning")
        setTimeIcon(<Sunrise className="h-5 w-5 text-orange-500" />)
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon")
        setTimeIcon(<Sun className="h-5 w-5 text-yellow-500" />)
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good evening")
        setTimeIcon(<Sunset className="h-5 w-5 text-orange-600" />)
      } else {
        setGreeting("Good night")
        setTimeIcon(<Moon className="h-5 w-5 text-blue-400" />)
      }
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [timeZone])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {timeIcon}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
          {greeting}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{currentTime}</p>
      </div>
    </motion.div>
  )
}
