'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      // This is intentional - we need to sync theme from localStorage after hydration
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      return newTheme
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
