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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, MapPin, Calendar, User, Save, Clock, Building2, X, Target, Navigation, FileText, Package, Upload, Image } from "lucide-react";

interface Task {
  taskId: string;
  plantName: string;
  plantAddress: string;
  assignedPerson: string;
  visitDate: string;
  plannedDate: string;
  actualDate: string;
  status: string;
  upcomingProjectCapacity?: string;
  geoTagLocation?: string;
  lastVisitedDate?: string;
  remark?: string;
  currentRefractory?: string;
  rawMaterialFeed?: string;
  orderStatus?: string;
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
    orderStatus: "",
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Your Google Apps Script URL
  const SHEET_API_URL =
    "https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
  try {
    setLoading(true);
    console.log("Fetching tasks from Visits sheet...");

    const url = `${SHEET_API_URL}?action=getVisitsData&t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API Response:", result);

    if (result.success && result.tasks) {
      const mappedTasks = result.tasks
        .filter((task: any) => {
          const hasPlanned = task["Planned 1"] && task["Planned 1"] !== "";
          const noActual = !task["Actual 1"] || task["Actual 1"] === "";
          return hasPlanned && noActual;
        })
        .map((task: any) => ({
          taskId: task["Task ID"] || "",
          plantName: task["Plant Name"] || "",
          plantAddress: task["Plant Address"] || "",
          assignedPerson: task["Assigned Person"] || "",
          visitDate: task["Visit Date"] || "",
          plannedDate: task["Planned 1"] || "",
          actualDate: task["Actual 1"] || "",
          status: "Pending",
          upcomingProjectCapacity: task["Project Capacity"] || "",
          geoTagLocation: task["Geo Tag Location"] || "",
          lastVisitedDate: task["Last Visited Date"] || "",
          remark: task["Customer Say"] || "",
          currentRefractory: task["Current Refractory"] || "",
          rawMaterialFeed: task["Raw Material Feed"] || "",
          orderStatus: task["Status"] || "",
          rowIndex: task.rowIndex
        }));

      console.log("Mapped tasks:", mappedTasks);
      setTasks(mappedTasks);
      
      toast({
        title: "Data Loaded",
        description: `Found ${mappedTasks.length} pending tasks`,
        variant: "default",
      });
    } else {
      throw new Error(result.error || "No tasks found");
    }
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    toast({
      title: "Error",
      description: "Failed to load tasks: " + error.message,
      variant: "destructive",
    });
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

const getUserLocation = () => {
  setIsGettingLocation(true);
  
  if (!navigator.geolocation) {
    toast({
      title: "Error",
      description: "Geolocation is not supported by your browser",
      variant: "destructive",
    });
    setIsGettingLocation(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      
      // Create Google Maps link instead of just coordinates
      const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      setUpdateData((prev) => ({
        ...prev,
        geoTagLocation: googleMapsLink,
      }));
      
      toast({
        title: "Location Captured",
        description: `Google Maps link generated`,
      });
      
      setIsGettingLocation(false);
    },
    (error) => {
      let errorMessage = "Failed to get location";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied. Please enable location access.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      }
      
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsGettingLocation(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = uploadedImages.length + newFiles.length;

    if (totalFiles > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive",
      });
      return;
    }

    setUploadedImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: "Images added",
      description: `${newFiles.length} image(s) added successfully`,
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

 const handleUpdate = async () => {
  if (!selectedTask) return;

  setUpdating(true);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const formattedTimestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;


  try {
    // Column mapping based on your sheet:
    // J=9: Actual 1, K=10: Project Capacity, L=11: Raw Material Feed
    // M=12: Geo Tag Location, N=13: Customer Say, O=14: Current Refractory
    // P=15: Raw Material Feed, Q=16: Images, R=17: Status
    
    const updates = [
      { column: 9, value: formattedTimestamp },                  // Actual 1
      { column: 10, value: updateData.upcomingProjectCapacity }, // Project Capacity
      { column: 11, value: updateData.rawMaterialFeed },         // Raw Material Feed
      { column: 12, value: updateData.geoTagLocation },          // Geo Tag Location
      { column: 13, value: updateData.remark },                  // Customer Say
      { column: 14, value: updateData.currentRefractory },       // Current Refractory
      { column: 16, value: updateData.orderStatus },             // Status
    ];

    // Prepare images for upload
    const imageDataArray = [];
    for (const file of uploadedImages) {
      const base64 = await fileToBase64(file);
      imageDataArray.push({
        name: file.name,
        mimeType: file.type,
        data: base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
      });
    }

    const response = await fetch(SHEET_API_URL, {
      method: "POST",
      redirect: 'follow',
      body: JSON.stringify({
        action: "updateTask",
        rowIndex: selectedTask.rowIndex,
        updates: updates,
        images: imageDataArray
      }),
    });

    const result = await response.json();
    console.log("Update response:", result);

    if (!result.success) {
      throw new Error(result.message || result.error || "Failed to update task");
    }

    toast({
      title: "Success",
      description: `Task updated successfully${uploadedImages.length > 0 ? ` with ${uploadedImages.length} image(s)` : ''}`,
    });

    await fetchTasks();
    
    setSelectedTask(null);
    setIsModalOpen(false);
    setUpdateData({
      upcomingProjectCapacity: "",
      geoTagLocation: "",
      lastVisitedDate: "",
      remark: "",
      currentRefractory: "",
      rawMaterialFeed: "",
      orderStatus: "",
    });
    setUploadedImages([]);
    setImagePreviews([]);
    
  } catch (error: any) {
    console.error("Error updating task:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to update task. Please try again.",
      variant: "destructive",
    });
  } finally {
    setUpdating(false);
  }
};

// Add this helper function for converting files to base64:
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

 const handleTaskSelect = (task: Task) => {
  setSelectedTask(task);
  
  // Convert existing coordinates to Google Maps link if needed
  let geoLocation = task.geoTagLocation || "";
  if (geoLocation && !geoLocation.startsWith('http') && geoLocation.includes(',')) {
    // Convert coordinates to Google Maps link
    const coords = geoLocation.split(',').map(coord => coord.trim());
    if (coords.length === 2) {
      geoLocation = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
    }
  }
  
  setUpdateData({
    upcomingProjectCapacity: task.upcomingProjectCapacity || "",
    geoTagLocation: geoLocation,
    lastVisitedDate: task.lastVisitedDate || "",
    remark: task.remark || "",
    currentRefractory: task.currentRefractory || "",
    rawMaterialFeed: task.rawMaterialFeed || "",
    orderStatus: task.orderStatus || "",
  });
  setIsModalOpen(true);
  
  // Automatically fetch location when modal opens if no location exists
  if (!task.geoTagLocation) {
    setTimeout(() => {
      getUserLocation();
    }, 500);
  }
};


  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-blue-600 font-medium">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-full mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-3 rounded-2xl shadow-lg">
              <Edit className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Update Tasks Dashboard
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Update pending tasks where Planned date is set but Actual date is empty
          </p>
        </div>

        {/* Full Width Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Calendar className="w-6 h-6" />
              Pending Tasks ({tasks.length})
            </CardTitle>
            <CardDescription className="text-blue-100">
              Tasks with Planned date but no Actual date
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[120px]">Task ID</th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[200px]">Plant Name</th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[250px]">Plant Address</th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[150px]">Assigned Person</th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[120px]"> Date</th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[100px]">Status</th>
                      <th className="text-center p-4 font-semibold text-slate-700 min-w-[120px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.taskId || index}
                        className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/50"
                      >
                        <td className="p-4 font-medium text-slate-900">{task.taskId}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-slate-900">{task.plantName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-3 h-3" />
                            <span>{task.plantAddress}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-3 h-3" />
                            <span>{task.assignedPerson}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <span className="font-medium text-slate-900">{task.plannedDate}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            onClick={() => handleTaskSelect(task)}
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 border-slate-300"
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
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-500 font-medium">No pending tasks found</p>
                <p className="text-slate-400 mt-2">All tasks are up to date!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 rounded-t-lg">
              <DialogTitle className="flex items-center gap-3 text-xl text-white">
                <Edit className="w-6 h-6" />
                Update Task Details
              </DialogTitle>
              <DialogDescription className="text-blue-100">
                {selectedTask && `Updating: ${selectedTask.plantName}`}
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-6 p-6">
                {/* Task Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-4 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">{selectedTask.plantName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedTask.plantAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>Planned Date: {selectedTask.plannedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-3 h-3" />
                    <span>Assigned to: {selectedTask.assignedPerson}</span>
                  </div>
                </div>

                {/* Update Form */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="capacity" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-600" />
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
        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="geotag" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-emerald-600" />
        Geo Tag Location
      </Label>
      <div className="flex gap-2">
        <Input
          id="geotag"
          placeholder="https://www.google.com/maps?q=19.0760,72.8777"
          value={updateData.geoTagLocation}
          onChange={(e) =>
            setUpdateData((prev) => ({
              ...prev,
              geoTagLocation: e.target.value,
            }))
          }
          className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
          readOnly={isGettingLocation}
        />
        <Button
          type="button"
          onClick={getUserLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="whitespace-nowrap border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
              Getting...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Get Location
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Click "Get Location" to automatically generate Google Maps link
      </p>
      
      {updateData.geoTagLocation && updateData.geoTagLocation.startsWith('http') && (
        <div className="mt-2">
          <a 
            href={updateData.geoTagLocation} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            Open in Google Maps
          </a>
        </div>
      )}
    </div>

    <div className="space-y-2">
      <Label htmlFor="refractory" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Package className="w-4 h-4 text-blue-600" />
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
        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="statusOfVisit" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Package className="w-4 h-4 text-emerald-600" />
        Status of Visit
      </Label>
      <Input
        id="statusOfVisit"
        placeholder="e.g., Completed, Rescheduled, Pending, etc."
        value={updateData.orderStatus}
        onChange={(e) =>
          setUpdateData((prev) => ({
            ...prev,
            orderStatus: e.target.value,
          }))
        }
        className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
      />
      <p className="text-xs text-slate-500">
        Enter the status of this visit (Completed, Rescheduled, Cancelled, etc.)
      </p>
    </div>
  </div> {/* ← THIS CLOSES THE FIRST COLUMN */}

  <div className="space-y-4"> {/* ← THIS STARTS THE SECOND COLUMN */}
    <div className="space-y-2">
      <Label htmlFor="rawMaterial" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Package className="w-4 h-4 text-emerald-600" />
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
        className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="remark" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-600" />
        What Did The Customer Say
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
        rows={3}
        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
      />
    </div>

    {/* Image Upload Section */}
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Image className="w-4 h-4 text-blue-600" />
        Upload Images
        <span className="text-xs text-slate-500 font-normal">(Max 5 images)</span>
      </Label>
      
      {/* File Input */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <Label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="w-8 h-8 text-slate-400" />
          <span className="text-sm text-slate-600">Click to upload images</span>
          <span className="text-xs text-slate-500">PNG, JPG, JPEG up to 5MB each</span>
        </Label>
      </div>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            Selected Images ({imagePreviews.length}/5)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="text-xs text-slate-500 truncate mt-1">
                  {uploadedImages[index]?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div> {/* ← THIS CLOSES THE SECOND COLUMN */}
</div> 

{/* ← THIS CLOSES THE GRID */}
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      setUploadedImages([]);
                      setImagePreviews([]);
                    }}
                    variant="outline"
                    className="flex-1 border-slate-300 hover:bg-slate-50"
                    disabled={updating}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg"
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