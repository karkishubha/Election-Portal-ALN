import { useState } from "react";
import { Shield, Loader2, AlertTriangle, Megaphone } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ResourceCard from "@/components/shared/ResourceCard";
import ErrorState from "@/components/shared/ErrorState";
import { motion } from "framer-motion";
import { useViolations, useMisinformation } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ElectionIntegrity = () => {
  const [violationsPage, setViolationsPage] = useState(1);
  const [misinformationPage, setMisinformationPage] = useState(1);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  
  const { data: violationsData, isLoading: violationsLoading, isError: violationsError, error: violationsErr, refetch: refetchViolations } = useViolations(violationsPage, language);
  const { data: misinformationData, isLoading: misinformationLoading, isError: misinformationError, error: misinformationErr, refetch: refetchMisinformation } = useMisinformation(misinformationPage, language);
  
  const violations = violationsData?.data || [];
  const violationsPagination = violationsData?.pagination;
  const misinformation = misinformationData?.data || [];
  const misinformationPagination = misinformationData?.pagination;

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
                value={language || "all"} 
                onValueChange={(value) => {
                  setLanguage(value === "all" ? undefined : value);
                  setViolationsPage(1);
                  setMisinformationPage(1);
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

          {/* Violations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-section-integrity/20">
                <AlertTriangle className="w-5 h-5 text-section-integrity" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Violations</h3>
            </div>

            {violationsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {violationsError && (
              <ErrorState 
                error={violationsErr instanceof Error ? violationsErr : new Error("Failed to load violations")}
                onRetry={() => refetchViolations()}
              />
            )}

            {!violationsLoading && !violationsError && violations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No violations available.</p>
              </div>
            )}

            <div className="space-y-3">
              {violations.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  title={resource.title}
                  description={resource.description}
                  downloadUrl={resource.pdfUrl}
                />
              ))}
            </div>

            {violationsPagination && violationsPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button variant="outline" onClick={() => setViolationsPage(p => Math.max(1, p - 1))} disabled={!violationsPagination.hasPrevPage}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {violationsPagination.page} of {violationsPagination.totalPages}</span>
                <Button variant="outline" onClick={() => setViolationsPage(p => p + 1)} disabled={!violationsPagination.hasNextPage}>Next</Button>
              </div>
            )}
          </div>

          {/* Misinformation */}
          <div className="space-y-4 mt-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-section-integrity/20">
                <Megaphone className="w-5 h-5 text-section-integrity" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Misinformation</h3>
            </div>

            {misinformationLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {misinformationError && (
              <ErrorState 
                error={misinformationErr instanceof Error ? misinformationErr : new Error("Failed to load misinformation")}
                onRetry={() => refetchMisinformation()}
              />
            )}

            {!misinformationLoading && !misinformationError && misinformation.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No misinformation items available.</p>
              </div>
            )}

            <div className="space-y-3">
              {misinformation.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  title={resource.title}
                  description={resource.description}
                  downloadUrl={resource.pdfUrl}
                />
              ))}
            </div>

            {misinformationPagination && misinformationPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button variant="outline" onClick={() => setMisinformationPage(p => Math.max(1, p - 1))} disabled={!misinformationPagination.hasPrevPage}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {misinformationPagination.page} of {misinformationPagination.totalPages}</span>
                <Button variant="outline" onClick={() => setMisinformationPage(p => p + 1)} disabled={!misinformationPagination.hasNextPage}>Next</Button>
              </div>
            )}
          </div>

          {/* Pagination moved into sections */}
        </div>
      </section>
    </Layout>
  );
};

export default ElectionIntegrity;
