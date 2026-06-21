import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, AlertCircle, LogIn, LogOut, Clock, Info } from 'lucide-react'
import { api } from '../api'

export default function Hostel({ user, showToast }) {
  const [rooms, setRooms] = useState([])
  const [summary, setSummary] = useState({ totalBeds: 0, vacantBeds: 0, curfew: '7:00 PM' })
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyBed, setBusyBed] = useState(null)
  const [attendanceBusy, setAttendanceBusy] = useState(false)

  const isWarden = user.role === 'warden'

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getRooms()
      setRooms(data.rooms)
      setSummary({ totalBeds: data.totalBeds, vacantBeds: data.vacantBeds, curfew: data.curfew })
      setSelectedRoomId((prev) => prev || (data.rooms[0] && data.rooms[0].id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const recountVacant = (list) =>
    list.reduce((sum, r) => sum + r.beds.filter((b) => !b.occupied).length, 0)

  const toggleBed = async (roomId, bedId) => {
    if (!isWarden) return
    setBusyBed(`${roomId}-${bedId}`)
    try {
      const result = await api.toggleBed(roomId, bedId)
      const occupied = result.data.occupied
      setRooms((prev) => {
        const next = prev.map((room) =>
          room.id === roomId
            ? { ...room, beds: room.beds.map((b) => (b.id === bedId ? { ...b, occupied } : b)) }
            : room,
        )
        setSummary((s) => ({ ...s, vacantBeds: recountVacant(next) }))
        return next
      })
      showToast(result.message, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusyBed(null)
    }
  }

  const attendance = async (type) => {
    setAttendanceBusy(true)
    try {
      const result = type === 'in' ? await api.checkIn() : await api.checkOut()
      showToast(result.message, 'success')
    } catch (err) {
      // Curfew rejection comes back as an error here.
      showToast(err.message, 'error')
    } finally {
      setAttendanceBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-stone-400">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm mt-3">Loading hostel availability…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto text-rose-500" />
        <p className="text-rose-700 font-medium mt-2">Couldn’t load hostel data</p>
        <p className="text-rose-600 text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-4 inline-flex items-center gap-2 bg-rose-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-rose-700">
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    )
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 p-5">
          <h2 className="font-display text-xl font-bold text-stone-900">Hostel availability</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {isWarden
              ? 'Tap a bed to mark it vacant or occupied. Changes update availability instantly.'
              : 'See which beds are free across the hostels. Ask your warden to confirm allocation.'}
          </p>
          <div className="flex gap-3 mt-4">
            <Pill label="Vacant beds" value={summary.vacantBeds} tone="emerald" />
            <Pill label="Total beds" value={summary.totalBeds} tone="stone" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-5 flex flex-col">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock size={16} />
            <span className="text-sm font-semibold">Curfew {summary.curfew}</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
            Check-in closes at {summary.curfew}. Let your warden know in advance if you’ll be late.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button
              onClick={() => attendance('in')}
              disabled={attendanceBusy}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <LogIn size={15} /> Check in
            </button>
            <button
              onClick={() => attendance('out')}
              disabled={attendanceBusy}
              className="inline-flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-900 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <LogOut size={15} /> Check out
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 p-5">
        <h3 className="font-semibold text-stone-800 mb-3">Rooms</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto scroll-soft pr-1">
          {rooms.map((room) => {
            const free = room.beds.filter((b) => !b.occupied).length
            const active = room.id === selectedRoomId
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                  active
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <p className="font-semibold text-sm text-stone-800">{room.id}</p>
                <p className={`text-[11px] mt-0.5 ${free > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {free}/{room.beds.length} free
                </p>
              </button>
            )
          })}
        </div>

        {selectedRoom && (
          <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-stone-800">{selectedRoom.id}</p>
              <p className="text-xs text-stone-500">{selectedRoom.block}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {selectedRoom.beds.map((bed) => {
                const busy = busyBed === `${selectedRoom.id}-${bed.id}`
                return (
                  <button
                    key={bed.id}
                    onClick={() => toggleBed(selectedRoom.id, bed.id)}
                    disabled={!isWarden || busy}
                    className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                      bed.occupied
                        ? 'border-rose-200 bg-rose-50'
                        : 'border-emerald-200 bg-emerald-50'
                    } ${isWarden ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
                  >
                    <p className="text-xs font-semibold text-stone-700">Bed {bed.id}</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${bed.occupied ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {busy ? 'Updating…' : bed.occupied ? 'Occupied' : 'Vacant'}
                    </p>
                  </button>
                )
              })}
            </div>
            {!isWarden && (
              <p className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-3">
                <Info size={12} /> Only wardens can change bed status.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Pill({ label, value, tone }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stone: 'bg-stone-50 text-stone-700 border-stone-200',
  }
  return (
    <div className={`rounded-xl border px-4 py-2 ${tones[tone]}`}>
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[11px] opacity-80">{label}</p>
    </div>
  )
}
