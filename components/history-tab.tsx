"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle, MapPin, User, Building, Calendar, Clock } from "lucide-react"

interface Task {
  timestamp: string
  taskId: string
  plantName: string
  plantAddress: string
  currentCapacity: string
  contactPerson: string
  assignedPerson: string
  visitDay: string
  nextVisitDate: string
  notes: string
  status: string
  upcomingProjectCapacity: string
  geoTagLocation: string
  lastVisitedDate: string
  remark: string
  currentRefractory: string
  rawMaterialFeed: string
}

export default function ProfessionalHistoryTable() {
  const [tableData, setTableData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching plant data from Google Sheets...');
        setLoading(true)

        const response = await fetch("https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec?action=fetch", {
          method: 'GET',
          redirect: 'follow'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw Google Sheets response:', result);

        if (result.success && result.data && result.data.length > 1) {
          const rows = result.data.slice(1) // skip header row

          const parsedRows = rows.map((row: any[]): Task => ({
            timestamp: row[0] || "",
            taskId: row[1] || "",
            plantName: row[2] || "",
            plantAddress: row[3] || "",
            currentCapacity: row[4] || "",
            contactPerson: row[5] || "",
            assignedPerson: row[6] || "",
            visitDay: row[7] || "",
            nextVisitDate: row[8] || "",
            notes: row[9] || "",
            status: row[10] || "",
            upcomingProjectCapacity: row[11] || "",
            geoTagLocation: row[12] || "",
            lastVisitedDate: row[13] || "",
            remark: row[14] || "",
            currentRefractory: row[15] || "",
            rawMaterialFeed: row[16] || "",
          }))

          // Only include rows where status = "done"
          const doneRows = parsedRows.filter(
            (row) => row.status.toLowerCase() === "done"
          )

          setTableData(doneRows)
        } else {
          setTableData([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to sample data if API fails
        const sampleData: Task[] = [
          {
            timestamp: "2024-01-15 10:30:00",
            taskId: "001",
            plantName: "Agrawal Sponge Limited",
            plantAddress: "Siltara Phase 2, Raipur",
            currentCapacity: "50'2 / 100*1",
            contactPerson: "Mr. Chatterji (GM)",
            assignedPerson: "Nikhil / Abhishek",
            visitDay: "15",
            nextVisitDate: "2024-02-15",
            notes: "Regular maintenance visit completed successfully",
            status: "done",
            upcomingProjectCapacity: "150 TPD",
            geoTagLocation: "21.2514, 81.6296",
            lastVisitedDate: "2024-01-15",
            remark: "All systems functioning properly",
            currentRefractory: "High Alumina Bricks",
            rawMaterialFeed: "Iron Ore Pellets"
          },
          {
            timestamp: "2024-01-20 14:45:00",
            taskId: "002",
            plantName: "Steel Authority of India Limited",
            plantAddress: "Bhilai Steel Plant, Chhattisgarh",
            currentCapacity: "200 TPD",
            contactPerson: "Mr. Kumar (Plant Manager)",
            assignedPerson: "Rahul / Priya",
            visitDay: "20",
            nextVisitDate: "2024-02-20",
            notes: "Quality inspection and process optimization",
            status: "done",
            upcomingProjectCapacity: "250 TPD",
            geoTagLocation: "21.1938, 81.3509",
            lastVisitedDate: "2024-01-20",
            remark: "Recommended upgrades for efficiency",
            currentRefractory: "Magnesia Carbon Bricks",
            rawMaterialFeed: "Coking Coal"
          }
        ];
        setTableData(sampleData);
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium text-gray-600">Loading visit history...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: '#5B2E91' }}>
              Completed Plant Visits
            </h1>

          </div>
          <p className="text-gray-600">Historical record of all successfully completed plant visits</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


          
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {tableData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed visits found</h3>
              <p className="text-gray-500">Complete some plant visits to see them appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-700 to-fuchsia-700">

                  <tr>
                    {[
                      'Task ID', 'Plant Name', 'Plant Address', 'Contact Person',
                      'Assigned Person', 'Visit Date', 'Current Capacity', 'Notes',
                      'Geo Location', 'Remark', 'Current Refractory', 'Raw Material Feed'
                    ].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{row.taskId}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{row.plantName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={row.plantAddress}>
                            {row.plantAddress}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{row.contactPerson}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {row.assignedPerson}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{formatDate(row.lastVisitedDate || row.nextVisitDate)}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{row.currentCapacity}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={row.notes}>
                          {row.notes || "No notes"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{row.geoTagLocation || "N/A"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={row.remark}>
                          {row.remark || "No remarks"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{row.currentRefractory || "N/A"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{row.rawMaterialFeed || "N/A"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}