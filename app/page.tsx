"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/log-in"
import { Sidebar } from "@/components/sidebar"
import TaskForm from "@/components/task-form"
import History from "@/components/history-tab"
import { UpdateTab } from "@/components/update-tab"
import { Dashboard } from "@/components/dashboard"
import { CustomerKYCForm } from "@/components/customer-kyc-form"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Import or define the UserData type from LoginPage
type UserData = {
  allowedPages: string[]
  [key: string]: any
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Set active tab to first allowed page
        if (userData.allowedPages && userData.allowedPages.length > 0) {
          setActiveTab(userData.allowedPages[0])
        }
      } catch (err) {
        console.error("Error parsing stored user:", err)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: UserData) => {
    console.log("User logged in:", userData)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    // Set active tab to first allowed page
    if (userData.allowedPages && userData.allowedPages.length > 0) {
      setActiveTab(userData.allowedPages[0])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setActiveTab("dashboard")
  }

  const renderContent = () => {
    // Check if user has access to the current tab
    if (user && user.allowedPages && !user.allowedPages.includes(activeTab)) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-blue-50/30">
          <Card className="max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
              <CardDescription className="text-base mt-2">
                You don't have permission to access this page. Please contact your administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "task-form":
        return <TaskForm />
      case "history":
        return <History />
      case "update":
        return <UpdateTab />
      case "kyc-form":
        return <CustomerKYCForm />
      default:
        return <Dashboard />
    }
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Show main app with sidebar if user is authenticated
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}