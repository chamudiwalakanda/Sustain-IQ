import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, AlertCircle, Leaf, Sprout } from 'lucide-react'
import { api } from '../api'

const formatLkr = (value) =>
  'Rs. ' + Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Canteen({ user, showToast }) {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reservingId, setReservingId] = useState(null)
  const [lastImpact, setLastImpact] = useState(null)

  const isStaff = user.role === 'canteen'

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setMenu(await api.getMenu())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reserve = async (mealId) => {
    setReservingId(mealId)
    try {
      const result = await api.preorder(mealId)
      const { portionsLeft, impact } = result.data
      setMenu((prev) =>
        prev.map((item) => (item.id === mealId ? { ...item, portionsLeft } : item)),
      )
      setLastImpact(impact)
      showToast(result.message, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setReservingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-stone-400">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm mt-3">Loading today’s menu…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto text-rose-500" />
        <p className="text-rose-700 font-medium mt-2">Couldn’t load the menu</p>
        <p className="text-rose-600 text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-4 inline-flex items-center gap-2 bg-rose-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-rose-700">
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    )
  }

  const totalPortions = menu.reduce((sum, m) => sum + m.portionsLeft, 0)
  const soldOut = menu.filter((m) => m.portionsLeft === 0).length

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-stone-200 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900">University of Ruhuna Canteen</h2>
          <p className="text-sm text-stone-500">
            {isStaff
              ? 'Live stock view. Monitor remaining portions to plan cooking and cut waste.'
              : 'Reserve your meal ahead of time. Every reservation helps the kitchen cook the right amount.'}
          </p>
        </div>
        {isStaff && (
          <div className="flex gap-3 text-center">
            <Stat label="Portions left" value={totalPortions} />
            <Stat label="Sold out" value={soldOut} />
          </div>
        )}
      </div>

      {!isStaff && lastImpact && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Sprout size={18} className="text-emerald-600" />
          {lastImpact} — thanks for helping reduce campus food waste.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {menu.map((item) => {
          const out = item.portionsLeft === 0
          const low = item.portionsLeft > 0 && item.portionsLeft <= 5
          return (
            <div key={item.id} className="rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col">
              <div className="px-5 pt-5 flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  {item.category}
                </span>
                {item.vegetarian && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    <Leaf size={11} /> Veg
                  </span>
                )}
              </div>
              <div className="px-5 pb-5 pt-2 flex-1 flex flex-col">
                <h3 className="font-semibold text-stone-900 leading-snug">{item.name}</h3>
                <p className="font-display text-lg font-bold text-emerald-700 mt-1">{formatLkr(item.priceLkr)}</p>

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      out
                        ? 'bg-rose-50 text-rose-600'
                        : low
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {out ? 'Sold out' : `${item.portionsLeft} left`}
                  </span>

                  {!isStaff && (
                    <button
                      onClick={() => reserve(item.id)}
                      disabled={out || reservingId === item.id}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      {reservingId === item.id && <Loader2 size={14} className="animate-spin" />}
                      {out ? 'Unavailable' : 'Reserve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-2">
      <p className="font-display text-lg font-bold text-stone-900">{value}</p>
      <p className="text-[11px] text-stone-500">{label}</p>
    </div>
  )
}
