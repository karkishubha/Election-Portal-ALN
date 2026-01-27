import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ResourceCard from "@/components/shared/ResourceCard";
import ErrorState from "@/components/shared/ErrorState";
import { motion } from "framer-motion";
import { useElectionIntegrity, useElectionIntegrityCategories } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ElectionIntegrity = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  
  const { data, isLoading, isError, error, refetch } = useElectionIntegrity(page, { category, language });
  const { data: categoriesData } = useElectionIntegrityCategories();
  
  const resources = data?.data || [];
  const pagination = data?.pagination;
  const categories = categoriesData?.data || [];

  return (
    <Layout>
      <PageHeader
        title="Election Integrity"
        description="Free, fair, and transparent elections are the cornerstone of democracy. Access resources on election standards, anti-misinformation efforts, and accountability measures."
        icon={<Shield className="w-6 h-6" />}
        accentColor="bg-section-integrity"
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
              Protecting Democratic Processes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Election integrity ensures that every vote counts and that the electoral process 
              reflects the genuine will of the people. These resources provide information on 
              maintaining fair elections and combating threats to democratic participation.
            </p>
          </motion.div>

          {/* Key Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            {[
              { title: "Transparency", desc: "Open and observable processes" },
              { title: "Accountability", desc: "Clear responsibility and oversight" },
              { title: "Fairness", desc: "Equal opportunity for all participants" },
            ].map((principle, index) => (
              <div
                key={index}
                className="bg-section-integrity/10 rounded-lg p-5 text-center"
              >
                <h4 className="font-semibold text-foreground mb-2">{principle.title}</h4>
                <p className="text-sm text-muted-foreground">{principle.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="w-48">
              <Select 
                value={category || "all"} 
                onValueChange={(value) => {
                  setCategory(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              Integrity Resources
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
        </div>
      </section>
    </Layout>
  );
};

export default ElectionIntegrity;
