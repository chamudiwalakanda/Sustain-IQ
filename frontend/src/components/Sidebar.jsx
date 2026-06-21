import { LayoutDashboard, Utensils, BedDouble, MessageSquareHeart, LogOut, Leaf } from 'lucide-react'

const ROLE_LABEL = {
  student: 'Student',
  warden: 'Hostel Warden',
  canteen: 'Canteen Staff',
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'canteen', label: 'Canteen', icon: Utensils },
  { id: 'hostel', label: 'Hostel', icon: BedDouble },
  { id: 'grievances', label: 'Support Desk', icon: MessageSquareHeart },
]

export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-stone-200 flex flex-col">
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
  )
}
