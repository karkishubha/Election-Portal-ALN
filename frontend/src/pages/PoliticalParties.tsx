import { Users, ExternalLink, FileText, List, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { usePoliticalParties } from "@/hooks/useQueries";

const PoliticalParties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isError, error, refetch } = usePoliticalParties(page);
  
  const parties = data?.data || [];
  const pagination = data?.pagination;

  // Client-side filtering for search
  const filteredParties = useMemo(() => {
    if (!searchQuery.trim()) return parties;
    return parties.filter((party) =>
      party.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.partyNameNepali?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parties, searchQuery]);

  return (
    <Layout>
      <PageHeader
        title="Political Parties"
        description="Neutral information about political parties contesting in the 2082 General Election. Access official websites, manifestos, and PR lists."
        icon={<Users className="w-6 h-6" />}
        accentColor="bg-section-parties"
      />

      <section className="py-12 lg:py-16">
        <div className="civic-container">
          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 rounded-xl border border-border p-4 md:p-6 mb-8"
          >
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> Information is provided for voter awareness purposes only. 
              This portal does not endorse any political party or candidate. 
              Party information is presented in no particular order.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Input
              type="search"
              placeholder="Search political parties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </motion.div>

          {/* Party Count */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Registered Parties
            </h3>
            <span className="text-sm text-muted-foreground">
              {pagination ? `Showing ${filteredParties.length} of ${pagination.total} parties` : 'Loading...'}
            </span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading political parties...</span>
            </div>
          )}
          
          {/* Error State */}
          {isError && (
            <ErrorState 
              error={error instanceof Error ? error : new Error("Failed to load parties")}
              onRetry={() => refetch()}
            />
          )}

          {/* Party List */}
          {!isLoading && !isError && (
            <div className="space-y-3">
              {filteredParties.map((party, index) => (
                <motion.div
                  key={party.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-lg border border-border p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
                >
                  {/* Symbol */}
                  <div className="flex-shrink-0">
                    {party.partySymbolUrl ? (
                      <img 
                        src={party.partySymbolUrl} 
                        alt={`${party.partyName} symbol`}
                        className="w-14 h-14 rounded-lg object-contain bg-muted"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {party.abbreviation || party.partyName.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Party Name */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{party.partyName}</h4>
                    {party.partyNameNepali && (
                      <p className="text-sm text-muted-foreground">{party.partyNameNepali}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {party.officialWebsite && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={party.officialWebsite} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                    {party.manifestoPdfUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={party.manifestoPdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-1" />
                          Manifesto
                        </a>
                      </Button>
                    )}
                    {party.prListPdfUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={party.prListPdfUrl} target="_blank" rel="noopener noreferrer">
                          <List className="w-4 h-4 mr-1" />
                          PR List
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && !isError && filteredParties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? `No parties found matching "${searchQuery}"` : "No parties available at the moment."}
              </p>
            </div>
          )}

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

          {/* More Parties Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 p-6 bg-muted/30 rounded-xl text-center"
          >
            <p className="text-sm text-muted-foreground">
              This list will be updated as more parties register for the 2082 election. 
              Additional parties and information will be added as they become available.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default PoliticalParties;
