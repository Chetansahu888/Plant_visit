"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Loader2, Building2, User, MapPin, Target, Phone } from "lucide-react";
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
    visitDate: "",
    currentCapacity: "", // Added currentCapacity to formData
  });
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);

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
            assignedPerson: "Nikhil / Abhishek2",
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

  const handlePlantChange = (plantName: string) => {
    const plant = plants.find((p) => p.name === plantName);
    console.log('Selected plant:', plant);

    setSelectedPlant(plant || null);
    setFormData((prev) => ({
      ...prev,
      plantName,
      assignedPerson: plant?.assignedPerson || "",
      currentCapacity: plant?.capacity || "", // Auto-fill capacity when plant changes
      visitDate: "" // Reset visit date when plant changes
    }));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      currentCapacity: e.target.value
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
  plantName: formData.plantName,
  plantAddress: selectedPlant?.address || "",
  currentCapacity: formData.currentCapacity,
  contactPerson: selectedPlant?.contact || "",
  assignedPerson: formData.assignedPerson,
  visitDate: formData.visitDate
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

      toast.success(`Visit saved successfully!`);

      // Reset form
      setFormData({ 
        plantName: "", 
        assignedPerson: "", 
        currentCapacity: "", 
        visitDate: "" 
      });
      setSelectedPlant(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (typeof error === "object" && error !== null && "name" in error && (error as { name?: string }).name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.');
      } else {
        alert('Error saving visit. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
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
    <div className="mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-3 rounded-2xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Plant Visit Form
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {/* Schedule plant visits for specific dates */}
            </p>
          </div>

          <div className="space-y-8">
            {/* First Row - Plant Name and Assigned Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Plant Name
                </Label>
                <Popover open={openPlantDropdown} onOpenChange={setOpenPlantDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPlantDropdown}
                      className="w-full justify-between h-12 border-slate-300 hover:border-blue-400 transition-colors"
                    >
                      <span className={formData.plantName ? "text-slate-800" : "text-slate-500"}>
                        {formData.plantName || "Select plant..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-slate-200 shadow-xl">
                    <Command>
                      <CommandInput placeholder="Search plant..." className="h-12" />
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
                                "cursor-pointer py-3",
                                "hover:bg-blue-50 hover:text-blue-700 transition-colors",
                                "data-[highlighted=true]:bg-blue-500 data-[highlighted=true]:text-white",
                                "data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-800"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-3 h-4 w-4",
                                  formData.plantName === plant.name ? "opacity-100 text-blue-600" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{plant.name}</span>
                                <span className="text-xs text-slate-500">{plant.address}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Assigned Person
                </Label>
                <Popover open={openPersonDropdown} onOpenChange={setOpenPersonDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPersonDropdown}
                      className="w-full justify-between h-12 border-slate-300 hover:border-emerald-400 transition-colors"
                    >
                      <span className={formData.assignedPerson ? "text-slate-800" : "text-slate-500"}>
                        {formData.assignedPerson || "Select person..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-slate-200 shadow-xl">
                    <Command>
                      <CommandInput placeholder="Search person..." className="h-12" />
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
                                "cursor-pointer py-3",
                                "hover:bg-emerald-50 hover:text-emerald-700 transition-colors",
                                "data-[highlighted=true]:bg-emerald-500 data-[highlighted=true]:text-white",
                                "data-[selected=true]:bg-emerald-100 data-[selected=true]:text-emerald-800"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-3 h-4 w-4",
                                  formData.assignedPerson === person ? "opacity-100 text-emerald-600" : "opacity-0"
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
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Auto-filled from plant data
                  </p>
                )}
              </div>
            </div>

            {/* Second Row - Plant Address and Current Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Plant Address
                </Label>
                <div className="relative">
                  <Input
                    value={selectedPlant?.address || ""}
                    placeholder="Address will auto-populate"
                    className="h-12 bg-slate-50/50 border-slate-300 text-slate-700 pl-10"
                    readOnly
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Current Capacity
                </Label>
                <div className="relative">
                  <Input
                    value={formData.currentCapacity} // Use formData.currentCapacity
                    onChange={handleCapacityChange} // Add onChange handler
                    placeholder="Enter current capacity or edit auto-filled value"
                    className="h-12 border-slate-300 pl-10"
                  />
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {selectedPlant?.capacity && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Auto-filled from plant data. You can edit this value.
                  </p>
                )}
              </div>
            </div>

            {/* Third Row - Contact Person and Visit Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Contact Person
                </Label>
                <div className="relative">
                  <Input
                    value={selectedPlant?.contact || ""}
                    placeholder="Contact will auto-populate"
                    className="h-12 bg-slate-50/50 border-slate-300 text-slate-700 pl-10"
                    readOnly
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  Visit Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) => {
                      console.log('Visit date changed to:', e.target.value);
                      setFormData(prev => ({ ...prev, visitDate: e.target.value }));
                    }}
                    className="h-12 pl-10 border-slate-300"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Select the specific date for the visit
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.plantName || !formData.assignedPerson || !formData.visitDate}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-5 h-5 mr-2" />
                    Save Visit
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}