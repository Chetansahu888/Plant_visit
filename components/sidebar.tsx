







// "use client"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { LayoutDashboard, Plus, Edit, BarChart3, Factory, Sparkles,History  } from "lucide-react"

// interface SidebarProps {
//   activeTab: string
//   onTabChange: (tab: string) => void
// }

// const menuItems = [
//   { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { id: "task-form", label: "Create Task", icon: Plus },
//   { id: "update", label: "Update Tasks", icon: Edit },
//   { id: "history", label: "History", icon: History  },
//   // { id: "reports", label: "Reports", icon: BarChart3 },
// ]

// export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
//   return (
//     <div className="w-64 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 border-r border-slate-800/50 flex flex-col relative overflow-hidden">
      
//       {/* Animated background overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-fuchsia-500/20 opacity-50"></div>
//       <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      
//       {/* Floating particles effect */}
//       <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
//       <div className="absolute top-32 right-8 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce"></div>
//       <div className="absolute bottom-20 left-6 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-300"></div>

//       {/* Header */}
//       <div className="p-6 border-b border-slate-700/50 relative z-10">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 relative">
//             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
//             <Factory className="w-6 h-6 text-white relative z-10" />
//             <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
//           </div>
//           <div>
//             <h1 className="font-bold text-xl text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
//               Plant Visits
//             </h1>
//             <p className="text-sm text-slate-300 font-medium">Task Management Pro</p>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 relative z-10">
//         <div className="space-y-3">
//           {menuItems.map((item, index) => {
//             const Icon = item.icon
//             const isActive = activeTab === item.id
//             return (
//               <Button
//                 key={item.id}
//                 variant="ghost"
//                 className={cn(
//                   "w-full justify-start gap-4 h-12 group relative overflow-hidden transition-all duration-300 transform hover:scale-105",
//                   isActive
//                     ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30"
//                     : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50",
//                 )}
//                 style={{ 
//                   animationDelay: `${index * 100}ms`,
//                   animation: "slideInLeft 0.5s ease-out"
//                 }}
//                 onClick={() => onTabChange(item.id)}
//               >
//                 {/* Active indicator */}
//                 {isActive && (
//                   <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-r-full"></div>
//                 )}
                
//                 {/* Icon container */}
//                 <div className={cn(
//                   "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
//                   isActive 
//                     ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-md" 
//                     : "bg-slate-700/50 group-hover:bg-slate-600"
//                 )}>
//                   <Icon className={cn(
//                     "w-4 h-4 transition-all duration-300",
//                     isActive ? "text-white" : "text-slate-400 group-hover:text-white"
//                   )} />
//                 </div>
                
//                 {/* Label */}
//                 <span className={cn(
//                   "font-medium transition-all duration-300",
//                   isActive ? "text-white font-semibold" : "text-slate-300 group-hover:text-white"
//                 )}>
//                   {item.label}
//                 </span>
                
//                 {/* Hover glow effect */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//               </Button>
//             )
//           })}
//         </div>
//       </nav>

//       {/* Footer with enhanced styling */}
//       <div className="p-4 border-t border-emerald-700/50 relative z-10">
//         <div className="text-center space-y-2">
//           <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
//           <div className="text-xs text-emerald-300 font-medium bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
//             v1.0.0 - Plant Management System
//           </div>
//           <div className="flex justify-center space-x-1">
//             <div className="w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-pulse"></div>
//             <div className="w-1.5 h-1.5 bg-teal-400/40 rounded-full animate-pulse delay-150"></div>
//             <div className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-pulse delay-300"></div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes slideInLeft {
//           from {
//             opacity: 0;
//             transform: translateX(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }
//       `}</style>
//     </div>
//   )
// }




"use client"

import { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, Edit, BarChart3, Factory, Sparkles, History, Menu, X } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "task-form", label: "Create Task", icon: Plus },
  { id: "update", label: "Update Tasks", icon: Edit },
  { id: "history", label: "History", icon: History },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button for mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-md"
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 border-r border-slate-800/50 flex flex-col z-40 transition-transform duration-300",
        // On mobile: slide in/out
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:relative" // always visible on desktop
      )}>
        {/* Existing sidebar content */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-fuchsia-500/20 opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>

        {/* Floating particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-8 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-6 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-300"></div>

        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              <Factory className="w-6 h-6 text-white relative z-10" />
              <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Plant Visits
              </h1>
              <p className="text-sm text-slate-300 font-medium">Task Management Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 relative z-10">
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 group relative overflow-hidden transition-all duration-300 transform hover:scale-105",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30"
                      : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50",
                  )}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: "slideInLeft 0.5s ease-out"
                  }}
                  onClick={() => {
  onTabChange(item.id);
  setIsOpen(false); // Close sidebar on mobile after click
}}

                >
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-r-full"></div>
                  )}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-md" 
                      : "bg-slate-700/50 group-hover:bg-slate-600"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4 transition-all duration-300",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )} />
                  </div>
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    isActive ? "text-white font-semibold" : "text-slate-300 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-700/50 relative z-10">
          <div className="text-center space-y-2">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
            <div className="text-xs text-emerald-300 font-medium bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              v1.0.0 - Plant Management System
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-teal-400/40 rounded-full animate-pulse delay-150"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </>
  )
}
