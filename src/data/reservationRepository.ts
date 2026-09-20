import { addDoc, collection, getDocs, onSnapshot, query, serverTimestamp, Timestamp, where, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase'

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'DECLINED'

export type Reservation = {
  id: string
  roomId: string
  roomName: string
  floorNumber: number
  professorId: string
  professorName: string
  startAt: Date
  endAt: Date
  status: ReservationStatus
  createdAt: Date | null
  updatedAt: Date | null
}

function mapReservation(item: { id: string; data: () => Record<string, unknown> }): Reservation {
  const data = item.data()
  const startAt = data.startAt instanceof Timestamp ? data.startAt.toDate() : new Date(String(data.startAt))
  const endAt = data.endAt instanceof Timestamp ? data.endAt.toDate() : new Date(String(data.endAt))
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null
  return {
    id: item.id,
    roomId: String(data.roomId),
    roomName: String(data.roomName),
    floorNumber: Number(data.floorNumber),
    professorId: String(data.professorId),
    professorName: String(data.professorName),
    startAt,
    endAt,
    status: data.status === 'APPROVED' ? 'APPROVED' : data.status === 'DECLINED' ? 'DECLINED' : 'PENDING',
    createdAt,
    updatedAt,
  }
}

export async function loadReservations(): Promise<Reservation[]> {
  const snapshot = await getDocs(query(collection(db, 'reservations'), where('status', 'in', ['PENDING', 'APPROVED'])))
  return snapshot.docs.map(mapReservation)
}

export function watchReservations(onChange: (reservations: Reservation[]) => void, onError: () => void): Unsubscribe {
  return onSnapshot(query(collection(db, 'reservations'), where('status', 'in', ['PENDING', 'APPROVED'])), (snapshot) => {
    onChange(snapshot.docs.map(mapReservation))
  }, onError)
}

export function watchProfessorReservations(professorId: string, onChange: (reservations: Reservation[]) => void, onError: () => void): Unsubscribe {
  return onSnapshot(query(collection(db, 'reservations'), where('professorId', '==', professorId)), (snapshot) => {
    onChange(snapshot.docs.map(mapReservation))
  }, onError)
}

export async function createReservation(input: Omit<Reservation, 'id' | 'startAt' | 'endAt' | 'status' | 'createdAt' | 'updatedAt'> & { startAt: Date; endAt: Date }) {
  await addDoc(collection(db, 'reservations'), {
    roomId: input.roomId,
    roomName: input.roomName,
    floorNumber: input.floorNumber,
    professorId: input.professorId,
    professorName: input.professorName,
    startAt: Timestamp.fromDate(input.startAt),
    endAt: Timestamp.fromDate(input.endAt),
    status: 'PENDING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
