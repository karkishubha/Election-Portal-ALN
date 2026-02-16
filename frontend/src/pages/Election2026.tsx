import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Shield, BookOpen, UserCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OfficialAnnouncements from "@/components/shared/OfficialAnnouncements";
import Election2026Data from "./election2026/Data";
import Election2026Candidates from "./election2026/Candidates";
import Election2026Parties from "./election2026/Parties";
import Election2026Integrity from "./election2026/Integrity";
import Election2026VoterEducation from "./election2026/VoterEducation";

type TabType = "data" | "candidates" | "parties" | "integrity" | "education";

const Election2026 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || "data");

  // Update tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ["data", "candidates", "parties", "integrity", "education"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    {
      id: "data" as TabType,
      label: "Insights",
      icon: BarChart3,
      description: "Key facts and figures of the 2026 election"
    },
    {
      id: "candidates" as TabType,
      label: "Candidates",
      icon: UserCheck,
      description: "Browse candidates by district, province and party"
    },
    {
      id: "parties" as TabType,
      label: "Political Parties",
      icon: Users,
      description: "Parties contesting in the 2026 election"
    },
    {
      id: "integrity" as TabType,
      label: "Election Monitoring",
      icon: Shield,
      description: "Monitoring and integrity-related content"
    },
    {
      id: "education" as TabType,
      label: "Voter Education",
      icon: BookOpen,
      description: "Educational materials for voters"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="civic-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Nepal Election 2026
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive information about the 2026 election to help you make informed decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-16 md:top-20 z-40 bg-card/95 backdrop-blur-sm border-b">
        <div className="civic-container">
          <div className="flex overflow-x-auto gap-1 sm:gap-2 py-3 sm:py-4 md:justify-center scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
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
      </section>

      {/* Tab Content */}
      <section className="py-8 sm:py-12 lg:py-20 bg-background">
        <div className="civic-container grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            {activeTab === "data" && <Election2026Data />}
            {activeTab === "candidates" && <Election2026Candidates />}
            {activeTab === "parties" && <Election2026Parties />}
            {activeTab === "integrity" && <Election2026Integrity />}
            {activeTab === "education" && <Election2026VoterEducation />}
          </div>
          <div className="lg:block">
            <OfficialAnnouncements />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Election2026;
