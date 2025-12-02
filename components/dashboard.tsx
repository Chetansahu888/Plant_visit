"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, MapPin, Users, AlertTriangle, TrendingUp, Building2, Clock, BarChart3, Download, RefreshCw } from "lucide-react";

interface Task {
  timestamp: string;
  taskId: string;
  plantName: string;
  plantAddress: string;
  currentCapacity: string;
  contactPerson: string;
  assignedPerson: string;
  visitDate: string;
  plannedDate: string;
  actualDate: string;
  notes: string;
  status: string;
  upcomingProjectCapacity: string;
  geoTagLocation: string;
  lastVisitedDate: string;
  remark: string;
  currentRefractory: string;
  rawMaterialFeed: string;
  orderStatus: string;
}

// Updated color palette
const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];
const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export function Dashboard() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterMonth, setFilterMonth] = useState("all");
  const [loading, setLoading] = useState(true);

  // Your Google Apps Script URL - same as your other components
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec";

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (filterMonth === "all") {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter((task) => {
        if (!task.visitDate) return false;

        try {
          // Parse dd/mm/yyyy format
          const [day, month, year] = task.visitDate.split("/");
          const taskMonth = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          ).getMonth();
          return taskMonth === Number.parseInt(filterMonth);
        } catch (error) {
          return false;
        }
      });
      setFilteredTasks(filtered);
    }
  }, [tasks, filterMonth]);

  // Date parsing helper function
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
  };

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks from Visits sheet...');
      setLoading(true);

      const url = `${SHEET_API_URL}?action=getVisitsData&t=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success && result.tasks) {
        // Map the tasks from the API response - using the same structure as your history table
        const mappedTasks: Task[] = result.tasks.map((task: any) => {
          const mappedTask: Task = {
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
            notes: task["Notes"] || "",
            status: task["Status"] || "",
            upcomingProjectCapacity: task["Project Capacity"] || "",
            geoTagLocation: task["Geo Tag Location"] || "",
            lastVisitedDate: task["Last Visited Date"] || "",
            remark: task["Customer Say"] || "",
            currentRefractory: task["Current Refractory"] || "",
            rawMaterialFeed: task["Raw Material Feed"] || "",
            orderStatus: task["Order Status"] || "",
          };

          // Compute status based on actual date and visit date
          if (mappedTask.actualDate && mappedTask.actualDate.trim() !== "") {
            mappedTask.status = "Complete";
          } else if (mappedTask.visitDate) {
            try {
              const [day, month, year] = mappedTask.visitDate.split("/");
              const visitDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
              );
              visitDate.setHours(0, 0, 0, 0);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              if (visitDate.getTime() < today.getTime()) {
                mappedTask.status = "Overdue";
              } else {
                mappedTask.status = "Pending";
              }
            } catch (error) {
              mappedTask.status = "Pending";
            }
          } else {
            mappedTask.status = "Pending";
          }

          return mappedTask;
        });

        console.log("Mapped tasks:", mappedTasks);
        setTasks(mappedTasks);
        
      } else {
        throw new Error(result.error || "No tasks found");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const stats = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  const getMonthlyStats = () => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    
    const stats = tasks.reduce((acc, task) => {
      if (!task.visitDate) return acc;

      try {
        // Parse dd/mm/yyyy format
        const [day, month, year] = task.visitDate.split("/");
        const monthIndex = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        ).getMonth();
        const monthName = monthNames[monthIndex];
        acc[monthName] = (acc[monthName] || 0) + 1;
      } catch (error) {
        // Skip invalid dates
      }
      return acc;
    }, {} as Record<string, number>);

    return monthNames.map((month) => ({
      month,
      tasks: stats[month] || 0,
    }));
  };

  const exportToCSV = () => {
    const headers = [
      "Task ID",
      "Plant Name",
      "Plant Address",
      "Assigned Person",
      "Visit Date",
      "Status",
      "Current Capacity",
      "Contact Person",
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredTasks.map((task) =>
        [
          task.taskId,
          `"${task.plantName}"`,
          `"${task.plantAddress}"`,
          task.assignedPerson,
          task.visitDate,
          task.status,
          task.currentCapacity,
          `"${task.contactPerson}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-visit-dashboard-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Data exported to CSV file",
    });
  };

  // Stats calculation for dashboard
  const totalPlants = new Set(tasks.map((t) => t.plantName)).size;
  const pendingVisits = tasks.filter((t) => t.status === "Pending").length;
  const completedVisits = tasks.filter((t) => t.status === "Complete").length;
  const activePersonnel = new Set(tasks.map((t) => t.assignedPerson)).size;
  const overdueTasks = tasks.filter((t) => t.status === "Overdue").length;

  const stats = [
    { 
      title: "Total Plants", 
      value: totalPlants, 
      icon: Building2, 
      color: "from-indigo-500 to-purple-600",
      description: "Unique plant locations"
    },
    { 
      title: "Pending Visits", 
      value: pendingVisits, 
      icon: CalendarDays, 
      color: "from-amber-500 to-orange-500",
      description: "Scheduled visits"
    },
    { 
      title: "Completed Visits", 
      value: completedVisits, 
      icon: TrendingUp, 
      color: "from-emerald-500 to-teal-600",
      description: "Successfully completed"
    },
    { 
      title: "Overdue Tasks", 
      value: overdueTasks, 
      icon: AlertTriangle, 
      color: "from-rose-500 to-pink-600",
      description: "Require attention"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const monthlyStats = getMonthlyStats();

  // Get upcoming visits (pending status with future dates)
  const upcomingVisits = tasks
    .filter(task => task.status === "Pending" && task.visitDate)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section with Filter */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-2">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Plant Visit Dashboard
              </h1>
            </div>
            <p className="text-lg text-slate-600">
              Comprehensive overview of plant visit management system
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="0">January</SelectItem>
                <SelectItem value="1">February</SelectItem>
                <SelectItem value="2">March</SelectItem>
                <SelectItem value="3">April</SelectItem>
                <SelectItem value="4">May</SelectItem>
                <SelectItem value="5">June</SelectItem>
                <SelectItem value="6">July</SelectItem>
                <SelectItem value="7">August</SelectItem>
                <SelectItem value="8">September</SelectItem>
                <SelectItem value="9">October</SelectItem>
                <SelectItem value="10">November</SelectItem>
                <SelectItem value="11">December</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button 
                onClick={fetchTasks} 
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={exportToCSV} 
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white"
                disabled={tasks.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`relative overflow-hidden border-0 shadow-lg text-white bg-gradient-to-r ${stat.color} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-semibold text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-white">Monthly Visit Distribution</CardTitle>
              <CardDescription className="text-indigo-100">
                Number of visits scheduled per month
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="tasks" 
                    fill="url(#colorGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-white">Visit Status Distribution</CardTitle>
              <CardDescription className="text-emerald-100">
                Breakdown of visit statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Visits */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <CalendarDays className="w-6 h-6" />
              <div>
                <CardTitle className="text-xl font-semibold">Upcoming Visits</CardTitle>
                <CardDescription className="text-indigo-100">
                  {upcomingVisits.length > 0 
                    ? `Next ${upcomingVisits.length} scheduled plant visits` 
                    : 'No upcoming visits scheduled'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingVisits.map((visit, index) => (
                <div
                  key={visit.taskId}
                  className="group relative p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 text-lg">{visit.plantName}</p>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>Assigned to: {visit.assignedPerson}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <MapPin className="w-4 h-4" />
                          <span className="max-w-xs truncate">{visit.plantAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-3">
                      <div className="flex items-center space-x-2 text-slate-700 justify-end">
                        <Clock className="w-4 h-4" />
                        <p className="text-lg font-semibold">
                          {visit.visitDate}
                        </p>
                      </div>
                      <Badge
                        className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1 font-medium"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {visit.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 rounded-b-xl">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-b-xl transition-all duration-500"
                      style={{ width: `${33.33 * (index + 1)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {upcomingVisits.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <CalendarDays className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-xl text-slate-500 font-medium mb-2">No upcoming visits found</p>
                  <p className="text-slate-400">All visits are completed or overdue!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Plant Visits</CardTitle>
                <CardDescription className="text-slate-300">
                  {filterMonth === "all"
                    ? `Showing all ${filteredTasks.length} tasks`
                    : `Tasks for ${new Date(2024, Number.parseInt(filterMonth), 1).toLocaleString("default", { month: "long" })} - ${filteredTasks.length} found`
                  }
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Total: {tasks.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200 hover:border-indigo-200"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-slate-800">
                        {task.plantName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {task.taskId}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {task.plantAddress}
                    </p>
                    <p className="text-sm text-slate-500">
                      Assigned to: {task.assignedPerson} | Contact: {task.contactPerson || "N/A"}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-slate-800">
                      {task.visitDate}
                    </p>
                    <Badge
                      className={`
                        ${task.status === "Complete" 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                          : task.status === "Overdue"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                        }
                      `}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No tasks found for the selected filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}