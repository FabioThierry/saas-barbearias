import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, X } from "lucide-react";

interface AppointmentFilters {
  status: string;
  barber: string;
  date: string;
  search: string;
}

interface AppointmentFiltersProps {
  onFilterChange: (filters: AppointmentFilters) => void;
  barbers: { id: string; name: string }[];
}

export function AppointmentFilters({
  onFilterChange,
  barbers,
}: AppointmentFiltersProps) {
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: "",
    barber: "",
    date: "",
    search: "",
  });

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no-show", label: "No Show" },
  ];

  const handleFilterChange = (key: keyof AppointmentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: AppointmentFilters = {
      status: "",
      barber: "",
      date: "",
      search: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers, services..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.barber}
          onValueChange={(value) => handleFilterChange("barber", value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Barber" />
          </SelectTrigger>
          <SelectContent>
            {barbers.map((barber) => (
              <SelectItem key={barber.id} value={barber.id}>
                {barber.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2">
        {filters.status && (
          <Badge variant="secondary" className="text-xs">
            Status:{" "}
            {statusOptions.find((opt) => opt.value === filters.status)?.label}
            <button
              onClick={() => handleFilterChange("status", "")}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.barber && (
          <Badge variant="secondary" className="text-xs">
            Barber: {barbers.find((b) => b.id === filters.barber)?.name}
            <button
              onClick={() => handleFilterChange("barber", "")}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.date && (
          <Badge variant="secondary" className="text-xs">
            Date: {filters.date}
            <button
              onClick={() => handleFilterChange("date", "")}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.search && (
          <Badge variant="secondary" className="text-xs">
            Search: {filters.search}
            <button
              onClick={() => handleFilterChange("search", "")}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
}
