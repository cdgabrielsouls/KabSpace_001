import { ArrowLeft, Bell, ChevronDown, LogOut, Monitor, MoveUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { floors as fallbackFloors, type Floor, type Room } from '../data/campus'
import { loadCeitFloors } from '../data/campusRepository'
import { cancelReservation, createReservation, loadReservations, type Reservation, watchProfessorReservations, watchReservations } from '../data/reservationRepository'
import { useAuth } from '../context/AuthContext'

function StatusBadge({ status }: { status: Room['status'] | 'PENDING' }) {
  return <span className={`status-badge ${status.toLowerCase()}`}><i />{status}</span>
}

export default function CeitBuilding() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [activeFloor, setActiveFloor] = useState(2)
  const [floors, setFloors] = useState<Floor[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [requestDate, setRequestDate] = useState(new Date().toISOString().slice(0, 10))
  const [requestMessage, setRequestMessage] = useState('')
  const [requestBusy, setRequestBusy] = useState(false)
  const [professorReservations, setProfessorReservations] = useState<Reservation[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [, setClock] = useState(() => Date.now())

  useEffect(() => {
    void loadCeitFloors().then(setFloors)
    const unsubscribe = watchReservations(setReservations, () => setReservations([]))
    return unsubscribe
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!['professor', 'admin'].includes(profile?.role ?? '') || !user) {
      setProfessorReservations([])
      return
    }
    return watchProfessorReservations(user.uid, setProfessorReservations, () => setProfessorReservations([]))
  }, [profile?.role, user])

  const availableFloors = floors.length > 0 ? floors : fallbackFloors
  const floor = availableFloors.find((item) => item.number === activeFloor) ?? availableFloors[0]
  const vacantCount = floor.rooms.filter((room) => !reservations.some((reservation) => reservation.roomId === room.id && reservation.floorNumber === floor.number && reservation.endAt > new Date())).length

  async function handleSignOut() {
    await signOut(auth)
    navigate('/')
  }

  async function handleReservationRequest() {
    if (!selectedRoom || !user || !profile || (profile.role !== 'professor' && profile.role !== 'admin')) return
    const startAt = new Date(`${requestDate}T${startTime}`)
    const endAt = new Date(`${requestDate}T${endTime}`)
    if (endAt <= startAt) return setRequestMessage('End time must be later than the start time.')
    setRequestBusy(true)
    setRequestMessage('')
    try {
      await createReservation({ roomId: selectedRoom.id, roomName: selectedRoom.name, floorNumber: floor.number, professorId: user.uid, professorName: profile.fullName, startAt, endAt })
      setRequestMessage('Request sent. It is now pending review.')
      setReservations(await loadReservations())
    } catch {
      setRequestMessage('Could not send the request. Make sure the latest Firestore rules are deployed.')
    } finally { setRequestBusy(false) }
  }

  async function handleCancelReservation(reservation: Reservation) {
    if (!user || reservation.professorId !== user.uid) return
    setRequestBusy(true)
    try {
      await cancelReservation(reservation.id)
      setReservations((current) => current.filter((item) => item.id !== reservation.id))
      setRequestMessage('Reservation cancelled. The room is available again.')
    } catch {
      setRequestMessage('Could not cancel the reservation.')
    } finally { setRequestBusy(false) }
  }

  function roomReservation(roomId: string) {
    const now = new Date()
    return reservations.find((reservation) => reservation.roomId === roomId && reservation.floorNumber === floor.number && reservation.endAt > now)
  }

  const unreadCount = professorReservations.filter((reservation) => reservation.status !== 'PENDING').length
  const latestFirst = professorReservations.slice().sort((first, second) => (second.updatedAt ?? second.createdAt ?? new Date(0)).getTime() - (first.updatedAt ?? first.createdAt ?? new Date(0)).getTime())
  return <main className="app-shell"><header className="app-header"><Link className="brand" to="/"><span className="logo-placeholder">K</span><span>KabSpace</span></Link><div className="header-actions">{['professor', 'admin'].includes(profile?.role ?? '') && <div className="notification-wrap"><button className="notification-button" type="button" aria-label="Reservation notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={17} />{unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}</button>{notificationsOpen && <div className="notification-panel"><strong>Reservation updates</strong>{latestFirst.length === 0 ? <p>No reservation requests yet.</p> : latestFirst.map((reservation) => <div className="notification-item" key={reservation.id}><b>{reservation.roomName}</b><span>{reservation.status === 'APPROVED' ? 'Your room is approved.' : reservation.status === 'DECLINED' ? 'Your room request was declined.' : 'Your request is pending review.'}</span><small>{reservation.startAt.toLocaleDateString()} · {reservation.startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{reservation.endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>)}</div>}</div>}<button className="sign-out" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button></div></header><section className="building-page"><Link className="back-link" to="/colleges"><ArrowLeft size={16} /> All colleges</Link><div className="building-heading"><div><p className="form-kicker">CEIT · DIT BUILDING</p><h1>Find a room to focus.</h1><p>Browse the four floors of the Department of Information Technology building.</p></div><div className="building-meta"><span className="building-meta-icon"><Monitor size={18} /></span><span><b>DIT Building</b><small>CEIT campus area</small></span></div></div><div className="floor-toolbar"><div className="floor-tabs" role="tablist" aria-label="Building floors">{availableFloors.map((item) => <button key={item.number} className={activeFloor === item.number ? 'selected' : ''} type="button" role="tab" aria-selected={activeFloor === item.number} onClick={() => setActiveFloor(item.number)}>Floor {item.number}</button>)}</div><div className="floor-select-wrap"><select value={activeFloor} onChange={(event) => setActiveFloor(Number(event.target.value))} aria-label="Select floor">{availableFloors.map((item) => <option key={item.number} value={item.number}>Floor {item.number}</option>)}</select><ChevronDown size={15} /></div></div><div className="floor-summary"><div><span className="form-kicker">FLOOR {floor.number}</span><h2>{vacantCount} rooms available</h2></div><span>{floor.rooms.length} rooms total</span></div><div className="room-grid">{floor.rooms.map((room) => { const reservation = roomReservation(room.id); const displayStatus = reservation?.status === 'APPROVED' ? 'RESERVED' : reservation?.status === 'PENDING' ? 'PENDING' : 'VACANT'; return <article className="room-card" key={room.id}><div className="room-card-top"><span className="room-number">{room.name}</span><StatusBadge status={displayStatus} /></div><p>{room.type}</p>{reservation && <small className="reservation-time">{reservation.status === 'PENDING' ? 'Request pending' : 'Reserved'} · {reservation.startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{reservation.endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}{reservation?.professorId === user?.uid && <button className="room-action" type="button" disabled={requestBusy} onClick={() => void handleCancelReservation(reservation!)}>Cancel reservation</button>}{['professor', 'admin'].includes(profile?.role ?? '') ? <button className="room-action" type="button" onClick={() => { setSelectedRoom(room); setRequestMessage('') }}>Request this room <MoveUpRight size={13} /></button> : <span className="room-student-note">{reservation ? `Requested by ${reservation.professorName}` : 'Available to view'}</span>}</article> })}</div>{selectedRoom && <div className="reservation-dialog" role="dialog" aria-modal="true"><div className="reservation-dialog-inner"><button className="dialog-close" type="button" onClick={() => setSelectedRoom(null)}>Close</button><p className="form-kicker">ROOM REQUEST</p><h2>{selectedRoom.name}</h2><p>Choose when you need this room. Your request will be marked pending.</p><label>Date<input type="date" value={requestDate} onChange={(event) => setRequestDate(event.target.value)} /></label><div className="time-fields"><label>Starts<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>Ends<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></div>{requestMessage && <p className="form-error">{requestMessage}</p>}<button className="form-submit" type="button" disabled={requestBusy} onClick={handleReservationRequest}>{requestBusy ? 'Sending request...' : 'Send reservation request'}</button></div></div>}</section></main>
}
