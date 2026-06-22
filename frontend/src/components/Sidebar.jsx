import { LayoutDashboard, Utensils, BedDouble, MessageSquareHeart, LogOut, Leaf } from 'lucide-react'

const ROLE_LABEL = {
  student: 'Student',
  warden: 'Hostel Warden',
  canteen: 'Canteen Staff',
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', short: 'Dashboard', icon: LayoutDashboard },
  { id: 'canteen', label: 'Canteen', short: 'Canteen', icon: Utensils },
  { id: 'hostel', label: 'Hostel', short: 'Hostel', icon: BedDouble },
  { id: 'grievances', label: 'Support Desk', short: 'Support', icon: MessageSquareHeart },
]

export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  return (
    <>
      {/* Desktop rail — hidden on mobile, replaced by the bottom nav below */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-stone-200 flex-col">
        <div className="px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-maroon text-white">
              <Leaf size={18} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-extrabold text-stone-900">SustainIQ</p>
              <p className="text-[11px] text-stone-500 -mt-0.5">University of Ruhuna</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-stone-100">
          <div className="rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 mb-2">
            <p className="text-sm font-semibold text-stone-800 truncate">{user.fullName}</p>
            <p className="text-[11px] text-stone-500 truncate">{user.faculty}</p>
            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-maroon bg-maroon/10 px-2 py-0.5 rounded-full">
              {ROLE_LABEL[user.role] || user.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation — visible below md, sits above content */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-[56px] px-1 py-2 text-[11px] font-medium leading-tight transition-colors ${
                  active ? 'text-emerald-600' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Icon size={20} className={active ? 'text-emerald-600' : ''} />
                {tab.short}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
