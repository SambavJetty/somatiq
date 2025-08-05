"use client"

import { TiptapEditor } from "@/components/tiptap-editor"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getAuth } from "firebase/auth"
import { app } from "@/firebase/clientApp"

export default function HomePage() {
  const { currentUser, loading } = useAuth()
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login")
    }
  }, [currentUser, loading, router])

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  const handleLogout = async () => {
    await auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Tiptap Autocomplete Editor</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
        <TiptapEditor />
      </div>
    </div>
  )
}
