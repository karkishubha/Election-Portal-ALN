import { useState, useMemo } from "react";
import { Users, Flag, MapPin, TrendingUp, Search, X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/candidates/StatCard";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { CandidateDetail } from "@/components/candidates/CandidateDetail";
import { PartyBarChart, QualificationPieChart, GenderChart, ProvinceChart } from "@/components/candidates/charts";
import { 
  useCandidatesData, 
  useFilteredCandidates, 
  useAggregatedStats, 
  useFilterOptions 
} from "@/hooks/useCandidates";
import { Candidate, FilterState } from "@/types/candidates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 12;

const Election2026Candidates = () => {
  const { candidates, isLoading, error } = useCandidatesData();
  
  const [filters, setFilters] = useState<FilterState>({
    province: null,
    district: null,
    party: null,
    qualification: null,
    gender: null,
    constituency: null,
    ageMin: null,
    ageMax: null,
    searchText: "",
  });

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filterOptions = useFilterOptions(candidates, filters);
  const filteredCandidates = useFilteredCandidates(candidates, filters);
  const stats = useAggregatedStats(filteredCandidates);

  // Calculate paginated candidates
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCandidates, currentPage]);

  // Reset page when filters change
  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? null : value,
    }));
    setCurrentPage(1);
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailOpen(true);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, v]) => v !== null && v !== "" && key !== "searchText"
  ).length;

  const clearFilters = () => {
    setFilters({
      province: null,
      district: null,
      party: null,
      qualification: null,
      gender: null,
      constituency: null,
      ageMin: null,
      ageMax: null,
      searchText: "",
    });
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">डाटा लोड गर्न सकिएन</h1>
        <p className="text-muted-foreground mb-4">Failed to load candidates data</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          पुनः प्रयास गर्नुहोस्
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Attention Disclaimer Banner */}
      <div
        role="alert"
        className="mb-6 rounded-xl border p-4 bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold">लोड हुन केही सेकेन्ड लाग्न सक्छ</p>
            <p className="text-sm">
              Heads up: This page may take a few seconds to load while candidate data is fetched.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          नेपाल निर्वाचन उम्मेदवार
        </h1>
        <p className="mt-1 sm:mt-2 text-base sm:text-lg text-muted-foreground">
          Nepal Election Candidates Dashboard
        </p>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
          जिल्ला, प्रदेश, र पार्टी अनुसार उम्मेदवारहरू खोज्नुहोस् • 
          Explore candidates by district, province, and party
        </p>
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Candidates"
            titleNp="कुल उम्मेदवार"
            value={stats.totalCandidates}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Political Parties"
            titleNp="राजनीतिक दलहरू"
            value={Object.keys(stats.byParty).length}
            icon={Flag}
          />
          <StatCard
            title="Districts"
            titleNp="जिल्लाहरू"
            value={Object.keys(stats.byDistrict).length}
            icon={MapPin}
          />
          <StatCard
            title="Provinces"
            titleNp="प्रदेशहरू"
            value={Object.keys(stats.byProvince).length}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-8 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">फिल्टर</h3>
            <span className="text-sm text-muted-foreground">(Filters)</span>
            {activeFiltersCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="उम्मेदवारको नाम खोज्नुहोस्... (Search candidate name)"
              value={filters.searchText || ""}
              onChange={(e) => updateFilter("searchText", e.target.value || null)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Province Filter */}
          <Select
            value={filters.province || "all"}
            onValueChange={(v) => updateFilter("province", v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="प्रदेश (Province)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सबै प्रदेश</SelectItem>
              {filterOptions.provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* District Filter */}
          <Select
            value={filters.district || "all"}
            onValueChange={(v) => updateFilter("district", v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="जिल्ला (District)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सबै जिल्ला</SelectItem>
              {filterOptions.districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Constituency Filter */}
          <Select
            value={filters.constituency?.toString() || "all"}
            onValueChange={(v) => updateFilter("constituency", v === "all" ? null : parseInt(v))}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="क्षेत्र (Area)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सबै क्षेत्र</SelectItem>
              {filterOptions.constituencies.map((constituency) => (
                <SelectItem key={constituency} value={constituency.toString()}>
                  क्षेत्र {constituency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Party Filter */}
          <Select
            value={filters.party || "all"}
            onValueChange={(v) => updateFilter("party", v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="पार्टी (Party)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सबै पार्टी</SelectItem>
              {filterOptions.parties.map((party) => (
                <SelectItem key={party} value={party}>
                  {party}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Qualification Filter */}
          <Select
            value={filters.qualification || "all"}
            onValueChange={(v) => updateFilter("qualification", v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="योग्यता (Qualification)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सबै योग्यता</SelectItem>
              {filterOptions.qualifications.map((qual) => (
                <SelectItem key={qual} value={qual}>
                  {qual}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Gender Filter */}
          <Select
            value={filters.gender || "all"}
            onValueChange={(v) => updateFilter("gender", v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="लिङ्ग (Gender)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सबै लिङ्ग</SelectItem>
              {filterOptions.genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PartyBarChart data={stats.byParty} />
          <QualificationPieChart data={stats.byQualification} />
          <GenderChart data={stats.byGender} />
          <ProvinceChart data={stats.byProvince} />
        </div>
      )}

      {/* Candidates Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              उम्मेदवारहरू
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredCandidates.length.toLocaleString()} उम्मेदवार फेला पर्यो
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : paginatedCandidates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.CandidateID}
                candidate={candidate}
                onClick={() => handleCandidateClick(candidate)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              कुनै उम्मेदवार फेला परेन
            </h3>
            <p className="text-muted-foreground">
              No candidates found matching your filters
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              फिल्टर हटाउनुहोस्
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              अघिल्लो
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              पछिल्लो
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      <CandidateDetail
        candidate={selectedCandidate}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
};

export default Election2026Candidates;
