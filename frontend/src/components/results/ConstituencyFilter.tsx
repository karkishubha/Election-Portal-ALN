import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import type { ConstituencyOption } from "./fptp-types";

interface ConstituencyFilterProps {
  provinces: string[];
  districts: string[];
  constituencies: ConstituencyOption[];
  selectedProvince: string;
  selectedDistrict: string;
  selectedConstituency: string;
  searchTerm: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onConstituencyChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  getConstituencyValue: (item: ConstituencyOption) => string;
}

const ConstituencyFilter = ({
  provinces,
  districts,
  constituencies,
  selectedProvince,
  selectedDistrict,
  selectedConstituency,
  searchTerm,
  onProvinceChange,
  onDistrictChange,
  onConstituencyChange,
  onSearchChange,
  onClearFilters,
  getConstituencyValue,
}: ConstituencyFilterProps) => {
  const hasActiveFilters =
    selectedProvince !== "all" ||
    selectedDistrict !== "all" ||
    selectedConstituency !== "" ||
    searchTerm.trim() !== "";

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Clear Filters
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="all">All Provinces (Optional)</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="all">All Districts (Optional)</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <select
            value={selectedConstituency}
            onChange={(e) => onConstituencyChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
            disabled={selectedDistrict === "all"}
          >
            <option value="">
              {selectedDistrict === "all" ? "Select District First" : "Select Constituency"}
            </option>
            {constituencies.map((item) => (
              <option key={getConstituencyValue(item)} value={getConstituencyValue(item)}>
                {item.id}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search district/constituency"
              className="pl-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConstituencyFilter;
