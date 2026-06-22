import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { Utensils, Leaf, BedDouble, MessageSquareHeart, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { api } from '../api'

const CATEGORY_COLORS = {
  Canteen: '#0d9488',
  Hostel: '#0e7490',
  Maintenance: '#ca8a04',
  Safety: '#be123c',
  General: '#78716c',
}

export default function Dashboard({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getAnalytics()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-stone-400">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm mt-3">Loading campus analytics…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto text-rose-500" />
        <p className="text-rose-700 font-medium mt-2">Couldn’t load analytics</p>
        <p className="text-rose-600 text-sm mt-1">{error}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center justify-center gap-2 bg-rose-600 text-white text-sm px-4 py-2 min-h-[44px] rounded-lg hover:bg-rose-700"
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    )
  }

  const m = data.metrics
  const cards = [
    { label: 'Meals reserved today', value: m.mealsReservedToday, icon: Utensils, tint: 'text-emerald-600 bg-emerald-50' },
    { label: 'Food waste reduced', value: `${m.foodWasteSavedKg} kg`, icon: Leaf, tint: 'text-teal-600 bg-teal-50' },
    { label: 'Vacant hostel beds', value: `${m.vacantBeds} / ${m.totalBeds}`, icon: BedDouble, tint: 'text-cyan-700 bg-cyan-50' },
    { label: 'Pending grievances', value: m.pendingGrievances, icon: MessageSquareHeart, tint: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">University of Ruhuna · Campus overview</p>
        <h2 className="font-display text-2xl font-bold text-stone-900 mt-1">
          Welcome, {user.fullName.split(' ')[0]}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Here’s how campus resources are looking right now. Numbers update as students reserve meals,
          wardens free up beds, and grievances come in.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
              <span className={`grid place-items-center w-10 h-10 rounded-xl ${c.tint}`}>
                <Icon size={20} />
              </span>
              <p className="font-display text-xl sm:text-2xl font-bold text-stone-900 mt-3">{c.value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{c.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Grievances by category" subtitle="Where students need the most support">
          <BarChart data={data.grievanceByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={tooltipStyle} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={38}>
              {data.grievanceByCategory.map((row) => (
                <Cell key={row.name} fill={CATEGORY_COLORS[row.name] || '#78716c'} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Hostel occupancy" subtitle="Beds across Wijayaba & Gemunu hostels">
          <BarChart data={data.hostelOccupancy}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={tooltipStyle} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={56}>
              {data.hostelOccupancy.map((row) => (
                <Cell key={row.name} fill={row.name === 'Vacant' ? '#059669' : '#9f1239'} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e7e5e4',
  borderRadius: '10px',
  fontSize: '12px',
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
      <h3 className="font-semibold text-stone-800">{title}</h3>
      <p className="text-xs text-stone-500 mb-4">{subtitle}</p>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
