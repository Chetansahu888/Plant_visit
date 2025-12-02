"use client"

import { useState, KeyboardEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, User, AlertCircle } from "lucide-react"

interface UserData {
  allowedPages: string[];  // Added this line
  username?: string;
  email?: string;
  name?: string;
  [key: string]: any;  // Add this to allow other properties from API
}

interface LoginPageProps {
  onLogin: (user: UserData) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec"

  const handleLogin = async () => {
    setError("")
    
    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }
    
    setLoading(true)

    try {
      const url = `${SHEET_API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&t=${Date.now()}`
      
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow' as RequestRedirect
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Login response:", result)

      if (result.success && result.user) {
        // Ensure user has allowedPages, default to empty array if not provided
        const userData: UserData = {
          allowedPages: result.user.allowedPages || [],
          username: result.user.username,
          email: result.user.email,
          name: result.user.name,
          ...result.user // Spread any other properties
        }
        
        // Pass user data to parent component
        onLogin(userData)
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to login. Please check your credentials and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access Plant Visit Management System
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>Contact your administrator for access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}