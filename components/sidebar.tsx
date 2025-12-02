"use client"

import { LayoutDashboard, ClipboardList, History, RefreshCw, FileText, LogOut, User, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface UserType {
  allowedPages: string[];
  username?: string;
  email?: string;
  name?: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user: UserType | null;
  onLogout: () => void;
}

// Define tabs array with proper type
const tabs: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "task-form", label: "Create Task", icon: ClipboardList },
  { id: "update", label: "Update Tasks", icon: RefreshCw },
  { id: "history", label: "History", icon: History },
  { id: "kyc-form", label: "Customer KYC", icon: FileText },
]

export function Sidebar({ activeTab, onTabChange, user, onLogout }: SidebarProps) {
  // Filter tabs based on user's allowed pages
  const allowedTabs = tabs.filter(tab => 
    user?.allowedPages?.includes(tab.id) ?? false
  )

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex flex-col shadow-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Plant Visit
        </h1>
        <p className="text-slate-400 text-sm mt-1">Management System</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-full">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.username}
              </p>
            </div>
          </div>
        </div>
      )}

      <Separator className="bg-slate-700 mb-4" />

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {allowedTabs.length > 0 ? (
          allowedTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })
        ) : (
          <div className="text-center text-slate-400 py-8">
            <p className="text-sm">No pages available</p>
          </div>
        )}
      </nav>

      <Separator className="bg-slate-700 my-4" />

      {/* Logout Button */}
      <Button
        onClick={onLogout}
        variant="ghost"
        className="w-full justify-start text-slate-300 hover:text-white hover:bg-red-600/20 border border-slate-700 hover:border-red-500/50"
      >
        <LogOut className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </Button>

      <div className="mt-4 text-center text-xs text-slate-500">
        <p>© 2024 Plant Visit System</p>
      </div>
    </div>
  )
}