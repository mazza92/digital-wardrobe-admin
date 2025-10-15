'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Shirt, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  User,
  UserCircle
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    { name: 'Tableau de Bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tenues', href: '/dashboard/outfits', icon: Shirt },
    { name: 'Profil', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Rapports', href: '/dashboard/reports', icon: BarChart3 },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white touch-manipulation"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="bg-black p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">Garde-Robe Virtuelle</span>
            </div>
            <nav className="mt-6 px-2 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 touch-manipulation"
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="bg-black p-2 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Garde-Robe Virtuelle</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Main content */}
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <button
                type="button"
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black touch-manipulation"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="bg-black p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-bold text-gray-900">Garde-Robe Virtuelle</span>
              </div>
              <div className="w-10"></div>
            </div>
            <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
              {children}
            </main>
          </div>
    </div>
  )
}
