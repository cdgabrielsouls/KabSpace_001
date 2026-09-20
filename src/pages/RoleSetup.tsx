import { GraduationCap, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveUserRole, type UserRole } from '../data/profileRepository'

export default function RoleSetup() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!loading && profile?.role === 'admin') return <Navigate to="/admin" replace />
  if (!loading && profile?.role === 'student') return <Navigate to="/student" replace />
  if (!loading && profile?.role === 'professor') return <Navigate to="/colleges" replace />

  async function continueWithRole() {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      await saveUserRole(user.uid, selectedRole)
      navigate(selectedRole === 'student' ? '/student' : '/colleges')
    } catch (roleError) {
      const code = roleError && typeof roleError === 'object' && 'code' in roleError ? String(roleError.code) : 'unknown-error'
      setError(`We could not save your role (${code}). Deploy the latest firestore.rules, then try again.`)
    } finally {
      setBusy(false)
    }
  }

  return <main className="role-shell"><Link className="brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><section className="role-card"><p className="form-kicker">ONE LAST STEP</p><h1>How will you use KabSpace?</h1><p>Choose the account type that best describes you. This choice cannot be changed from the app.</p><div className="role-options"><button className={selectedRole === 'student' ? 'role-option selected' : 'role-option'} type="button" onClick={() => setSelectedRole('student')}><span className="role-icon"><GraduationCap size={20} /></span><span><b>Student</b><small>Find available rooms to study and work.</small></span><i /></button><button className={selectedRole === 'professor' ? 'role-option selected' : 'role-option'} type="button" onClick={() => setSelectedRole('professor')}><span className="role-icon"><ShieldCheck size={20} /></span><span><b>Professor</b><small>Request rooms for classes and academic work.</small></span><i /></button></div>{selectedRole === 'professor' && <p className="role-note">Professor reservation requests will be marked pending for review.</p>}{error && <p className="form-error">{error}</p>}<button className="form-submit" type="button" onClick={continueWithRole} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : 'Continue to KabSpace'}</button></section></main>
}
