import { Check, LogOut, RefreshCw, Shield, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { type UserProfile } from '../data/profileRepository'
import { type Reservation, type ReservationStatus } from '../data/reservationRepository'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [professors, setProfessors] = useState<UserProfile[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  async function loadAdminData() {
    setError('')
    try {
      const [usersSnapshot, reservationsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'professor'), where('roleStatus', '==', 'pending'))),
        getDocs(query(collection(db, 'reservations'), where('status', '==', 'PENDING'))),
      ])
      setProfessors(usersSnapshot.docs.map((item) => ({ id: item.id, fullName: String(item.data().fullName ?? ''), email: String(item.data().email ?? ''), role: 'professor', roleStatus: 'pending' })))
      setReservations(reservationsSnapshot.docs.map((item) => {
        const data = item.data()
        return { id: item.id, roomId: String(data.roomId), roomName: String(data.roomName), floorNumber: Number(data.floorNumber), professorId: String(data.professorId), professorName: String(data.professorName), startAt: data.startAt.toDate(), endAt: data.endAt.toDate(), status: 'PENDING', createdAt: data.createdAt?.toDate?.() ?? null, updatedAt: data.updatedAt?.toDate?.() ?? null }
      }))
    } catch {
      setError('Could not load admin data. Confirm this account has role: admin and deploy the latest rules.')
    }
  }

  useEffect(() => {
    void loadAdminData()
    const unsubscribeProfessors = onSnapshot(query(collection(db, 'users'), where('role', '==', 'professor'), where('roleStatus', '==', 'pending')), (snapshot) => {
      setProfessors(snapshot.docs.map((item) => ({ id: item.id, fullName: String(item.data().fullName ?? ''), email: String(item.data().email ?? ''), role: 'professor', roleStatus: 'pending' })))
    }, () => setError('Could not listen for professor updates.'))
    const unsubscribeReservations = onSnapshot(query(collection(db, 'reservations'), where('status', '==', 'PENDING')), (snapshot) => {
      setReservations(snapshot.docs.map((item) => {
        const data = item.data()
        return { id: item.id, roomId: String(data.roomId), roomName: String(data.roomName), floorNumber: Number(data.floorNumber), professorId: String(data.professorId), professorName: String(data.professorName), startAt: data.startAt.toDate(), endAt: data.endAt.toDate(), status: 'PENDING', createdAt: data.createdAt?.toDate?.() ?? null, updatedAt: data.updatedAt?.toDate?.() ?? null }
      }))
    }, () => setError('Could not listen for reservation updates.'))
    return () => {
      unsubscribeProfessors()
      unsubscribeReservations()
    }
  }, [])

  async function updateProfessor(userId: string, status: 'confirmed' | 'rejected') {
    setBusyId(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { roleStatus: status, reviewedAt: serverTimestamp() })
      await loadAdminData()
    } catch { setError('Could not update the professor account.') } finally { setBusyId('') }
  }

  async function updateReservation(reservationId: string, status: Exclude<ReservationStatus, 'PENDING'>) {
    setBusyId(reservationId)
    try {
      await updateDoc(doc(db, 'reservations', reservationId), { status, reviewedAt: serverTimestamp(), updatedAt: serverTimestamp() })
      await loadAdminData()
    } catch { setError('Could not update the reservation. Check the Firestore rules deployment.') } finally { setBusyId('') }
  }

  async function handleSignOut() { await signOut(auth); navigate('/') }

  return <main className="app-shell"><header className="app-header"><Link className="brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><div className="admin-header-actions"><span className="admin-label"><Shield size={14} /> Admin beta</span><button className="sign-out" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button></div></header><section className="admin-page"><div className="admin-title"><div><p className="form-kicker">CONTROL CENTER</p><h1>Review requests.</h1><p>Approve professor access and room reservations from one place.</p></div><button className="refresh-button" type="button" onClick={() => void loadAdminData()}><RefreshCw size={15} /> Refresh</button></div>{error && <p className="form-error">{error}</p>}<div className="admin-columns"><section className="admin-section"><div className="admin-section-heading"><div><span className="form-kicker">PROFESSOR ACCESS</span><h2>Pending professors</h2></div><b>{professors.length}</b></div>{professors.length === 0 ? <p className="admin-empty">No professor accounts are waiting for review.</p> : professors.map((professor) => <div className="admin-row" key={professor.id}><div><strong>{professor.fullName}</strong><span>{professor.email}</span></div><div className="admin-row-actions"><button className="approve-button" disabled={busyId === professor.id} onClick={() => void updateProfessor(professor.id, 'confirmed')}><Check size={14} /> Approve</button><button className="decline-button" disabled={busyId === professor.id} onClick={() => void updateProfessor(professor.id, 'rejected')}><X size={14} /> Reject</button></div></div>)}</section><section className="admin-section"><div className="admin-section-heading"><div><span className="form-kicker">ROOM RESERVATIONS</span><h2>Pending requests</h2></div><b>{reservations.length}</b></div>{reservations.length === 0 ? <p className="admin-empty">No room reservations are waiting for review.</p> : reservations.map((reservation) => <div className="admin-row" key={reservation.id}><div><strong>{reservation.roomName} · Floor {reservation.floorNumber}</strong><span>{reservation.professorName} · {reservation.startAt.toLocaleString()}–{reservation.endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div className="admin-row-actions"><button className="approve-button" disabled={busyId === reservation.id} onClick={() => void updateReservation(reservation.id, 'APPROVED')}><Check size={14} /> Approve</button><button className="decline-button" disabled={busyId === reservation.id} onClick={() => void updateReservation(reservation.id, 'DECLINED')}><X size={14} /> Decline</button></div></div>)}</section></div></section></main>
}
