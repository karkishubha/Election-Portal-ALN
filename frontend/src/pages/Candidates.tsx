import { useState, useMemo } from "react";
import { Users, MapPin, Flag, Search, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useCandidatesData, 
  useFilteredCandidates, 
  useAggregatedStats,
  useFilterOptions 
} from "@/hooks/useCandidates";
import { FilterState } from "@/types/candidates";

const Candidates = () => {
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

  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const ITEMS_PER_PAGE = 24;

  const filterOptions = useFilterOptions(candidates, filters);
  const filteredCandidates = useFilteredCandidates(candidates, filters);
  const stats = useAggregatedStats(filteredCandidates);

  // Pagination
  const paginatedCandidates = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredCandidates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCandidates, page]);

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  const resetFilters = () => {
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
    setPage(1);
  };

  return (
    <Layout>
      <PageHeader
        title="Election Candidates 2026"
        description="Explore detailed information about all candidates contesting in Nepal's 2026 general election. Filter by district, province, political party, and more."
        icon={<Users className="w-6 h-6" />}
        accentColor="bg-primary"
      />

      <section className="py-12 lg:py-16">
        <div className="civic-container">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.totalCandidates}</div>
              <div className="text-sm text-muted-foreground">Total Candidates</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{Object.keys(stats.byParty).length}</div>
              <div className="text-sm text-muted-foreground">Political Parties</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{Object.keys(stats.byDistrict).length}</div>
              <div className="text-sm text-muted-foreground">Districts</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">{Object.keys(stats.byProvince).length}</div>
              <div className="text-sm text-muted-foreground">Provinces</div>
            </Card>
          </div>

          {/* Search and Filter Toggle */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by candidate name, party, or district..."
                  value={filters.searchText || ""}
                  onChange={(e) => handleFilterChange("searchText", e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Select 
                    value={filters.province || "all"} 
                    onValueChange={(value) => handleFilterChange("province", value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {filterOptions.provinces.map((province) => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.district || "all"} 
                    onValueChange={(value) => handleFilterChange("district", value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {filterOptions.districts.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.party || "all"} 
                    onValueChange={(value) => handleFilterChange("party", value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Political Party" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Parties</SelectItem>
                      {filterOptions.parties.map((party) => (
                        <SelectItem key={party} value={party}>{party}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.gender || "all"} 
                    onValueChange={(value) => handleFilterChange("gender", value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="पुरुष">पुरुष (Male)</SelectItem>
                      <SelectItem value="महिला">महिला (Female)</SelectItem>
                      <SelectItem value="अन्य">अन्य (Other)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Failed to load candidates data. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-full" />
                </Card>
              ))}
            </div>
          )}

          {/* Candidates Grid */}
          {!isLoading && !error && (
            <>
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No candidates found matching your filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedCandidates.map((candidate) => (
                      <Card key={candidate.CandidateID} className="p-6 hover:shadow-lg transition-shadow">
                        <h3 className="font-semibold text-lg mb-2">{candidate.CandidateName}</h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{candidate.PoliticalPartyName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {candidate.DistrictName}, {candidate.StateName}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="secondary">Age: {candidate.AGE_YR}</Badge>
                            <Badge variant="outline">{candidate.Gender}</Badge>
                            {candidate.QUALIFICATION && (
                              <Badge variant="outline">{candidate.QUALIFICATION}</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Candidates;
