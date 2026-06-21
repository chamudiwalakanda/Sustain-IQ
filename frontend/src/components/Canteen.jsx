import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, AlertCircle, Leaf, Sprout, UtensilsCrossed } from 'lucide-react'
import { api } from '../api'

const formatLkr = (value) =>
  'Rs. ' + Number(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function hashString(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

// A small, fixed palette cycled by category name so any category gets a
// consistent, distinguishable tag without hardcoding the menu's categories.
const CATEGORY_PALETTE = [
  { text: 'text-amber-700', dot: 'bg-amber-500' },
  { text: 'text-orange-700', dot: 'bg-orange-500' },
  { text: 'text-teal-700', dot: 'bg-teal-500' },
  { text: 'text-violet-700', dot: 'bg-violet-500' },
  { text: 'text-sky-700', dot: 'bg-sky-500' },
]

function categoryStyle(name = '') {
  return CATEGORY_PALETTE[hashString(name) % CATEGORY_PALETTE.length]
}

function stockLevel(portionsLeft) {
  if (portionsLeft === 0) return 'out'
  if (portionsLeft <= 5) return 'low'
  return 'healthy'
}

// Maps a menu item's category/name to relevant search keywords for the
// photo. Falls back to a generic "food" pair so nothing ever has no photo.
function imageKeywords(category = '', name = '') {
  const text = `${category} ${name}`.toLowerCase()
  if (/rice|curry/.test(text)) return 'rice,curry'
  if (/kottu|noodle|fried\s?rice/.test(text)) return 'noodles,stirfry'
  if (/short\s?eats?|snack|roll|patty|cutlet|samosa/.test(text)) return 'srilankan,snack'
  if (/tea|coffee|juice|drink|beverage|milk/.test(text)) return 'beverage,drink'
  if (/dessert|sweet|cake|pudding|watalappan/.test(text)) return 'dessert,sweet'
  if (/bread|bun|bakery|roti/.test(text)) return 'bakery,bread'
  if (/salad/.test(text)) return 'salad,fresh'
  if (/soup/.test(text)) return 'soup,bowl'
  return 'food,meal'
}

// Builds a stable (per-item) placeholder photo URL from LoremFlickr, a free
// keyword-based image service backed by Creative Commons Flickr photos — no
// API key needed. The `lock` seed is derived from the item's id+name so the
// same dish always gets the same photo instead of a new random one on every
// reload. If the API ever starts returning a real `item.imageUrl`, that
// takes priority automatically.
function resolveImageUrl(item) {
  if (item.imageUrl) return item.imageUrl
  const seed = hashString(`${item.id}-${item.name}`) % 1000
  const keywords = imageKeywords(item.category, item.name)
  return `https://loremflickr.com/480/320/${encodeURIComponent(keywords)}?lock=${seed}`
}

// Renders the dish photo, and quietly swaps to a plain icon tile if the
// remote image fails to load (third-party image services occasionally rate
// limit or go down — the card should never show a broken-image icon).
function FoodImage({ src, alt }) {
  const [errored, setErrored] = useState(false)
  if (errored || !src) {
    return (
      <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
        <UtensilsCrossed className="text-stone-300" size={26} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className="aspect-[4/3] sm:aspect-[16/10] w-full object-cover"
    />
  )
}

// Signature element: a tray-compartment style gauge. It reframes "portions
// left" as a depleting strip — the same visual language as watching a
// canteen tray empty out — which is the whole point of this app: make
// scarcity visible so food gets cooked, and eaten, to the right amount.
function PortionGauge({ portionsLeft, max = 20 }) {
  const ratio = Math.min(portionsLeft / max, 1)
  const level = stockLevel(portionsLeft)
  const fill =
    level === 'out' ? 'bg-rose-400' : level === 'low' ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div
      className="h-1.5 w-full rounded-full bg-stone-100 ring-1 ring-inset ring-stone-200 overflow-hidden"
      role="img"
      aria-label={portionsLeft === 0 ? 'No portions left' : `${portionsLeft} portions left`}
    >
      <div
        className={`h-full rounded-full ${fill} transition-all duration-500 ease-out`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}

// Staff-only: one glance at how the whole kitchen's stock is trending.
function StockHealthBar({ menu }) {
  const total = menu.length || 1
  const out = menu.filter((m) => stockLevel(m.portionsLeft) === 'out').length
  const low = menu.filter((m) => stockLevel(m.portionsLeft) === 'low').length
  const healthy = total - out - low
  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden ring-1 ring-inset ring-stone-200">
      <div className="bg-emerald-500" style={{ width: `${(healthy / total) * 100}%` }} />
      <div className="bg-amber-400" style={{ width: `${(low / total) * 100}%` }} />
      <div className="bg-rose-400" style={{ width: `${(out / total) * 100}%` }} />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-stone-100" />
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 space-y-3">
        <div className="h-4 w-3/4 rounded bg-stone-100" />
        <div className="h-5 w-1/3 rounded bg-stone-100" />
        <div className="h-1.5 w-full rounded-full bg-stone-100" />
        <div className="h-9 w-full rounded-lg bg-stone-100" />
      </div>
    </div>
  )
}

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
      <div className="space-y-4 sm:space-y-5">
        <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 h-20 sm:h-[88px] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 sm:mt-16 rounded-xl border border-rose-200 bg-rose-50 p-5 sm:p-6 text-center">
        <AlertCircle className="mx-auto text-rose-500" />
        <p className="text-rose-700 font-medium mt-2">Menu didn’t load</p>
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

  const totalPortions = menu.reduce((sum, m) => sum + m.portionsLeft, 0)
  const soldOut = menu.filter((m) => stockLevel(m.portionsLeft) === 'out').length
  const lowStock = menu.filter((m) => stockLevel(m.portionsLeft) === 'low').length

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 leading-tight">
              University of Ruhuna Canteen
            </h2>
            <p className="text-[13px] sm:text-sm text-stone-500 mt-0.5">
              {isStaff
                ? 'Live stock view. Watch the gauges to plan cooking and cut waste.'
                : 'Reserve your meal ahead of time. Every reservation helps the kitchen cook the right amount.'}
            </p>
          </div>

          {isStaff && menu.length > 0 && (
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 shrink-0">
              <Stat label="Left" value={totalPortions} />
              <Stat label="Low" value={lowStock} tone="amber" />
              <Stat label="Out" value={soldOut} tone="rose" />
            </div>
          )}
        </div>

        {isStaff && menu.length > 0 && (
          <div className="mt-4">
            <StockHealthBar menu={menu} />
          </div>
        )}
      </div>

      {!isStaff && lastImpact && (
        <div className="flex items-start sm:items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Sprout size={18} className="text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>{lastImpact} — thanks for helping reduce campus food waste.</span>
        </div>
      )}

      {menu.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 sm:p-12 text-center">
          <UtensilsCrossed className="mx-auto text-stone-300" size={28} />
          <p className="text-stone-600 font-medium mt-3">No meals listed for today</p>
          <p className="text-stone-400 text-sm mt-1">Check back once the kitchen publishes the menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {menu.map((item) => {
            const level = stockLevel(item.portionsLeft)
            const cat = categoryStyle(item.category)
            const imageUrl = resolveImageUrl(item)
            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg hover:shadow-stone-200/70 hover:border-stone-300"
              >
                <div className="relative">
                  <FoodImage src={imageUrl} alt={item.name} />
                  <div className="absolute inset-x-0 top-0 p-2.5 sm:p-3 flex items-start justify-between gap-2 bg-gradient-to-b from-black/35 via-black/0 to-transparent">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide bg-white/90 backdrop-blur-sm ${cat.text} px-2 py-0.5 rounded-full truncate max-w-[65%] shadow-sm`}
                    >
                      <span className={`size-1.5 rounded-full ${cat.dot} shrink-0`} />
                      <span className="truncate">{item.category}</span>
                    </span>
                    {item.vegetarian && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shrink-0 shadow-sm">
                        <Leaf size={11} /> Veg
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2 min-h-[2.5em]">
                    {item.name}
                  </h3>
                  <p className="font-display text-lg font-bold text-emerald-700 mt-1">{formatLkr(item.priceLkr)}</p>

                  <div className="mt-auto pt-4 space-y-2.5">
                    <PortionGauge portionsLeft={item.portionsLeft} />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${
                          level === 'out'
                            ? 'bg-rose-50 text-rose-600'
                            : level === 'low'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {level === 'out'
                          ? 'Sold out'
                          : level === 'low'
                            ? `${item.portionsLeft} left — going fast`
                            : `${item.portionsLeft} left`}
                      </span>

                      {!isStaff && (
                        <button
                          onClick={() => reserve(item.id)}
                          disabled={level === 'out' || reservingId === item.id}
                          className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shrink-0 min-w-[92px]"
                        >
                          {reservingId === item.id && <Loader2 size={14} className="animate-spin" />}
                          {level === 'out' ? 'Unavailable' : 'Reserve'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }) {
  const valueColor =
    tone === 'rose' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : 'text-stone-900'
  return (
    <div className="rounded-xl bg-stone-50 border border-stone-200 px-3 sm:px-4 py-1.5 sm:py-2 text-center sm:text-left">
      <p className={`font-display text-base sm:text-lg font-bold leading-tight ${valueColor}`}>{value}</p>
      <p className="text-[10px] sm:text-[11px] text-stone-500 leading-tight">{label}</p>
    </div>
  )
}