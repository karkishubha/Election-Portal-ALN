import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, DollarSign, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Election2026Integrity = () => {
  const violations = [
    {
      id: 1,
      date: "2082-03-15",
      party: "Sample Party A",
      violation: "Code of Conduct Violation",
      description: "Unauthorized campaign material distribution",
      severity: "medium"
    },
    {
      id: 2,
      date: "2082-03-10",
      party: "Sample Party B",
      violation: "Campaign Finance Violation",
      description: "Exceeded spending limit",
      severity: "high"
    }
  ];

  const misinformation = [
    {
      id: 1,
      claim: "Sample False Claim",
      status: "false",
      verified_info: "Verified information about the claim"
    }
  ];

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="misinformation">Misinformation</TabsTrigger>
          <TabsTrigger value="finance">Campaign Finance</TabsTrigger>
        </TabsList>

        {/* Newsletters Tab */}
        <TabsContent value="newsletters" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <FileText className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Election Monitoring Newsletters</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Regular updates on election monitoring activities and key observations.
            </p>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded p-4 hover:bg-muted/70 transition-colors cursor-pointer">
                <p className="font-semibold text-foreground">Newsletter Issue #5</p>
                <p className="text-sm text-muted-foreground">March 2082 - Campaign Phase Update</p>
              </div>
              <div className="bg-muted/50 rounded p-4 hover:bg-muted/70 transition-colors cursor-pointer">
                <p className="font-semibold text-foreground">Newsletter Issue #4</p>
                <p className="text-sm text-muted-foreground">February 2082 - Candidate Registration Phase</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Code of Conduct Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <div className="space-y-4">
            {violations.map((violation) => (
              <motion.div
                key={violation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg p-6 border"
              >
                <div className="flex items-start gap-4">
                  <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-1 ${
                    violation.severity === "high" ? "text-red-500" : "text-yellow-500"
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">{violation.violation}</h3>
                      <span className="text-xs text-muted-foreground">{violation.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary mb-2">{violation.party}</p>
                    <p className="text-sm text-muted-foreground">{violation.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Misinformation vs Verified Tab */}
        <TabsContent value="misinformation" className="space-y-4">
          <div className="space-y-4">
            {misinformation.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg p-6 border"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="font-semibold text-foreground">Claim: {item.claim}</p>
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
                  <p className="text-sm text-muted-foreground">{item.verified_info}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Campaign Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <DollarSign className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Campaign Finance Information</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Information about campaign spending limits and financial disclosures.
            </p>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded p-4">
                <p className="font-semibold text-foreground mb-2">Budget Ceiling (2026)</p>
                <p className="text-2xl font-bold text-primary">NPR 1 Crore</p>
                <p className="text-sm text-muted-foreground mt-1">Per registered political party</p>
              </div>
              <div className="bg-muted/50 rounded p-4">
                <p className="font-semibold text-foreground mb-2">Individual Candidate Limit</p>
                <p className="text-2xl font-bold text-accent">NPR 50 Lakh</p>
                <p className="text-sm text-muted-foreground mt-1">Per FPTP candidate</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Election2026Integrity;
