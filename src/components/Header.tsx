'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Languages,
  Phone,
  Menu,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useSyncExternalStore } from 'react'

// Empty subscribe function for SSR compatibility
const emptySubscribe = () => () => {}

export default function Header() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme, mounted } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Use useSyncExternalStore for SSR-safe client detection
  const clientMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'si', label: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', label: 'தமிழ்', flag: '🇱🇰' }
  ] as const

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient top border */}
      <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500" />
      
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-green-100 dark:border-green-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg">
                <Phone className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {t('app.title')}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Site Visitor App
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button 
                variant={pathname === '/' ? 'default' : 'ghost'} 
                size="sm"
                className={`gap-2 ${
                  pathname === '/' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600' 
                    : 'hover:bg-green-50 dark:hover:bg-green-950/50'
                }`}
              >
                <Home className="h-4 w-4" />
                {t('nav.home')}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                variant={pathname === '/dashboard' ? 'default' : 'ghost'} 
                size="sm"
                className={`gap-2 ${
                  pathname === '/dashboard' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600' 
                    : 'hover:bg-green-50 dark:hover:bg-green-950/50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('nav.dashboard')}
              </Button>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector - Only render on client to avoid hydration mismatch */}
            {clientMounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-green-50 dark:hover:bg-green-950/50">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">{languages.find(l => l.code === language)?.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {languages.map((lang) => (
                    <DropdownMenuItem 
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer ${language === lang.code ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700' : ''}`}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" className="gap-2">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">🌐</span>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="hover:bg-green-50 dark:hover:bg-green-950/50"
            >
              {!mounted ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-100 dark:border-green-900 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant={pathname === '/' ? 'default' : 'ghost'} 
                  className={`w-full justify-start gap-2 ${
                    pathname === '/' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                      : ''
                  }`}
                >
                  <Home className="h-4 w-4" />
                  {t('nav.home')}
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant={pathname === '/dashboard' ? 'default' : 'ghost'} 
                  className={`w-full justify-start gap-2 ${
                    pathname === '/dashboard' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                      : ''
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('nav.dashboard')}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
