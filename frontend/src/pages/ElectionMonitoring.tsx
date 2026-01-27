import { useState } from "react";
import { Newspaper, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ResourceCard from "@/components/shared/ResourceCard";
import ErrorState from "@/components/shared/ErrorState";
import { motion } from "framer-motion";
import { useNewsletters } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";

const ElectionMonitoring = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isError, error, refetch } = useNewsletters(page);
  
  const newsletters = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <PageHeader
        title="Nepal Election Monitoring"
        description="Access newsletters and reports from Accountability Lab Nepal and Digital Rights Nepal (DRN) documenting the electoral process."
        icon={<Newspaper className="w-6 h-6" />}
        accentColor="bg-section-monitoring"
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
              About Election Monitoring
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Accountability Lab Nepal, in collaboration with Digital Rights Nepal (DRN), 
              produces regular newsletters documenting the electoral environment, political developments, 
              and civil society activities related to Nepal's elections.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These reports provide objective analysis and are intended to support transparency 
              and accountability in the democratic process.
            </p>
          </motion.div>

          {/* Newsletter Archive */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Newsletter Archive
              </h3>
              {pagination && (
                <span className="text-sm text-muted-foreground">
                  {pagination.total} issues available
                </span>
              )}
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading newsletters...</span>
              </div>
            )}
            
            {/* Error State */}
            {isError && (
              <ErrorState 
                error={error instanceof Error ? error : new Error("Failed to load newsletters")}
                onRetry={() => refetch()}
              />
            )}
            
            {/* Empty State */}
            {!isLoading && !isError && newsletters.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No newsletters available at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for updates.</p>
              </div>
            )}
            
            {/* Newsletter List */}
            {!isLoading && !isError && newsletters.length > 0 && (
              <div className="space-y-3">
                {newsletters.map((newsletter) => (
                  <ResourceCard
                    key={newsletter.id}
                    title={newsletter.title}
                    description={newsletter.summary}
                    date={new Date(newsletter.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    downloadUrl={newsletter.pdfUrl}
                    type="newsletter"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 flex justify-center gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ElectionMonitoring;
