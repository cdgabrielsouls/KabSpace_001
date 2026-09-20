import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export type UserRole = 'student' | 'professor' | 'admin'
export type RoleStatus = 'confirmed' | 'pending'

export type UserProfile = {
  id: string
  fullName: string
  email: string
  role?: UserRole
  roleStatus?: RoleStatus
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', userId))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    id: snapshot.id,
    fullName: String(data.fullName ?? 'KabSpace user'),
    email: String(data.email ?? ''),
    role: data.role === 'admin' ? 'admin' : data.role === 'professor' ? 'professor' : data.role === 'student' ? 'student' : undefined,
    roleStatus: data.roleStatus === 'pending' ? 'pending' : data.roleStatus === 'confirmed' ? 'confirmed' : undefined,
  }
}

export async function saveUserRole(userId: string, role: UserRole) {
  await setDoc(doc(db, 'users', userId), {
    role,
    roleStatus: role === 'professor' ? 'pending' : 'confirmed',
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
