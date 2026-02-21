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
  Phone
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'si', label: 'සිංහල' },
    { code: 'ta', label: 'தமிழ்' }
  ] as const

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-green-600 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">{t('app.title')}</span>
            <span className="text-xs text-green-100">{t('app.subtitle')}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button 
              variant={pathname === '/' ? 'secondary' : 'ghost'} 
              size="sm"
              className={`gap-2 ${pathname === '/' ? 'bg-white text-green-700 hover:bg-white/90' : 'text-white hover:bg-white/20'}`}
            >
              <Home className="h-4 w-4" />
              {t('nav.home')}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} 
              size="sm"
              className={`gap-2 ${pathname === '/dashboard' ? 'bg-white text-green-700 hover:bg-white/90' : 'text-white hover:bg-white/20'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('nav.dashboard')}
            </Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? 'bg-green-50 text-green-700' : ''}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="text-white hover:bg-white/20"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Mobile Navigation */}
          <div className="flex md:hidden gap-1">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm"
                className={pathname === '/' ? 'bg-white/20' : 'text-white'}
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className={pathname === '/dashboard' ? 'bg-white/20' : 'text-white'}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
