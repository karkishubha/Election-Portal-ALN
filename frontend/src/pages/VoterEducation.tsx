import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ResourceCard from "@/components/shared/ResourceCard";
import ErrorState from "@/components/shared/ErrorState";
import { motion } from "framer-motion";
import { useVoterEducation } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VoterEducation = () => {
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  
  const { data, isLoading, isError, error, refetch } = useVoterEducation(page, language);
  
  const resources = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <PageHeader
        title="Voter Education"
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
              Why Voter Education Matters
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              An informed electorate is the foundation of a healthy democracy. These resources, 
              compiled from official sources including the Election Commission of Nepal, 
              will help you understand the electoral process and exercise your democratic rights effectively.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-48">
              <Select 
                value={language || "all"} 
                onValueChange={(value) => {
                  setLanguage(value === "all" ? undefined : value);
                  setPage(1);
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

          {/* Resources Grid */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              Educational Resources
            </h3>
            
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading resources...</span>
              </div>
            )}
            
            {isError && (
              <ErrorState 
                error={error instanceof Error ? error : new Error("Failed to load resources")}
                onRetry={() => refetch()}
              />
            )}
            
            {!isLoading && !isError && resources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources available at the moment.</p>
              </div>
            )}
            
            <div className="space-y-3">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  title={resource.title}
                  description={resource.description}
                  downloadUrl={resource.pdfUrl}
                  type="pdf"
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          )}

          {/* Future Expansion Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 p-6 bg-muted/50 rounded-xl border border-border text-center"
          >
            <p className="text-muted-foreground text-sm">
              More resources including videos, infographics, and FAQs will be added as they become available.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default VoterEducation;
