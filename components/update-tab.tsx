
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, MapPin, Calendar, User, Save, Clock, AlertCircle, CheckCircle2, Eye, Building2, X } from "lucide-react";

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

export function UpdateTab() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    upcomingProjectCapacity: "",
    geoTagLocation: "",
    lastVisitedDate: "",
    remark: "",
    currentRefractory: "",
    rawMaterialFeed: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Your Google Apps Script URL (same as in task-form)
  const SHEET_API_URL =
    "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      console.log("Fetching tasks...");

      const response = await fetch(`${SHEET_API_URL}?sheet=Visits&action=fetch`);
      const result = await response.json();

      console.log("result", result);

      if (result.success && result.data && result.data.length > 1) {
        // Parse the sheet data into tasks
        const headers = result.data[0];
        const rows = result.data.slice(1);

        const parsedTasks = rows.map((row: any[], index: number) => ({
          taskId: row[1] || "", // Column B - Task ID
          plantName: row[2] || "", // Column C - Plant Name
          plantAddress: row[3] || "", // Column D - Plant Address
          assignedPerson: row[6] || "", // Column G - Assigned Person
          visitDate: row[8] || "", // Column I - Visit Date
          status: row[10] || "Pending", // Column J - Status (use existing status or default to Pending)
          upcomingProjectCapacity: row[11] || "", // Column K if exists
          geoTagLocation: row[12] || "", // Column L if exists
          lastVisitedDate: row[13] || "", // Column M if exists
          remark: row[14] || "", // Column N if exists
          currentRefractory: row[15] || "", // Column O if exists
          rawMaterialFeed: row[16] || "", // Column P if exists
          rowIndex: index + 2, // Add 2 because: +1 for 0-based index, +1 for header row
        }));

        // Filter for tasks with Pending status
        // Filter for tasks with Pending status
        const pendingTasks = parsedTasks.filter(
          (task: Task) => {
            const status = (task.status || "").trim().toLowerCase();
            return status !== "complete" && status !== "done";
          }
        );


        console.log("pendingTasks", pendingTasks);

        // Get current date (without time)
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Find pending tasks that have visit date within 3 days of current date (future)
        const pendingTasksWithin3Days = pendingTasks.filter((task: Task) => {
          const visitDate = parseDate(task.visitDate);
          if (!visitDate) return false;

          visitDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((visitDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

          return diffDays >= 0 && diffDays <= 3;
        });


        // Find overdue tasks (visit date is before current date)
        const overdueTasks = pendingTasks.filter((task: Task) => {
          const visitDate = parseDate(task.visitDate);
          if (!visitDate) return false;

          visitDate.setHours(0, 0, 0, 0);
          return visitDate.getTime() < currentDate.getTime();
        });


        console.log("pendingTasksWithin3Days", pendingTasksWithin3Days);
        console.log("overdueTasks", overdueTasks);

        // Sort pending tasks by closest date (nearest date first)
        pendingTasksWithin3Days.sort((a: Task, b: Task) => {
          const [dayA, monthA, yearA] = a.visitDate.split("/");
          const [dayB, monthB, yearB] = b.visitDate.split("/");
          const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
          const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));

          // Sort by difference from current date
          const diffA = dateA.getTime() - currentDate.getTime();
          const diffB = dateB.getTime() - currentDate.getTime();
          return diffA - diffB;
        });

        // Sort overdue tasks by most overdue first
        overdueTasks.sort((a: Task, b: Task) => {
          const [dayA, monthA, yearA] = a.visitDate.split("/");
          const [dayB, monthB, yearB] = b.visitDate.split("/");
          const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
          const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));

          // Sort by how overdue they are (most overdue first)
          const diffA = currentDate.getTime() - dateA.getTime();
          const diffB = currentDate.getTime() - dateB.getTime();
          return diffB - diffA;
        });

        // Combine tasks - one pending and one overdue
        // const tasksToShow = [];

        // if (pendingTasksWithin3Days.length > 0) {
        //   tasksToShow.push({
        //     ...pendingTasksWithin3Days[0],
        //     status: "In Progress" // Ensure status is Pending
        //   });
        // }

        // if (overdueTasks.length > 0) {
        //   tasksToShow.push({
        //     ...overdueTasks[0],
        //     status: "Overdue" // Change status to Overdue
        //   });
        // }
        const tasksToShow = [
          ...pendingTasksWithin3Days.map(t => ({ ...t, status: "In Progress" })),
          ...overdueTasks.map(t => ({ ...t, status: "Overdue" }))
        ];

        setTasks(tasksToShow);


        setTasks(tasksToShow);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // If format is yyyy-mm-dd
    if (dateStr.includes("-")) {
      return new Date(dateStr); // safe parse
    }

    // If format is dd/mm/yyyy
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return null;
  }

  const handleUpdate = async () => {
    if (!selectedTask) return;

    setUpdating(true);
    const now = new Date();
    const formattedTimestamp = `${String(now.getDate()).padStart(
      2,
      "0"
    )}/${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    try {
      // Prepare all updates for batch operation
      const updates = [
        { column: 1, value: formattedTimestamp }, // Column A → Timestamp
        { column: 2, value: selectedTask.taskId }, // Column B → Task ID
        { column: 3, value: updateData.upcomingProjectCapacity }, // Column C
        { column: 4, value: updateData.geoTagLocation }, // Column D
        { column: 5, value: formattedTimestamp }, // Column E → Last Visited Date
        { column: 6, value: updateData.remark }, // Column F
        { column: 7, value: updateData.currentRefractory }, // Column G
        { column: 8, value: updateData.rawMaterialFeed }, // Column H
      ];


      // Send JSON data instead of URLSearchParams
      const payload = {
        action: "batchUpdateCells",
        sheetName: "Form Responses 1",
        rowIndex: selectedTask.rowIndex!.toString(),
        updates: JSON.stringify(updates)
      };

      // Replace only this part in handleUpdate function:
      const response = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: "batchUpdateCells",
          rowIndex: selectedTask.rowIndex!.toString(),
          updates: JSON.stringify(updates)
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update task");
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      fetchTasks(); // Refresh tasks
      setSelectedTask(null);
      setIsModalOpen(false);
      setUpdateData({
        upcomingProjectCapacity: "",
        geoTagLocation: "",
        lastVisitedDate: "",
        remark: "",
        currentRefractory: "",
        rawMaterialFeed: "",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setUpdateData({
      upcomingProjectCapacity: task.upcomingProjectCapacity || "",
      geoTagLocation: task.geoTagLocation || "",
      lastVisitedDate: task.lastVisitedDate || "",
      remark: task.remark || "",
      currentRefractory: task.currentRefractory || "",
      rawMaterialFeed: task.rawMaterialFeed || "",
    });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Overdue") {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <div className="text-indigo-600 font-medium">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 rounded-full">
              <Edit className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 bg-clip-text text-transparent drop-shadow-md">
              Update Tasks Dashboard
            </h1>

          </div>
          {/* <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and update visit details for your upcoming and overdue tasks
          </p> */}
        </div>

        {/* Full Width Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-800 via-[#5B2E91] to-fuchsia-700 text-white rounded-t-lg">

            <CardTitle className="flex items-center gap-3 text-xl">
              <Calendar className="w-6 h-6" />
              Upcoming & Overdue Tasks
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Select a task to update visit details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">Task ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[250px]">Plant Name</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[300px]">Plant Address</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[180px]">Assigned Person</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[120px]">Visit Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[120px]">Status</th>
                      {/* <th className="text-left p-4 font-semibold text-gray-700 min-w-[180px]">Project Capacity</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[150px]">Geo Location</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[150px]">Last Visited</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[180px]">Current Refractory</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[180px]">Raw Material Feed</th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">Remarks</th> */}
                      <th className="text-center p-4 font-semibold text-gray-700 min-w-[120px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.taskId}
                        className="border-b transition-all duration-200 hover:bg-gray-50"
                      >
                        <td className="p-4 font-medium text-gray-900">{task.taskId}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold text-gray-900">{task.plantName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{task.plantAddress}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-3 h-3" />
                            <span>{task.assignedPerson}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-indigo-600" />
                            <span className="font-medium text-gray-900">{task.visitDate}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(task.status)}
                        </td>
                        {/* <td className="p-4 text-gray-600">{task.upcomingProjectCapacity || '-'}</td>
                        <td className="p-4 text-gray-600">{task.geoTagLocation || '-'}</td>
                        <td className="p-4 text-gray-600">{task.lastVisitedDate || '-'}</td>
                        <td className="p-4 text-gray-600">{task.currentRefractory || '-'}</td>
                        <td className="p-4 text-gray-600">{task.rawMaterialFeed || '-'}</td>
                        <td className="p-4 text-gray-600">{task.remark || '-'}</td> */}
                        <td className="p-4 text-center">
                          <Button
                            onClick={() => handleTaskSelect(task)}
                            variant="outline"
                            size="sm"
                            className="hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 font-medium">No upcoming tasks found</p>
                <p className="text-gray-400 mt-2">All tasks are up to date!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <Edit className="w-6 h-6 text-indigo-600" />
                Update Task Details
              </DialogTitle>
              <DialogDescription>
                {selectedTask && `Updating: ${selectedTask.plantName}`}
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-6 py-4">
                {/* Task Info Section */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">{selectedTask.plantName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedTask.plantAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>Visit Date: {selectedTask.visitDate}</span>
                  </div>
                </div>

                {/* Update Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700">
                      Upcoming Project Capacity
                    </Label>
                    <Input
                      id="capacity"
                      placeholder="e.g., 800 MW"
                      value={updateData.upcomingProjectCapacity}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          upcomingProjectCapacity: e.target.value,
                        }))
                      }
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geotag" className="text-sm font-semibold text-gray-700">
                      Geo Tag Location
                    </Label>
                    <Input
                      id="geotag"
                      placeholder="e.g., 19.0760, 72.8777"
                      value={updateData.geoTagLocation}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          geoTagLocation: e.target.value,
                        }))
                      }
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refractory" className="text-sm font-semibold text-gray-700">
                      Current Refractory
                    </Label>
                    <Input
                      id="refractory"
                      placeholder="e.g., High Alumina Bricks"
                      value={updateData.currentRefractory}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          currentRefractory: e.target.value,
                        }))
                      }
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rawMaterial" className="text-sm font-semibold text-gray-700">
                      Raw Material Feed
                    </Label>
                    <Input
                      id="rawMaterial"
                      placeholder="e.g., Coal, Limestone"
                      value={updateData.rawMaterialFeed}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          rawMaterialFeed: e.target.value,
                        }))
                      }
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remark" className="text-sm font-semibold text-gray-700">
                      Remark
                    </Label>
                    <Textarea
                      id="remark"
                      placeholder="Add any additional notes or observations..."
                      value={updateData.remark}
                      onChange={(e) =>
                        setUpdateData((prev) => ({
                          ...prev,
                          remark: e.target.value,
                        }))
                      }
                      rows={4}
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Task
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}