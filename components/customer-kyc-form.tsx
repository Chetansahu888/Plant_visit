"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, MapPin, Building, Phone, FileText, Briefcase, Save, Loader2, CheckCircle, History, Plus, Building2, Calendar, Search, IndianRupee, Edit, X, AlertCircle, Clock, Download, Sheet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomerKYCData {
  customerName: string;
  address: string;
  cityLocation: string;
  purchaseName: string;
  creditLimit: string;
  purchaseNo: string;
  purchaseDetails: string;
  projectName: string;
  entryNumber: number;
  versionNumber?: number; // Track which version this is
}

interface KYCSubmission extends CustomerKYCData {
  timestamp: string
  customerId: string
  editHistory?: EditRecord[]
  allVersions?: {
    [key: string]: string[] // Store all versions of each field
  }
}

interface EditRecord {
  timestamp: string
  editedBy: string
  changes: FieldChange[]
}

interface FieldChange {
  field: string
  oldValue: string
  newValue: string
  column?: string // Which column it was saved to
  version?: number // Version number
}

export function CustomerKYCForm() {
const [formData, setFormData] = useState<CustomerKYCData>({
  customerName: "",
  address: "",
  cityLocation: "",
  purchaseName: "",
  creditLimit: "",
  purchaseNo: "",
  purchaseDetails: "",
  projectName: "",
  entryNumber: 1
})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"form" | "history">("form")
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState("all")
  const [editingSubmission, setEditingSubmission] = useState<KYCSubmission | null>(null)
  const [editFormData, setEditFormData] = useState<CustomerKYCData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [viewEditHistory, setViewEditHistory] = useState<KYCSubmission | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Your Google Apps Script URL
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec"

  // Fetch submission history
  // Fetch submission history
// Fetch submission history

// Add this helper function at the top of your component
const parseSheetDate = (dateString: string): string => {
  if (!dateString) return new Date().toISOString();
  
  // If it's already in ISO format, return as is
  if (dateString.includes('T') && dateString.endsWith('Z')) {
    return dateString;
  }
  
  // Parse DD/MM/YYYY HH:mm:ss format
  if (dateString.includes('/')) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    
    if (timePart) {
      const [hours, minutes, seconds] = timePart.split(':');
      return new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day),
        parseInt(hours),
        parseInt(minutes), 
        parseInt(seconds)
      ).toISOString();
    } else {
      return new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day)
      ).toISOString();
    }
  }
  
  // Fallback to current date
  return new Date().toISOString();
}
// Update fetchSubmissionHistory to include numbered columns:
const fetchSubmissionHistory = async () => {
  setLoadingHistory(true)
  try {
    const response = await fetch(`${SHEET_API_URL}?action=getKYCData&t=${Date.now()}`)
    if (response.ok) {
      const result = await response.json()
      console.log("KYC Data Response:", result)
      
      if (result.success && result.data) {
        const processedSubmissions: KYCSubmission[] = []
        
        result.data.forEach((row: any) => {
          const customerId = row["Customer ID"]
          
          if (!customerId || customerId === "") return // Skip empty rows
          
          // Get LATEST version of each field by checking columns 1-5
          const getLatestValue = (field: string): string => {
            // Check columns 5 to 1 (reverse to get latest)
            for (let i = 5; i >= 1; i--) {
              const columnName = i === 1 ? field : `${field}${i}`
              if (row[columnName] && row[columnName].toString().trim() !== "") {
                return row[columnName].toString()
              }
            }
            // Fallback to original column
            return row[field] ? row[field].toString() : ""
          }
          
          // Get ALL versions for edit history display
          const getAllVersions = (field: string): string[] => {
            const versions: string[] = []
            // Add original version
            if (row[field]) versions.push(row[field].toString())
            // Add numbered versions
            for (let i = 1; i <= 5; i++) {
              const columnName = `${field}${i}`
              if (row[columnName] && row[columnName].toString().trim() !== "") {
                versions.push(row[columnName].toString())
              }
            }
            return versions
          }
          
          // Parse edit history
          let editHistory: EditRecord[] = []
          try {
            const historyJson = row["Edit History"]
            if (historyJson && historyJson !== "[]" && historyJson !== "") {
              const parsed = JSON.parse(historyJson)
              if (Array.isArray(parsed)) {
                editHistory = parsed.map((entry: any) => ({
                  timestamp: entry.timestamp || "",
                  editedBy: entry.user || entry.editedBy || "Unknown",
                  changes: Object.keys(entry.changes || {}).map(fieldKey => {
                    const change = entry.changes[fieldKey]
                    return {
                      field: fieldKey,
                      oldValue: change.from || "",
                      newValue: change.to || "",
                      column: change.column || "",
                      version: change.version || 1
                    }
                  })
                }))
              }
            }
          } catch (e) {
            console.error("Error parsing edit history:", e)
          }
          
          const submission: KYCSubmission = {
            customerId: customerId,
            timestamp: parseSheetDate(row["Timestamp"]),
            customerName: getLatestValue("Customer Name"),
            address: getLatestValue("Address"),
            cityLocation: getLatestValue("City/Location"),
            purchaseName: getLatestValue("Purchase Name"),
            creditLimit: getLatestValue("Credit Limit"),
            purchaseNo: getLatestValue("Purchase No."),
            purchaseDetails: getLatestValue("Purchase Details"),
            projectName: getLatestValue("Project Name"),
            entryNumber: Number(row["Entry Number"]) || 1,
            editHistory: editHistory,
            allVersions: {
              customerName: getAllVersions("Customer Name"),
              address: getAllVersions("Address"),
              cityLocation: getAllVersions("City/Location"),
              purchaseName: getAllVersions("Purchase Name"),
              creditLimit: getAllVersions("Credit Limit"),
              purchaseNo: getAllVersions("Purchase No."),
              purchaseDetails: getAllVersions("Purchase Details"),
              projectName: getAllVersions("Project Name")
            }
          }
          
          processedSubmissions.push(submission)
        })
        
        // Sort by timestamp (newest first)
        processedSubmissions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        
        setSubmissions(processedSubmissions)
      } else {
        throw new Error(result.error || "No KYC data found")
      }
    } else {
      throw new Error("Failed to fetch KYC data")
    }
  } catch (error) {
    console.error("Error fetching KYC history:", error)
    setError("Failed to load submission history")
    setSubmissions([])
  } finally {
    setLoadingHistory(false)
  }
}

// Helper function to get all versions of a field
const getFieldVersions = (row: any, fieldName: string, maxVersions: number) => {
  const versions: string[] = [];
  
  // Add original version
  if (row[fieldName]) versions.push(row[fieldName]);
  
  // Add numbered versions
  for (let i = 1; i <= maxVersions; i++) {
    const numberedField = fieldName + i;
    if (row[numberedField]) versions.push(row[numberedField]);
  }
  
  return versions;
}


  useEffect(() => {
    if (activeTab === "history") {
      fetchSubmissionHistory()
    }
  }, [activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)

  try {
    // Create URL parameters for GET request
    const params = new URLSearchParams({
      action: 'submitKYC',
      timestamp: new Date().toISOString()
    })

    // Check if customer name is not empty
    if (!formData.customerName.trim()) {
      throw new Error("Customer Name is required")
    }

    // Add single entry to parameters (no need for forEach loop)
    params.append('customerName', formData.customerName)
    params.append('address', formData.address)
    params.append('cityLocation', formData.cityLocation)
    params.append('purchaseName', formData.purchaseName)
    params.append('creditLimit', formData.creditLimit)
    params.append('purchaseNo', formData.purchaseNo)
    params.append('purchaseDetails', formData.purchaseDetails)
    params.append('projectName', formData.projectName)
    params.append('entryNumber', formData.entryNumber.toString())

    const url = `${SHEET_API_URL}?${params.toString()}`
    console.log("Submitting URL:", url) // Debug log
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })

    const result = await response.json()
    console.log("Submit KYC Response:", result)

    if (result.success) {
      setIsSubmitted(true)
      // Reset form
      setFormData({
        customerName: "",
        address: "",
        cityLocation: "",
        purchaseName: "",
        creditLimit: "",
        purchaseNo: "",
        purchaseDetails: "",
        projectName: "",
        entryNumber: 1
      })
      if (activeTab === "history") {
        fetchSubmissionHistory()
      }
    } else {
      throw new Error(result.error || "Failed to submit KYC form")
    }
  } catch (err: any) {
    console.error("Error submitting KYC form:", err)
    setError(err.message || "Failed to submit form. Please try again.")
  } finally {
    setIsSubmitting(false)
  }
}

const handleEditSubmit = async () => {
  if (!editingSubmission || !editFormData) return

  setIsEditing(true)
  setError(null)
  
  try {
    // Find which version number to use for this edit
    let nextVersionNumber = 1
    
    // Check existing versions to determine next version number
    if (editingSubmission.allVersions) {
      // Check how many versions exist for customerName (represents total edits)
      const customerNameVersions = editingSubmission.allVersions.customerName || []
      nextVersionNumber = Math.min(customerNameVersions.length + 1, 5)
    }
    
    // Prepare update data
    const params = new URLSearchParams({
      action: 'updateKYC',
      customerId: editingSubmission.customerId,
      currentUser: "Current User"
    })
    
    // Fix 1: Define fieldMapping with all properties from CustomerKYCData
    const fieldMapping: Record<keyof CustomerKYCData, string> = {
      customerName: "customerName",
      address: "address",
      cityLocation: "cityLocation",
      purchaseName: "purchaseName",
      creditLimit: "creditLimit",
      purchaseNo: "purchaseNo",
      purchaseDetails: "purchaseDetails",
      projectName: "projectName",
      entryNumber: "entryNumber", // Add missing property
      versionNumber: "versionNumber" // Add versionNumber if needed
    }
    
    // Fix 2: Iterate through fieldMapping keys instead of editFormData keys
    Object.keys(fieldMapping).forEach(fieldKey => {
      const key = fieldKey as keyof CustomerKYCData;
      const value = editFormData[key];
      
      // Skip if value is undefined or (if string) empty after trim
      if (value === undefined || value === null) return;
      
      // For strings, check if it's empty after trimming
      if (typeof value === "string" && value.trim() === "") {
        return;
      }
      
      // For numbers, you might want to send them anyway
      // Or skip if 0: if (typeof value === "number" && value === 0) return;
      
      // Get the mapped parameter name
      const paramName = fieldMapping[key];
      
      // Add version suffix for versions 2-5
      const finalParamName = nextVersionNumber > 1 ? paramName + nextVersionNumber : paramName;
      
      // Convert value to string for URL params
      params.append(finalParamName, String(value));
    })
    
    console.log("Edit Params:", params.toString())
    
    const url = `${SHEET_API_URL}?${params.toString()}`
    
    // Make the update request
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })
    
    // Try to get response text
    const responseText = await response.text()
    console.log("Edit Response:", responseText)
    
    // Parse response if it's JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.log("Response is not JSON:", responseText)
      // If response is not JSON, it might be HTML (error page)
      if (responseText.includes("success") || responseText.includes("updated")) {
        result = { success: true, message: "Update submitted" }
      } else {
        throw new Error("Invalid response from server")
      }
    }
    
    if (result.success) {
      // Close dialog and refresh data
      closeEditDialog()
      
      // Show success message
      setError("✅ Update successful! Refreshing data...")
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchSubmissionHistory()
      }, 1000)
    } else {
      throw new Error(result.error || "Update failed")
    }
    
  } catch (err: any) {
    console.error("Error updating KYC:", err)
    setError(`❌ ${err.message || "Failed to update. Please try again."}`)
  } finally {
    setIsEditing(false)
  }
}
// Add this function to fetch edit history for a specific customer
const fetchEditHistoryForCustomer = async (customerId: string) => {
  try {
    const response = await fetch(
      `${SHEET_API_URL}?action=getEditHistory&customerId=${encodeURIComponent(customerId)}`
    );
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        // Transform the data to match your component's format
        const transformedHistory = result.history.map((entry: any) => ({
          timestamp: entry.timestamp,
          editedBy: entry.user || entry.editedBy || "Unknown",
          changes: Object.keys(entry.changes || {}).map(field => ({
            field,
            oldValue: entry.changes[field]?.from || "",
            newValue: entry.changes[field]?.to || ""
          }))
        }));
        
        return transformedHistory;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching edit history:", error);
    return [];
  }
};

  const handleInputChange = (field: keyof CustomerKYCData, value: string | number) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }))
}

  const handleEditInputChange = (field: keyof CustomerKYCData, value: string | number) => {
  setEditFormData(prev => prev ? {
    ...prev,
    [field]: value
  } : null)
}

  const resetForm = () => {
    setIsSubmitted(false)
    setError(null)
    setActiveTab("form")
  }

  const openEditDialog = (submission: KYCSubmission) => {
    setEditingSubmission(submission)
    setEditFormData({
      customerName: submission.customerName,
      address: submission.address,
      cityLocation: submission.cityLocation,
      purchaseName: submission.purchaseName,
      creditLimit: submission.creditLimit,
      purchaseNo: submission.purchaseNo,
      purchaseDetails: submission.purchaseDetails,
      projectName: submission.projectName,
      entryNumber: submission.entryNumber || 1 // Add this line

    })
    setIsEditDialogOpen(true)
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingSubmission(null)
    setEditFormData(null)
    setIsEditing(false)
  }

  
  // Filter submissions based on search and project filter
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.purchaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProject = filterProject === "all" || submission.projectName === filterProject
    
    return matchesSearch && matchesProject
  })

  const uniqueProjects = Array.from(new Set(submissions.map(s => s.projectName))).filter(Boolean)

  const getEditCount = (submission: KYCSubmission) => {
    return submission.editHistory?.length || 0
  }

  const getFieldDisplayName = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      customerName: "Customer Name",
      address: "Address",
      cityLocation: "City/Location",
      purchaseName: "Purchase Name",
      creditLimit: "Credit Limit",
      purchaseNo: "Purchase No",
      purchaseDetails: "Purchase Details",
      projectName: "Project Name",
      entryNumber: "entryNumber", // Add missing property

    }
    return fieldMap[field] || field
  }

  // Export functionality
  const exportToCSV = () => {
    setIsExporting(true)
    try {
      const dataToExport = filteredSubmissions.length > 0 ? filteredSubmissions : submissions
      
      // Define headers
      const headers = [
        'Customer ID',
        'Timestamp',
        'Customer Name',
        'Address', 
        'City/Location',
        'Purchase Name',
        'Credit Limit',
        'Purchase No',
        'Purchase Details',
        'Project Name',
        'Edit Count'
      ]
      
      // Convert data to CSV format
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(submission => [
          `"${submission.customerId}"`,
          `"${new Date(submission.timestamp).toLocaleString('en-IN')}"`,
          `"${submission.customerName}"`,
          `"${submission.address}"`,
          `"${submission.cityLocation}"`,
          `"${submission.purchaseName}"`,
          `"${submission.creditLimit}"`,
          `"${submission.purchaseNo}"`,
          `"${submission.purchaseDetails.replace(/"/g, '""')}"`,
          `"${submission.projectName}"`,
          `"${getEditCount(submission)}"`
        ].join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `KYC_Submissions_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting data:', error)
      setError('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const dataToExport = filteredSubmissions.length > 0 ? filteredSubmissions : submissions
      
      // For a real implementation, you would use a library like xlsx
      // This is a simplified version that creates a basic Excel-compatible CSV
      const excelHeaders = [
        'Customer ID',
        'Submission Date',
        'Customer Name',
        'Address', 
        'City/Location',
        'Purchase Contact Name',
        'Credit Limit',
        'Purchase Contact Number',
        'Purchase Details',
        'Project Name',
        'Total Edits',
        'Last Edited'
      ]
      
      const excelContent = [
        excelHeaders.join(','),
        ...dataToExport.map(submission => [
          `"${submission.customerId}"`,
          `"${new Date(submission.timestamp).toLocaleString('en-IN')}"`,
          `"${submission.customerName}"`,
          `"${submission.address}"`,
          `"${submission.cityLocation}"`,
          `"${submission.purchaseName}"`,
          `"${submission.creditLimit}"`,
          `"${submission.purchaseNo}"`,
          `"${submission.purchaseDetails.replace(/"/g, '""')}"`,
          `"${submission.projectName}"`,
          `"${getEditCount(submission)}"`,
          `"${submission.editHistory && submission.editHistory.length > 0 
            ? new Date(submission.editHistory[submission.editHistory.length - 1].timestamp).toLocaleString('en-IN')
            : 'Never'
          }"`
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `KYC_Data_${new Date().toISOString().split('T')[0]}.xls`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      setError('Failed to export to Excel. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                KYC Form Submitted Successfully!
              </h2>
              <p className="text-slate-600 mb-6">
                Your Customer KYC information has been successfully submitted to the KYC_Data sheet.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Another Form
                </Button>
                <Button
                  onClick={() => { setIsSubmitted(false); setActiveTab("history"); }}
                  variant="outline"
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-3 rounded-2xl shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Customer KYC Form
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Complete customer verification and manage KYC submissions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200 shadow-sm">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === "form" ? "default" : "ghost"}
                onClick={() => setActiveTab("form")}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all duration-200",
                  activeTab === "form" 
                    ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <User className="w-4 h-4 mr-2" />
                New KYC Form
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all duration-200",
                  activeTab === "history" 
                    ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <History className="w-4 h-4 mr-2" />
                Submission History
                <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-700">
                  {submissions.length}
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form Tab */}
        {activeTab === "form" && (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Customer KYC Information</CardTitle>
                    <CardDescription className="text-blue-100">
                      Fill in all the mandatory fields for KYC verification
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Customer Name *
                      </Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer full name"
                        value={(formData as any).customerName || ""}
                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                        className="w-full border-slate-300 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Purchase Name */}
                    <div className="space-y-2">
                      <Label htmlFor="purchaseName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        Purchase Name *
                      </Label>
                      <Input
                        id="purchaseName"
                        placeholder="Enter purchase contact name"
                        value={(formData as any ).purchaseName || ""}
                        onChange={(e) => handleInputChange("purchaseName", e.target.value)}
                        className="w-full border-slate-300 focus:border-emerald-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Purchase No */}
                    <div className="space-y-2">
                      <Label htmlFor="purchaseNo" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        Purchase No. *
                      </Label>
                      <Input
                        id="purchaseNo"
                        placeholder="Enter purchase contact number"
                        value={(formData as any).purchaseNo || ""}
                        onChange={(e) => handleInputChange("purchaseNo", e.target.value)}
                        className="w-full border-slate-300 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Project Name */}
                    <div className="space-y-2">
                      <Label htmlFor="projectName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        Project Name *
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="Enter project name"
                        value={(formData as any ).projectName || ""}
                        onChange={(e) => handleInputChange("projectName", e.target.value)}
                        className="w-full border-slate-300 focus:border-emerald-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Credit Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                        Credit Limit *
                      </Label>
                      <Input
                        id="creditLimit"
                        placeholder="Enter credit limit amount"
                        value={(formData as any).creditLimit || ""}
                        onChange={(e) => handleInputChange("creditLimit", e.target.value)}
                        className="w-full border-slate-300 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* City/Location */}
                    <div className="space-y-2">
                      <Label htmlFor="cityLocation" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        City/Location *
                      </Label>
                      <Input
                        id="cityLocation"
                        placeholder="Enter city or location"
                        value={(formData as any ).cityLocation || ""}
                        onChange={(e) => handleInputChange("cityLocation", e.target.value)}
                        className="w-full border-slate-300 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Address *
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter complete address"
                        value={(formData as any).address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full border-slate-300 focus:border-blue-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Purchase Details */}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="purchaseDetails" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Purchase Details *
                      </Label>
                      <textarea
                        id="purchaseDetails"
                        placeholder="Enter detailed purchase information"
                        value={(formData as any ).purchaseDetails || ""}
                        onChange={(e) => handleInputChange("purchaseDetails", e.target.value)}
                        className="w-full min-h-[120px] p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Submit KYC Form
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <History className="w-6 h-6" />
                    <div>
                      <CardTitle className="text-xl">KYC Submission History</CardTitle>
                      <CardDescription className="text-slate-300">
                        {filteredSubmissions.length} submissions found
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64 bg-white/10 border-slate-600 text-white placeholder-slate-300"
                      />
                    </div>
                    <Select value={filterProject} onValueChange={setFilterProject}>
                      <SelectTrigger className="w-full sm:w-48 bg-white/10 border-slate-600 text-white">
                        <SelectValue placeholder="Filter by project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {uniqueProjects.map(project => (
                          <SelectItem key={project} value={project}>{project}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Export Buttons */}
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={exportToCSV}
                              disabled={isExporting || submissions.length === 0}
                              className="bg-white/10 border-slate-600 text-white hover:bg-white/20 hover:text-white"
                            >
                              {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export to CSV</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={exportToExcel}
                              disabled={isExporting || submissions.length === 0}
                              className="bg-white/10 border-slate-600 text-white hover:bg-white/20 hover:text-white"
                            >
                              {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sheet className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export to Excel</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSubmissionHistory}
                        disabled={loadingHistory}
                        className="bg-white/10 border-slate-600 text-white hover:bg-white/20 hover:text-white"
                      >
                        {loadingHistory ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingHistory ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-slate-600">Loading KYC history...</span>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No KYC submissions found</h3>
                    <p className="text-slate-500">
                      {submissions.length === 0 ? "No KYC submissions in the system yet." : "No KYC submissions match your search criteria."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredSubmissions.map((submission) => (
                      <div
                   key={`${submission.customerId}-${submission.timestamp}-${Math.random()}`}
                        className="p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900">{submission.customerName}</h3>
                                  <p className="text-sm text-slate-500">ID: {submission.customerId}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    {submission.projectName}
                                  </Badge>
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                    {submission.creditLimit}
                                  </Badge>
                                </div>
                                <div className="flex gap-2 ml-4">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openEditDialog(submission)}
          className="h-8 px-2 text-slate-600 hover:text-blue-600"
        >
          <Edit className="w-3 h-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Edit this customer</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewEditHistory(submission)}
          className="h-8 px-2 text-slate-600 hover:text-orange-600"
        >
          <Clock className="w-3 h-3" />
          <span className="ml-1 text-xs">
            {submission.editHistory?.length || submission.allVersions?.customerName.length || 1}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>View Edit History ({submission.editHistory?.length || submission.allVersions?.customerName.length || 1} versions)</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
  <div className="space-y-2">
    {/* <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-slate-500" />
      <span className="font-medium text-slate-700">Purchase Contact:</span>
      <span className="text-slate-600">{submission.purchaseName}</span>
    </div> */}
    <div className="flex items-center gap-2">
      <Phone className="w-4 h-4 text-slate-500" />
      <span className="font-medium text-slate-700">Contact No:</span>
      <span className="text-slate-600">{submission.purchaseNo}</span>
    </div>
    <div className="flex items-center gap-2">
      <IndianRupee className="w-4 h-4 text-slate-500" />
      <span className="font-medium text-slate-700">Credit Limit:</span>
      <span className="text-slate-600 font-semibold">{submission.creditLimit}</span>
    </div>
  </div>
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-slate-500" />
      <span className="font-medium text-slate-700">Location:</span>
      <span className="text-slate-600">{submission.cityLocation}</span>
    </div>
    <div className="flex items-center gap-2">
  <Calendar className="w-4 h-4 text-slate-500" />
  <span className="font-medium text-slate-700">Submitted:</span>
  <span className="text-slate-600">
    {new Date(submission.timestamp).toString() === 'Invalid Date' 
      ? 'Invalid Date'
      : new Date(submission.timestamp).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
    }
  </span>
</div>
   {submission.editHistory && submission.editHistory.length > 0 && (
  <div className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4 text-orange-500" />
    <span className="font-medium text-slate-700">Last Edited:</span>
    <span className="text-slate-600">
      {new Date(submission.editHistory[submission.editHistory.length - 1].timestamp).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </span>
  </div>
)}
  </div>
</div>
                            
                            <div className="text-sm">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                                <div>
                                  <span className="font-medium text-slate-700">Purchase Details:</span>
                                  <p className="text-slate-600 text-sm mt-1">
                                    {submission.purchaseDetails}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Address:</span>
                              <p className="text-slate-600 mt-1">{submission.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit KYC Submission
            </DialogTitle>
            <DialogDescription>
              Update the customer KYC information. All changes will be tracked in the edit history.
            </DialogDescription>
          </DialogHeader>
          
          {editFormData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customerName">Customer Name *</Label>
                  <Input
                    id="edit-customerName"
                    value={editFormData.customerName}
                    onChange={(e) => handleEditInputChange("customerName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseName">Purchase Name *</Label>
                  <Input
                    id="edit-purchaseName"
                    value={editFormData.purchaseName}
                    onChange={(e) => handleEditInputChange("purchaseName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseNo">Contact No. *</Label>
                  <Input
                    id="edit-purchaseNo"
                    value={editFormData.purchaseNo}
                    onChange={(e) => handleEditInputChange("purchaseNo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-projectName">Project Name *</Label>
                  <Input
                    id="edit-projectName"
                    value={editFormData.projectName}
                    onChange={(e) => handleEditInputChange("projectName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-creditLimit">Credit Limit *</Label>
                  <Input
                    id="edit-creditLimit"
                    value={editFormData.creditLimit}
                    onChange={(e) => handleEditInputChange("creditLimit", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cityLocation">City/Location *</Label>
                  <Input
                    id="edit-cityLocation"
                    value={editFormData.cityLocation}
                    onChange={(e) => handleEditInputChange("cityLocation", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-address">Address *</Label>
                  <Input
                    id="edit-address"
                    value={editFormData.address}
                    onChange={(e) => handleEditInputChange("address", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-purchaseDetails">Purchase Details *</Label>
                  <textarea
                    id="edit-purchaseDetails"
                    value={editFormData.purchaseDetails}
                    onChange={(e) => handleEditInputChange("purchaseDetails", e.target.value)}
                    className="w-full min-h-[100px] p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={isEditing}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Submission
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit History Dialog */}
      {/* Edit History Dialog */}
{/* Edit History Dialog - Show detailed version history */}
<Dialog open={!!viewEditHistory} onOpenChange={(open) => !open && setViewEditHistory(null)}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <History className="w-5 h-5 text-orange-600" />
        Edit History - {viewEditHistory?.customerName}
        <Badge variant="outline" className="ml-2">
          {viewEditHistory?.editHistory?.length || 0} edits
        </Badge>
      </DialogTitle>
      <DialogDescription>
        All versions of this customer's data. Latest version is shown first.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-6">
      {viewEditHistory?.allVersions ? (
        <>
          {/* Version Timeline */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Version Timeline
            </h4>
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((versionNum) => {
                const hasVersion = viewEditHistory!.allVersions!.customerName.length >= versionNum
                return (
                  <div key={versionNum} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      hasVersion ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {versionNum}
                    </div>
                    <span className="text-xs mt-1">
                      {hasVersion ? `V${versionNum}` : 'Empty'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Detailed Version Comparison */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">All Versions (Latest to Oldest)</h4>
            
            {/* Show each version */}
            {viewEditHistory.allVersions.customerName.map((_, index) => {
              const versionNum = index + 1
              const isLatest = index === 0
              
              return (
                <div key={versionNum} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className={`p-3 ${
                    isLatest ? 'bg-emerald-50 border-b border-emerald-200' : 'bg-slate-50 border-b border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={isLatest ? "default" : "outline"} className={
                          isLatest ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''
                        }>
                          Version {versionNum} {isLatest && '(Latest)'}
                        </Badge>
                        {viewEditHistory.editHistory && viewEditHistory.editHistory[index] && (
                          <span className="text-sm text-slate-600">
                            Edited: {new Date(viewEditHistory.editHistory[index].timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Saved in: {versionNum === 1 ? 'Original columns' : `Columns ${versionNum}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Field values for this version */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Customer Name:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.customerName?.[index] || "(Not set)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Address:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.address?.[index] || "(Not set)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">City/Location:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.cityLocation?.[index] || "(Not set)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Purchase Name:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.purchaseName?.[index] || "(Not set)"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Credit Limit:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.creditLimit?.[index] || "(Not set)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Contact No:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.purchaseNo?.[index] || "(Not set)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Project:</span>
                          <span className="text-slate-900">
                            {viewEditHistory.allVersions?.projectName?.[index] || "(Not set)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Details:</span>
                          <span className="text-slate-900">
                          {viewEditHistory.allVersions?.purchaseDetails?.[index] || "(Not set)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Edit History Timeline */}
          {viewEditHistory.editHistory && viewEditHistory.editHistory.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-slate-800 mb-4">Edit Change Log</h4>
              <div className="space-y-3">
                {viewEditHistory.editHistory.map((edit, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4 pb-4 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{edit.editedBy}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(edit.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {edit.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="text-sm bg-slate-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getFieldDisplayName(change.field)}
                            </Badge>
                            {change.column && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                {change.column}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <div className="text-xs text-slate-500">From:</div>
                              <div className="text-slate-700 line-through">{change.oldValue || "(empty)"}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">To:</div>
                              <div className="text-emerald-700 font-medium">{change.newValue}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No version history available for this submission.</p>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>

    </div>
  )
}

// RefreshCw icon component
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)