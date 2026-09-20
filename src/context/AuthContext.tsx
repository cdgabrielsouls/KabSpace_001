import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth, db } from '../firebase'
import { loadUserProfile, type UserProfile } from '../data/profileRepository'

type AuthContextValue = { user: User | null; profile: UserProfile | null; loading: boolean }
const AuthContext = createContext<AuthContextValue>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser)
    if (!nextUser) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    void loadUserProfile(nextUser.uid)
      .then((existingProfile) => {
        setProfile(existingProfile)
        return setDoc(doc(db, 'users', nextUser.uid), {
          fullName: nextUser.displayName ?? nextUser.email?.split('@')[0] ?? 'KabSpace user',
          email: nextUser.email ?? '',
          createdAt: serverTimestamp(),
        }, { merge: true }).catch(() => undefined)
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }), [])

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}