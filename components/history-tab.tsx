"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle, MapPin, User, Building, Calendar, Clock, Target, Navigation, Package, FileText, ExternalLink, AlertCircle, PlayCircle, Image as ImageIcon } from "lucide-react"

interface Task {
  timestamp: string
  taskId: string
  plantName: string
  plantAddress: string
  currentCapacity: string
  contactPerson: string
  assignedPerson: string
  visitDate: string
  plannedDate: string
  actualDate: string
  projectCapacity: string
  rawMaterialFeed: string
  geoTagLocation: string
  customerSay: string
  currentRefractory: string
  image: string
  status: string
  notes: string
  lastVisitedDate: string
  orderStatus: string
}

export default function ProfessionalHistoryTable() {
  const [tableData, setTableData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")

  // Your Google Apps Script URL
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec"

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks from Visits sheet...')
      setLoading(true)

      const url = `${SHEET_API_URL}?action=getVisitsData&t=${Date.now()}`
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("API Response:", result)

      if (result.success && result.tasks) {
        // Map ALL tasks from the API response with exact column names
        const mappedTasks = result.tasks.map((task: any) => {
          // Calculate status based on actual date
          let status = "Pending"
          if (task["Actual 1"] && task["Actual 1"] !== "") {
            status = "Completed"
          } else if (task["Visit Date"]) {
            try {
              const [day, month, year] = task["Visit Date"].split('/')
              const visitDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              visitDate.setHours(0, 0, 0, 0)
              
              if (visitDate < today) {
                status = "Overdue"
              }
            } catch (error) {
              console.error("Error parsing date:", error)
            }
          }

          return {
            timestamp: task["Timestamp"] || "",
            taskId: task["Task ID"] || "",
            plantName: task["Plant Name"] || "",
            plantAddress: task["Plant Address"] || "",
            currentCapacity: task["Current Capacity"] || "",
            contactPerson: task["Contact Person"] || "",
            assignedPerson: task["Assigned Person"] || "",
            visitDate: task["Visit Date"] || "",
            plannedDate: task["Planned 1"] || "",
            actualDate: task["Actual 1"] || "",
            projectCapacity: task["Project capicity"] || "", // Note: typo in sheet column name
            rawMaterialFeed: task["Raw Material Feed"] || "",
            geoTagLocation: task["Geotaglocation"] || "",
            customerSay: task["Customer Say"] || "",
            currentRefractory: task["Currentrefractory"] || "",
            image: task["Image"] || "",
            status: task["Status"] || status, // Use sheet status if available, otherwise calculate
            notes: task["Notes"] || "",
            lastVisitedDate: task["Last Visited Date"] || "",
            orderStatus: task["Order Status"] || "",
          }
        })

        console.log("All tasks from sheet:", mappedTasks)
        setTableData(mappedTasks)
        
      } else {
        throw new Error(result.error || "No tasks found")
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      // Fallback to empty array if API fails
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      // Handle different date formats from Google Sheets
      if (dateStr.includes('/')) {
        // Already in dd/mm/yyyy format
        return dateStr.split(' ')[0] // Remove time part if exists
      }
      
      // Try to parse as Date object
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return dateStr
      }
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // Function to check if a string is a Google Maps link
  const isGoogleMapsLink = (location: string) => {
    return location && location.startsWith('http') && location.includes('maps')
  }

  // Function to convert Google Drive file ID to direct image URL
  // Function to open Google Drive link directly
const openDriveLink = (imageString: string) => {
  if (!imageString) return;
  
  const cleanString = imageString.trim();
  
  // If it's already a full Google Drive URL
  if (cleanString.includes('drive.google.com')) {
    window.open(cleanString, '_blank');
    return;
  }
  
  // If it's a file ID, create Google Drive URL
  if (/^[a-zA-Z0-9_-]+$/.test(cleanString)) {
    const driveUrl = `https://drive.google.com/file/d/${cleanString}/view`;
    window.open(driveUrl, '_blank');
    return;
  }
  
  // If it's any other URL, open directly
  if (cleanString.startsWith('http')) {
    window.open(cleanString, '_blank');
  }
};

// Function to check if it's a valid URL or file ID
const isValidAttachment = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.trim();
  
  return (
    cleanUrl !== '' &&
    cleanUrl !== '-' &&
    (cleanUrl.startsWith('http') || /^[a-zA-Z0-9_-]+$/.test(cleanUrl))
  );
};
  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Overdue":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-3 w-3 mr-1" />
      case "Overdue":
        return <AlertCircle className="h-3 w-3 mr-1" />
      case "Pending":
        return <Clock className="h-3 w-3 mr-1" />
      default:
        return <PlayCircle className="h-3 w-3 mr-1" />
    }
  }

  // Filter tasks based on status
  const filteredTasks = filterStatus === "all" 
    ? tableData 
    : tableData.filter(task => task.status === filterStatus)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-slate-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium text-slate-600">Loading all plant visits...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-[95vw] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All Plant Visits
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Complete overview of all plant visits with detailed information
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Visits</p>
                <p className="text-2xl font-bold mt-1">{tableData.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold mt-1">
                  {tableData.filter(item => item.status === "Completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold mt-1">
                  {tableData.filter(item => item.status === "Pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-rose-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold mt-1">
                  {tableData.filter(item => item.status === "Overdue").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-rose-200" />
            </div>
          </div>
        </div>

        {/* Filter and Refresh Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <span className="text-sm text-slate-600">
              Showing {filteredTasks.length} of {tableData.length} visits
            </span>
          </div>
          <button 
            onClick={fetchTasks}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No visits found</h3>
              <p className="text-slate-500">
                {tableData.length === 0 
                  ? "No plant visits found in the system." 
                  : "No visits match the selected filter."
                }
              </p>
              <button 
                onClick={fetchTasks}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <tr>
                    {[
                      'Timestamp', 'Task ID', 'Plant Name', 'Plant Address', 
                      'Current Capacity', 'Contact Person', 'Assigned Person',
                      'Visit Date',  'Project Capacity',
                      'Raw Material Feed', 'Geo Location', 'Customer Say',
                      'Current Refractory', 'Image', 
                    ].map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredTasks.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors duration-150">
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(row.timestamp)}
                      </td>

                      {/* Task ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {row.taskId}
                        </span>
                      </td>

                      {/* Plant Name */}
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-blue-600 mr-2" />
                          {row.plantName}
                        </div>
                      </td>

                      {/* Plant Address */}
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-slate-500 mr-2 flex-shrink-0" />
                          <span className="truncate" title={row.plantAddress}>
                            {row.plantAddress}
                          </span>
                        </div>
                      </td>

                      {/* Current Capacity */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.currentCapacity || "N/A"}
                      </td>

                      {/* Contact Person */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-3 w-3 text-emerald-600 mr-2" />
                          {row.contactPerson || "N/A"}
                        </div>
                      </td>

                      {/* Assigned Person */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {row.assignedPerson}
                        </span>
                      </td>

                      {/* Visit Date */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-blue-600 mr-2" />
                          {formatDate(row.actualDate)}
                        </div>
                      </td>

                      {/* Project Capacity */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {row.projectCapacity || "N/A"}
                      </td>

                      {/* Raw Material Feed */}
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                        {row.rawMaterialFeed || "N/A"}
                      </td>

                      {/* Geo Location */}
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Navigation className="h-3 w-3 text-slate-500 mr-2" />
                            <span className="truncate" title={row.geoTagLocation}>
                              {isGoogleMapsLink(row.geoTagLocation) ? "Google Maps" : (row.geoTagLocation || "N/A")}
                            </span>
                          </div>
                          {isGoogleMapsLink(row.geoTagLocation) && (
                            <a 
                              href={row.geoTagLocation} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Customer Say */}
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 text-slate-500 mr-2 flex-shrink-0" />
                          <span className="truncate" title={row.customerSay}>
                            {row.customerSay || "No remarks"}
                          </span>
                        </div>
                      </td>

                      {/* Current Refractory */}
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                        {row.currentRefractory || "N/A"}
                      </td>

                      {/* Image */}
                     {/* Image */}
<td className="px-4 py-3 text-sm text-slate-600">
  {isValidAttachment(row.image) ? (
    <button 
      onClick={() => openDriveLink(row.image)}
      className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg"
    >
      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
      View
    </button>
  ) : (
    <span className="text-slate-400 text-sm">-</span>
  )}
</td>

                      
                      {/* <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(row.status)}`}>
                          {getStatusIcon(row.status)}
                          {row.status}
                        </span>
                      </td> */}

                      {/* Notes */}
                      {/* <td className="px-4 py-3 text-sm text-slate-600 max-w-xs"> */}
                        {/* <span className="truncate" title={row.notes}> */}
                          {/* {row.notes || "N/A"} */}
                        {/* </span> */}
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {tableData.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="font-semibold">Complete Plant Visits Overview</h3>
                  <p className="text-slate-300 text-sm">
                    {tableData.length} total visits • {new Set(tableData.map(item => item.plantName)).size} plants • 
                    Completed: {tableData.filter(item => item.status === "Completed").length} • 
                    Pending: {tableData.filter(item => item.status === "Pending").length} • 
                    Overdue: {tableData.filter(item => item.status === "Overdue").length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-300">Last updated</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// RefreshCw icon component
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)