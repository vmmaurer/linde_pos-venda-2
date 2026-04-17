"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const savedUser = localStorage.getItem("linde_user")
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  const login = (username: string, password: string) => {
    const validUsers = ["ghinara", "vinicius"]
    const normalizedUsername = username.toLowerCase()
    
    if (validUsers.includes(normalizedUsername) && password === "1234") {
      setUser(normalizedUsername)
      localStorage.setItem("linde_user", normalizedUsername)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("linde_user")
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
