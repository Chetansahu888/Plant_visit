






// "use client";

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { CalendarDays, MapPin, Users, AlertTriangle, TrendingUp, Building2, Clock } from "lucide-react";

// interface Task {
//   taskId: string;
//   plantName: string;
//   plantAddress: string;
//   assignedPerson: string;
//   visitDate: string;
//   status: string;
// }

// export function Dashboard() {
//   const { toast } = useToast();
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);

//   const SHEET_API_URL =
//     "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec";

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       const response = await fetch(`${SHEET_API_URL}?sheet=Main&action=fetch`);
//       const result = await response.json();

//       if (result.success && result.data && result.data.length > 1) {
//         const rows = result.data.slice(1);

//         const parsedTasks: Task[] = rows.map((row: any[]) => ({
//           taskId: row[1] || "",
//           plantName: row[2] || "",
//           plantAddress: row[3] || "",
//           assignedPerson: row[6] || "",
//           visitDate: row[8] || "",
//           status: row[9] || "Pending",
//         }));

//         // sort tasks by visitDate
//         const upcoming = parsedTasks
//           .filter((task) => task.status !== "Complete" && task.visitDate)
//           .sort((a, b) => {
//             const [dayA, monthA, yearA] = a.visitDate.split("/");
//             const [dayB, monthB, yearB] = b.visitDate.split("/");
//             const dateA = new Date(+yearA, +monthA - 1, +dayA).getTime();
//             const dateB = new Date(+yearB, +monthB - 1, +dayB).getTime();
//             return dateA - dateB;
//           });

//         setTasks(upcoming);
//       } else {
//         setTasks([]);
//       }
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch dashboard data",
//         variant: "destructive",
//       });
//       setTasks([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Stats calculation
//   const totalPlants = new Set(tasks.map((t) => t.plantName)).size;
//   const pendingVisits = tasks.filter((t) => t.status === "Pending").length;
//   const activePersonnel = new Set(tasks.map((t) => t.assignedPerson)).size;
//   const overdueTasks = tasks.filter((t) => {
//     if (!t.visitDate) return false;
//     const [day, month, year] = t.visitDate.split("/");
//     const date = new Date(+year, +month - 1, +day);
//     return date.getTime() < new Date().setHours(0, 0, 0, 0);
//   }).length;

//   const stats = [
//     { 
//       title: "Total Plants", 
//       value: totalPlants, 
//       icon: Building2, 
//       color: "from-blue-500 to-blue-600",
//       bgColor: "bg-blue-50",
//       iconColor: "text-blue-600"
//     },
//     { 
//       title: "Pending Visits", 
//       value: pendingVisits, 
//       icon: CalendarDays, 
//       color: "from-orange-500 to-orange-600",
//       bgColor: "bg-orange-50",
//       iconColor: "text-orange-600"
//     },
//     { 
//       title: "Active Personnel", 
//       value: activePersonnel, 
//       icon: Users, 
//       color: "from-green-500 to-green-600",
//       bgColor: "bg-green-50",
//       iconColor: "text-green-600"
//     },
//     { 
//       title: "Overdue Tasks", 
//       value: overdueTasks, 
//       icon: AlertTriangle, 
//       color: "from-red-500 to-red-600",
//       bgColor: "bg-red-50",
//       iconColor: "text-red-600"
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-4">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="text-slate-600 font-medium">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header Section */}
//         <div className="text-center space-y-4">
//           <div className="flex items-center justify-center space-x-3">
//             {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg">
//               <TrendingUp className="w-8 h-8 text-white" />
//             </div> */}
//             {/* <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               Plant Visit Dashboard
//             </h1> */}
//           </div>
//           {/* <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//             Comprehensive overview of your plant visit management system
//           </p> */}
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <Card key={index} className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
//                 <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}></div>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
//                   <CardTitle className="text-sm font-semibold text-slate-600">
//                     {stat.title}
//                   </CardTitle>
//                   <div className={`${stat.bgColor} p-2 rounded-lg`}>
//                     <Icon className={`w-5 h-5 ${stat.iconColor}`} />
//                   </div>
//                 </CardHeader>
//                 <CardContent className="relative">
//                   <div className="text-3xl font-bold text-slate-800 mb-1">
//                     {stat.value}
//                   </div>
//                   <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stat.bgColor} ${stat.iconColor}`}>
//                     <TrendingUp className="w-3 h-3 mr-1" />
//                     Active
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>

//         {/* Upcoming Visits */}
//         <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//           <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
//             <div className="flex items-center space-x-3">
//               <CalendarDays className="w-6 h-6" />
//               <div>
//                 <CardTitle className="text-xl font-semibold">Upcoming Visits</CardTitle>
//                 <CardDescription className="text-blue-100">
//                   Next 3 scheduled plant visits
//                 </CardDescription>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="space-y-4">
//               {tasks.slice(0, 3).map((visit, index) => (
//                 <div
//                   key={visit.taskId}
//                   className="group relative p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
//                         <Building2 className="w-5 h-5 text-white" />
//                       </div>
//                       <div className="space-y-1">
//                         <p className="font-semibold text-slate-800 text-lg">{visit.plantName}</p>
//                         <div className="flex items-center space-x-2 text-sm text-slate-600">
//                           <Users className="w-4 h-4" />
//                           <span>Assigned to: {visit.assignedPerson}</span>
//                         </div>
//                         <div className="flex items-center space-x-2 text-sm text-slate-500">
//                           <MapPin className="w-4 h-4" />
//                           <span>{visit.plantAddress}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-right space-y-3">
//                       <div className="flex items-center space-x-2 text-slate-700">
//                         <Clock className="w-4 h-4" />
//                         <p className="text-lg font-semibold">
//                           {visit.visitDate}
//                         </p>
//                       </div>
//                       <Badge
//                         variant={visit.status === "Pending" ? "secondary" : "default"}
//                         className={`
//                           ${visit.status === "Pending" 
//                             ? "bg-orange-100 text-orange-800 border-orange-200" 
//                             : "bg-blue-100 text-blue-800 border-blue-200"
//                           } px-3 py-1 font-medium
//                         `}
//                       >
//                         <Clock className="w-3 h-3 mr-1" />
//                         {visit.status}
//                       </Badge>
//                     </div>
//                   </div>
                  
//                   {/* Progress indicator */}
//                   <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 rounded-b-xl">
//                     <div 
//                       className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-xl transition-all duration-500"
//                       style={{ width: `${33.33 * (index + 1)}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
              
//               {tasks.length === 0 && (
//                 <div className="text-center py-16">
//                   <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
//                     <CalendarDays className="w-12 h-12 text-slate-400" />
//                   </div>
//                   <p className="text-xl text-slate-500 font-medium mb-2">No upcoming visits found</p>
//                   <p className="text-slate-400">All visits are up to date!</p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Footer Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold mb-2">{tasks.length - overdueTasks}</div>
//               <div className="text-green-100">On Schedule</div>
//             </CardContent>
//           </Card>
          
//           <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold mb-2">{Math.round((tasks.length - overdueTasks) / Math.max(tasks.length, 1) * 100)}%</div>
//               <div className="text-blue-100">Success Rate</div>
//             </CardContent>
//           </Card>
          
//           <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold mb-2">{tasks.length}</div>
//               <div className="text-purple-100">Total Active</div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }











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
import { CalendarDays, MapPin, Users, AlertTriangle, TrendingUp, Building2, Clock, BarChart3, Download } from "lucide-react";

interface Task {
  taskId: string;
  plantName: string;
  plantAddress: string;
  assignedPerson: string;
  visitDate: string;
  status: string;
  upcomingProjectCapacity?: string;
  geoTagLocation?: string;
  lastVisitedDate?: string;
  remark?: string;
  currentRefractory?: string;
  rawMaterialFeed?: string;
  rowIndex?: number;
}

const COLORS = ["#f97316", "#ea580c", "#d97706", "#fbbf24"];

export function Dashboard() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterMonth, setFilterMonth] = useState("all");
  const [loading, setLoading] = useState(true);

  const SHEET_API_URL =
    "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec";

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (filterMonth === "all") {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter((task) => {
        if (!task.visitDate) return false;

        // Parse dd/mm/yyyy format
        const [day, month, year] = task.visitDate.split("/");
        const taskMonth = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        ).getMonth();
        return taskMonth === Number.parseInt(filterMonth);
      });
      setFilteredTasks(filtered);
    }
  }, [tasks, filterMonth]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${SHEET_API_URL}?sheet=Main&action=fetch`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 1) {
        const rows = result.data.slice(1);

        const parsedTasks: Task[] = rows.map((row: any[], index: number) => {
          const task: Task = {
            taskId: row[1] || "",
            plantName: row[2] || "",
            plantAddress: row[3] || "",
            assignedPerson: row[6] || "",
            visitDate: row[8] || "",
            status: row[9] || "Pending",
            upcomingProjectCapacity: row[10] || "",
            geoTagLocation: row[11] || "",
            lastVisitedDate: row[12] || "",
            remark: row[13] || "",
            currentRefractory: row[14] || "",
            rawMaterialFeed: row[15] || "",
            rowIndex: index + 2,
          };

          // Compute status (Overdue if visitDate < today)
          if (task.status !== "Complete" && task.visitDate) {
            const [day, month, year] = task.visitDate.split("/");
            const visitDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
            visitDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (visitDate.getTime() < today.getTime()) {
              task.status = "Overdue";
            } else {
              task.status = "Pending"; // Future or today → Pending
            }
          }

          return task;
        });

        setTasks(parsedTasks);
      } else {
        setTasks([]);
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
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const stats = tasks.reduce((acc, task) => {
      if (!task.visitDate) return acc;

      // Parse dd/mm/yyyy format
      const [day, month, year] = task.visitDate.split("/");
      const monthIndex = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      ).getMonth();
      const monthName = monthNames[monthIndex];
      acc[monthName] = (acc[monthName] || 0) + 1;
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
      "Assigned Person",
      "Visit Date",
      "Status",
      "Remark",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredTasks.map((task) =>
        [
          task.taskId,
          `"${task.plantName}"`,
          task.assignedPerson,
          task.visitDate,
          task.status,
          `"${task.remark || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-visit-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Stats calculation for original dashboard
  const totalPlants = new Set(tasks.map((t) => t.plantName)).size;
  const pendingVisits = tasks.filter((t) => t.status === "Pending").length;
  const activePersonnel = new Set(tasks.map((t) => t.assignedPerson)).size;
  const overdueTasks = tasks.filter((t) => {
    if (!t.visitDate) return false;
    const [day, month, year] = t.visitDate.split("/");
    const date = new Date(+year, +month - 1, +day);
    return date.getTime() < new Date().setHours(0, 0, 0, 0);
  }).length;

  const stats = [
    { 
      title: "Total Plants", 
      value: totalPlants, 
      icon: Building2, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      title: "Pending Visits", 
      value: pendingVisits, 
      icon: CalendarDays, 
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    { 
      title: "Active Personnel", 
      value: activePersonnel, 
      icon: Users, 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    { 
      title: "Overdue Tasks", 
      value: overdueTasks, 
      icon: AlertTriangle, 
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section with Filter */}
        <div className="flex items-center justify-between">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div> */}
              {/* <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Plant Visit Dashboard
              </h1> */}
            </div>
            {/* <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive overview of your plant visit management system
            </p> */}
          </div>
          <div className="flex items-center gap-4">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-48">
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
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
       {/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat, index) => {
    const Icon = stat.icon;

    // Fixed gradient colors like footer
    const gradients = [
      "from-green-500 to-emerald-600",
      "from-blue-500 to-cyan-600",
      "from-purple-500 to-pink-600",
      "from-indigo-500 to-purple-600",
    ];

    return (
      <Card
        key={index}
        className={`relative overflow-hidden border-0 shadow-xl text-white bg-gradient-to-r ${gradients[index]}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-semibold text-white/90">
            {stat.title}
          </CardTitle>
          <div className="bg-white/20 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold mb-1">
            {stat.value}
          </div>
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active
          </div>
        </CardContent>
      </Card>
    );
  })}
</div>


    

        {/* Charts from Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Monthly Task Distribution</CardTitle>
              <CardDescription>
                Number of tasks scheduled per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Breakdown of task statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent=0 }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Visits */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <CalendarDays className="w-6 h-6" />
              <div>
                <CardTitle className="text-xl font-semibold">Upcoming Visits</CardTitle>
                <CardDescription className="text-blue-100">
                  Next 3 scheduled plant visits
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {tasks.slice(0, 3).map((visit, index) => (
                <div
                  key={visit.taskId}
                  className="group relative p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
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
                          <span>{visit.plantAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-3">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Clock className="w-4 h-4" />
                        <p className="text-lg font-semibold">
                          {visit.visitDate}
                        </p>
                      </div>
                      <Badge
                        variant={visit.status === "Pending" ? "secondary" : "default"}
                        className={`
                          ${visit.status === "Pending" 
                            ? "bg-orange-100 text-orange-800 border-orange-200" 
                            : "bg-blue-100 text-blue-800 border-blue-200"
                          } px-3 py-1 font-medium
                        `}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {visit.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 rounded-b-xl">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-xl transition-all duration-500"
                      style={{ width: `${33.33 * (index + 1)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <CalendarDays className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-xl text-slate-500 font-medium mb-2">No upcoming visits found</p>
                  <p className="text-slate-400">All visits are up to date!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task List from Reports */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              {filterMonth === "all"
                ? "All tasks"
                : `Tasks for ${new Date(
                    2024,
                    Number.parseInt(filterMonth),
                    1
                  ).toLocaleString("default", { month: "long" })}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800">
                      {task.plantName}
                    </p>
                    <p className="text-sm text-slate-600">
                      Assigned to: {task.assignedPerson}
                    </p>
                    <p className="text-sm text-slate-600">
                      Task ID: {task.taskId}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-slate-800">
                      {task.visitDate}
                    </p>
                    <Badge
                      variant={
                        task.status === "Complete"
                          ? "default"
                          : task.status === "Overdue"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No tasks found for the selected filter
                </p>
              )}
            </div>
          </CardContent>
        </Card>

      
      
      </div>
    </div>
  );
}