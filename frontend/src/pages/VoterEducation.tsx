import { useState, useEffect } from "react";
import { BookOpen, Loader2, Image as ImageIcon, Video as VideoIcon, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ResourceCard from "@/components/shared/ResourceCard";
import ErrorState from "@/components/shared/ErrorState";
import { motion } from "framer-motion";
import { useInfographics, useVideos, useExplainers } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabType = "infographics" | "videos" | "explainers";

const VoterEducation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || "infographics");
  const [infographicsPage, setInfographicsPage] = useState(1);
  const [videosPage, setVideosPage] = useState(1);
  const [explainersPage, setExplainersPage] = useState(1);
  const [language, setLanguage] = useState<string | undefined>(undefined);

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ["infographics", "videos", "explainers"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const { data: infographicsData, isLoading: infographicsLoading, isError: infographicsError, error: infographicsErr, refetch: refetchInfographics } = useInfographics(infographicsPage, language);
  const { data: videosData, isLoading: videosLoading, isError: videosError, error: videosErr, refetch: refetchVideos } = useVideos(videosPage, language);
  const { data: explainersData, isLoading: explainersLoading, isError: explainersError, error: explainersErr, refetch: refetchExplainers } = useExplainers(explainersPage, language);
  
  const infographics = infographicsData?.data || [];
  const infographicsPagination = infographicsData?.pagination;
  const videos = videosData?.data || [];
  const videosPagination = videosData?.pagination;
  const explainers = explainersData?.data || [];
  const explainersPagination = explainersData?.pagination;

  const tabs = [
    {
      id: "infographics" as TabType,
      label: "Infographics",
      icon: ImageIcon,
      description: "Visual guides and educational materials"
    },
    {
      id: "videos" as TabType,
      label: "Videos",
      icon: VideoIcon,
      description: "Educational videos about voting"
    },
    {
      id: "explainers" as TabType,
      label: "Explainers",
      icon: FileText,
      description: "Detailed written guides and explanations"
    }
  ];

  return (
    <Layout>
      <PageHeader
        title="Knowledge & Tools"
        description="Understanding the voting process is essential for meaningful participation in democracy. Access resources to learn about voting procedures, eligibility, and your rights as a voter."
        icon={<BookOpen className="w-6 h-6" />}
        accentColor="bg-section-voter"
      />

      <section className="py-12 lg:py-16">
        <div className="civic-container">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8"
          >
            <h2 className="font-display text-xl font-semibold mb-4">
              Educational Resources
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              An informed electorate is the foundation of a healthy democracy. These resources, 
              compiled from official sources including the Election Commission of Nepal, 
              will help you understand the electoral process and exercise your democratic rights effectively.
            </p>
          </motion.div>

          {/* Tabs Navigation */}
          <div className="sticky top-16 md:top-20 z-40 bg-card/95 backdrop-blur-sm border-b mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex overflow-x-auto gap-1 sm:gap-2 py-3 sm:py-4 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => handleTabChange(tab.id)}
                    className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-10 shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-48">
              <Select 
                value={language || "all"} 
                onValueChange={(value) => {
                  setLanguage(value === "all" ? undefined : value);
                  setInfographicsPage(1);
                  setVideosPage(1);
                  setExplainersPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ne">Nepali</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Infographics Tab Content */}
          {activeTab === "infographics" && (
            <div className="space-y-4">
              {infographicsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {infographicsError && (
                <ErrorState 
                  error={infographicsErr instanceof Error ? infographicsErr : new Error("Failed to load infographics")}
                  onRetry={() => refetchInfographics()}
                />
              )}

              {!infographicsLoading && !infographicsError && infographics.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No infographics available.</p>
                </div>
              )}

              <div className="space-y-3">
                {infographics.map((item) => (
                  <ResourceCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    downloadUrl={item.resourceUrl}
                  />
                ))}
              </div>

              {infographicsPagination && infographicsPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button variant="outline" onClick={() => setInfographicsPage(p => Math.max(1, p - 1))} disabled={!infographicsPagination.hasPrevPage}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {infographicsPagination.page} of {infographicsPagination.totalPages}</span>
                  <Button variant="outline" onClick={() => setInfographicsPage(p => p + 1)} disabled={!infographicsPagination.hasNextPage}>Next</Button>
                </div>
              )}
            </div>
          )}

          {/* Videos Tab Content */}
          {activeTab === "videos" && (
            <div className="space-y-4">
              {videosLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {videosError && (
                <ErrorState 
                  error={videosErr instanceof Error ? videosErr : new Error("Failed to load videos")}
                  onRetry={() => refetchVideos()}
                />
              )}

              {!videosLoading && !videosError && videos.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No videos available.</p>
                </div>
              )}

              <div className="space-y-3">
                {videos.map((item) => (
                  <ResourceCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    externalUrl={item.resourceUrl}
                  />
                ))}
              </div>

              {videosPagination && videosPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button variant="outline" onClick={() => setVideosPage(p => Math.max(1, p - 1))} disabled={!videosPagination.hasPrevPage}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {videosPagination.page} of {videosPagination.totalPages}</span>
                  <Button variant="outline" onClick={() => setVideosPage(p => p + 1)} disabled={!videosPagination.hasNextPage}>Next</Button>
                </div>
              )}
            </div>
          )}

          {/* Explainers Tab Content */}
          {activeTab === "explainers" && (
            <div className="space-y-4">
              {explainersLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {explainersError && (
                <ErrorState 
                  error={explainersErr instanceof Error ? explainersErr : new Error("Failed to load explainers")}
                  onRetry={() => refetchExplainers()}
                />
              )}

              {!explainersLoading && !explainersError && explainers.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No explainers available.</p>
                </div>
              )}

              <div className="space-y-3">
                {explainers.map((item) => (
                  <ResourceCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    downloadUrl={item.resourceUrl}
                  />
                ))}
              </div>

              {explainersPagination && explainersPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button variant="outline" onClick={() => setExplainersPage(p => Math.max(1, p - 1))} disabled={!explainersPagination.hasPrevPage}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {explainersPagination.page} of {explainersPagination.totalPages}</span>
                  <Button variant="outline" onClick={() => setExplainersPage(p => p + 1)} disabled={!explainersPagination.hasNextPage}>Next</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default VoterEducation;
