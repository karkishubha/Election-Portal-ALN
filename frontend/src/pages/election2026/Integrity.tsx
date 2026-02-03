import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, Loader2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNewsletters, useNewsletterDetail, useViolations, useMisinformation } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import PdfViewer from "@/components/shared/PdfViewer";

const Election2026Integrity = () => {
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfViewerState, setPdfViewerState] = useState<{ url?: string; title?: string; fileName?: string } | null>(null);

  // Fetch newsletters list from database
  const { data: newsletterData, isLoading: newslettersLoading, isError: newslettersError } = useNewsletters(1);
  const newsletters = newsletterData?.data || [];

  // Fetch single newsletter with PDF data when selected
  const { data: selectedNewsletterData, isLoading: pdfLoading } = useNewsletterDetail(selectedNewsletterId || 0);
  const selectedNewsletter = selectedNewsletterData?.data;

  const handleViewPdf = (id: number) => {
    setSelectedNewsletterId(id);
    setPdfViewerState(null);
    setIsPdfOpen(true);
  };

  // Fetch Integrity documents by category (admin can add/delete via Admin panel)
  const { data: violationsData } = useViolations(1);
  const { data: misinformationData } = useMisinformation(1);
  const violations = violationsData?.data || [];
  const misinformation = misinformationData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Election Integrity & Monitoring</h2>
        <p className="text-muted-foreground">
          This section brings together monitoring work and analysis related to the integrity of the 
          2026 election. It showcases newsletters, key observations, and information that may influence 
          the fairness and transparency of the electoral process, including code of conduct violations, 
          campaign finance–related issues, and content addressing misinformation alongside verified information.
        </p>
      </div>

      <Tabs defaultValue="newsletters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="misinformation">Misinformation</TabsTrigger>
        </TabsList>

        {/* Newsletters Tab */}
        <TabsContent value="newsletters" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <FileText className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Election Monitoring Newsletters</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Regular updates on election monitoring activities and key observations.
            </p>
            
            {/* Loading State */}
            {newslettersLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading newsletters...</span>
              </div>
            )}

            {/* Error State */}
            {newslettersError && (
              <div className="text-center py-8">
                <p className="text-destructive">Failed to load newsletters</p>
              </div>
            )}

            {/* Empty State */}
            {!newslettersLoading && !newslettersError && newsletters.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No newsletters available yet.</p>
              </div>
            )}

            {/* Newsletter List */}
            {!newslettersLoading && !newslettersError && newsletters.length > 0 && (
              <div className="space-y-3">
                {newsletters.map((newsletter) => (
                  <motion.div
                    key={newsletter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/50 rounded p-4 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{newsletter.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(newsletter.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {newsletter.summary && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {newsletter.summary}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPdf(newsletter.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View PDF
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Code of Conduct Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <div className="space-y-4">
            {violations.map((violation: any) => (
              <motion.div
                key={violation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg p-6 border"
              >
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1 text-yellow-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">{violation.title}</h3>
                      <span className="text-xs text-muted-foreground">{new Date(violation.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{violation.description}</p>
                    {violation.pdfUrl && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                        setPdfViewerState({ url: violation.pdfUrl, title: violation.title });
                        setIsPdfOpen(true);
                      }}>
                        View PDF
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Misinformation vs Verified Tab */}
        <TabsContent value="misinformation" className="space-y-4">
          <div className="space-y-4">
            {misinformation.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg p-6 border"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="font-semibold text-foreground">{item.title}</p>
                  </div>
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">
                    FALSE
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="font-semibold text-foreground">Verified Information</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.pdfUrl && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                      setPdfViewerState({ url: item.pdfUrl, title: item.title });
                      setIsPdfOpen(true);
                    }}>
                      View PDF
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

      </Tabs>

      {/* PDF Viewer Modal */}
      <PdfViewer
        isOpen={isPdfOpen}
        onClose={() => {
          setIsPdfOpen(false);
          setSelectedNewsletterId(null);
          setPdfViewerState(null);
        }}
        pdfData={pdfViewerState ? undefined : selectedNewsletter?.pdfData}
        pdfUrl={pdfViewerState?.url || selectedNewsletter?.pdfUrl}
        title={pdfViewerState?.title || selectedNewsletter?.title || 'Document'}
        fileName={pdfViewerState?.fileName || selectedNewsletter?.pdfFileName}
      />

      {/* Loading overlay when fetching PDF */}
      {pdfLoading && isPdfOpen && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading PDF...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Election2026Integrity;
