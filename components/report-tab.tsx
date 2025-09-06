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
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react";

interface Task {
  taskId: string;
  plantName: string;
  plantAddress: string;
  assignedPerson: string;
  upcomingProjectCapacity: string;
  geoTagLocation: string;
  visitDate: string;
  lastVisitedDate: string;
  currentRefractory: string;
  rawMaterialFeed: string;
  status: string;
  rowIndex: number;
  remark?: string;
}

const COLORS = ["#f97316", "#ea580c", "#d97706", "#fbbf24"];

// Your Google Apps Script URL
const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec";

export function ReportTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterMonth, setFilterMonth] = useState("all");
  const [loading, setLoading] = useState(true);

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
        // Parse the sheet data into tasks
        const headers = result.data[0];
        const rows = result.data.slice(1);

        const parsedTasks = rows.map((row: any[], index: number) => {
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
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for plant visit tasks
          </p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <BarChart3 className="w-5 h-5 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter((t) => t.status === "Complete").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Calendar className="w-5 h-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter((t) => t.status !== "Complete").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter((t) => t.status === "Overdue").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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

        <Card>
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

      {/* Task List */}
      <Card>
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
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {task.plantName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {task.assignedPerson}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Task ID: {task.taskId}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-foreground">
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
              <p className="text-center text-muted-foreground py-8">
                No tasks found for the selected filter
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
