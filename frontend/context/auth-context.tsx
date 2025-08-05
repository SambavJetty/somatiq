"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, onAuthStateChanged, getAuth } from "firebase/auth"
import { app } from "@/firebase/clientApp"

interface AuthContextType {
  currentUser: User | null
  idToken: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const token = await user.getIdToken()
        setIdToken(token)
      } else {
        setIdToken(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  return <AuthContext.Provider value={{ currentUser, idToken, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
