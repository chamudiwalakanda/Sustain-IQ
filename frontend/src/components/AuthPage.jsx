import { useState } from 'react'
import { Leaf, GraduationCap, ShieldCheck, ChefHat, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../api'

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, idLabel: 'Registration Number', idHint: 'EG/2021/1234' },
  { id: 'warden', label: 'Warden', icon: ShieldCheck, idLabel: 'Staff ID', idHint: 'WRD-0142' },
  { id: 'canteen', label: 'Canteen Staff', icon: ChefHat, idLabel: 'Staff ID', idHint: 'CAN-0098' },
]

const FACULTIES = [
  'Faculty of Engineering',
  'Faculty of Medicine',
  'Faculty of Science',
  'Faculty of Management & Finance',
  'Faculty of Humanities & Social Sciences',
  'Faculty of Agriculture',
  'Faculty of Fisheries & Marine Sciences',
  'Faculty of Technology',
  'Faculty of Allied Health Sciences',
  'Administration / Support Services',
]

const EMPTY = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  universityId: '',
  faculty: FACULTIES[0],
}

export default function AuthPage({ onAuthed, showToast }) {
  const [mode, setMode] = useState('register') // 'register' | 'login'
  const [role, setRole] = useState('student')
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const activeRole = ROLES.find((r) => r.id === role)

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setServerError('')
  }

  const validate = () => {
    const next = {}
    if (mode === 'register') {
      if (!form.fullName.trim()) next.fullName = 'Enter your full name'
      if (!form.universityId.trim()) next.universityId = `Enter your ${activeRole.idLabel.toLowerCase()}`
      if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match'
    }
    if (!form.email.trim()) next.email = 'Enter your email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.password) next.password = 'Enter a password'
    else if (form.password.length < 6) next.password = 'At least 6 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setServerError('')
    try {
      let result
      if (mode === 'register') {
        result = await api.register({ ...form, role })
      } else {
        result = await api.login({ email: form.email, password: form.password })
      }
      showToast(result.message, 'success')
      onAuthed(result.data)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-maroon text-white p-12 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/15">
            <Leaf size={20} />
          </span>
          <span className="font-display text-2xl font-extrabold">SustainIQ</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            A smarter, greener campus for Ruhuna.
          </h1>
          <p className="text-white/80 leading-relaxed">
            Reserve canteen meals, cut food waste, check hostel bed availability,
            manage check-in, and raise grievances — all in one place, built for
            University of Ruhuna students and staff.
          </p>
        </div>
        <p className="text-white/60 text-sm">Wellamadama · Hapugala · Galle</p>
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -right-4 top-1/3 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-maroon text-white">
              <Leaf size={18} />
            </span>
            <span className="font-display text-xl font-extrabold text-stone-900">SustainIQ</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-stone-900">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-stone-500 text-sm mt-1 mb-6">
            {mode === 'register'
              ? 'Register to access the campus resource portal.'
              : 'Log in to continue to your dashboard.'}
          </p>

          {mode === 'register' && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {ROLES.map((r) => {
                const Icon = r.icon
                const active = role === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors ${
                      active
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    <Icon size={18} />
                    {r.label}
                  </button>
                )
              })}
            </div>
          )}

          {serverError && (
            <div className="flex items-start gap-2 mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'register' && (
              <Field
                label="Full name"
                value={form.fullName}
                onChange={(v) => update('fullName', v)}
                placeholder="Nimali Perera"
                error={errors.fullName}
              />
            )}

            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update('email', v)}
              placeholder="nimali@ruh.ac.lk"
              error={errors.email}
            />

            {mode === 'register' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label={activeRole.idLabel}
                  value={form.universityId}
                  onChange={(v) => update('universityId', v)}
                  placeholder={activeRole.idHint}
                  error={errors.universityId}
                />
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    {role === 'student' ? 'Faculty' : 'Department'}
                  </label>
                  <select
                    value={form.faculty}
                    onChange={(e) => update('faculty', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {FACULTIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => update('password', v)}
                placeholder="••••••••"
                error={errors.password}
              />
              {mode === 'register' && (
                <Field
                  label="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(v) => update('confirmPassword', v)}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {mode === 'register' ? 'Create account' : 'Log in'}
            </button>
          </div>

          <p className="text-center text-sm text-stone-500 mt-6">
            {mode === 'register' ? 'Already registered?' : 'New to SustainIQ?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register')
                setErrors({})
                setServerError('')
              }}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {mode === 'register' ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-stone-200 focus:border-emerald-500 focus:ring-emerald-100'
        }`}
      />
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  )
}
