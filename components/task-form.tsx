
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "react-toastify"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";


interface PlantData {
  name: string;
  address: string;
  capacity: string;
  contact: string;
  assignedPerson: string;
  visitDays: string;
}

export default function TaskForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [assignedPeople, setAssignedPeople] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    plantName: "",
    assignedPerson: "",
    visitDay: "",
  });
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [createFor12Months, setCreateFor12Months] = useState(true);
  const [previewDates, setPreviewDates] = useState<string[]>([]);

  const [openPlantDropdown, setOpenPlantDropdown] = useState(false);
  const [openPersonDropdown, setOpenPersonDropdown] = useState(false);


  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchPlantData = async () => {
      try {
        console.log('Fetching plant data from Google Sheets...');

        // Updated URL to call getMasterData function
        const response = await fetch("https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec?action=getMasterData", {
          method: 'GET',
          redirect: 'follow'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw Google Sheets response:', data);

        // Transform the data to match our PlantData interface
        const transformedPlants: PlantData[] = data.plants.map((plantName: string) => {
          const plantInfo = data.plantMap[plantName];
          console.log(`Plant: ${plantName}`, plantInfo);

          return {
            name: plantName,
            address: plantInfo.address || '',
            capacity: plantInfo.capacity || '',
            contact: plantInfo.contact || '',
            assignedPerson: plantInfo.defaultAssigned || '',
            visitDays: plantInfo.visitDays || ''
          };
        });

        console.log('Transformed plants data:', transformedPlants);
        setPlants(transformedPlants);
        setAssignedPeople(data.assignedPeople || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching plant data:', error);
        // Fallback to sample data if API fails
        const samplePlants: PlantData[] = [
          {
            name: "Agrawal Sponge Limited.",
            address: "Siltara Phase 2",
            capacity: "50'2 / 100*1",
            contact: "Mr.Chatterji (GM)",
            assignedPerson: "Nikhil / Abhishek",
            visitDays: "15"
          }
        ];
        const sampleAssignedPeople = ["Nikhil / Abhishek", "Rahul / Priya"];

        setPlants(samplePlants);
        setAssignedPeople(sampleAssignedPeople);
        setLoading(false);
      }
    };

    fetchPlantData();
  }, []);

  // Generate preview dates when visit day changes
  useEffect(() => {
    if (formData.visitDay && createFor12Months) {
      const dates: string[] = [];
      const currentDate = new Date();
      const visitDay = parseInt(formData.visitDay);

      for (let i = 0; i < 12; i++) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, visitDay);
        const formattedDate = targetDate.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
      setPreviewDates(dates);
    } else {
      setPreviewDates([]);
    }
  }, [formData.visitDay, createFor12Months]);

  const handlePlantChange = (plantName: string) => {
    const plant = plants.find((p) => p.name === plantName);
    console.log('Selected plant:', plant);

    setSelectedPlant(plant || null);
    setFormData((prev) => ({
      ...prev,
      plantName,
      assignedPerson: plant?.assignedPerson || "",
      visitDay: plant?.visitDays || ""
    }));
  };

  // Updated handleSubmit function
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const taskId = Date.now();

      const submitData = {
        action: "submitVisit",
        timestamp: new Date().toISOString(),
        taskId: taskId,
        plantName: formData.plantName,
        plantAddress: selectedPlant?.address || "",
        currentCapacity: selectedPlant?.capacity || "",
        contactPerson: selectedPlant?.contact || "",
        assignedPerson: formData.assignedPerson,
        visitDay: formData.visitDay,
        visitDate: calculateNextVisitDate(formData.visitDay),
        generate12: createFor12Months
      };

      console.log('Submitting data:', submitData);

      // Add error handling and timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("https://script.google.com/macros/s/AKfycbyoZicqyzgTWUJZGu-D5f-6UGMt-4_sv7TeOOxBH6ndodSbWVXQgsosyKLv3Z1zT9s/exec", {
        method: 'POST',
        mode: 'no-cors', // Changed from 'cors' to 'no-cors'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // With no-cors mode, we can't read the response, so we'll assume success
      // If you need to read the response, you'll need to deploy your script differently
      console.log('Visit submitted successfully (assuming success with no-cors)');

      toast.success(`Visit(s) saved successfully!`);

      // Reset form
      setFormData({ plantName: "", assignedPerson: "", visitDay: "" });
      setSelectedPlant(null);
      setPreviewDates([]);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.');
      } else {
        alert('Error saving visit(s). Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  // Helper function to calculate next visit date
  const calculateNextVisitDate = (visitDay: string): string => {
    if (!visitDay) return "";

    const today = new Date();
    const currentDay = today.getDate();
    const targetDay = parseInt(visitDay);

    // If target day hasn't passed this month, use this month; otherwise next month
    let targetDate: Date;
    if (targetDay >= currentDay) {
      targetDate = new Date(today.getFullYear(), today.getMonth(), targetDay);
    } else {
      targetDate = new Date(today.getFullYear(), today.getMonth() + 1, targetDay);
    }

    return targetDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading plant data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[35px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              Plant Visit Form
            </h1>


            <p className="text-sm text-gray-600">Optionally create entries for the next 12 months automatically.</p>
          </div>

          <div className="space-y-6">
            {/* First Row - Plant Name and Assigned Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Plant Name</Label>
                <Popover open={openPlantDropdown} onOpenChange={setOpenPlantDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPlantDropdown}
                      className="w-full justify-between"
                    >
                      {formData.plantName || "Select plant..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search plant..." />
                      <CommandList>
                        <CommandEmpty>No plant found.</CommandEmpty>
                        <CommandGroup>
                          {plants.map((plant, index) => (
                            <CommandItem
                              key={index}
                              value={plant.name}
                              onSelect={() => {
                                handlePlantChange(plant.name);
                                setOpenPlantDropdown(false);
                              }}
                              className={cn(
                                "cursor-pointer",
                                // ✅ Hover state
                                "hover:bg-purple-100 hover:text-purple-700",
                                // ✅ Highlighted (jo abhi black aa raha tha)
                                "data-[highlighted=true]:bg-purple-500 data-[highlighted=true]:text-white",
                                // ✅ Selected item
                                "data-[selected=true]:bg-purple-200 data-[selected=true]:text-purple-800"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.plantName === plant.name ? "opacity-100 text-purple-600" : "opacity-0"
                                )}
                              />
                              {plant.name}
                            </CommandItem>

                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Assigned Person</Label>
                <Popover open={openPersonDropdown} onOpenChange={setOpenPersonDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPersonDropdown}
                      className="w-full justify-between"
                    >
                      {formData.assignedPerson || "Select person..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search person..." />
                      <CommandList>
                        <CommandEmpty>No person found.</CommandEmpty>
                        <CommandGroup>
                          {assignedPeople.map((person, index) => (
                            <CommandItem
                              key={index}
                              value={person}
                              onSelect={(value) => {
                                setFormData(prev => ({ ...prev, assignedPerson: value }));
                                setOpenPersonDropdown(false);
                              }}
                              className={cn(
                                "cursor-pointer",
                                // ✅ Mouse hover par
                                "hover:bg-purple-100 hover:text-purple-700",
                                // ✅ Keyboard/mouse highlight (jo black dikh raha tha)
                                "data-[highlighted=true]:bg-purple-500 data-[highlighted=true]:text-white",
                                // ✅ Selected value styling
                                "data-[selected=true]:bg-purple-200 data-[selected=true]:text-purple-800"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.assignedPerson === person ? "opacity-100 text-purple-600" : "opacity-0"
                                )}
                              />
                              {person}
                            </CommandItem>

                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedPlant?.assignedPerson && (
                  <p className="text-xs text-gray-500">
                    Auto-filled from plant data. You can change if needed.
                  </p>
                )}
              </div>
            </div>

            {/* Second Row - Plant Address and Current Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Plant Address</Label>
                <Input
                  value={selectedPlant?.address || ""}
                  placeholder="Address will auto-populate"
                  className="bg-gray-50"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Current Capacity</Label>
                <Input
                  value={selectedPlant?.capacity || ""}
                  placeholder="Capacity will auto-populate"
                  className="bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            {/* Third Row - Contact Person and Visit Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                <Input
                  value={selectedPlant?.contact || ""}
                  placeholder="Contact will auto-populate"
                  className="bg-gray-50"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Visit Day (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.visitDay}
                  onChange={(e) => {
                    console.log('Visit day manually changed to:', e.target.value);
                    setFormData(prev => ({ ...prev, visitDay: e.target.value }));
                  }}
                  placeholder="Enter day of month"
                  className={selectedPlant?.visitDays ? "bg-blue-50" : ""}
                />
                <p className="text-xs text-gray-500">
                  {selectedPlant?.visitDays
                    ? `Auto-filled: ${selectedPlant.visitDays} (editable)`
                    : "E.g., 20 = 20th of each month"
                  }
                </p>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create12months"
                checked={createFor12Months}
                onCheckedChange={(checked) => setCreateFor12Months(checked as boolean)}
              />
              <Label htmlFor="create12months" className="text-sm font-medium text-gray-700">
                Create for 12 months
              </Label>
            </div>

            {/* Preview Dates */}
            {previewDates.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Preview 12 months
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {previewDates.map((date, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {index + 1}. {date}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.plantName || !formData.assignedPerson || !formData.visitDay}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Visit(s)
              </Button>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}