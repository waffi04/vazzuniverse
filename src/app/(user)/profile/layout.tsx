import { AuthProvider, UserGuard } from "@/components/layouts/provider/user-provider"
import type { ReactNode } from "react"
import { SidebarMember } from "./sidebar"

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UserGuard>
        <div className="min-h-screen" style={{ background: "hsl(219, 100%, 10%)" }}>
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-64 shrink-0">
                <SidebarMember />
              </div>
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </div>
      </UserGuard>
    </AuthProvider>
  )
}

