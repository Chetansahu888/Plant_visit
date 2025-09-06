// "use client"

// import { useState } from "react"
// import { Sidebar } from "@/components/sidebar"
// // import { TaskForm } from "@/components/task-form"
// import TaskForm from "@/components/task-form"
// import  History  from "@/components/history-tab"
// import { UpdateTab } from "@/components/update-tab"
// // import { ReportTab } from "@/components/report-tab"
// import { Dashboard } from "@/components/dashboard"

// export default function Home() {
//   const [activeTab, setActiveTab] = useState("dashboard")

//   const renderContent = () => {
//     switch (activeTab) {
//       case "dashboard":
//         return <Dashboard />
//       case "task-form":
//         return <TaskForm />
//       case "history":
//         return <History />
//       case "update":
//         return <UpdateTab />
//       // case "reports":
//       //   return <ReportTab />
//       default:
//         return <Dashboard />
//     }
//   }

//   return (
//     <div className="flex h-screen bg-background">
//       <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
//       <main className="flex-1 overflow-auto">{renderContent()}</main>
//     </div>
//   )
// }











"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import TaskForm from "@/components/task-form"
import History from "@/components/history-tab"
import { UpdateTab } from "@/components/update-tab"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "task-form":
        return <TaskForm />
      case "history":
        return <History />
      case "update":
        return <UpdateTab />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setMobileSidebarOpen(false) // close sidebar on mobile after selection
        }}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto md:ml-0">
        {renderContent()}
      </main>
    </div>
  )
}
