import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, AlertCircle, LogIn, LogOut, Clock, Info, BedDouble } from 'lucide-react'
import { api } from '../api'

function vacancyLevel(free, total) {
  if (free === 0) return 'none'
  if (total > 0 && free / total <= 0.25) return 'low'
  return 'good'
}

// Same visual language as the canteen's portion gauge: a thin fill-strip
// that reframes "X free out of Y" as a depleting bar, so the two pages of
// the app read as one system rather than two unrelated screens.
function CapacityGauge({ free, total, size = 'md' }) {
  const ratio = total > 0 ? Math.min(free / total, 1) : 0
  const level = vacancyLevel(free, total)
  const fill = level === 'none' ? 'bg-rose-400' : level === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
  const height = size === 'sm' ? 'h-1' : 'h-1.5'
  return (
    <div
      className={`${height} w-full rounded-full bg-stone-100 ring-1 ring-inset ring-stone-200 overflow-hidden`}
      role="img"
      aria-label={`${free} of ${total} beds free`}
    >
      <div
        className={`h-full rounded-full ${fill} transition-all duration-500 ease-out`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-stone-200 px-3 py-3 animate-pulse space-y-2">
      <div className="h-3.5 w-10 rounded bg-stone-100 mx-auto" />
      <div className="h-2.5 w-12 rounded bg-stone-100 mx-auto" />
    </div>
  )
}

export default function Hostel({ user, showToast }) {
  const [rooms, setRooms] = useState([])
  const [summary, setSummary] = useState({ totalBeds: 0, vacantBeds: 0, curfew: '7:00 PM' })
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyBed, setBusyBed] = useState(null)
  const [attendanceBusy, setAttendanceBusy] = useState(null)

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
    setAttendanceBusy(type)
    try {
      const result = type === 'in' ? await api.checkIn() : await api.checkOut()
      showToast(result.message, 'success')
    } catch (err) {
      // Curfew rejection comes back as an error here.
      showToast(err.message, 'error')
    } finally {
      setAttendanceBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 h-32 sm:h-36 animate-pulse" />
          <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 h-32 sm:h-36 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
          <div className="h-4 w-24 rounded bg-stone-100 mb-3 animate-pulse" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 sm:mt-16 rounded-xl border border-rose-200 bg-rose-50 p-5 sm:p-6 text-center">
        <AlertCircle className="mx-auto text-rose-500" />
        <p className="text-rose-700 font-medium mt-2">Hostel data didn’t load</p>
        <p className="text-rose-600 text-sm mt-1 break-words">{error}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center justify-center gap-2 bg-rose-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-rose-700 active:scale-[0.97] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 w-full sm:w-auto"
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    )
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
          <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 leading-tight">
            Hostel availability
          </h2>
          <p className="text-[13px] sm:text-sm text-stone-500 mt-0.5">
            {isWarden
              ? 'Tap a bed to mark it vacant or occupied. Changes update availability instantly.'
              : 'See which beds are free across the hostels. Ask your warden to confirm allocation.'}
          </p>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 mt-4">
            <Pill label="Vacant beds" value={summary.vacantBeds} tone="emerald" />
            <Pill label="Total beds" value={summary.totalBeds} tone="stone" />
          </div>
          <div className="mt-3 max-w-xs">
            <CapacityGauge free={summary.vacantBeds} total={summary.totalBeds} />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 flex flex-col">
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
              disabled={attendanceBusy !== null}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 text-white text-sm font-medium py-2.5 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {attendanceBusy === 'in' ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
              Check in
            </button>
            <button
              onClick={() => attendance('out')}
              disabled={attendanceBusy !== null}
              className="inline-flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-900 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 text-white text-sm font-medium py-2.5 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 focus-visible:ring-offset-2"
            >
              {attendanceBusy === 'out' ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
              Check out
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
        <h3 className="font-semibold text-stone-800 mb-3 text-sm sm:text-base">Rooms</h3>

        {rooms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 p-8 sm:p-10 text-center">
            <BedDouble className="mx-auto text-stone-300" size={26} />
            <p className="text-stone-600 font-medium mt-3">No rooms set up yet</p>
            <p className="text-stone-400 text-sm mt-1">Rooms will appear here once they're added.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5 max-h-72 overflow-y-auto scroll-soft pr-1">
              {rooms.map((room) => {
                const free = room.beds.filter((b) => !b.occupied).length
                const active = room.id === selectedRoomId
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`rounded-xl border px-2.5 sm:px-3 py-2.5 sm:py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${
                      active
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <p className="font-semibold text-sm text-stone-800 truncate">{room.id}</p>
                    <p className={`text-[11px] mt-0.5 ${free > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {free}/{room.beds.length} free
                    </p>
                    <div className="mt-1.5">
                      <CapacityGauge free={free} total={room.beds.length} size="sm" />
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedRoom && (
              <div className="mt-4 sm:mt-5 rounded-xl border border-stone-200 bg-stone-50 p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <p className="font-semibold text-stone-800">{selectedRoom.id}</p>
                  <p className="text-xs text-stone-500 truncate">{selectedRoom.block}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {selectedRoom.beds.map((bed) => {
                    const busy = busyBed === `${selectedRoom.id}-${bed.id}`
                    return (
                      <button
                        key={bed.id}
                        onClick={() => toggleBed(selectedRoom.id, bed.id)}
                        disabled={!isWarden || busy}
                        className={`rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                          bed.occupied
                            ? 'border-rose-200 bg-rose-50 focus-visible:ring-rose-400'
                            : 'border-emerald-200 bg-emerald-50 focus-visible:ring-emerald-400'
                        } ${isWarden ? 'cursor-pointer hover:brightness-95 active:scale-[0.97]' : 'cursor-default'}`}
                      >
                        <p className="text-xs font-semibold text-stone-700">Bed {bed.id}</p>
                        <p className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 ${bed.occupied ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {busy && <Loader2 size={10} className="animate-spin" />}
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
          </>
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
    <div className={`rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 text-center sm:text-left ${tones[tone]}`}>
      <p className="font-display text-base sm:text-lg font-bold leading-tight">{value}</p>
      <p className="text-[10px] sm:text-[11px] opacity-80 leading-tight">{label}</p>
    </div>
  )
}