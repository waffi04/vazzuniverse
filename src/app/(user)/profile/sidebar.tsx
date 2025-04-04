import { CreditCard, User } from "lucide-react"
import Link from "next/link"

export function SidebarMember() {
  return (
    <aside
      className="w-full lg:w-64 shadow-md rounded-lg p-4 mb-6 lg:mb-0"
      style={{ background: "hsl(219, 100%, 15%)" }}
    >
      <div className="space-y-4">
        <h3 className="text-lg font-medium px-2 text-white">Member Menu</h3>

        <nav className="flex flex-col space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
            aria-label="Profile"
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          <Link
            href="/profile/deposit"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-200 hover:bg-gray-700/50 rounded-md transition-colors"
            aria-label="Deposit"
          >
            <CreditCard size={18} />
            <span>Deposit</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}

