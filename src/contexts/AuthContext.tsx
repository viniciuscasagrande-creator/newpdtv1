import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { SystemModuleId, UserProfile, UserRole } from '../types/core'
import { mockUsers } from '../data/mockUsers'

interface AuthContextType {
  currentUser: UserProfile
  allUsers: UserProfile[]
  switchUser: (userId: string) => void
  hasPermission: (module: SystemModuleId) => boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]) // João Silva (Admin)

  const switchUser = (userId: string) => {
    const found = mockUsers.find((u) => u.id === userId)
    if (found) {
      setCurrentUser(found)
    }
  }

  const hasPermission = (module: SystemModuleId): boolean => {
    if (currentUser.role === 'admin') return true
    if (module === 'overview') return true
    return currentUser.permissions.includes(module)
  }

  const isAdmin = currentUser.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: mockUsers,
        switchUser,
        hasPermission,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
