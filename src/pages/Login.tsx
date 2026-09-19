import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { ArrowLeft, Eye, EyeOff, LoaderCircle, MoveUpRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { isSchoolEmail, schoolEmailMessage } from '../utils/emailValidator'

function getAuthErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/unauthorized-domain') {
    return 'This site is not authorized in Firebase. Add the current hostname under Firebase Authentication > Settings > Authorized domains, or open KabSpace at http://localhost:5173.'
  }
  return error instanceof Error ? error.message.replace('Firebase: ', '') : 'Authentication failed. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!isSchoolEmail(email)) return setError(schoolEmailMessage)
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords do not match.')
    setBusy(true)
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email.trim(), password)
      else await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/colleges')
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally { setBusy(false) }
  }

  async function handleGoogleSignIn() {
    setError('')
    setBusy(true)
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      if (!isSchoolEmail(result.user.email ?? '')) {
        await signOut(auth)
        throw new Error(schoolEmailMessage)
      }
      navigate('/colleges')
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally { setBusy(false) }
  }

  return <main className="auth-shell">
    <div className="auth-visual"><Link className="brand auth-brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><div className="auth-visual-copy"><span className="eyebrow"><i /> CEIT · DIT BUILDING</span><h1>Make space for better work.</h1><p>Sign in with your Cavite State University account to see what rooms are available.</p></div><span className="auth-caption">A calmer campus, one room at a time.</span></div>
    <div className="auth-form-area"><Link className="back-link" to="/"><ArrowLeft size={16} /> Back to home</Link><div className="auth-form-wrap"><p className="form-kicker">WELCOME TO KABSPACE</p><h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p className="form-intro">Use your university email to continue.</p><button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={busy}><span className="google-mark">G</span> Continue with Google <MoveUpRight size={15} /></button><div className="form-divider"><span>or use email</span></div><form onSubmit={handleSubmit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="firstname.lastname@cvsu.edu.ph" required /></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 characters minimum" required minLength={8} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{mode === 'signup' && <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} /></label>}{error && <p className="form-error" role="alert">{error}</p>}<button className="form-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : mode === 'login' ? 'Log in' : 'Create account'}</button></form><p className="mode-switch">{mode === 'login' ? 'New to KabSpace?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></p></div></div>
  </main>
}