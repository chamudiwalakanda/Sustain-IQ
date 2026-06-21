import { useEffect, useRef, useState } from 'react'
import AuthPage from './components/AuthPage'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Dashboard from './components/Dashboard'
import Canteen from './components/Canteen'
import Hostel from './components/Hostel'
import GrievanceDesk from './components/GrievanceDesk'

const TAB_TITLES = {
  dashboard: 'Dashboard',
  canteen: 'Canteen',
  hostel: 'Hostel',
  grievances: 'Support Desk',
}

export default function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), [])

  const logout = () => {
    setUser(null)
    setActiveTab('dashboard')
    showToast('You have been logged out.', 'info')
  }

  if (!user) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AuthPage onAuthed={setUser} showToast={showToast} />
      </>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-stone-200 flex items-center px-6">
          <h1 className="font-display text-lg font-bold text-stone-900">{TAB_TITLES[activeTab]}</h1>
        </header>

        <main className="flex-1 overflow-y-auto scroll-soft p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard user={user} />}
            {activeTab === 'canteen' && <Canteen user={user} showToast={showToast} />}
            {activeTab === 'hostel' && <Hostel user={user} showToast={showToast} />}
            {activeTab === 'grievances' && <GrievanceDesk showToast={showToast} />}
          </div>
        </main>
      </div>
    </div>
  )
}
